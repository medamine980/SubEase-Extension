const playBtn = document.querySelector(".hoster-player");

function getTheShowName() {
    const match = location.href.match("https://bs.to/serie/([A-Za-z0-9\-]+)/.+");
    return match?.[1];
}

function getSeasonNumber() {
    const match = location.href.match("https://bs.to/serie/[A-Za-z0-9\-]+/(\\d+)/.+");
    return match?.[1];
}

function getSeasonInLetters() {
    const seasonNumber = getSeasonNumber();
    switch (seasonNumber) {
        case "1":
            return "first";
        case "2":
            return "second";
        case "3":
            return "third";
        case "4":
            return "forth";
        case "5":
            return "fifth";
        case "6":
            return "sixth";
        case "7":
            return "seventh";
        case "8":
            return "eighth";
        case "9":
            return "nineth";
        case "10":
            return "tenth";
    }
}

function getEpisodeNumber() {
    const match = location.href.match("https://bs.to/serie/[A-Za-z0-9\-]+/\\d+/(\\d).+");
    return match?.[1];
}

async function getSubtitles() {
    const show = getTheShowName();
    const season = getSeasonInLetters();
    const episode = getEpisodeNumber();
    let url = `https://subscene.com/subtitles/searchbytitle/`;
    let encodedURL = encodeURI(url);
    const body = encodeURIComponent(JSON.stringify({
        "query": `${show} ${season} season`
    }))
    let res = await fetch(`http://localhost/api/download?url=${encodedURL}&method=POST&body=${body}`);
    const parser = new DOMParser();
    page = parser.parseFromString(await res.text(), "text/html");
    const suList = page.querySelectorAll("div.title a");
    if (suList.length === 0) {
        console.warn("SUBTITLES NOT FOUND");
        return null;
    }
    const firstLink = suList[0].href.replace("bs.to", "subscene.com");
    console.log(firstLink);
    url = firstLink;
    encodedURL = encodeURI(url);
    res = await fetch(`http://localhost/api/download?url=${encodedURL}`);
    page = parser.parseFromString(await res.text(), "text/html");
    const allspans = page.querySelectorAll(".positive-icon ~ span");
    let acceptedLinks = [];
    console.log(page);
    for (let i = 0; i < allspans.length; i++) {
        const span = allspans[i];
        if (span.innerText.trim().match(`.+[Ee]0?${episode}.+`) && span.parentElement.firstElementChild.innerText.trim().
            match(/English/i)) {
            acceptedLinks.push(span.parentElement.href.replace("bs.to", "subscene.com"));
            console.log("pushed");
        };
    }
    if (acceptedLinks.length !== 0) {
        url = acceptedLinks[0];
        encodedURL = encodeURI(url);
        res = await fetch(`http://localhost/api/download?url=${encodedURL}`);
        page = parser.parseFromString(await res.text(), "text/html");
        url = page.querySelector("#downloadButton").href.replace("bs.to", "subscene.com");
        res = await fetch(`http://localhost/api/download?url=${encodedURL}`);
        console.log(await res.text());

    } else {
        console.log(allspans);
    }

}

function detectActiveHoster() {
    const hosterQuery = ".hoster-tabs li.active a";
    const hoster = document.querySelector(hosterQuery);
    return hoster.textContent.trim().toLocaleLowerCase();
}

const currentHost = detectActiveHoster();

const KNOWN_HOSTS = {
    vidoza: "vidoza"
}

let bruteForceId;

async function process() {
    const show = getTheShowName();
    const season = getSeasonNumber();
    const episode = getEpisodeNumber();
    if (currentHost === KNOWN_HOSTS.vidoza) {
        const htmlPlayer = document.querySelector("iframe[src^='https://vidoza.net']");
        const url = htmlPlayer.src;
        const encodedURL = encodeURI(url);
        console.log("fetching...");
        const res = await fetch(`http://localhost/api/download?url=${encodedURL}&resType=text`, {
            method: "GET",
        });
        const text = await res.text();
        const parser = new DOMParser();
        const html = parser.parseFromString(text, "text/html");
        const videoSource = html.querySelector("#player source").src;
        console.log(videoSource);
        console.log(show, season, episode);
        getSubtitles();
    }
    clearInterval(bruteForceId);
}

playBtn.addEventListener("click", e => {
    bruteForceId = setInterval(process, 10000);
})