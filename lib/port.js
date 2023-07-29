export default class Port {
    static port;
    constructor(tab, portName) {
        if (!Port.port) Port.port = chrome.tabs.connect(tab.id, {
            name: portName,
        });
    }

    postMessage(obj) {
        Port.port.postMessage(obj);
    }
}