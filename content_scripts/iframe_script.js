document.addEventListener("videoscraping", () => {
    console.log("ll");
});
let a = [];

// chrome.runtime.onMessage.addListener((sender, message, sendResponse) => {
//     console.log("ghghgh");
//     const allframes = document.querySelector("video");
//     sendResponse(allframes);
// });
let allVideos;
let originalTrack;
let favicon;
let syncTimeStamps = [];
document.querySelector("script[src='https://www.gstatic.com/recaptcha/releases/iZWPJyR27lB0cR4hL_xOX0GC/recaptcha__fr.js']")?.remove();
let activatedVideos = {};
// console.log(allVideos);

const randomId = btoa(Math.random() * 1000) + btoa(Date.now());

const RESIZE_TIMEOUT_SECONDS = 500;

function detectVideoPlatform() {
    const { href } = location;
    const platform = href.match(/https?:\/\/(?:www\.)?([A-Za-z0-9]+)\..+/)?.[1];
    return platform.charAt(0).toLocaleUpperCase() + platform.slice(1);
}

function detectVideoTitle(videoEle) {
    const platform = detectVideoPlatform();
    return document.querySelector("title")?.text ?? platform;
    // switch (platform) {
    //     case "Youtube":
    //         const titleEle = videoEle.
    //             closest("#primary-inner").querySelector("yt-formatted-string.style-scope.ytd-watch-metadata");
    //         return titleEle.textContent;
    //     default:
    //         return document.querySelector("title")?.text ?? platform;
    // }
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    chrome.runtime.sendMessage({ "msg": "helllo" })
});

function syncTime(timeString, syncSeconds) {
    const datetime = new Date(`1970-01-01T${timeString}Z`);
    datetime.setSeconds(datetime.getSeconds() + syncSeconds);
    if (datetime.getDay() < 4) {
        return `00:00:00.000`;
    } else if (datetime.getDay() > 4) {
        return `99:59:59.999`;
    }
    const hours = datetime.getHours().toString().replace(/^(\d)$/, "0$1");
    const minutes = datetime.getMinutes().toString().replace(/^(\d)$/, "0$1");
    const seconds = datetime.getSeconds().toString().replace(/^(\d)$/, "0$1");
    const miliseconds = datetime.getMilliseconds().toString().padEnd("3", "0");
    return `${hours}:${minutes}:${seconds}.${miliseconds}`;
}

function modifyTrack(vttText, syncValue) {
    const cuesArr = vttText.split("\n\n");
    const regex = /([0-9]{2}:[0-9]{2}:[0-9]{2}(?:.\d+)?)/g;
    const editedCuesArray = [];
    // console.log(vttText);
    // console.log("***************************");
    cuesArr.forEach(cue => {
        const match = cue.match(regex);
        if (!match) return editedCuesArray.push(cue);
        else {
            let timeStamp = [];
            let isFirstTrackValid = true;
            for (let i = 0; i < match.length; i++) {
                // const parts = match[i].split(":");
                // let seconds = parseFloat(parts[parts.length - 1]);
                // let minutes = parseInt(parts[1]);
                // let hours = parseInt(parts[0]);
                const syncedTime = syncTime(match[i], syncValue);
                if (syncedTime === "00:00:00.000" && i === 0) isFirstTrackValid = false;
                if (syncedTime === "99:59:59.999" && i === 1 && !isFirstTrackValid) {
                    return;
                }
                // seconds += computedSync;
                // minutes += Math.floor(seconds / 60);
                // hours += Math.floor(minutes / 60);
                // minutes %= 60;
                // seconds %= 60;
                // seconds = seconds.toFixed(3).toString().replace(/^(\d)$/, "0$1");
                // minutes = minutes.toString().replace(/^(\d)$/, "0$1");
                // hours = hours.toString().replace(/^(\d)$/, "0$1");
                timeStamp.push(syncedTime);
            }
            editedCuesArray.push(
                cue.replace(/([0-9]{2}:[0-9]{2}:[0-9]{2}(?:.\d+)?) --> ([0-9]{2}:[0-9]{2}:[0-9]{2}(?:.\d+)?)/,
                    timeStamp.join(" --> "))
            );
        }
    });
    // console.log(editedCuesArray.join("\n\n"));
    return editedCuesArray.join("\n\n");
}

