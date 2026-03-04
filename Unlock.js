function addExtensionButton() {
  if (!window.vm) {
    console.warn("VM not found. Run quickFindVM() first.");
    return;
  }
  if (document.getElementById("loadCustomExtBtn")) return;

  const btn = Object.assign(document.createElement("button"), {
    id: "loadCustomExtBtn",
    textContent: "Load Custom Extension",
    style: {
      position: "fixed",
      top: "10px",
      right: "10px",
      zIndex: 999999,
      padding: "10px 14px",
      background: "#ff6600",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer"
    },
    onclick: () => {
      const choice = prompt("Choose option:\n1 = Paste code\n2 = Load .js file", "1");
      if (!choice || !["1", "2"].includes(choice)) {
        if (choice) alert("Invalid choice (use 1 or 2)");
        return;
      }

      if (choice === "1") {
        const code = prompt("Paste your JS extension code:");
        if (!code) return;
        loadExtensionCode(code);
      } else {
        const input = Object.assign(document.createElement("input"), {
          type: "file",
          accept: ".js"
        });
        input.onchange = e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = ev => loadExtensionCode(ev.target.result);
          reader.readAsText(file);
        };
        input.click();
      }
    }
  });

  document.body.appendChild(btn);
  console.log("🎉 Load Custom Extension button added");
}

function loadExtensionCode(code) {
  try {
    const Scratch = {
      vm: window.vm,
      runtime: window.vm.runtime,
      BlockType: window.vm.runtime.BlockType,
      ArgumentType: window.vm.runtime.ArgumentType,
      extensions: {
        register(ext) {
          window.vm.extensionManager._registerInternalExtension(ext);
        }
      }
    };
    new Function("Scratch", code)(Scratch);
    alert("Extension loaded successfully!");
  } catch (e) {
    console.error(e);
    alert("Failed to load extension. See console for details.");
  }
}

function quickFindVM() {
  for (const el of document.querySelectorAll("*")) {
    for (const key in el) {
      const val = el[key];
      if (val && typeof val === "object") {
        if (val.scratchGui?.vm) {
          window.vm = val.scratchGui.vm;
          console.log("%cVM found via store!", "color:cyan;font-size:14px");
          return window.vm;
        }
        if (val.vm) {
          window.vm = val.vm;
          console.log("%cVM found directly!", "color:cyan;font-size:14px");
          return window.vm;
        }
      }
    }
  }
  console.warn("Quick VM search failed :(");
  return null;
}

// Run once
quickFindVM();
addExtensionButton();
