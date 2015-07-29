var cuttle = require("../lib/main");

function $(selector) { return document.querySelector(selector); }

function suggest(e) {
    var result = "Nothing to suggest :(";
    var from = $("#from input").value;
    var to = $("#to input").value;
    var suggestions = [];

    if (!from || !to) {
        result = "I need more colors!";
    } else {
        suggestions = cuttle.suggest(from, to);
    }

    if (suggestions.length) {
        result = "<ul>" + suggestions.map(function(x) {
            return "<li><span>" + x.format + "</span> will generate <span title='(difference: " + x.difference + ")'>" + x.color.toCSS() + "</span></li>";
        }).join("") + "</ul>";
    }

    $("#suggestions").innerHTML = result;
}

document.body.addEventListener("input", suggest);
document.addEventListener("DOMContentLoaded", suggest);

window.cuttle = cuttle;
