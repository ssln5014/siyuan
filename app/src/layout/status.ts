/// #if !MOBILE
import {getAllDocks} from "./getAll";
import {updateHotkeyTip} from "../protyle/util/compatibility";
import {exportLayout, getDockByType, resizeTabs} from "./util";
import {hasClosestByClassName} from "../protyle/util/hasClosest";
import {fetchPost} from "../util/fetch";
import {mountHelp} from "../util/mount";
/// #if !BROWSER
import {getCurrentWindow} from "@electron/remote";
/// #endif
/// #endif
import {isBrowser} from "../util/functions";

export const initStatus = () => {
    /// #if !MOBILE
    const allDocks = getAllDocks();
    let menuHTML = "";
    allDocks.forEach(item => {
        menuHTML += `<button class="b3-menu__item" data-type="${item.type}"><svg class="b3-menu__icon""><use xlink:href="#${item.icon}"></use></svg><span class="b3-menu__label">${window.siyuan.languages[item.hotkeyLangId]}</span><span class="b3-menu__accelerator">${updateHotkeyTip(window.siyuan.config.keymap.general[item.hotkeyLangId].custom)}</span></button>`;
    });
    document.getElementById("status").innerHTML = `<div id="barDock" class="toolbar__item b3-tooltips b3-tooltips__e${window.siyuan.config.readonly ? " fn__none" : ""}" aria-label="${window.siyuan.config.uiLayout.hideDock ? window.siyuan.languages.showDock : window.siyuan.languages.hideDock}">
    <svg>
        <use xlink:href="#${window.siyuan.config.uiLayout.hideDock ? "iconDock" : "iconHideDock"}"></use>
    </svg>
    <div class="b3-menu fn__none" style="bottom: 32px;left: 5px">
        ${menuHTML}
    </div>
</div>
<div class="status__msg"></div>
<div class="fn__flex-1"></div>
<div class="status__counter"></div>
<div id="barHelp" class="toolbar__item b3-tooltips b3-tooltips__w" aria-label="${window.siyuan.languages.openBy} ${window.siyuan.languages.help}">
    <svg><use xlink:href="#iconHelp"></use></svg>
    <div class="b3-menu fn__none" style="bottom: 32px;right: 5px">
        <button id="barFeedback" class="b3-menu__item"><svg class="b3-menu__icon""><use xlink:href="#iconHeart"></use></svg><span class="b3-menu__label">${window.siyuan.languages.feedback}</span></button>
        <button id="barLock" class="b3-menu__item"><svg class="b3-menu__icon""><use xlink:href="#iconLock"></use></svg><span class="b3-menu__label">${window.siyuan.languages.lockScreen}</span><span class="b3-menu__accelerator">${updateHotkeyTip(window.siyuan.config.keymap.general.lockScreen.custom)}</span></button>
        <button id="barDebug" class="b3-menu__item${isBrowser() ? " fn__none" : ""}"><svg class="b3-menu__icon""><use xlink:href="#iconBug"></use></svg><span class="b3-menu__label">${window.siyuan.languages.debug}</span></button>
    </div>
</div>`;
    const dockElement = document.getElementById("barDock");
    dockElement.addEventListener("mousemove", () => {
        dockElement.querySelector(".b3-menu").classList.remove("fn__none");
    });
    dockElement.addEventListener("mouseleave", () => {
        dockElement.querySelector(".b3-menu").classList.add("fn__none");
    });
    const helpElement = document.getElementById("barHelp");
    helpElement.addEventListener("mousemove", () => {
        helpElement.querySelector(".b3-menu").classList.remove("fn__none");
    });
    helpElement.addEventListener("mouseleave", () => {
        helpElement.querySelector(".b3-menu").classList.add("fn__none");
    });
    /// #if !BROWSER
    document.querySelector("#barDebug").classList.remove("fn__none");
    /// #endif
    document.querySelector("#status").addEventListener("click", (event) => {
        let target = event.target as HTMLElement;
        while (target.id !== "status") {
            if (target.id === "barDock") {
                const useElement = target.firstElementChild.firstElementChild;
                const dockIsShow = useElement.getAttribute("xlink:href") === "#iconHideDock";
                if (dockIsShow) {
                    useElement.setAttribute("xlink:href", "#iconDock");
                    target.setAttribute("aria-label", window.siyuan.languages.showDock);
                } else {
                    useElement.setAttribute("xlink:href", "#iconHideDock");
                    target.setAttribute("aria-label", window.siyuan.languages.hideDock);
                }
                document.querySelectorAll(".dock").forEach(item => {
                    if (dockIsShow) {
                        if (item.querySelector(".dock__item")) {
                            item.classList.add("fn__none");
                        }
                    } else {
                        if (item.querySelector(".dock__item")) {
                            item.classList.remove("fn__none");
                        }
                    }
                });
                resizeTabs();
                target.querySelector(".b3-menu").classList.add("fn__none");
                event.stopPropagation();
                break;
            } else if (target.id === "barLock") {
                exportLayout(false, () => {
                    fetchPost("/api/system/logoutAuth", {}, () => {
                        window.location.href = "/";
                    });
                });
                event.stopPropagation();
                break;
            } else if (target.id === "barHelp") {
                mountHelp();
                event.stopPropagation();
                break;
            } else if (target.id === "barDebug") {
                /// #if !BROWSER
                getCurrentWindow().webContents.openDevTools({mode: "bottom"});
                /// #endif
                event.stopPropagation();
                break;
            } else if (target.id === "barFeedback") {
                if ("zh_CN" === window.siyuan.config.lang) {
                    window.open("https://ld246.com/article/1649901726096");
                } else {
                    window.open("https://github.com/siyuan-note/siyuan/issues");
                }
                event.stopPropagation();
                break;
            } else if (target.classList.contains("b3-menu__item")) {
                const type = target.getAttribute("data-type") as TDockType;
                getDockByType(type).toggleModel(type);
                if (type === "file" && getSelection().rangeCount > 0) {
                    const range = getSelection().getRangeAt(0);
                    const wysiwygElement = hasClosestByClassName(range.startContainer, "protyle-wysiwyg", true);
                    if (wysiwygElement) {
                        wysiwygElement.blur();
                    }
                }
                target.parentElement.classList.add("fn__none");
                event.stopPropagation();
                break;
            }
            target = target.parentElement;
        }
    });
    if (window.siyuan.config.appearance.hideStatusBar) {
        document.getElementById("status").classList.add("fn__none");
    }
    /// #endif
};

