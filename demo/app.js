var cuttle = require("../lib/main");

(function() {

function $(selector) { return document.querySelector(selector); }

var toArray = function(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
}

function inputUpdate(input) {
    var color = input.value;
    input.style.color = color;
    input.style.borderBottomColor = color;

    var paths = input.nextElementSibling.contentDocument.querySelectorAll("[fill='#006884']");

    toArray(paths).forEach(function(path) { path.style.fill = color; });
}

function suggest(e) {
    var result = "<p>Nothing to suggest</p><i class='cry'></i>";
    var fromField = $("#from input");
    var from = fromField.value;
    var toField = $("#to input");
    var to = toField.value;
    var suggestions = [];

    inputUpdate(fromField);
    inputUpdate(toField);

    if (!from || !to) {
        result = "<p>I need more colors!</p>";
    } else {
        suggestions = cuttle.suggest(from, to);
    }

    if (suggestions.length) {
        result = "<ul>" + suggestions.map(function(x) {
            return "<li><span class='format'>" + x.format + "</span><i class='arrow-small'></i><span class='result' title='difference: " + x.difference + "'>" + x.color.toCSS() + "</span></li>";
        }).join("") + "</ul>";
    }

    $("#suggestions").innerHTML = result;
}

document.body.addEventListener("input", suggest);
document.addEventListener("DOMContentLoaded", suggest);

window.cuttle = cuttle;

})();
