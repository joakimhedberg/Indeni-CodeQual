// ==UserScript==
// @name Indeni enhancements
// @version 1.1
// @description Make it easier to make alert screenshots
// @match https://indeni.domain.local/*
// @grant none
// @require http://code.jquery.com/jquery-latest.js
// @run-at      document-idle
// ==/UserScript==

//Make sure that the tampermonkey jQuery does not tamper with indeni's scripts
this.$ = this.jQuery = jQuery.noConflict(true);

var globTamper = { alertInfoWidth: "" };

setTimeout(function(){

    $("main-nav").append("<div><button id=\"toggleExpandAlertInfo\" style=\"float:right;\">Expand alert summary</button></div>");

    $("#toggleExpandAlertInfo").on("click", function(){

        var deviceName = $("tr.last td.device").text();
        var alertInfo = $("section.side-pane.open.visible");

        if(globTamper.alertInfoWidth === ""){

            //Save the old width
            globTamper.alertInfoWidth = $(alertInfo).css("width");

            //Save the old style in globTamper, increase the width of the alert details and show the device id
            $("section.list").toggle();
            $("div.side-pane-content div.title div.content_wrap").prepend("<div id=\"alertDetailsDeviceName\" style=\"margin-bottom:20px;font-size:14px;font-weight:bold;\">Device Name: " + deviceName + "<br></div>");
            $(alertInfo).css("width", "1000px");

        } else {

            //Restore the old style and remove the device title
            $(alertInfo).css("width", globTamper.alertInfoWidth);
            $("#alertDetailsDeviceName").remove();
            $("section.list").toggle();
            globTamper.alertInfoWidth = "";

        }
    });

}, 3000);

