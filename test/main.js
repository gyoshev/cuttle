var assert = require("assert");
var suggest = require("../lib/main").suggest;

describe("Cuttle", function(){
  describe("#suggest()", function(){
    var suggestion;
    function suggestions(from, to, preprocessor) {
        var result = suggest(from, to, preprocessor);

        if (!result.length) {
            throw new Error("Nothing suggested!");
        }

        return result;
    }
    function firstFormat(from, to, preprocessor) {
        return suggestions(from, to, preprocessor)[0].format;
    }
    function allFormats(from, to, preprocessor) {
        return suggestions(from, to, preprocessor).map(function(x) {
            return x.format;
        });
    }
    function allComplexities(from, to, preprocessor) {
        var functionName = /^(.*)\(/i;
        return suggestions(from, to, preprocessor).reduce(function(result, x) {
            var type = functionName.exec(x.format)[1];
            result[type] = x.complexity;
            return result;
        }, {});
    }
    assert.contains = function(haystack, needle, message) {
        assert(haystack.indexOf(needle) > -1, message ||
               (haystack + " does not contain " + needle));
    };
    assert.lt = function(a, b, message) {
        assert(a < b, message || (a + " is not less than " + b));
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
      suggestion = allFormats("000000", "030303");
      assert.contains(suggestion, "lighten(@input, 1%)");

      suggestion = allFormats("000000", "050505");
      assert.contains(suggestion, "lighten(@input, 2%)");
    });
    it("should suggest darken", function() {
      suggestion = allFormats("cccccc", "c9c9c9");
      assert.contains(suggestion, "darken(@input, 1%)");

      suggestion = allFormats("cccccc", "c4c4c4");
      assert.contains(suggestion, "darken(@input, 3%)");
    });
    it("should suggest darken as a simpler format", function() {
      var complexities = allComplexities("cccccc", "c4c4c4");
      assert.lt(complexities.darken, complexities.multiply);
    });
    it("should suggest desaturate", function() {
      suggestion = allFormats("80e619", "80cc33");
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
    it("should suggest spin", function() {
      suggestion = firstFormat("ff0000", "ff2b00");
      assert.contains(suggestion, "spin(@input, 10)");
    });
    it("should suggest negative spin", function() {
      suggestion = firstFormat("00ff00", "2bff00");
      assert.contains(suggestion, "spin(@input, -10)");
    });
    it("should suggest greyscale", function() {
      suggestion = firstFormat("80f20d", "808080");
      assert.contains(suggestion, "greyscale(@input)");
    });
    it("should suggest multiply", function() {
      suggestion = allFormats("ff6600", "331400");
      assert.contains(suggestion, "multiply(@input, #333333)");

      suggestion = allFormats("ff6600", "cc5200");
      assert.contains(suggestion, "multiply(@input, #cccccc)");
    });
    it("should suggest screen", function() {
      suggestion = allFormats("ff6600", "ffa366");
      assert.contains(suggestion, "screen(@input, #666666)");

      suggestion = allFormats("ff6600", "ffc299");
      assert.contains(suggestion, "screen(@input, #999999)");
    });
    it("should suggest overlay", function() {
      suggestion = allFormats("ff6600", "ff2900");
      assert.contains(suggestion, "overlay(@input, #333333)");

      suggestion = allFormats("ff6600", "ffa300");
      assert.contains(suggestion, "overlay(@input, #cccccc)");
    });
    it("should suggest softlight", function() {
      suggestion = allFormats("ff6600", "ff5a00");
      assert.contains(suggestion, "softlight(@input, #666666)");

      suggestion = allFormats("ff6600", "ff8a00");
      assert.contains(suggestion, "softlight(@input, #cdcdcd)");
    });
    it("should suggest difference", function() {
      suggestion = allFormats("ff6600", "cc3333");
      assert.contains(suggestion, "difference(@input, #333333)");

      suggestion = allFormats("ff6600", "663399");
      assert.contains(suggestion, "difference(@input, #999999)");
    });
    it("should suggest exclusion", function() {
      suggestion = allFormats("ff6600", "cc7033");
      assert.contains(suggestion, "exclusion(@input, #333333)");

      suggestion = allFormats("ff6600", "668599");
      assert.contains(suggestion, "exclusion(@input, #999999)");
    });
    it("should suggest sass identity", function() {
      suggestion = firstFormat("000", "000", "sass");
      assert.contains(suggestion, "$input");
    });
    it("should suggest sass lighten", function() {
      suggestion = allFormats("000000", "030303", "sass");
      assert.contains(suggestion, "lighten($input, 1%)");

      suggestion = allFormats("000000", "050505", "sass");
      assert.contains(suggestion, "lighten($input, 2%)");
    });
    it("should suggest sass grayscale", function() {
      suggestion = firstFormat("80f20d", "808080", "sass");
      assert.contains(suggestion, "grayscale($input)");
    });
  });
});
