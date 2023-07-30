const aboutUsBtn = document.querySelector("[data-about-us-btn]");
const aboutUsDialog = document.querySelector("[data-about-us-dialog]");
const radarEle = document.querySelector("[data-radar]");
const loadingProgEle = document.querySelector("[data-loading-prog]");

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // chrome.tabs.sendMessage(tabs[0].id, { method: "enableFeature" }, function (response) {
    // });
    // chrome.scripting.executeScript({
    //     target: { tabId: tabs[0].id, allFrames: true },
    //     // files: [chrome.runtime.getURL("popup/js/iframe.js")]
    //     func: () => { alert("ll") }
    // });
    // chrome.tabs.executeScript(null, {
    //     file: "iframe.js"
    // });

    // chrome.runtime.sendMessage({ message: "scrap-videos" }, function (response) {
    //     console.log(response);
    // })
    // Open up connection
    const videosListEle = document.querySelector("[data-videos-list]");
    const port = chrome.tabs.connect(tabs[0].id, {
        name: "subtitles",
    });

    const MAX_INTERVAL_CALLS = 2;
    const INTERVAL_TIME_IN_MS = 400;
    let currentIntervalCalls = 0;
    let intervalId;
    intervalId = setInterval(() => {
        if (currentIntervalCalls === MAX_INTERVAL_CALLS) {
            if (videosListEle.childElementCount === 0) {
                const videosNotFoundEle = document.createElement("li");
                videosNotFoundEle.classList.add("videos-list__item-msg");
                videosNotFoundEle.textContent = "No videos are found";
                videosListEle.appendChild(videosNotFoundEle);
                videosListEle.ariaBusy = false;
            }
            radarEle.remove();
            return clearInterval(intervalId);
        }
        currentIntervalCalls++;
        port.postMessage({
            type: "initial"
        });
    }, INTERVAL_TIME_IN_MS);

    let injectionsInfo = [];
    let videosNum = 0;

    // setTimeout(() => {
    //     if (videosListEle.childElementCount === 0) {
    //         const videosNotFoundEle = document.createElement("li");
    //         videosNotFoundEle.classList.add("videos-list__item-msg");
    //         videosNotFoundEle.textContent = "No videos are found";
    //         videosListEle.appendChild(videosNotFoundEle);
    //     }
    // }, 500);

    port.onMessage.addListener(function (msg) {
        if (msg.type === "initial") {
            const { id, platform, videosLength, videosTitle, activatedVideos, icon } = msg;
            if (videosLength === 0 || injectionsInfo.find(({ id }) => id === id)) return;
            injectionsInfo.push({
                id,
                videosLength
            });
            for (let i = 0; i < videosLength; i++) {
                const videoEle = document.createElement("li");
                const pageIconEle = document.createElement("img");
                pageIconEle.src = icon ?? "../images/any-video.png";
                pageIconEle.width = 32;
                pageIconEle.height = 32;
                const titlePlatformContainerEle = document.createElement("div");
                const videoTitleEle = document.createElement("h3");
                videoTitleEle.textContent = videosTitle[i];
                videoTitleEle.classList.add("videos-list__item__title");
                videoTitleEle.title = videosTitle[i];
                let checkMarkEle;
                if (activatedVideos[i]) {
                    checkMarkEle = document.createElement("span");
                    checkMarkEle.innerHTML = "&#x2713;";
                    checkMarkEle.classList.add("videos-list__item__checkmark");
                    checkMarkEle.dataset.checkmark = true;
                }
                const platformEle = document.createElement("p");
                platformEle.textContent = `platform: ${platform}`;
                titlePlatformContainerEle.append(videoTitleEle, platformEle);
                videoEle.classList.add("videos-list__item");
                videoEle.dataset.video = i;
                videoEle.dataset.id = id;
                videoEle.addEventListener("mouseover", e => {
                    port.postMessage({
                        "type": "videoHover",
                        id,
                        videoIndex: i
                    });
                });
                videoEle.addEventListener("mouseout", e => {
                    port.postMessage({
                        type: "removeVideoHover",
                        id,
                        videoIndex: i
                    })
                });
                videoEle.addEventListener("click", e => {
                    port.postMessage({
                        type: "videoChosen",
                        id,
                        videoIndex: i,
                    });
                    if (!videoEle.querySelector("[data-checkmark]")) {
                        const checkMarkEle = document.createElement("span");
                        checkMarkEle.innerHTML = "&#x2713;";
                        checkMarkEle.classList.add("videos-list__item__checkmark");
                        checkMarkEle.dataset.checkmark = true;
                        videoEle.append(checkMarkEle);
                    }
                    window.close();
                });
                if (checkMarkEle) videoEle.append(checkMarkEle);
                videoEle.append(pageIconEle, titlePlatformContainerEle);
                videosListEle.appendChild(videoEle);
                videosNum++;
            }
        }
    });
});
aboutUsBtn.addEventListener("click", e => {
    aboutUsDialog.showModal();
});

window.addEventListener("click", e => {
    if (e.target === aboutUsDialog) {
        aboutUsDialog.close();
    }
})