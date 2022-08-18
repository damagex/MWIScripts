// ==UserScript==
// @name         MilkyWayIdle Better Router
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Better router for MilkyWayIdle
// @author       D4M4G3X
// @match        *://*.milkywayidle.com/game
// @icon         https://www.google.com/s2/favicons?sz=64&domain=milkywayidle.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    class MwiRouter {
        historyList = [];

        constructor() {
            const router = this;
            this.historyList.push({
                page: router.getActiveNavLink(),
                tab: router.getActiveTab(router.getActivePanel())
            });

            this.applyFixes();
            this.attachRoutes();

            history.pushState(null, null, window.location.pathname);
            window.addEventListener('popstate', function (event) {
                history.pushState(null, null, window.location.pathname);
                router.historyList.pop();
                if (!router.historyList.length) return false;
                const last = router.historyList[router.historyList.length - 1];
                if (last.page) {
                    last.page.click();
                }
                if (last.tab) {
                    last.tab.click();
                }

                if (last.scrollTops.length) {
                    last.scrollTops.forEach(sect => {
                        sect.section.scrollTop = sect.scrollTop;
                    })
                }
            }, false);
        }

        applyFixes() {
            const navButtons = document.querySelectorAll("[class*=NavigationBar_navigationLink__]");
            [...navButtons].forEach(el => {
                if (el.textContent.includes("Marketplace")) {
                    el.addEventListener("click", evt => {
                        const backButton = document.querySelector("[class*=MarketplacePanel_marketNavButtonContainer__] > div:nth-child(1)");
                        if (backButton) backButton.click();
                    })
                }
            })
        }

        attachRoutes() {
            const router = this;
            const routes = [
                "[class*=NavigationBar_navigationLink__] ",
                "[class*=MarketplacePanel_marketplacePanel__] [class*=Item_itemContainer__]",
                "[class*=GamePage_mainPanel__] [class*=TabsComponent_tabsContainer__]:first-of-type .MuiTab-root",
            ]

            setInterval(_=> {
                const tooltip = document.querySelector(".MuiTooltip-tooltip:not(.done)");
                if (!tooltip) return false;
                tooltip.classList.add("done");
                const btns = tooltip.querySelectorAll("[class*=Button_button__]");
                [...btns].forEach(el => {
                    if (el.textContent.includes("Marketplace")) {
                        router.addHistory(router);
                    }
                });
            }, 500);

            routes.forEach(route => {
                const items = document.querySelectorAll(route);
                [...items].forEach(el => {
                    el.addEventListener("click", evt => {
                        if (evt.pointerId !== 1) return false;
                        router.addHistory(router, route)
                    });
                })
            });
        }

        addHistory(router, route = "") {
            const last = router.historyList[router.historyList.length - 1] || {};
            let scrollTops = [];
            let sections = router.getActivePanel().querySelectorAll("[class*=TabsComponent_tabPanelsContainer__]");
            [...sections].forEach(sect => {
                scrollTops.push({
                    section: sect,
                    scrollTop: sect.scrollTop
                })
            });

            setTimeout(_ => {
                let page = router.getActiveNavLink();
                let tab = router.getActiveTab(router.getActivePanel());
                if (last.tab === tab && last.page === page && !route.includes("Item_itemContainer__")) return false;
                if (router.historyList.length) {
                    last.scrollTops = scrollTops;
                }
                router.historyList.push({
                    page: page,
                    tab: tab,
                    scrollTops: []
                });

            }, 1);
        }

        getActiveNavLink() {
            return document.querySelector("[class*=NavigationBar_active__]");
        }

        getActivePanel() {
            return document.querySelector("[class*=MainPanel_subPanelContainer__]:not([class*=MainPanel_hidden__])");
        }

        getActiveTab(parent) {
            return parent.querySelector(".MuiTab-root.Mui-selected");
        }
    }

    const init = setInterval(() => {
        if (document.querySelector("[class^=NavigationBar_navigationBar]")) {
            clearInterval(init);
            new MwiRouter();
        }
    }, 250);


})();
