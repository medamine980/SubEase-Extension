const aboutUsBtn = document.querySelector("[data-about-us-btn]");
const aboutUsDialog = document.querySelector("[data-about-us-dialog]");

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

    port.postMessage({
        type: "initial"
    });

    let injectionsInfo = [];
    let videosNum = 0;

    setTimeout(() => {
        if (videosListEle.childElementCount === 0) {
            const videosNotFoundEle = document.createElement("li");
            videosNotFoundEle.classList.add("videos-list__item-msg");
            videosNotFoundEle.textContent = "No videos are found";
            videosListEle.appendChild(videosNotFoundEle);
        }
    }, 500);

    port.onMessage.addListener(function (msg) {
        if (msg.type === "initial") {
            const { id, platform, videosLength, videosTitle, activatedVideos, icon } = msg;
            if (videosLength === 0) return;
            injectionsInfo.push({
                id,
                videosLength
            });
            for (let i = 0; i < videosLength; i++) {
                const videoEle = document.createElement("li");
                const pageIconEle = document.createElement("img");
                pageIconEle.src = icon;
                pageIconEle.width = 20;
                pageIconEle.height = 20;
                const titlePlatformContainerEle = document.createElement("div");
                const videoTitleEle = document.createElement("h3");
                videoTitleEle.textContent = videosTitle[i];
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