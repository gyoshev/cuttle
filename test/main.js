var assert = require("assert");
var util = require("util");
var suggest = require("lib/main").suggest;

describe("whichcolorfunction", function(){
  describe("#suggest()", function(){
    it("should return array", function(){
      assert(util.isArray(suggest()));
    });
    it("should suggest inverse", function() {
      var suggestions = suggest("#fff", "#000");
      assert(suggestions.indexOf("contrast(@input)") > -1);
    });
  })
})
