var assert = require("assert");
var suggest = require("../lib/main").suggest;

describe("Cuttle", function(){
  describe("#suggest()", function(){
    var suggestion;
    function firstFormat(from, to) {
        var suggestions = suggest(from, to);

        if (!suggestions.length) {
            throw new Error("Nothing suggested!");
        }

        return suggestions[0].format;
    }
    assert.contains = function(haystack, needle, message) {
        assert(haystack.indexOf(needle) > -1, message ||
               (haystack + " does not contain " + needle));
    };
    it("throws when called without input", function(){
      assert.throws(suggest);
    });
    it("should suggest contrast", function() {
      suggestion = firstFormat("fff", "000");
      assert.contains(suggestion, "contrast(@input)");
    });
    it("should suggest identity", function() {
      suggestion = firstFormat("000", "000");
      assert.contains(suggestion, "@input");
    });
    it("should suggest lighten", function() {
      suggestion = firstFormat("000000", "030303");
      assert.contains(suggestion, "lighten(@input, 1%)");

      suggestion = firstFormat("000000", "050505");
      assert.contains(suggestion, "lighten(@input, 2%)");
    });
    it("should suggest darken", function() {
      suggestion = firstFormat("cccccc", "c9c9c9");
      assert.contains(suggestion, "darken(@input, 1%)");

      suggestion = firstFormat("cccccc", "c4c4c4");
      assert.contains(suggestion, "darken(@input, 3%)");
    });
    it("should suggest desaturate", function() {
      suggestion = firstFormat("80e619", "80cc33");
      assert.contains(suggestion, "desaturate(@input, 20%)");
    });
    it("should suggest saturate", function() {
      suggestion = firstFormat("80e619", "80ff00");
      assert.contains(suggestion, "saturate(@input, 20%)");
    });
    it("should handle hashes", function() {
      suggestion = firstFormat("#000", "#000");
      assert.contains(suggestion, "@input");
    });
    it("should handle named colors", function() {
      suggestion = firstFormat("black", "#000");
      assert.contains(suggestion, "@input");
    });
  });
});
