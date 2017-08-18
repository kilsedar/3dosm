define(['libraries/WebWorldWind/src/WorldWind', 'src/OSMLayer'], function (WorldWind, OSMLayer) {
  "use strict";

  describe("OSMLayerTest", function() {
    var osmMilanBuilding = new OSMLayer({}, {type: "boundingBox", coordinates: [-74.03, 40.70, -73.99, 40.72]});
    it("should have the source correctly set", function() {
      expect(osmMilanBuilding.source.type).toEqual("boundingBox");
      expect(osmMilanBuilding.source.coordinates).toEqual([-74.03, 40.70, -73.99, 40.72]);
    });
  });
});
