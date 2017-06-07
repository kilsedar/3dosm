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
      altitude: 1e2
    };
    var osmMilanBuilding = new OSMBuildingLayer(worldWindow, [45.455, 9.145, 45.46, 9.15], configuration, true);
    osmMilanBuilding.log();
    osmMilanBuilding.add();
    osmMilanBuilding.zoom();



    var shapeConfigurationCallback = function (geometry, properties) {
      var configuration = {};
      configuration.attributes =  new WorldWind.ShapeAttributes(null);
      configuration.attributes.interiorColor = new WorldWind.Color(0.67, 0.25, 0.020, 0.8);
      configuration.attributes.outlineColor = new WorldWind.Color(1.0, 0.25, 0.020, 1.0);
      configuration.attributes.outlineWidth = 2.0;
      configuration.extrude = true;
      configuration.altitude = 1e4;
      configuration.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

      return configuration;
    }

    var polygon = new WorldWind.RenderableLayer("Polygon");
    var polygonGeoJSON = new GeoJSONParserTriangulation('{"type": "FeatureCollection","features": [{"type": "Feature","properties": {},"geometry": {"type": "Polygon","coordinates": [[[7.7838134765625,45.598665689820635],[8.052978515625,45.598665689820635],[8.052978515625,45.794339630460705],[7.7838134765625,45.794339630460705],[7.7838134765625,45.598665689820635]]]}}]}');
    polygonGeoJSON.log();
    polygonGeoJSON.load(null, shapeConfigurationCallback, polygon);
    worldWindow.addLayer(polygon);
});