function injectSearchIframe(msg) {
    const { videoIndex, id } = msg;
    const videoEle = allVideos[videoIndex];
    if (id === randomId && videoEle) {
        let iframeToInject = document.querySelector(`[id="frameId${id + videoIndex}"]`);
        let { width, height, top, left } = videoEle.getBoundingClientRect();
        if (!iframeToInject) {
            const encodedRandomId = encodeURIComponent(id);
            const encodedVideoIndex = encodeURIComponent(videoIndex);
            const videoTitle = detectVideoTitle();
            const encodedVideoTitle = encodeURIComponent(videoTitle !== detectVideoPlatform() ? videoTitle.substring(0, 25) : "");
            iframeToInject = document.createElement("iframe");
            iframeToInject.style.zIndex = 2147483647;
            iframeToInject.style.position = "absolute";
            iframeToInject.id = `frameId${id + videoIndex}`;
            iframeToInject.style.height = `${height}px`;
            iframeToInject.style.width = `${width}px`;
            iframeToInject.style.left = `${left + scrollX}px`;
            iframeToInject.style.top = `${top + scrollY}px`;
            iframeToInject.style.boxSizing = "border-box";

            iframeToInject.src = chrome.runtime.getURL(
                `views/search/index.html?callerId=${encodedRandomId}&videoId=${encodedVideoIndex}\
&searchTitle=${encodedVideoTitle}${syncTimeStamps[videoIndex] ? ` & syncValue=${syncTimeStamps[videoIndex]}` : ""}`);
            document.body.prepend(iframeToInject);
            let searchIframeResizeTimeoutId;
            window.addEventListener("resize", e => {
                clearTimeout(searchIframeResizeTimeoutId);
                searchIframeResizeTimeoutId = setTimeout(() => {
                    const {
                        width: newWidth,
                        height: newHeight,
                        top: newTop,
                        left: newLeft
                    } = videoEle.getBoundingClientRect();
                    iframeToInject.style.height = `${newHeight}px`;
                    iframeToInject.style.width = `${newWidth}px`;
                    iframeToInject.style.left = `${newLeft + scrollX}px`;
                    iframeToInject.style.top = `${newTop + scrollY}px`;
                }, RESIZE_TIMEOUT_SECONDS);
            });

        } else {
            iframeToInject.style.height = `${height}px`;
            iframeToInject.style.width = `${width}px`;
            iframeToInject.style.left = `${left + scrollX}px`;
            iframeToInject.style.top = `${top + scrollY}px`;
            if (iframeToInject.style.display === "none") {
                iframeToInject.style.display = "block";
                if (syncTimeStamps[videoIndex])
                    iframeToInject.contentWindow.postMessage({ syncValue: syncTimeStamps[videoIndex] }, '*');
            } else {
                iframeToInject.style.display = "none";
            }
        }

    }
}

function displayMessage(msg, displayText, isError) {
    const { id, videoIndex } = msg;
    const iframe = document.querySelector(`[id="frameId${id + videoIndex}"]`);
    const videoEle = allVideos[videoIndex];
    const subtitleMsgEle = document.createElement("p");
    const span1 = document.createElement("span");
    span1.textContent = displayText;
    span1.style.marginLeft = "auto";
    const span2 = document.createElement("span");
    span2.innerHTML = "&times;";
    span2.style.fontWeight = "bold";
    span2.style.marginLeft = "auto";
    span2.style.fontSize = "1.3em";
    span2.style.cursor = "pointer";
    span2.onclick = removeSubtitleMsg;
    subtitleMsgEle.style.cssText = iframe.style.cssText;
    subtitleMsgEle.style.display = "block";
    subtitleMsgEle.style.fontSize = "16px";
    subtitleMsgEle.style.padding = "10px";
    subtitleMsgEle.style.height = "auto";
    subtitleMsgEle.style.display = "flex";
    subtitleMsgEle.style.justifyContent = "center";
    subtitleMsgEle.style.alignItems = "center";
    subtitleMsgEle.style.textAlign = "center";
    subtitleMsgEle.style.color = "white";
    if (isError)
        subtitleMsgEle.style.backgroundColor = "#d70000";
    else
        subtitleMsgEle.style.backgroundColor = "#067500";
    subtitleMsgEle.append(span1, span2);
    let subtitleMsgResizeTimeOutId;
    function resizeForSubtitleMsg() {
        clearTimeout(subtitleMsgResizeTimeOutId);
        subtitleMsgResizeTimeOutId = setTimeout(() => {
            const {
                width: newWidth,
                top: newTop,
                left: newLeft
            } = videoEle.getBoundingClientRect();
            subtitleMsgEle.style.width = `${newWidth}px`;
            subtitleMsgEle.style.left = `${newLeft + scrollX}px`;
            subtitleMsgEle.style.top = `${newTop + scrollY}px`;
        }, RESIZE_TIMEOUT_SECONDS)
    }
    function removeSubtitleMsg() {
        subtitleMsgEle.remove();
        window.removeEventListener("resize", resizeForSubtitleMsg);
    }
    window.addEventListener("resize", resizeForSubtitleMsg);
    setTimeout(() => {
        removeSubtitleMsg();
    }, 5000);
    iframe.insertAdjacentElement("afterend", subtitleMsgEle);
}

