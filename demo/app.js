(function() {

var cuttle = require("../lib/main");

function $$(selector, element) {
    return (element || document).querySelectorAll(selector);
}

function $(selector, element) {
    return $$(selector, element)[0];
}

function toArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
}

function next(tagName, node) {
    do {
        node = node.nextSibling;
    } while (node && node.nodeName.toLowerCase() != tagName);

    return node;
}

function inputUpdate(input) {
    var color = input.value;
    var object = next("object", input);
    var paths = $$("[fill='#006884']", object.contentDocument);

    toArray(paths).forEach(function(path) {
        path.style.fill = color;
    });
}

function formatSuggestion(s) {
    var color = s.color.toCSS();
    return "<tr>" +
        "<td class='format'>" + s.format + "</td>" +
        "<td><i class='arrow-small'></i></td>" +
        "<td class='result' style='color: " + color + "'>" +
            color +
        "</td>" +
    "</tr>";
}

function checkedValue(nodes) {
    return Array.prototype.slice.apply(nodes)
        .map(function(x) {
            return x.checked ? x.value : undefined;
        })
        .filter(Boolean)[0];
}

function isBlending(suggestion) {
    return (/^blend-/i).test(suggestion.format);
}

function suggest(e) {
    var result = "<p>Nothing to suggest</p><i class='cry'></i>";
    var fromField = $("#from input");
    var from = fromField.value;
    var toField = $("#to input");
    var to = toField.value;
    var suggestions = [];
    var preprocessor = checkedValue($$("[name=preprocessor]"));

    inputUpdate(fromField);
    inputUpdate(toField);

    if (!from || !to) {
        result = "<p>I need more colors!</p>";
    } else {
        suggestions = cuttle.suggest(from, to, preprocessor);
    }

    if (suggestions.length) {
        result = [].concat([
            "<table>",
            "<colgroup><col><col><col></colgroup>"
        ], suggestions.map(formatSuggestion), [
            "</table>"
        ]).join("");
    }

    if (preprocessor == "sass" && suggestions.some(isBlending)) {
        result += "<p>Note: For blend-* formats, use <a href='https://github.com/heygrady/scss-blend-modes'>scss-blend-modes</a>.</p>";
    }

    $(".suggestions").innerHTML = result;

}

// scroll to section once, to show results

function scrollable(elements) {
    return toArray(elements).filter(function(element) {
        return element.clientHeight < element.offsetHeight;
    })[0];
}

function scrollToSection(e) {
    if (e.target.nodeName.toLowerCase() != "input") {
        return;
    }

    scrollTo(scrollable($$("html,body")), $("section").offsetTop, 500);

    unbind();
}

function unbind() {
    document.body.removeEventListener("focus", scrollToSection, true);
}

document.body.addEventListener("focus", scrollToSection, true);
document.body.addEventListener("input", suggest);
$("fieldset").addEventListener("change", suggest);
window.addEventListener("load", suggest);

window.cuttle = cuttle;

// scrollTo + easing, http://stackoverflow.com/a/16136789/25427
function scrollTo(element, to, duration) {
    var start = element.scrollTop;
    var change = to - start;
    var time = 0;
    var increment = 20;

    function animateScroll() {
        time += increment;
        var val = Math.easeInOutQuad(time, start, change, duration);
        element.scrollTop = val;
        if (time < duration) {
            setTimeout(animateScroll, increment);
        }
    }

    animateScroll();
}

//t = current time
//b = start value
//c = change in value
//d = duration
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};

})();
