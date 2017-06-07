var wwd;

define(['libraries/WebWorldWind/src/WorldWind', 'src/OSMBuildingLayer'],
  function (WorldWind, OSMBuildingLayer) {
    "use strict";

    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_ERROR);
    WorldWind.configuration.baseUrl = "http://localhost/3dosm/libraries/WebWorldWind/";

    // Create the World Window.
    wwd = new WorldWind.WorldWindow("canvas");

    /**
     * Add imagery layers.
     */
    var layers = [
        {layer: new WorldWind.BMNGOneImageLayer(), enabled: true},
        {layer: new WorldWind.BingAerialWithLabelsLayer(), enabled: true},
        {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
        {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true},
        {layer: new WorldWind.AtmosphereLayer(), enabled: true}
    ];
    // layers[1].layer.detailControl = 1;
    for (var l = 0; l < layers.length; l++) {
        layers[l].layer.enabled = layers[l].enabled;
        wwd.addLayer(layers[l].layer);
    }

    var configuration = {
      interiorColor: new WorldWind.Color(0.67, 0.25, 0.020, 0.8),
      outlineColor: new WorldWind.Color(1.0, 0.25, 0.020, 1.0),
      outlineWidth: 2.0,
      altitude: 1e2
    };
    var osmMilanBuilding = new OSMBuildingLayer(wwd, [45.455, 9.145, 45.46, 9.15], configuration, true);
    osmMilanBuilding.log();
    osmMilanBuilding.add();
    osmMilanBuilding.zoom();
});
