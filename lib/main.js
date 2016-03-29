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
    return function(color, target, preprocessor) {
        var func = registry.get(functionName);
        var result = func(color);
        return {
            color: result,
            complexity: 0,
            difference: target.difference(result),
            format: format("{" + functionName + "}({input})", preprocessor)
        };
    };
}

function suggestParameterFunction(functionName, min, max, unit) {
    return function(color, target, preprocessor) {
        var func = registry.get(functionName);
        var amount = { value: 1 };
        var start = min || 1;
        var end = max || 100;

        var result = [];

        if (typeof unit == "undefined") {
            unit = "%";
        }

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
                format: format("{" + functionName + "}({input}, " + val + unit + ")", preprocessor)
            });

            if (difference < 0.05) {
                break;
            }
        }

        return best(result, target)[0];
    };
}

function suggestBlendingFunction(functionName) {
    return function(color, target, preprocessor) {
        var func = registry.get(functionName);
        var result = [];

        for (var i = 1; i < 254; i++) {
            var blendColor = new Color([i, i, i]);
            var newColor = func(color, blendColor);
            var difference = target.difference(newColor);

            result.push({
                color: newColor,
                difference: difference,
                complexity: 50,
                format: format("{" + functionName + "}({input}, " + blendColor.toCSS() + ")", preprocessor)
            });
        }

        return best(result, target)[0];
    };
}

var dialects = {
    less: {
        input: "@input"
    },
    sass: {
        input: "$input",
        greyscale: "grayscale",
        spin: "adjust-hue",

        multiply: "blend-multiply",
        screen: "blend-screen",
        overlay: "blend-overlay",
        difference: "blend-difference",
        exclusion: "blend-exclusion",
        softlight: "blend-softlight"
    }
};

function format(string, preprocessor) {
    return string.replace(/{([^}]+)}/g, function(_, id) {
        return dialects[preprocessor][id] || id;
    });
}

function availableIn(preprocessors) {
    return function(suggestingFunction) {
        suggestingFunction.preprocessors = preprocessors;
        return suggestingFunction;
    };
}

var lessOnly = availableIn([ "less" ]);

var functions = {
    identity: function(color, target, preprocessor) {
        return {
            color: color,
            complexity: 0,
            difference: target.difference(color),
            format: format("{input}", preprocessor)
        };
    },
    lighten: suggestParameterFunction("lighten"),
    darken: suggestParameterFunction("darken"),
    saturate: suggestParameterFunction("saturate"),
    desaturate: suggestParameterFunction("desaturate"),
    spin: suggestParameterFunction("spin", -359, 359, ''),
    greyscale: suggestSimpleFunction("greyscale"),

    multiply: suggestBlendingFunction("multiply"),
    screen: suggestBlendingFunction("screen"),
    overlay: suggestBlendingFunction("overlay"),
    difference: suggestBlendingFunction("difference"),
    exclusion: suggestBlendingFunction("exclusion"),
    softlight: suggestBlendingFunction("softlight"),

    contrast: lessOnly(suggestSimpleFunction("contrast"))

    // TODO: SASS-only: complement, invert, mix
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

function suggest(from, to, preprocessor) {
    if (!from) {
        throw new Error("cannot suggest without input");
    }

    from = asColor(from);
    to = asColor(to);
    preprocessor = preprocessor || "less";

    if ((from.rgb.length != 3) || (to.rgb.length != 3)) {
        return [];
    }

    var result = Object.keys(functions).map(function(name) {
        var suggestingFunction = functions[name];
        var preprocessors = suggestingFunction.preprocessors;

        if (preprocessors && preprocessors.indexOf(preprocessor) < 0) {
            return;
        }

        return suggestingFunction(from, to, preprocessor);
    }).filter(Boolean);

    return best(result, to);
}

if (module) {
    module.exports = {
        suggest: suggest
    };
}
