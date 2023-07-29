chrome.action.onClicked.addListener((tab) => {
    // chrome.scripting.registerContentScripts([{
    //     id: "test",
    //     matches: ["https://*"],
    //     allFrames: true,
    //     js: ["content_script.js"],
    // }]);
    console.log("hello");
    chrome.windows.create({
        focused: true,
        width: 400,
        height: 600,
        type: 'popup',
        url: 'popup/views/index.html',
        top: 0,
        left: 0
    },
        () => { })
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content_scripts/iframe_script.js"]
    });
});