function injectFloatingBtn(msg, hideIframe) {
    const { id, videoIndex } = msg;
    const videoEle = allVideos[videoIndex];
    if (id !== randomId || !videoEle) return;
    const iframe = document.querySelector(`[id="frameId${id + videoIndex}"]`);
    let floatingBtn = document.querySelector(`[id="floatingBtnId${id + videoIndex}"]`);
    if (!floatingBtn) {
        floatingBtn = document.createElement("button");
        const { right, top } = videoEle.getBoundingClientRect();
        floatingBtn.id = `floatingBtnId${id + videoIndex}`;
        floatingBtn.style.cssText = iframe.style.cssText;
        floatingBtn.style.left = `${right + scrollX - 10}px`;
        floatingBtn.style.top = `${top + scrollY + 10}px`;
        floatingBtn.style.width = "auto";
        floatingBtn.style.height = "auto";
        if (document.fullscreenElement) {
            floatingBtn.style.display = "none";
        }
        const spanTitleEle = document.createElement("span");
        // spanTitleEle.textContent = "SubEase";
        const appImgEle = document.createElement("img");
        appImgEle.src = chrome.runtime.getURL("icons/icon48.png");
        appImgEle.width = 28;
        appImgEle.style.verticalAlign = "middle";
        floatingBtn.append(appImgEle);
        floatingBtn.append(spanTitleEle);
        let floatingBtnResizeTimeOutId;
        window.addEventListener("resize", e => {
            clearTimeout(floatingBtnResizeTimeOutId);
            floatingBtnResizeTimeOutId = setTimeout(() => {
                const {
                    right,
                    top
                } = videoEle.getBoundingClientRect();
                floatingBtn.style.left = `${right + scrollX - 10}px`;
                floatingBtn.style.top = `${top + scrollY + 10}px`;
            }, RESIZE_TIMEOUT_SECONDS);
            // if (window.innerHeight >= (screen.height)) {
            //     floatingBtn.style.display = "none";
            // } else if (floatingBtn.style.display === "none") {
            //     floatingBtn.style.display = "block";
            // }
        });
        window.addEventListener("fullscreenchange", () => {
            if (document.fullscreenElement) {
                floatingBtn.style.display = "none";
            } else {
                floatingBtn.style.display = "block";
            }
        });
        iframe.insertAdjacentElement("beforebegin", floatingBtn);
        function toggleSettingsFrame() {
            let settingsIframe = document.querySelector(`[id='settingsIframeId${id + videoIndex}']`);
            if (!settingsIframe) {
                const { left, width, top } = floatingBtn.getBoundingClientRect();
                settingsIframe = document.createElement("iframe");
                settingsIframe.id = `settingsIframeId${id + videoIndex}`;
                const encodedRandomId = encodeURIComponent(id);
                const encodedVideoIndex = encodeURIComponent(videoIndex);
                settingsIframe.src = chrome.runtime.getURL(
                    `views/settings/index.html?callerId=${encodedRandomId}&videoIndex=${encodedVideoIndex}\
&isTrackAdded=${Boolean(originalTrack)}&downloadLink=${videoEle.src ?? ''}`);
                settingsIframe.style.zIndex = 2147483647;
                settingsIframe.style.position = "absolute";
                settingsIframe.style.width = "400px";
                settingsIframe.style.left = `${left - 400 + scrollX - 5}px`;
                settingsIframe.style.top = `${top + scrollY}px`;
                settingsIframe.style.borderRadius = "1em";
                settingsIframe.style.height = "250px"
                let settingsFrameResizeTimeOutId;
                window.addEventListener("resize", e => {
                    clearTimeout(settingsFrameResizeTimeOutId);
                    setTimeout(() => {
                        const { left, width, top } = floatingBtn.getBoundingClientRect();
                        settingsIframe.style.width = "400px";
                        settingsIframe.style.left = `${left - 400 + scrollX - 5}px`;
                        settingsIframe.style.top = `${top + scrollY}px`;
                    }, RESIZE_TIMEOUT_SECONDS);
                });
                iframe.insertAdjacentElement("afterend", settingsIframe);
            }
            if (settingsIframe.style.display === "block") {
                settingsIframe.style.display = "none";
            } else {
                const { left, top } = floatingBtn.getBoundingClientRect();
                settingsIframe.style.left = `${left - 400 + scrollX - 5}px`;
                settingsIframe.style.top = `${top + scrollY}px`;
                settingsIframe.style.display = "block";
            }
        }
        window.addEventListener("click", e => {
            if (!floatingBtn.contains(e.target)) {
                let settingsIframe = document.querySelector(`[id='settingsIframeId${id + videoIndex}']`);
                if (settingsIframe) settingsIframe.style.display = "none";
            }
        })
        floatingBtn.onclick = toggleSettingsFrame;
    }
    if (hideIframe) iframe.style.display = "none";
}

