// ==UserScript==
// @name         MPP Chat Eval
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Send result of "> input" to chat
// @author       MPP Firefox
// @match        https://multiplayerpiano.com/*
// @match        https://mppclone.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

const _ce_init = () => {
    MPP.client.on('a', e => {
        if (e.p._id === MPP.client.getOwnParticipant()._id && e.a.indexOf("> ") === 0) {
            let thing;
            try {
                thing = eval(e.a.substr(2)).toString();
            } catch(err) { thing = err.message.toString() }

            MPP.client.sendArray([{m: "a", message: thing}]);
        }
    });
}

const _ce_mppExists = time => {
    if (window.MPP === undefined) requestAnimationFrame(_ce_mppExists); else _ce_init();
}

requestAnimationFrame(_ce_mppExists);