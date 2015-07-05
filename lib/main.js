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
    identity: function(color, target) {
        return {
            color: color,
            difference: target.difference(color),
            format: "@input"
        };
    },
    lighten: function(color, target) {
        var lighten = registry.get("lighten");
        var amount = { value: 1 };

        var result = [];

        for (var val = 1; val <= 50; val++) {
            amount.value = val;

            var newColor = lighten(color, amount);

            result.push({
                color: newColor,
                difference: target.difference(newColor),
                format: "lighten(@input, " + amount.value + "%)"
            });
        }

        return best(result, target)[0];
    },
    contrast: function(color, target) {
        var contrast = registry.get("contrast");
        var result = contrast(color);
        return {
            color: result,
            difference: target.difference(result),
            format: "contrast(@input)"
        }
    }
};

function best(results, target) {
    results.sort(function(a, b) {
        return a.difference < b.difference ? -1 :
               a.difference > b.difference ? 1 : 0;
    });

    return results.filter(function(x) {
        return x && x.color.similarTo(target);
    });
}

function suggest(from, to) {
    if (!from) {
        throw new Error("cannot suggest without input");
    }

    from = new Color(from);
    to = new Color(to);

    var result = Object.keys(functions).map(function(name) {
        return functions[name](from, to);
    });

    return best(result, to);
}

if (module) {
    module.exports = {
        suggest: suggest
    };
}