function createStyleSheet(id) {
    let styleSheet = document.querySelector(`[id="styleId${id}"]`);
    if (!styleSheet) {
        styleSheet = document.createElement("style");
        styleSheet.id = id;
        styleSheet.textContent = `::cue{
            background-color: var(--track-bg-color, black);
            color: var(--track-text-color, white);
        }`;
        document.head.appendChild(styleSheet);
    }
    return styleSheet;
}

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(async function (msg) {
        if (port.name === "subtitles") {
            const { type } = msg;
            if (type === "initial") {
                let blobURL;
                const linkIcon = document.querySelector("link[rel*='icon']")?.href;
                if (!favicon && favicon !== false) {
                    try {
                        blobURL = URL.createObjectURL(await (await fetch(linkIcon ?? "/favicon.ico")).blob());
                        favicon = blobURL;
                    } catch {
                        favicon = false;
                    }
                } else if (favicon) {
                    blobURL = favicon;
                }
                allVideos = document.querySelectorAll("video");
                const videosTitle = Array.from(allVideos).map(video => detectVideoTitle(video));
                port.postMessage({
                    id: randomId,
                    type: "initial",
                    platform: detectVideoPlatform(),
                    videosTitle,
                    activatedVideos,
                    videosLength: allVideos.length,
                    icon: blobURL
                });
            } else if (type === "videoHover") {
                const { videoIndex, id } = msg;
                if (id !== randomId || !allVideos[videoIndex]) return;
                const { width, height, top, left } = allVideos[videoIndex].getBoundingClientRect();
                let div = document.querySelector(`[id="${id + videoIndex}"]`);
                if (!div) {
                    div = document.createElement("div");
                    div.id = id + videoIndex;
                    document.body.appendChild(div);
                    div.style.zIndex = 2147483647;
                    div.style.position = "absolute";
                    div.style.pointerEvents = "none";
                }
                div.style.height = `${height}px`;
                div.style.width = `${width}px`;
                div.style.left = `${left + scrollX}px`;
                div.style.top = `${top + scrollY}px`;
                div.style.backgroundColor = "#0098ff55";
                div.scrollIntoView({ behavior: "smooth", block: "center" });
            } else if (type === "removeVideoHover") {
                const { videoIndex, id } = msg;
                let div = document.querySelector(`[id="${id + videoIndex}"]`);
                if (div) div.style.backgroundColor = "transparent";
            } else if (type === "videoChosen") {
                const { videoIndex } = msg;
                activatedVideos[videoIndex] = true;
                injectSearchIframe(msg);
                injectFloatingBtn(msg, false);
            }
        } else if (port.name === "searchIframe") {
            if (msg.type === "addTrack") {
                let { id, videoIndex, webvtt, syncValue, lang } = msg;
                if (id !== randomId || !allVideos[videoIndex]) return;
                const videoEle = allVideos[videoIndex];
                originalTrack = webvtt;
                if (syncValue) {
                    webvtt = modifyTrack(originalTrack, syncValue);
                }
                const webvttURL = URL.createObjectURL(new Blob([webvtt], { type: "text/vtt" }));
                // video.addEventListener("loadedmetadata", function () {
                let track = document.querySelector(`[id="trackId${id + videoIndex}"]`);
                if (!track) {
                    track = document.createElement("track");
                    track.id = `trackId${id + videoIndex}`;
                    track.kind = "captions";
                    track.label = lang;
                    track.srclang = lang;
                    track.default = true;
                    track.addEventListener("load", function () {
                        track.track.mode = "showing";
                        // video.textTracks[0].mode = "showing"; // thanks Firefox
                    });
                    videoEle.prepend(track);
                }
                if (track.src) URL.revokeObjectURL(track.src);
                track.src = webvttURL;
                track.track.mode = "showing";
                const settingsIframe = document.querySelector(`[id="settingsIframeId${id + videoIndex}"]`)
                if (settingsIframe) settingsIframe.contentWindow.postMessage({
                    type: 'trackAdded'
                }, '*');
                displayMessage(msg, "Subtitles added successfully");
                injectFloatingBtn(msg, true);
                // });
            }
            if (msg.type === "closeSearchSubtitles") {
                injectFloatingBtn(msg, true);
            }
        }
        if (port.name === "settingsIframe") {
            if (msg.type === "selectSubtitles") {
                const { id, videoIndex } = msg;
                if (id !== randomId || !allVideos[videoIndex]) return;
                const settingsIframe = document.querySelector(`[id='settingsIframeId${id + videoIndex}']`);
                settingsIframe.style.display = "none";
                injectSearchIframe(msg);
            } else if (msg.type === "syncSubtitles") {
                const { id, videoIndex, syncValue } = msg;
                if (id !== randomId || !allVideos[videoIndex]) return;
                // const computedSync = syncValue - (syncTimeStamps[videoIndex] ?? 0);
                syncTimeStamps[videoIndex] = syncValue;
                const track = document.querySelector(`[id="trackId${id + videoIndex}"]`);
                if (!track || !originalTrack) {
                    displayMessage(msg, "Subtitles are not loaded yet", true);
                    return;
                }
                const trackCuesText = originalTrack;
                const editedCuesArray = modifyTrack(trackCuesText, syncValue);
                const blobURL = URL.createObjectURL(new Blob([editedCuesArray], { type: 'text/vtt' }));
                URL.revokeObjectURL(track.src);
                track.src = blobURL;
                // console.log(editedCuesArray);
                displayMessage(msg, "Synchronized successfully");
            } else if (msg.type === "enableSubtitles") {
                const { id, videoIndex, enable } = msg;
                if (id !== randomId || !allVideos[videoIndex]) return;
                const track = document.querySelector(`[id="trackId${id + videoIndex}"]`);
                if (track) {
                    if (enable) {
                        track.track.mode = "showing";
                        displayMessage(msg, "Subtitles are enabled");
                    }
                    else {
                        track.track.mode = "hidden";
                        displayMessage(msg, "Subtitles are disabled");
                    }
                }
            } else if (msg.type === "changeBgColor") {
                const { id, videoIndex, color } = msg;
                if (id !== randomId || !allVideos[videoIndex]) return;
                createStyleSheet();
                const videoEle = allVideos[videoIndex];
                videoEle.style.setProperty("--track-bg-color", color);
            } else if (msg.type === "changeTextColor") {
                const { id, videoIndex, color } = msg;
                if (id !== randomId || !allVideos[videoIndex]) return;
                createStyleSheet();
                const videoEle = allVideos[videoIndex];
                videoEle.style.setProperty("--track-text-color", color);
            } else if (msg.type === "download") {
                const { id, videoIndex } = msg;
                if (id !== randomId || !allVideos[videoIndex]) return;
                const videoEle = allVideos[videoIndex];
                location.href = videoEle.src;
            }
        }
    });
    port.onDisconnect.addListener(() => {
        if (port.name === "subtitles") {
            for (let i = 0; i < allVideos.length; i++) {
                let div = document.querySelector(`[id="${randomId + i}"]`);
                if (div) div.style.backgroundColor = "transparent";
            }
        }
    })
});