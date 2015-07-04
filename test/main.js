var assert = require("assert");
var suggest = require("lib/main").suggest;

describe("whichcolorfunction", function(){
  describe("#suggest()", function(){
    it("without input should throw", function(){
      assert.throws(suggest);
    });
    it("should suggest inverse", function() {
      var suggestions = suggest("fff", "000");
      assert(suggestions.indexOf("contrast(@input)") > -1);
      assert(suggestions.indexOf("@input") == -1);
    });
    it("should suggest identity", function() {
      var suggestions = suggest("000", "000");
      assert(suggestions.indexOf("@input") > -1);
      assert(suggestions.indexOf("contrast(@input)") == -1);
    });
  })
})
