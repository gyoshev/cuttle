var less = require("less/lib/less");

function suggest(from, to) {
    return [ "contrast(@input)" ];
}

if (module) {
    module.exports = {
        suggest: suggest
    };
}
