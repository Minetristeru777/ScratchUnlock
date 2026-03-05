(() => {
  const serverUrl = "wss://cloud-var-officalserver.dorda-ivan14.workers.dev";
  let vm = window.vm;

  if (!vm) {
    for (let el of document.querySelectorAll("*")) {
      for (let k in el) {
        const v = el[k];
        if (v?.scratchGui?.vm) { vm = v.scratchGui.vm; break; }
        if (v?.vm?.runtime) { vm = v.vm; break; }
      }
      if (vm) break;
    }
    window.vm = vm;
  }

  const OriginalWebSocket = window.WebSocket;

  window.WebSocket = function(url, protocols) {
    if (url?.includes("clouddata.scratch.mit.edu") || url?.includes("cloud.scratch.mit.edu")) {
      console.log("%c[Custom Cloud] Redirecting cloud → your server", "color:orange;font-weight:bold");
      const match = location.pathname.match(/projects\/(\d+)/);
      const projectId = match ? match[1] : "default";
      const ws = new OriginalWebSocket(serverUrl);

      ws.addEventListener("open", () => {
        console.log("%c[Custom Cloud] Connected! Handshake project " + projectId, "color:cyan");
        ws.send(JSON.stringify({ method: "handshake", project_id: projectId }));
      });

      ws.addEventListener("message", (event) => {
        if (typeof event.data !== "string") return;
        try {
          const data = JSON.parse(event.data);
          if (data.method === "set" && vm?.runtime?.ioDevices?.cloud) {
            vm.runtime.ioDevices.cloud._setCloudVar(data.name, data.value);
            console.log("[Cloud] set", data.name, "→", data.value);
          }
        } catch {}
      });

      return ws;
    }
    return new OriginalWebSocket(url, protocols);
  };

  setTimeout(() => {
    if (vm?.runtime?.ioDevices?.cloud) {
      const cloud = vm.runtime.ioDevices.cloud;
      console.log("%c[Custom Cloud] Restarting cloud connection...", "color:#00ffff");
      cloud.disconnect?.();
      setTimeout(() => cloud.connect?.(), 400);
    } else {
      console.warn("[Custom Cloud] Could not find Scratch VM cloud device.");
    }
  }, 1200);
  let checkVM = setInterval(() => {
  if (vm?.runtime?.ioDevices?.cloud) {
    clearInterval(checkVM);
    const cloud = vm.runtime.ioDevices.cloud;
    cloud.disconnect?.();
    setTimeout(() => cloud.connect?.(), 400);
  }
}, 300);
})();
