define(['libraries/WebWorldWind/src/WorldWind', 'src/OSMBuildingLayer'],
  function (WorldWind, OSMBuildingLayer) {
    "use strict";

    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_ERROR);
    WorldWind.configuration.baseUrl = "http://localhost/3dosm/libraries/WebWorldWind/";

    // Create the World Window.
    var worldWindow = new WorldWind.WorldWindow("canvas");

    /**
     * Add imagery layers.
     */
    var layers = [
        {layer: new WorldWind.BMNGOneImageLayer(), enabled: true},
        {layer: new WorldWind.BingAerialWithLabelsLayer(), enabled: true},
        {layer: new WorldWind.CoordinatesDisplayLayer(worldWindow), enabled: true},
        {layer: new WorldWind.ViewControlsLayer(worldWindow), enabled: true},
        {layer: new WorldWind.AtmosphereLayer(), enabled: true}
    ];
    // layers[1].layer.detailControl = 1;
    for (var l = 0; l < layers.length; l++) {
        layers[l].layer.enabled = layers[l].enabled;
        worldWindow.addLayer(layers[l].layer);
    }

    var configuration = {
      interiorColor: new WorldWind.Color(0.67, 0.25, 0.020, 0.9),
      extrude: true,
      altitude: 3e2,
      altitudeMode: WorldWind.RELATIVE_TO_GROUND
    };
    var osmMilanBuilding = new OSMBuildingLayer(worldWindow, [45.48, 9.45, 45.50, 9.50], configuration);
    // osmMilanBuilding.log();
    osmMilanBuilding.add();
    osmMilanBuilding.zoom();
});
