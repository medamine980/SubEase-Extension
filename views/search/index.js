import Port from "./../../lib/port.js";

const middleContainerEle = document.querySelector("[data-middle]");
const searchInput = document.querySelector("[data-search-input]");
const autocompleteOptions = document.querySelector("[data-autocomplete-options]");
const langSelectorEle = document.querySelector("[data-lang-selector]");
const closeBtn = document.querySelector("[data-close-btn]");
const searchInfoMessageEle = document.querySelector("[data-search-info-message]");

const MAX_IN_SEARCH = 40;
const SEARCH_THROTTLE_TIME_IN_MS = 250;


let throttleTimeOutId;

const locationQuery = decodeURIComponent(location.search).split("&");
const callerId = locationQuery[0].match(/=(.+)/)[1];
const videoIndex = locationQuery[1].match(/=(.+)/)[1];
const searchTitle = locationQuery[2]?.match(/=(.+)/)[1];
let syncValue = locationQuery[3]?.match(/=(.+)/)[1];
searchInput.value = searchTitle;
if (syncValue) syncValue = parseInt(syncValue);
closeBtn.addEventListener("click", e => {
    chrome.tabs.getCurrent(tab => {
        const port = new Port(tab, "searchIframe");
        port.postMessage({
            id: callerId,
            videoIndex,
            type: "closeSearchSubtitles",
        });
    })
});

window.addEventListener("message", e => {
    syncValue = e.data.syncValue;
});

langSelectorEle.addEventListener("change", async e => {
    if (searchInput.value !== "") {
        createLoading();
        await search(searchInput.value);
    }
});

let loadingContainerEle;
function createLoading() {
    searchInfoMessageEle.classList.remove("show");
    if (!loadingContainerEle) {
        loadingContainerEle = document.createElement("div");
        loadingContainerEle.classList.add("loading-container");
        const loadingEle = document.createElement("progress");
        loadingEle.classList.add("loading-container__progress");
        loadingEle.dataset.loadingEle = true;
        loadingContainerEle.append(loadingEle);
        middleContainerEle.appendChild(loadingContainerEle);
    } else if (!middleContainerEle.contains(loadingContainerEle)) {
        middleContainerEle.appendChild(loadingContainerEle);
    }
}
searchInput.addEventListener("input", async e => {
    e.preventDefault();
    createLoading();
    clearTimeout(throttleTimeOutId);
    throttleTimeOutId = setTimeout(async () => {
        await search(searchInput.value);
    }, SEARCH_THROTTLE_TIME_IN_MS);
});

searchInput.addEventListener("keypress", async e => {
    clearTimeout(throttleTimeOutId);
    if (e.key === "Enter") {
        e.preventDefault();
        createLoading();
        await search(searchInput.value);
    }
});

function downloadOverlay() {
    const divContainer = document.createElement("div");
    divContainer.classList.add("download-overlay-container");
    const pEle = document.createElement("p");
    pEle.textContent = "Downloading";
    pEle.classList.add("download-overlay-container__text");
    divContainer.appendChild(pEle);
    document.body.appendChild(divContainer);
    return divContainer;
}

