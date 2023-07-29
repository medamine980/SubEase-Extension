import Port from "./../../lib/port.js";

const selectSubtitlesBtn = document.querySelector("[data-select-subtitle-btn]");
const syncRangeEle = document.querySelector("[data-sync-range]");
const syncNumberEle = document.querySelector("[data-sync-number]");
const settingsFormEle = document.querySelector("[data-settings-form]");
const enableSubtitlesEle = document.querySelector("[data-enable-subtitles]");
const bgColorEle = document.querySelector("[data-bg-color]");
const textColorEle = document.querySelector("[data-text-color]");

const locationQuery = decodeURIComponent(location.search).split("&");
const callerId = locationQuery[0].match(/=(.+)/)[1];
const videoIndex = locationQuery[1].match(/=(.+)/)[1];
let isTrackAdded = locationQuery[2].match(/=(.+)/)[1];
const videoLink = locationQuery[3].match(/=(.+)/)[1];

const SYNC_TIMEOUT_TIME_IN_MS = 1000;

const DEFAULT_TIMEOUT_TIME_IN_MS = 250;


async function saveSyncValue(value) {
    await chrome.storage.local.set({ syncValue: value });
}

let syncTimeoutId;
if (isTrackAdded === "true") {
    enableSubtitlesEle.disabled = false;
    enableSubtitlesEle.checked = true;
}

window.addEventListener("message", e => {
    if (e.data.type === "trackAdded") {
        enableSubtitlesEle.disabled = false;
        enableSubtitlesEle.checked = true;
    }
});

settingsFormEle.onsubmit = e => false;


// if (videoLink) {
//     const settingsContainerEle = document.createElement("div");
//     settingsContainerEle.classList.add("settings-container__item");
//     const anchorEle = document.createElement("a");
//     anchorEle.href = videoLink;
//     anchorEle.classList.add("settings-container__item__subitem", "settings-container__item__subitem--btn");
//     anchorEle.download = true;
//     anchorEle.dataset.download = true;
//     anchorEle.textContent = "Download";
//     anchorEle.addEventListener("click", () => {
//         chrome.tabs.getCurrent(tab => {
//             const port = new Port(tab, "settingsIframe");
//             port.postMessage({
//                 id: callerId,
//                 videoIndex,
//                 type: "download",
//             });
//         });
//     });
//     settingsContainerEle.appendChild(anchorEle);
//     settingsFormEle.append(settingsContainerEle);
// }

let textColorTimeOutId;
textColorEle.addEventListener("change", () => {
    clearTimeout(textColorTimeOutId);
    textColorTimeOutId = setTimeout(() => {
        chrome.tabs.getCurrent(tab => {
            const port = new Port(tab, "settingsIframe");
            port.postMessage({
                id: callerId,
                videoIndex,
                type: "changeTextColor",
                color: textColorEle.value
            });
        });
    }, DEFAULT_TIMEOUT_TIME_IN_MS);
});

let bgColorTimeOutId;
bgColorEle.addEventListener("change", () => {
    clearTimeout(bgColorTimeOutId);
    bgColorTimeOutId = setTimeout(() => {
        chrome.tabs.getCurrent(tab => {
            const port = new Port(tab, "settingsIframe");
            port.postMessage({
                id: callerId,
                videoIndex,
                type: "changeBgColor",
                color: bgColorEle.value
            });
        });
    }, DEFAULT_TIMEOUT_TIME_IN_MS);
});


let enableSubtitlesTimeOutId;
enableSubtitlesEle.addEventListener("change", () => {
    clearTimeout(enableSubtitlesTimeOutId);
    enableSubtitlesTimeOutId = setTimeout(() => {
        chrome.tabs.getCurrent(tab => {
            const port = new Port(tab, "settingsIframe");
            port.postMessage({
                id: callerId,
                videoIndex,
                type: "enableSubtitles",
                enable: enableSubtitlesEle.checked
            });
        });
    }, DEFAULT_TIMEOUT_TIME_IN_MS);
});

syncNumberEle.addEventListener("change", async e => {
    // await saveSyncValue();
    syncRangeEle.value = syncNumberEle.valueAsNumber;
    clearTimeout(syncTimeoutId);
    syncTimeoutId = setTimeout(() => {
        chrome.tabs.getCurrent(tab => {
            const port = new Port(tab, "settingsIframe");
            port.postMessage({
                id: callerId,
                videoIndex,
                type: "syncSubtitles",
                syncValue: syncNumberEle.valueAsNumber
            });
        })
    }, SYNC_TIMEOUT_TIME_IN_MS);
});

syncRangeEle.addEventListener("change", async e => {
    // await saveSyncValue();
    syncNumberEle.value = syncRangeEle.valueAsNumber;
    clearTimeout(syncTimeoutId);
    syncTimeoutId = setTimeout(() => {
        chrome.tabs.getCurrent(tab => {
            const port = new Port(tab, "settingsIframe");
            port.postMessage({
                id: callerId,
                videoIndex,
                type: "syncSubtitles",
                syncValue: syncRangeEle.valueAsNumber
            });
        })
    }, SYNC_TIMEOUT_TIME_IN_MS);
})

selectSubtitlesBtn.addEventListener("click", () => {
    chrome.tabs.getCurrent(tab => {
        const port = new Port(tab, "settingsIframe");
        port.postMessage({
            id: callerId,
            videoIndex,
            type: "selectSubtitles"
        });
    })
});

chrome.storage.local.get(["syncValue"], result => {
    syncRangeEle.value = result.syncValue ?? 0;
    syncNumberEle.value = result.syncValue ?? 0;
})