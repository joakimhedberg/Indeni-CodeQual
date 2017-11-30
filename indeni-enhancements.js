// ==UserScript==
// @name Indeni expand alert info
// @version 1.0
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

    $('main-nav').append("<div><button id=\"toggleExpandAlertInfo\" style=\"float:right;\">Expand alert summary</button></div>");

    $("#toggleExpandAlertInfo").on("click", function(){

        alertInfo = $("section.side-pane.open.visible");

        if(globTamper.alertInfoWidth === ""){

            //Save the old width
            globTamper.alertInfoWidth = $(alertInfo).css("width");

            $("section.list").toggle();
            $(alertInfo).css("width", "1000px");

        } else {

            $(alertInfo).css("width", globTamper.alertInfoWidth);
            $("section.list").toggle();
            globTamper.alertInfoWidth = "";

        }
    });

}, 4000);