async function search(value) {
    const thisTimeOutId = throttleTimeOutId;
    value = encodeURIComponent(value);
    const lang = encodeURIComponent(langSelectorEle.value);
    const request = new Request(
        `https://api.opensubtitles.com/api/v1/subtitles?query=${value}&languages=${lang}`, {
        method: "GET",
        headers: {
            "Api-Key": "2qsRn5gCOQ6v0Ddd97aZbad9xUuO0SVd"
        }
    });
    const res = await fetch(request);
    if (res.status >= 500) {
        loadingContainerEle.remove();
        searchInfoMessageEle.textContent = "Error at the server level";
        searchInfoMessageEle.classList.add("show");
        return;
    }
    if (thisTimeOutId !== throttleTimeOutId) return;
    const json = await res.json();
    autocompleteOptions.textContent = "";
    console.log(json);
    if (json["errors"] || json["data"]["length"] === 0) {
        loadingContainerEle.remove();
        searchInfoMessageEle.textContent = "Not found";
        searchInfoMessageEle.classList.add("show");
        return;
    }
    const length = json.data.length > MAX_IN_SEARCH ? MAX_IN_SEARCH : json.data.length;
    const fragment = new DocumentFragment();
    for (let i = 0; i < length; i++) {
        const { id, attributes: { files: [{ file_id: fileId }], language, feature_details: { movie_name } } } = json.data[i];
        const autocompleteOption = document.createElement("li");
        const langEle = document.createElement("span");
        const movieNameEle = document.createElement("span");
        langEle.classList.add("autocomplete-options__option__lang")
        autocompleteOption.classList.add("autocomplete-options__option");
        autocompleteOption.id = id;
        langEle.textContent = language;
        movieNameEle.textContent = movie_name;
        autocompleteOption.append(langEle, movieNameEle);
        autocompleteOption.addEventListener("click", async ev => {
            const donwloadOverlayEle = downloadOverlay();
            let srt;
            try {
                srt = await download(fileId);
            } catch {
                donwloadOverlayEle.remove();
                return;
            }
            console.log("srt");
            console.log(srt);
            console.log("webvtt");
            let webvtt = convertToWebvtt(srt);
            console.log(webvtt);
            if (syncValue) {
                // const cuesArr = webvtt.split("\n\n");
                // const regex = /([0-9]{2}:[0-9]{2}:[0-9]{2}(?:.\d+)?)/g;
                // const editedCuesArray = cuesArr.map(cue => {
                //     const match = cue.match(regex);
                //     if (!match) return cue;
                //     else {
                //         let timeStamp = [];
                //         for (let i = 0; i < match.length; i++) {
                //             const parts = match[i].split(":");
                //             let seconds = parseFloat(parts[parts.length - 1]);
                //             let minutes = parseInt(parts[1]);
                //             let hours = parseInt(parts[0]);
                //             seconds += syncValue;
                //             minutes += Math.floor(seconds / 60);
                //             hours += Math.floor(minutes / 60);
                //             minutes %= 60;
                //             seconds %= 60;
                //             seconds = seconds.toFixed(3).toString().replace(/^(\d)$/, "0$1")
                //             minutes = minutes.toString().replace(/^(\d)$/, "0$1")
                //             hours = hours.toString().replace(/^(\d)$/, "0$1");
                //             timeStamp.push(`${hours}:${minutes}:${seconds}`);
                //         }
                //         return cue.replace(/([0-9]{2}:[0-9]{2}:[0-9]{2}(?:.\d+)?) --> ([0-9]{2}:[0-9]{2}:[0-9]{2}(?:.\d+)?)/,
                //             timeStamp.join(" --> "));
                //     }
                // });
                // webvtt = editedCuesArray.join("\n\n");
            }
            chrome.tabs.getCurrent(tab => {
                // chrome.tabs.sendMessage(tab.id, {
                // id: callerId,
                // videoIndex,
                // type: "addTrack",
                // webvtt
                // }, { frameId: 0 }, function () {
                //     console.log("got it");
                // });
                const port = new Port(tab, "searchIframe");

                port.postMessage({
                    id: callerId,
                    videoIndex,
                    type: "addTrack",
                    webvtt,
                    syncValue: syncValue,
                    lang
                });
                searchInput.value = "";
            });
            donwloadOverlayEle.remove();
            autocompleteOptions.textContent = "";
        });
        fragment.appendChild(autocompleteOption);
    }
    autocompleteOptions.appendChild(fragment);
    autocompleteOptions.scrollTo({ top: 0 });
    loadingContainerEle.remove();
    // loadingContainerEle = null;
}

function convertToWebvtt(srt) {
    var webvtt = srt2webvtt(srt);
    return webvtt;
}
function srt2webvtt(data) {
    // remove dos newlines
    var srt = data.replace(/\r+/g, '');
    // trim white space start and end
    srt = srt.replace(/^\s+|\s+$/g, '');
    // get cues
    var cuelist = srt.split('\n\n');
    var result = "";
    if (cuelist.length > 0) {
        result += "WEBVTT\n\n";
        for (var i = 0; i < cuelist.length; i = i + 1) {
            result += convertSrtCue(cuelist[i]);
        }
    }
    return result;
}
function convertSrtCue(caption) {
    // remove all html tags for security reasons
    //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');
    var cue = "";
    var s = caption.split(/\n/);
    // concatenate muilt-line string separated in array into one
    while (s.length > 3) {
        for (var i = 3; i < s.length; i++) {
            s[2] += "\n" + s[i]
        }
        s.splice(3, s.length - 3);
    }
    var line = 0;
    // detect identifier
    if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
        cue += s[0].match(/\w+/) + "\n";
        line += 1;
    }
    // get time strings
    if (s[line].match(/\d+:\d+:\d+/)) {
        // convert time string
        var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
        if (m) {
            cue += m[1] + ":" + m[2] + ":" + m[3] + "." + m[4] + " --> "
                + m[5] + ":" + m[6] + ":" + m[7] + "." + m[8] + "\n";
            line += 1;
        } else {
            // Unrecognized timestring
            return "";
        }
    } else {
        // file format error or comment lines
        return "";
    }
    // get cue text
    if (s[line]) {
        cue += s[line] + "\n\n";
    }
    return cue;
}

const cache = {};


async function download(fileId) {
    if (cache[fileId]) {
        return cache[fileId]["srt"];
    }
    const request = new Request(
        `https://api.opensubtitles.com/api/v1/download`, {
        method: "POST",
        body: JSON.stringify({
            file_id: fileId
        }),
        headers: {
            "Content-Type": "application/json",
            "Api-Key": "2qsRn5gCOQ6v0Ddd97aZbad9xUuO0SVd"
        }
    });
    let res = await fetch(request);
    const json = await res.json();
    if (json.error) {
        console.error(json);
    } else {
        const { link } = json;
        res = await fetch(link);
        const text = await res.text();
        cache[fileId] = {
            link,
            srt: text
        }
        return text;
    }
}
