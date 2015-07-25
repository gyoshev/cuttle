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
        result = suggestions.map(function(x) {
            return x.format;
        }).join("\n");
    }

    $("output").value = result;
}

document.body.addEventListener("input", suggest);
document.addEventListener("DOMContentLoaded", suggest);

window.cuttle = cuttle;
