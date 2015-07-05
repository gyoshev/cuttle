var assert = require("assert");
var suggest = require("../lib/main").suggest;

describe("whichcolorfunction", function(){
  describe("#suggest()", function(){
    var suggestion;
    function firstFormat(from, to) {
        return suggest(from, to)[0].format;
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
  })
})