let countRootId: string;
export const countSelectWord = (range: Range, rootID?: string) => {
    /// #if !MOBILE
    if (document.getElementById("status").classList.contains("fn__none")) {
        return;
    }
    const selectText = range.toString();
    if (selectText) {
        fetchPost("/api/block/getContentWordCount", {"content": range.toString()}, (response) => {
            renderStatusbarCounter(response.data);
        });
        countRootId = "";
    } else if (rootID && rootID !== countRootId) {
        countRootId = rootID;
        fetchPost("/api/block/getTreeStat", {id: rootID}, (response) => {
            renderStatusbarCounter(response.data);
        });
    }
    /// #endif
};

export const countBlockWord = (ids: string[], rootID?: string, clearCache = false) => {
    /// #if !MOBILE
    if (document.getElementById("status").classList.contains("fn__none")) {
        return;
    }
    if (clearCache) {
        countRootId = "";
    }
    if (ids.length > 0) {
        fetchPost("/api/block/getBlocksWordCount", {ids}, (response) => {
            renderStatusbarCounter(response.data);
        });
        countRootId = "";
    } else if (rootID && rootID !== countRootId) {
        countRootId = rootID;
        fetchPost("/api/block/getTreeStat", {id: rootID}, (response) => {
            renderStatusbarCounter(response.data);
        });
    }
    /// #endif
};

export const clearCounter = () => {
    countRootId = "";
    document.querySelector("#status .status__counter").innerHTML = "";
};

export const renderStatusbarCounter = (stat: { runeCount: number, wordCount: number, linkCount: number, imageCount: number, refCount: number }) => {
    let html = `<span class="ft__on-surface">${window.siyuan.languages.runeCount}</span>&nbsp;${stat.runeCount}<span class="fn__space"></span>
<span class="ft__on-surface">${window.siyuan.languages.wordCount}</span>&nbsp;${stat.wordCount}<span class="fn__space"></span>`;
    if (0 < stat.linkCount) {
        html += `<span class="ft__on-surface">${window.siyuan.languages.link}</span>&nbsp;${stat.linkCount}<span class="fn__space"></span>`;
    }
    if (0 < stat.imageCount) {
        html += `<span class="ft__on-surface">${window.siyuan.languages.image}</span>&nbsp;${stat.imageCount}<span class="fn__space"></span>`;
    }
    if (0 < stat.refCount) {
        html += `<span class="ft__on-surface">${window.siyuan.languages.ref}</span>&nbsp;${stat.refCount}<span class="fn__space"></span>`;
    }
    document.querySelector("#status .status__counter").innerHTML = html;
};
