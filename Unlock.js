let vm = window.vm;
if (!vm) {
  for (let el of document.querySelectorAll("*")) {
    for (let k in el) {
      let v = el[k];
      if (v?.scratchGui?.vm) { vm = v.scratchGui.vm; break; }
      if (v?.vm?.runtime)     { vm = v.vm; break; }
    }
    if (vm) break;
  }
  window.vm = vm;
}
if (!vm?.runtime) {
  console.warn("VM not found");
} else if (!document.getElementById("ldExt")) {
  const b = document.createElement("button");
  b.id = "ldExt";
  b.textContent = "Load .js Ext";
  Object.assign(b.style, {
    position: "fixed", top: "16px", right: "16px", zIndex: 99999999,
    padding: "10px 16px", background: "#e65100", color: "white",
    border: "none", borderRadius: "6px", cursor: "pointer",
    fontWeight: "bold", boxShadow: "0 2px 8px #0004"
  });
  b.onclick = () => {
    const i = document.createElement("input");
    i.type = "file";
    i.accept = ".js";
    i.onchange = e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = ev => {
        try {
          const Scratch = {
            vm, runtime: vm.runtime,
            BlockType: vm.runtime.BlockType,
            ArgumentType: vm.runtime.ArgumentType,
            extensions: { register: ext => vm.extensionManager._registerInternalExtension(ext) }
          };
          new Function("Scratch", ev.target.result)(Scratch);
          alert("Extension loaded: " + f.name);
        } catch (e) {
          console.error(e);
          alert("Load failed – check console");
        }
      };
      r.readAsText(f);
    };
    i.click();
  };
  document.body.appendChild(b);
  console.log("Button added");
}
