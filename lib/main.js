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

function suggestParameterFunction(functionName, min, max) {
    return function(color, target) {
        var func = registry.get(functionName);
        var amount = { value: 1 };
        var start = min || 1;
        var end = max || 100;

        var result = [];

        for (var val = start; val <= end; val++) {
            if (!val) {
                continue;
            }

            amount.value = val;

            var newColor = func(color, amount);
            var difference = target.difference(newColor);

            result.push({
                color: newColor,
                difference: difference,
                complexity: Math.abs(val),
                format: functionName + "(@input, " + amount.value + "%)"
            });

            if (difference < 0.05) {
                break;
            }
        }

        return best(result, target)[0];
    };
}

var functions = {
    identity: function(color, target) {
        return {
            color: color,
            complexity: 0,
            difference: target.difference(color),
            format: "@input"
        };
    },
    contrast: function(color, target) {
        var contrast = registry.get("contrast");
        var result = contrast(color);
        return {
            color: result,
            complexity: 0,
            difference: target.difference(result),
            format: "contrast(@input)"
        };
    },
    spin: suggestParameterFunction("spin", -359, 359),
    lighten: suggestParameterFunction("lighten"),
    darken: suggestParameterFunction("darken"),
    desaturate: suggestParameterFunction("desaturate"),
    saturate: suggestParameterFunction("saturate")
};

function best(results, target) {
    results.sort(function(a, b) {
        return a.difference < b.difference ? -1 :
               a.difference > b.difference ? 1 :
                 a.complexity < b.complexity ? -1 :
                 a.complexity > b.complexity ? 1 : 0;
    });

    return results.filter(function(x) {
        return x && x.color.similarTo(target);
    });
}

function asColor(color) {
    if ((/^#/).test(color)) {
        color = color.substring(1);
    }

    return new Color(color);
}

function suggest(from, to) {
    if (!from) {
        throw new Error("cannot suggest without input");
    }

    from = asColor(from);
    to = asColor(to);

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
