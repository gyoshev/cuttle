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

function suggestSimpleFunction(functionName) {
    return function(color, target) {
        var func = registry.get(functionName);
        var result = func(color);
        return {
            color: result,
            complexity: 0,
            difference: target.difference(result),
            format: functionName + "(@input)"
        };
    };
}

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
    hslTransform: function(color, target) {
        var h = registry.get("hue");
        var s = registry.get("saturation");
        var l = registry.get("lightness");
        var hsl = registry.get("hsl");

        var inputHsl = [ h(color).value, s(color).value, l(color).value ];
        var targetHsl = [ h(target).value, s(target).value, l(target).value ];

        var coefficients = [
            targetHsl[0] / inputHsl[0],
            targetHsl[1] / inputHsl[1],
            targetHsl[2] / inputHsl[2]
        ];

        var output = hsl(
            inputHsl[0] * coefficients[0] || 0,
            inputHsl[1] * coefficients[1] || 0,
            inputHsl[2] * coefficients[2] || 0
        );

        return {
            color: output,
            complexity: 100,
            difference: target.difference(output),
            format: "hsl(hue(@input) * " + coefficients[0] + ", " +
                        "saturation(@input) * " + coefficients[1] + ", " +
                        "lightness(@input) * " + coefficients[2] + ")"
        };
    },
    contrast: suggestSimpleFunction("contrast"),
    greyscale: suggestSimpleFunction("greyscale"),
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
