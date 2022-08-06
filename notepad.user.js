// ==UserScript==
// @name         MilkyWayIdle Notepad
// @version      0.1
// @description  adds an ingame notepad that saves in localStorage
// @author       D4M4G3X
// @match        https://www.milkywayidle.com/game
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const css = document.createElement("style");
    css.textContent = `
.d4np_wrap {
  font-family: poppins;
  font-weight: 300;
  height: 90%;
  padding: 10px 20px 10px 5px;
  border-radius: 32px;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.1);
}

.d4np_notepad {
  margin-top: 5px;
  height: 50% !important;
  resize: none;
}

.d4ui_input {
  padding: 10px;
  height: 30px;
  width: 100%;
  color: #FFF;
  border: none;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.2);
}

.d4ui_input:focus {
  outline: none;
}

.d4ui_selector_wrap {
  display: flex;
  gap: 3px;
  margin: 5px 0;
}

.d4ui_selector_input {
  width: 100%;
  height: 30px;
  padding: 0 5px;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.2);
}

.d4ui_selector_input > option {
  color: #000;
}

.d4ui_selector_input > option:nth-child(odd) {
  background-color: #EEE;
}

.d4ui_selector_button {
  width: 30px;
  height: 30px;
  color: #FFF;
  font-size: 21px;
  border: 2px solid #999;
  border-radius: 100%;
}

.d4ui_selector_button_add {
  background-color: #0F0;
}

.d4ui_selector_button_remove {
  background-color: #F00;
}
`;
    document.body.append(css);

        class UserInterface {
        addSection(parent, name, content) {
            const tabContainer = parent.querySelector(".MuiTabs-flexContainer");
            const sectionContainer = parent.querySelector("[class^=TabsComponent_tabPanelsContainer__]");
            const tab = this.createTab(name);
            const section = this.createSection(name, content);
            tabContainer.addEventListener("click", evt => {
                let root = evt.target;
                if (evt.target.classList.contains("MuiTab-root")) {
                    root = evt.target;
                } else if (evt.target.classList.contains("MuiBadge-root")) {
                    root = evt.target.parentNode;
                }

                Array.from(tabContainer.children).forEach(el => {
                    let mode = el === root ? "add" : "remove";
                    el.classList[mode]("Mui-selected");
                    el.setAttribute("aria-selected", mode === "add");
                    el.setAttribute("tabindex", mode === "add" ? 0 : -1);
                });
                Array.from(sectionContainer.children).forEach(el => {
                    if (root.classList.contains("d4ui_tab_" + name)) {
                        el.classList.add("TabPanel_hidden__26UM3");
                        if(el.classList.contains("d4ui_section_" + name)) {
                            el.classList.remove("TabPanel_hidden__26UM3");
                        }
                    }
                });
            });
            tabContainer.append(tab);
            sectionContainer.append(section);
        }

        createTab(name) {
            const clone = document.querySelector(".MuiTab-root").cloneNode();
            clone.textContent = name;
            clone.className += " d4ui_tab_" + name;
            return clone;
        }

        createSection(name, content) {
            const clone = document.querySelector("[class^=TabPanel_tabPanel__]").cloneNode();
            clone.innerHTML = "";
            clone.append(content);
            clone.className += " d4ui_section_" + name;
            return clone;
        }

        createSelector(data) {
            const elem = {};
            elem.wrap = document.createElement("div");
            elem.wrap.className = "d4ui_selector_wrap";

            elem.select = document.createElement("select");
            elem.select.className = "d4ui_input d4ui_selector_input";
            elem.select.addEventListener("change", evt => {
                data.changeCallback(data.ref, evt.target.value);
            });
            elem.wrap.append(elem.select);

            const btns = [["add", "+"], ["remove", "-"]];
            btns.forEach(btn => {
                if (btn[0] + "Callback" in data && typeof data[btn[0] + "Callback"] === "function") {
                    const el = document.createElement("button");
                    el.className = "d4ui_selector_button d4ui_selector_button_" + btn[0];
                    el.textContent = btn[1];
                    el.addEventListener("click", evt => {
                        data[btn[0] + "Callback"](data.ref, evt);
                    });
                    elem.wrap.append(el);
                }
            });

            return elem;
        }
    }

    const ui = new UserInterface();

    class Notepad {
        elem = {};
        noteData = {
            notes: [],
            current: 0,
        };
        currentNote = 0;
        lastChange = 0;
        constructor() {
            this.load(this);
            this.create(this);
            this.initEditor(this);
            this.update(this);
        }
        create(np) {
            np.elem.wrap = document.createElement("div");
            np.elem.wrap.classList.add("d4np_wrap");

            const title = document.createElement("input");
            title.className = "d4ui_input";
            title.addEventListener("input", evt => {
                np.onInput(np, "title", evt);
            });
            np.elem.title = title;

            const area = document.createElement("textarea");
            area.id = "d4np_notepad";
            area.className = "d4np_notepad d4ui_input";
            area.addEventListener("input", evt => {
                np.onInput(np, "content", evt);
            });
            np.elem.area = area;

            const selector = ui.createSelector({
                ref: np,
                addCallback: np.addNote,
                removeCallback: np.removeNote,
                changeCallback: np.switchNote,
            });
            np.elem.selector = selector.select;

            np.elem.wrap.append(selector.wrap);
            np.elem.wrap.append(title);
            np.elem.wrap.append(area);
        }

        initEditor(np) {
            const init = setInterval(_=>{
                const editor = document.querySelector("#d4np_notepad");
                if (editor) {
                    clearInterval(init);
                    // Init Editor Plugin
                }
            }, 250);
        }

        update(np) {
            np.elem.title.value = np.noteData.notes[np.noteData.current].title;
            np.elem.area.value = np.noteData.notes[np.noteData.current].content;

            np.elem.selector.textContent = "";
            for (let opt in np.elem.selector.options) {
                np.elem.selector.options.remove(0);
            }
            np.noteData.notes.forEach((note, index) => {
                let opt = document.createElement("option");
                opt.value = index;
                opt.textContent = note.title;
                np.elem.selector.append(opt);
            });
            np.elem.selector.value = np.noteData.current;
        }
        load(np) {
            np.noteData = JSON.parse(localStorage.getItem("d4np_noteData")) || {
                notes: [{
                    title: "New Note",
                    content: "",
                }],
                current: 0,
            };
        }
        save(np) {
            setTimeout(_=> {
                if (new Date().getTime() - np.lastChange > 1000) {
                    localStorage.setItem("d4np_noteData", JSON.stringify(np.noteData));
                    np.update(np);
                }
            }, 1500);
        }

        onInput(np, type, evt) {
            np.lastChange = new Date().getTime();
            np.noteData.notes[np.noteData.current][type] = evt.target.value;
            np.save(np);
        }

        switchNote(np, value) {
            np.lastChange = new Date().getTime() - 1000;
            np.noteData.current = value;
            np.update(np);
            np.save(np);
        }

        addNote(np) {
            np.noteData.notes.push({
                title: "New Note",
                content: "",
            });
            np.noteData.current = np.noteData.notes.length - 1;
            np.lastChange = new Date().getTime() - 1000;
            np.update(np);
            np.save(np);
        }
        removeNote(np) {
            if (confirm("Are you sure you want to remove this note?")) {
                np.noteData.notes.splice(np.noteData.current, 1);
                np.noteData.current = Math.max(np.noteData.current - 1, 0);
                if (!np.noteData.notes.length) {
                    np.noteData.notes.push({
                        title: "New Note",
                        content: "",
                    });
                }
                np.lastChange = new Date().getTime() - 1000;
                np.update(np);
                np.save(np);
            }
        }
    }

    const init = () => {
        const notepad = new Notepad();
        const tabsParent = document.querySelector("[class^=CharacterManagement_tabsComponentContainer__]");
        ui.addSection(tabsParent, "Notepad", notepad.elem.wrap);
    }

    const initRef = setInterval(_ => {
        if (document.querySelector("[class^=CharacterManagement_tabsComponentContainer__]")) {
            clearInterval(initRef);
            init();
        }
    }, 250);
})();

