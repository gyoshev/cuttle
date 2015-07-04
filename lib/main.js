var chroma = require("chroma-js");
var less = require("less/lib/less/functions")({});
var registry = less.functionRegistry;
var Color = require("less/lib/less/tree/color");

Color.prototype.asLab = function() {
    return chroma.rgb.call(chroma, this.rgb).lab();
};

Color.prototype.difference = function(other) {
    // dE76 implementation
    var a = this.asLab();
    var b = other.asLab();

    function square(x) { return x*x; }
    function sum(x,y) { return x+y; }

    return Math.sqrt(
        [ a[0]-b[0], a[1]-b[1], a[2]-b[2] ]
            .map(square)
            .reduce(sum)
    );
};

Color.prototype.similarTo = function(other) {
    return this.difference(other) < 2.3;
};

var functions = {
    identity: {
        call: function(color) {
            return color;
        },
        format: "@input"
    },
    contrast: {
        call: function(color) {
            var contrast = registry.get("contrast");
            return contrast(color);
        },
        format: "contrast(@input)"
    }
};

function suggest(from, to) {
    if (!from) {
        throw new Error("cannot suggest without input");
    }

    var result = [];

    from = new Color(from);
    to = new Color(to);

    Object.keys(functions).forEach(function(name) {
        var func = functions[name];
        if (func.call(from).similarTo(to)) {
            result.push(func.format)
        }
    });

    return result;
}

if (module) {
    module.exports = {
        suggest: suggest
    };
}
