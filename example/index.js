define(['libraries/WebWorldWind/src/WorldWind',
        'src/OSMBuildingLayer',
        'src/OSMTBuildingLayer'],
       function (WorldWind, OSMBuildingLayer, OSMTBuildingLayer) {
    "use strict";

    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_ERROR);
    WorldWind.configuration.baseUrl = "../libraries/WebWorldWind/";

    // Create the WorldWindow.
    var worldWindow = new WorldWind.WorldWindow("canvas");

    /**
     * Add imagery layers.
     */
    worldWindow.addLayer(new WorldWind.BMNGOneImageLayer());
    var bingAerialWithLabels = new WorldWind.BingAerialWithLabelsLayer();
    bingAerialWithLabels.detailControl = 1;
    worldWindow.addLayer(bingAerialWithLabels);
    worldWindow.addLayer(new WorldWind.CoordinatesDisplayLayer(worldWindow));
    worldWindow.addLayer(new WorldWind.ViewControlsLayer(worldWindow));
    var starFieldLayer = new WorldWind.StarFieldLayer();
    starFieldLayer.time = new Date();
    worldWindow.addLayer(starFieldLayer);
    /* var atmosphereLayer = new WorldWind.AtmosphereLayer();
    atmosphereLayer.lightLocation = WorldWind.SunPosition.getAsGeographicLocation(starFieldLayer.time);
    worldWindow.addLayer(atmosphereLayer); */


    // var source = {type: "boundingBox", coordinates: [-74.0232, 40.6998, -73.97, 40.74]}; // New York (big)
    var source = {type: "boundingBox", coordinates: [-74.03, 40.70, -73.99, 40.72]}; // New York (small)
    // var source = {type: "boundingBox", coordinates: [9.04284, 45.3871, 9.27791, 45.536]}; // Milan (PRIN & big)
    // var source = {type: "boundingBox", coordinates: [9.05, 45.45, 9.10, 45.50]}; // Milan (medium)
    // var source = {type: "boundingBox", coordinates: [9.45, 45.48, 9.50, 45.50]}; // Milan (small)
    // var source = {type: "boundingBox", coordinates: [9.1705, 45.4557, 9.2021, 45.4735]}; // Milan (center)
    // var source = {type: "boundingBox", coordinates: [9.2, 45.48, 9.21, 45.49]}; // Milan (buggy region - nodes)
    // var source = {type: "boundingBox", coordinates: [9.48, 45.18, 9.53, 45.19]}; // region tested in GRASS
    // var source = {type: "GeoJSONFile", path: "data/prin_small_med.geojson"};

    var configuration = {
      // interiorColor: new WorldWind.Color(0.1, 0.7, 0.8, 1.0),
      // interiorColor: new WorldWind.Color(0.02, 0.2, 0.7, 1.0),
      interiorColor: new WorldWind.Color(1.0, 0.1, 0.1, 1.0),
      applyLighting: true,
      extrude: true,
      heatmap: {enabled: true, thresholds: [0, 10, 30, 50, 900]},
      // altitude: {type: "number", value: 100},
      altitude: {type: "osm"},
      // altitude: {type: "property", value: "height_median"},
      altitudeMode: WorldWind.RELATIVE_TO_GROUND
    };

    var test = new OSMBuildingLayer(worldWindow, configuration, source);
    test.add();
    // test.boundingBox = [9.15651, 45.44919, 9.20246, 45.48449]; // prin_small_med.geojson
    // test.boundingBox = [9.18307, 45.46073, 9.20421, 45.46957]; // prin_smaller_med.geojson
    // test.zoom();
});
