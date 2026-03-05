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
      console.log("[Custom Cloud] Redirecting cloud → server");
      const match = location.pathname.match(/projects\/(\d+)/);
      const projectId = match ? match[1] : "default";
      const ws = new OriginalWebSocket(serverUrl);

      ws.addEventListener("open", () => {
        console.log("[Custom Cloud] connected, handshake project", projectId);
        ws.send(JSON.stringify({ method: "handshake", project_id: projectId }));
      });

      ws.addEventListener("message", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.method === "set") {
            const cloud = vm?.runtime?.ioDevices?.cloud;
            if (!cloud) return;
            if (cloud._cloudData[data.name] === undefined) {
              cloud.createCloudVariable(data.name);
            }
            cloud._setCloudVar(data.name, data.value);
            console.log("[Cloud] set", data.name, data.value);
          }
        } catch {}
      });

      ws.addEventListener("error", e => console.log("[Custom Cloud] ws error", e));
      ws.addEventListener("close", () => console.log("[Custom Cloud] ws closed"));

      return ws;
    }
    return new OriginalWebSocket(url, protocols);
  };

  // Перевірка кожні 300ms поки VM не буде готовий
  let checkVM = setInterval(() => {
    const cloud = vm?.runtime?.ioDevices?.cloud;
    if (cloud) {
      clearInterval(checkVM);
      cloud.disconnect?.();
      setTimeout(() => cloud.connect?.(), 400);
    }
  }, 300);
})();
