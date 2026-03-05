// === Scratch Custom Cloud Variables (F12 Console - Fixed Server) ===
// Connects scratch.mit.edu exclusively to YOUR fixed Cloudflare Worker server
// No prompt — one server only

(() => {
    // ────────────────────────────────────────────────
    // Зміни цю адресу на свою (тільки один раз тут!)
    const serverUrl = "wss://your-worker.yourname.workers.dev";
    // ────────────────────────────────────────────────

    if (!serverUrl || !serverUrl.startsWith("wss://")) {
        console.error("[Custom Cloud] Error: Invalid server URL. Edit the script and set a valid wss:// address.");
        return;
    }

    console.clear();
    console.log("%c[Custom Cloud] Script started! Using fixed server: " + serverUrl, "color:lime;font-size:16px;font-weight:bold");

    const OriginalWebSocket = window.WebSocket;

    window.WebSocket = function(url, protocols) {
        if (url && (url.includes("clouddata.scratch.mit.edu") || url.includes("cloud.scratch.mit.edu"))) {
            console.log("%c[Custom Cloud] Redirecting official cloud connection → your fixed server!", "color:orange;font-weight:bold");
            
            // Extract project_id from current page URL
            const match = location.pathname.match(/projects\/(\d+)/);
            const projectId = match ? match[1] : "default";

            const ws = new OriginalWebSocket(serverUrl);

            // Automatic handshake (compatible with TurboWarp/our server)
            ws.addEventListener("open", () => {
                console.log("%c[Custom Cloud] Connected to your server! Sending handshake for project " + projectId, "color:cyan");
                ws.send(JSON.stringify({ method: "handshake", project_id: projectId }));
            });

            // Optional: log incoming messages for debugging
            ws.addEventListener("message", (event) => {
                if (typeof event.data === "string") {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.method === "set") {
                            console.log("[Cloud Debug] Received set →", data.name, "=", data.value);
                        }
                    } catch {}
                }
            });

            return ws;
        }
        return new OriginalWebSocket(url, protocols);
    };

    // Force Scratch to reconnect cloud (very important!)
    setTimeout(() => {
        const vm = window.vm || window.Scratch?.vm;
        if (vm?.runtime?.ioDevices?.cloud) {
            const cloud = vm.runtime.ioDevices.cloud;
            console.log("%c[Custom Cloud] Forcing cloud reconnection in Scratch VM...", "color:#00ffff");
            cloud.disconnect?.();
            setTimeout(() => cloud.connect?.(), 300);
        } else {
            console.warn("[Custom Cloud] Scratch VM not found yet — try running script after editor loads fully");
        }
    }, 1000);

    console.log("%cDone! Cloud variables working.", "color:lime;font-size:15px");
})();
