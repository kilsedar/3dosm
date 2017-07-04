define(['libraries/WebWorldWind/src/WorldWind', 'src/OSMBuildingLayer'],
  function (WorldWind, OSMBuildingLayer) {
    "use strict";

    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_ERROR);
    WorldWind.configuration.baseUrl = "http://localhost/3dosm/libraries/WebWorldWind/";

    // Create the WorldWindow.
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
      // interiorColor: new WorldWind.Color(0.67, 0.25, 0.020, 1.0),
      interiorColor: new WorldWind.Color(0.02, 0.2, 0.7, 1.0),
      applyLighting: true,
      extrude: true,
      heatmap: {enabled: true, thresholds: [0, 30, 50, 100, 900]},
      altitude: "osm",
      altitudeMode: WorldWind.RELATIVE_TO_GROUND
    };
    // var osmMilan = new OSMBuildingLayer(worldWindow, [45.48, 9.45, 45.50, 9.50], configuration);
    // var osmMilan = new OSMBuildingLayer(worldWindow, [45.45, 9.05, 45.5, 9.1], configuration);
    // var osmMilan = new OSMBuildingLayer(worldWindow, [45.3871, 9.04284, 45.536, 9.27791], configuration);
    // var osmMilan = new OSMBuildingLayer(worldWindow, [45.48, 9.2, 45.49, 9.21], configuration); // buggy region (nodes)
    // var osmMilan = new OSMBuildingLayer(worldWindow, [45.4557, 9.1705, 45.4735, 9.2021], configuration); // center
    /* osmMilan.add();
    osmMilan.zoom(); */
    // var osmNewYork = new OSMBuildingLayer(worldWindow, [40.6998, -74.0232, 40.74, -73.97], configuration);
    var osmNewYork = new OSMBuildingLayer(worldWindow, [40.70, -74.03, 40.72, -74.0], configuration);
    osmNewYork.add();
    osmNewYork.zoom();
});
