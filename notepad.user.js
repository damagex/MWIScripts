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
        ref = null;
        lastChange = 0;
        hasChanged = false;
        constructor() {
            this.create(this);
            this.load(this);
            this.tickRef = setInterval(_=> this.save(this), 500);
        }
        create(np) {
            np.ref = document.createElement("textarea");
            np.ref.style.width = "100%";
            np.ref.style.height = "90%";
            np.ref.style.color = "#FFF";
            np.ref.style.padding = "10px";
            np.ref.style.resize = "none";
            np.ref.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
            np.ref.addEventListener("input", evt => {
                np.lastChange = new Date().getTime();
                np.hasChanged = true;
            });
        }
        load(np) {
            np.ref.value = localStorage.getItem("d4np_note");
        }
        save(np) {
            if (new Date().getTime() - np.lastChange > 1000 && np.hasChanged) {
                this.hasChanged = false;
                localStorage.setItem("d4np_note", np.ref.value);
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
        ui.addSection(tabsParent, "Notepad", notepad.ref);
    }

    const initRef = setInterval(_ => {
        if (document.querySelector("[class^=CharacterManagement_tabsComponentContainer__]")) {
            clearInterval(initRef);
            init();
        }
    }, 250);
})();

