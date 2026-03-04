function addExtensionButton() {
    if (!window.vm) {
        console.warn("VM не знайдено, спочатку запусти quickFindVM()");
        return;
    }

    if (document.getElementById('loadCustomExtBtn')) return;

    const btn = document.createElement("button");
    btn.id = 'loadCustomExtBtn';
    btn.textContent = "Load Custom Extension";
    Object.assign(btn.style, {
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 999999,
        padding: "10px",
        background: "#ff6600",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    });

    btn.onclick = () => {
        const choice = prompt("Вибери опцію:\n1 - Вставити код\n2 - Завантажити .js файл", "1");
        if (!choice) return;

        if (choice === "1") {
            const code = prompt("Встав код JS extension:");
            if (!code) return;
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
                alert("Extension loaded!");
            } catch (e) {
                console.error(e);
                alert("Помилка при завантаженні extension. Перевір консоль.");
            }
        } else if (choice === "2") {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".js";
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    try {
                        const code = ev.target.result;
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
                        alert("Extension loaded!");
                    } catch (err) {
                        console.error(err);
                        alert("Помилка при завантаженні extension. Перевір консоль.");
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        } else {
            alert("Невірний вибір (1 або 2)");
        }
    };

    document.body.appendChild(btn);
    console.log("🎉 Кнопка Load Custom Extension додана!");
}

function quickFindVM() {
    const allElements = document.querySelectorAll('*');
    for (let el of allElements) {
        for (let key in el) {
            if (el[key] && typeof el[key] === 'object') {
                if (el[key].scratchGui?.vm) {
                    const vm = el[key].scratchGui.vm;
                    console.log("%cЗнайдено VM через store!", "color:cyan; font-size:14px");
                    window.vm = vm;
                    return vm;
                }
                if (el[key].vm) {
                    const vm = el[key].vm;
                    console.log("%cЗнайдено VM напряму!", "color:cyan; font-size:14px");
                    window.vm = vm;
                    return vm;
                }
            }
        }
    }
    console.warn("Швидкий пошук VM нічого не дав :(");
    return null;
}

quickFindVM()
addExtensionButton()