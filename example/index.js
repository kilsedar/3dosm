define(['libraries/WebWorldWind/src/WorldWind', 'src/OSMBuildingLayer', 'src/GeoJSONParserTriangulation'],
  function (WorldWind, OSMBuildingLayer, GeoJSONParserTriangulation) {
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
      interiorColor: new WorldWind.Color(0.67, 0.25, 0.020, 0.8),
      outlineColor: new WorldWind.Color(1.0, 0.25, 0.020, 1.0),
      outlineWidth: 2.0,
      extrude: true,
      altitude: 1e2,
      altitudeMode: WorldWind.RELATIVE_TO_GROUND
    };
    var osmMilanBuilding = new OSMBuildingLayer(worldWindow, [45.95, 9.95, 46, 10], configuration);
    // osmMilanBuilding.log();
    osmMilanBuilding.add();
    osmMilanBuilding.zoom();


    /* var shapeConfigurationCallback = function (geometry, properties) {
      var configuration = {};
      configuration.attributes =  new WorldWind.ShapeAttributes(null);
      configuration.attributes.interiorColor = new WorldWind.Color(0.67, 0.25, 0.020, 0.8);
      configuration.attributes.outlineColor = new WorldWind.Color(1.0, 0.25, 0.020, 1.0);
      configuration.attributes.outlineWidth = 0.5;
      configuration.extrude = true;
      configuration.altitude = 1e3;
      configuration.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

      return configuration;
    }

    var polygon = new WorldWind.RenderableLayer("Polygon");
    var polygonGeoJSON = new GeoJSONParserTriangulation('{"type": "FeatureCollection","features": [{"type": "Feature","properties": {},"geometry": {"type": "Polygon","coordinates": [[[9.155130386352539,45.44429526006493],[9.179420471191406,45.44429526006493],[9.179420471191406,45.45693983584491],[9.155130386352539,45.45693983584491],[9.155130386352539,45.44429526006493]]]}}]}');
    polygonGeoJSON.log();
    polygonGeoJSON.load(null, shapeConfigurationCallback, polygon);
    worldWindow.addLayer(polygon); */
});
