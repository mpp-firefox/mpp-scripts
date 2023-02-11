// ==UserScript==
// @name         MPP Second Color
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Ability to have a second color in MPP
// @author       MPP Firefox, Anonygold
// @match        https://multiplayerpiano.com/*
// @match        https://mppclone.com/*
// @match        https://mpp.141.lv/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACDSURBVDhPY2TABooL/kNZBAGKAXxFOURrhAG4AXKF6SRrBgGwAXqFyWRpBgGwAXYFceQb4JcfRbZmEGCMyw+jzIC8vEDKDKjL86XMgP5cD8oMmJ/jQpkBIGJ9jj3ZhoAN2J9tTZkBIHA+y5wsQ+AGgMD9LCOSDUExAAbeZ+oRaRADAwAarSM3FaaFtwAAAABJRU5ErkJggg==
// @grant        none
// ==/UserScript==

//
//
//   hi, don't mind the horrible code
//
//

//   thank Anonygold for the "second color at top" option, ok?

const _sc_init = () => {
    const _sc_version = "1.6";
    let _sc_actualVersion;
    window._sc_users = {};

    console.log("MPP Second Color loaded!");

    //if (window.localStorage.getItem("secondColor") === null) window.localStorage.setItem("secondColor", "#000000");

    let currentSecondColor = window.localStorage.getItem("secondColor") || '#777777';
    let currentAtTop = (window.localStorage.getItem("atTop") === 'true') || false;

    const _sc_colorInvalid = sc => {
        return typeof sc !== "string" || !CSS.supports("color", sc) || sc.length !== 7;
    }

    const _sc_sendColor = (sc, atTop, global, user, req) => {
        if (_sc_colorInvalid(sc)) sc = MPP.client.getOwnParticipant().color;

        window.localStorage.setItem("secondColor", sc);

        currentSecondColor = sc;

        const top = String(atTop) === 'true';

        window.localStorage.setItem("atTop", top);

        currentAtTop = top;

        if (global) MPP.client.sendArray([{m: "custom", data: {sc, atTop: top, requestSc: req}, target: {mode: "subscribed"}}]);
        else MPP.client.sendArray([{m: "custom", data: {sc, atTop: top, requestSc: req}, target: {mode: "id", id: user}}]);
    }

    MPP.client.on('hi', () => MPP.client.sendArray([{m: "+custom"}]));

    MPP.client.on('ch', () => {
        let sc = currentSecondColor;
        if (sc === null) window.localStorage.setItem("secondColor", MPP.client.getOwnParticipant().color), sc = window.localStorage.getItem("secondColor");
        const participant = MPP.client.getOwnParticipant();
        if (_sc_colorInvalid(sc)) sc = participant.color;

        const background = currentAtTop ? `linear-gradient(${
            sc
        }, ${
            participant.color
        })` : `linear-gradient(${
            participant.color
        }, ${
            sc
        })`;

        if (participant.nameDiv) {
            participant.nameDiv.style.background = background;
        }
        if (participant.cursorDiv) {
            participant.cursorDiv.getElementsByClassName("name")[0].style.background = background;
        }

        _sc_sendColor(sc, currentAtTop, true, "", true);
    });

    MPP.client.on('p', msg => {
        let sc = currentSecondColor;
        if (sc === null) window.localStorage.setItem("secondColor", MPP.client.getOwnParticipant().color), sc = window.localStorage.getItem("secondColor");
        if (_sc_colorInvalid(sc)) sc = MPP.client.getOwnParticipant().color;

        _sc_sendColor(sc, currentAtTop, false, msg._id, true);
    });

    MPP.client.on('custom', msg => {
        if (msg.data.sc !== undefined) {
            let sc = msg.data.sc;
            let participant = MPP.client.findParticipantById(msg.p);

            if (_sc_colorInvalid(sc)) sc = participant.color;

            const background = msg.data.atTop ? `linear-gradient(${
                sc
            }, ${
                participant.color
            })` : `linear-gradient(${
                participant.color
            }, ${
                sc
            })`;

            if (participant.nameDiv) {
              participant.nameDiv.style.background = background;
            }
            if (participant.cursorDiv) {
              participant.cursorDiv.getElementsByClassName("name")[0].style.background = background;
            }

            if (participant.tag === undefined)
                participant.nameDiv.title = "This user is using Second Color."; else switch (participant.tag.text) {
                default:
                case '':
                case undefined:
                    participant.nameDiv.title = "This user is using Second Color.";
                    break;

                case 'BOT':
                    participant.nameDiv.title = "This is an authorized bot, which is using Second Color.";
                    break;

                case 'MOD':
                    participant.nameDiv.title = "This user is an official moderator of the site that is using Second Color.";
                    break;

                case 'ADMIN':
                    participant.nameDiv.title = "This user is an official administrator of the site that is using Second Color.";
                    break;

                case 'OWNER':
                    participant.nameDiv.title = "This user is the owner of the site and is using Second Color.";
                    break;

                case 'MEDIA':
                    participant.nameDiv.title = "This is a well known person on Twitch, Youtube, or another platform and is using Second Color.";
                    break;
            }

            window._sc_users[participant._id] = participant.name;

            if (_sc_colorInvalid(window.localStorage.getItem("secondColor"))) window.localStorage.setItem("secondColor", MPP.client.getOwnParticipant().color);
            let _sc = window.localStorage.getItem("secondColor");

            if (msg.data.requestSc && msg.p !== MPP.client.getOwnParticipant().id) _sc_sendColor(_sc, currentAtTop, false, msg.p);
        }
    });

    $("#rename .submit").click(() => {
        const participant = MPP.client.getOwnParticipant();

        const name = $("#rename input[name=name]").val();
        const fcolor = $("#rename input[name=color]").val();
        const scolor = $("#rename input[name=secondcolor]").val();
        const top = document.querySelector('#rename input[id="second-color-at-top"]').checked;

        MPP.client.sendArray([{m: "userset", set: {name, color: fcolor}}]);
        if (scolor !== window.localStorage.getItem("secondColor") || top !== (window.localStorage.getItem("atTop") === 'true')) _sc_sendColor(scolor, top, true);

        if (participant.nameDiv) {
          participant.nameDiv.style.background = top ? `linear-gradient(${scolor}, ${fcolor})` : `linear-gradient(${fcolor}, ${scolor})`;
        }
        if (participant.cursorDiv) {
          participant.cursorDiv.style.background = top ? `linear-gradient(${scolor}, ${fcolor})` : `linear-gradient(${fcolor}, ${scolor})`;
        }
    });

    const _sc_createButtons = () => {
        let br = document.createElement("br");
        $("#rename p .text")[0].after(br);

        let button = document.createElement("input");

        let color = (window.localStorage.getItem("secondColor") === null || _sc_colorInvalid(window.localStorage.getItem("secondColor")))
        ? MPP.client.getOwnParticipant().color : window.localStorage.getItem("secondColor");

        button.setAttribute("type", "color");
        button.setAttribute("class", "color");
        button.setAttribute("placeholder", "");
        button.setAttribute("value", color);
        button.setAttribute("maxlength", 7);
        button.setAttribute("name", "secondcolor");

        const _button = document.createElement("button");

        _button.innerText = "Invert";
        _button.setAttribute("class", "ugly-button");
        _button.setAttribute("id", "invert");
        _button.style = "margin-left: 10px; width: 50px; height: 27px; user-select: none; color: white";

        _button.onclick = () => {
            let ___yes = $("#rename p .color")[0].value;
            $("#rename p .color")[0].value = button.value;
            button.value = ___yes;
        }

        const label = document.createElement("label");

        label.innerText = ' Second color at top: ';
        label.style.fontSize = '16px';
        label.setAttribute("id", "scattop");

        const checkbox = document.createElement("input");

        checkbox.type = 'checkbox';
        checkbox.id = 'second-color-at-top';
        checkbox.checked = currentAtTop;

        label.appendChild(checkbox);

        $("#rename p").append(button).append(_button).append(label);

        let _br = document.createElement("br");
        $("#rename p #scattop")[0].before(_br);
    }

    _sc_createButtons();

    setTimeout(() => {
        fetch(new Request("https://raw.githubusercontent.com/mpp-firefox/mpp-scripts/main/_sc_version.txt")).then(response => response.text().then(text => {
            _sc_actualVersion = text.trim();
            if (_sc_actualVersion !== _sc_version) {
                let _sc_notification = new MPP.Notification({
                    title: "Your Second Color version is outdated!",
                    text: `You have ${_sc_version} while the latest is ${_sc_actualVersion}! Please get the new version from: https://github.com/mpp-firefox/mpp-scripts`, target: "#piano", duration: 10000
                });
            }
        }));

    }, 3000);

};

const _sc_mppExists = time => {
    if (window.MPP === undefined) requestAnimationFrame(_sc_mppExists); else _sc_init();
}

requestAnimationFrame(_sc_mppExists);
