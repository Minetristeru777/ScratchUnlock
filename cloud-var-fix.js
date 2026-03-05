const CUSTOM_CLOUD_URL = "wss://cloud-var-officalserver.dorda-ivan14.workers.dev";

    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        if (url.includes("clouddata.scratch.mit.edu")) {
            console.log("%c[Custom Cloud] Connected to server!", "color: lime");
            return new originalWebSocket(CUSTOM_CLOUD_URL);
        }
        return new originalWebSocket(url, protocols);
