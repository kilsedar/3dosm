define(['libraries/WebWorldWind/src/WorldWind', 'src/OSMLayer'], function (WorldWind, OSMLayer) {
  "use strict";

  var wwd = "temp";

  describe("OSMLayerTest", function() {
    var osmMilanBuilding = new OSMLayer(wwd, [45.45, 9.14, 45.46, 9.15], {});
    it("should have the _boundingBox correctly set", function() {
      expect(osmMilanBuilding._boundingBox).toEqual([45.45, 9.14, 45.46, 9.15]);
    });
  });
});
