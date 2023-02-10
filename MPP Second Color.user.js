// ==UserScript==
// @name         MPP Second Color
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Ability to have a second color in MPP
// @author       MPP Firefox
// @match        https://multiplayerpiano.com/*
// @match        https://mppclone.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACDSURBVDhPY2TABooL/kNZBAGKAXxFOURrhAG4AXKF6SRrBgGwAXqFyWRpBgGwAXYFceQb4JcfRbZmEGCMyw+jzIC8vEDKDKjL86XMgP5cD8oMmJ/jQpkBIGJ9jj3ZhoAN2J9tTZkBIHA+y5wsQ+AGgMD9LCOSDUExAAbeZ+oRaRADAwAarSM3FaaFtwAAAABJRU5ErkJggg==
// @grant        none
// ==/UserScript==

//
//
//   hi, don't mind the horrible code
//
//

const _sc_init = () => {
    console.log("MPP Second Color loaded!");
    let _sc_time = Date.now();

    const _sc_colorInvalid = sc => {
        if (typeof sc !== "string") console.log("isn't string.");
        if (!CSS.supports("color", sc)) console.log("isn't color.");
        if (sc.length !== 7) console.log("isn't exact length.");
        return typeof sc !== "string" || !CSS.supports("color", sc) || sc.length !== 7;
    }

    const _sc_sendColor = (sc, global, user, req) => {
        if (_sc_colorInvalid(sc)) sc = MPP.client.getOwnParticipant().color;

        window.localStorage.setItem("secondColor", sc);

        if (global) MPP.client.sendArray([{m: "custom", data: {sc: sc}, target: {mode: "subscribed"}}]);
        else MPP.client.sendArray([{m: "custom", data: {sc: sc, requestSc: req}, target: {mode: "id", id: user}}]);
    }

    MPP.client.on('hi', () => MPP.client.sendArray([{m: "+custom"}]));

    MPP.client.on('ch', () => {
        if (_sc_colorInvalid(window.localStorage.getItem("secondColor"))) window.localStorage.setItem("secondColor", MPP.client.getOwnParticipant().color);
        //_sc_sendColor(window.localStorage.getItem("secondColor"), true);
        MPP.client.getOwnParticipant().nameDiv.style.background = `linear-gradient(${MPP.client.getOwnParticipant().color}, ${window.localStorage.getItem("secondColor")})`;

        //MPP.client.sendArray([{m: "custom", data: {requestSc: "pretty-please"}}]);
    });

    MPP.client.on('participant added', msg => {
        let sc = window.localStorage.getItem("secondColor");
        if (_sc_colorInvalid(sc)) sc = MPP.client.getOwnParticipant().color;

        _sc_sendColor(sc, false, msg._id, true);
    });

    MPP.client.on('custom', msg => {
        if (msg.data.sc !== undefined) {
            console.log(msg.data.sc, msg.p);
            let sc = msg.data.sc;
            let participant = MPP.client.findParticipantById(msg.p);

            if (_sc_colorInvalid(sc)) sc = participant.color;
            if (_sc_colorInvalid(sc)) console.log("color is invalid.");

            participant.nameDiv.style.background = `linear-gradient(${participant.color}, ${sc})`;
            participant.cursorDiv.getElementsByClassName("name")[0].style.background = `linear-gradient(${participant.color}, ${sc})`;

            if (_sc_colorInvalid(window.localStorage.getItem("secondColor"))) window.localStorage.setItem("secondColor", MPP.client.getOwnParticipant().color);
            let _sc = window.localStorage.getItem("secondColor");

            if (msg.data.requestSc) _sc_sendColor(_sc, false, msg.p);
        }
    });

    $("#rename .submit").click(() => {
        let participant = MPP.client.getOwnParticipant();

        let name = $("#rename input[name=name]").val();
        let fcolor = $("#rename input[name=color]").val();
        let scolor = $("#rename input[name=secondcolor]").val();

        MPP.client.sendArray([{m: "userset", set: {name: name, color: fcolor}}]);
        if (scolor !== window.localStorage.getItem("secondColor")) _sc_sendColor(scolor, true);

        //participant.nameDiv.style.background = `linear-gradient(${participant.color}, ${scolor})`;
        participant.nameDiv.style.background = `linear-gradient(${fcolor}, ${scolor})`;
    });

    const _sc_createButton = () => {
        let button = document.createElement("input");

        button.setAttribute("type", "color");
        button.setAttribute("class", "color");
        button.setAttribute("placeholder", "");
        button.setAttribute("maxlength", 7);
        button.setAttribute("name", "secondcolor");

        $("#rename p").append(button);
    }

    _sc_createButton();

};

const _sc_mppExists = time => {
    if (window.MPP === undefined) requestAnimationFrame(_sc_mppExists); else _sc_init();
}

requestAnimationFrame(_sc_mppExists);