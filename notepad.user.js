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
    class Notepad {
        elem = {};
        noteData = {
            notes: [],
            current: 0,
        };
        currentNote = 0;
        lastChange = 0;
        hasChanged = false;
        constructor() {
            this.load(this);
            this.create(this);
            this.update(this);
            this.tickRef = setInterval(_=> this.save(this), 500);
        }
        create(np) {
            np.elem.wrap = document.createElement("div");
            np.elem.wrap.style.height = "90%";
            np.elem.wrap.style.padding = "10px";
            np.elem.wrap.style.borderRadius = "32px";
            np.elem.wrap.style.overflow = "hidden";
            np.elem.wrap.style.backgroundColor = "rgba(0, 0, 0, 0.1)";

            const title = document.createElement("input");
            title.style.width = "100%";
            title.style.height = "30px";
            title.style.color = "#FFF";
            title.style.border = "none";
            title.style.backgroundColor = "transparent";
            title.addEventListener("input", evt => {
                np.lastChange = new Date().getTime();
                np.hasChanged = true;
                np.noteData.notes[np.noteData.current].title = evt.target.value;
            });
            title.addEventListener("focus", function () {
                this.style.outline = "none";
            });
            np.elem.title = title;

            const area = document.createElement("textarea");
            area.style.width = "100%";
            area.style.height = "50%";
            area.style.color = "#FFF";
            area.style.padding = "10px";
            area.style.resize = "none";
            area.style.border = "none";
            area.style.borderTop = "1px dotted #999";
            area.style.backgroundColor = "transparent";
            area.addEventListener("input", evt => {
                np.lastChange = new Date().getTime();
                np.hasChanged = true;
                np.noteData.notes[np.noteData.current].content = evt.target.value;
            });
            area.addEventListener("focus", function () {
                this.style.outline = "none";
            });
            np.elem.area = area;

            const [selectorWrap, selector] = np.createSelector(np, {
                add: np.addNote,
                remove: np.removeNote,
                change: np.switchNote,
            });
            np.elem.selector = selector;

            np.elem.wrap.append(selectorWrap);
            np.elem.wrap.append(title);
            np.elem.wrap.append(area);

        }

        createSelector(np, data) {
            const wrap = document.createElement("div");
            wrap.style.display = "flex";
            wrap.style.gap = "3px";
            wrap.style.margin = "5px 0";

            const selector = document.createElement("select");
            selector.style.width = "100%";
            selector.style.height = "30px";
            selector.style.padding = "0 5px";
            selector.style.borderRadius = "16px";
            selector.addEventListener("change", evt => {
                data.change(np, evt.target.value);
            });

            const btn = document.createElement("button");
            btn.style.width = "30px";
            btn.style.height = "30px";
            btn.style.color = "#FFF";
            btn.style.fontSize = "21px";
            btn.style.border = "2px solid #999";
            btn.style.borderRadius = "100%";

            const btnAdd = btn.cloneNode();
            btnAdd.textContent = "+";
            btnAdd.style.backgroundColor = "#0F0";

            const btnRemove = btn.cloneNode();
            btnRemove.textContent = "-";
            btnRemove.style.backgroundColor = "#F00";

            wrap.addEventListener("click", evt => {
                if (evt.target === btnAdd) {
                    data.add(np);
                } else if (evt.target === btnRemove) {
                    data.remove(np);
                }

            });

            wrap.append(selector);
            wrap.append(btnAdd);
            wrap.append(btnRemove);

            return [wrap, selector];
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
                opt.style.width = "90%";
                if (index % 2 === 0) {
                    opt.style.backgroundColor = "#CCC";
                }
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
            if (new Date().getTime() - np.lastChange > 1000 && np.hasChanged) {
                np.hasChanged = false;
                localStorage.setItem("d4np_noteData", JSON.stringify(np.noteData));
                np.update(np);
            }
        }
        switchNote(np, value) {
            np.lastChange = new Date().getTime() - 1000;
            np.hasChanged = true;
            np.noteData.current = value;
        }

        addNote(np) {
            np.noteData.notes.push({
                title: "New Note",
                content: "",
            });
            np.noteData.current = np.noteData.notes.length - 1;
            np.lastChange = new Date().getTime() - 1000;
            np.hasChanged = true;
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
                np.hasChanged = true;
            }
        }
    }

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

    }

    const ui = new UserInterface();
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

