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
      height: 1e2
    };
    var osmMilanBuilding = new OSMBuildingLayer(wwd, [45.455, 9.145, 45.46, 9.15], configuration, true);
    osmMilanBuilding.log();
    osmMilanBuilding.add();
    osmMilanBuilding.zoom();




    /* var extrudedConfigurationCallback = function (geometry, properties) {
      var configuration = {};

      configuration.attributes = new WorldWind.ShapeAttributes(null);

      // Fill the polygon with a random pastel color.
      configuration.attributes.interiorColor = new WorldWind.Color(
        0.375 + 0.5 * Math.random(),
        0.375 + 0.5 * Math.random(),
        0.375 + 0.5 * Math.random(),
        1.0
      );

      configuration.attributes.outlineColor = new WorldWind.Color(
        0.5 * configuration.attributes.interiorColor.red,
        0.5 * configuration.attributes.interiorColor.green,
        0.5 * configuration.attributes.interiorColor.blue,
        1.0
      );

      configuration.extrude = true;
      configuration.altitude=properties.height || 1e5;
      configuration.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

      return configuration;
    };

    var sicilyBoundingsLayer = new WorldWind.RenderableLayer("Sicily Boundings");
    var sicilyBoundingsGeoJSON = new WorldWind.GeoJSONParser('{"type":"FeatureCollection","features":[{"type":"' +
    'Feature","properties":{"height":"1e5"},"geometry":{"type":"Polygon","coordinates":[[[12.07397,36.55377],' +
    '[15.72143,36.55377],[15.72143,38.48799],[12.07397,38.48799],[12.07397,36.55377]]]}}]}');
    sicilyBoundingsGeoJSON.load(null, extrudedConfigurationCallback, sicilyBoundingsLayer);
    sicilyBoundingsLayer.enabled = true;
    wwd.addLayer(sicilyBoundingsLayer);



    // Create a layer to hold the polygons.
    var polygonsLayer = new WorldWind.RenderableLayer();
    polygonsLayer.displayName = "Polygons";
    wwd.addLayer(polygonsLayer);

    // Define an outer and an inner boundary to make a polygon with a hole.
    var boundaries = [];
    boundaries[0] = []; // outer boundary
    boundaries[0].push(new WorldWind.Position(40, -100, 1e5));
    boundaries[0].push(new WorldWind.Position(45, -110, 1e5));
    boundaries[0].push(new WorldWind.Position(40, -120, 1e5));
    boundaries[1] = []; // inner boundary
    boundaries[1].push(new WorldWind.Position(41, -103, 1e5));
    boundaries[1].push(new WorldWind.Position(44, -110, 1e5));
    boundaries[1].push(new WorldWind.Position(41, -117, 1e5));

    var polygon = new WorldWind.Polygon(boundaries, null);
    polygon.altitudeMode = WorldWind.ABSOLUTE;
    polygon.extrude = true;

    var polygonAttributes = new WorldWind.ShapeAttributes(null);
    polygonAttributes.drawInterior = true;
    polygonAttributes.drawOutline = true;
    polygonAttributes.outlineColor = WorldWind.Color.RED;
    polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
    // polygonAttributes.drawVerticals = polygon.extrude;
    // polygonAttributes.applyLighting = true;
    polygon.attributes = polygonAttributes;

    // Create and assign the polygon's highlight attributes.
    // var highlightAttributes = new WorldWind.ShapeAttributes(polygonAttributes);
    // highlightAttributes.outlineColor = WorldWind.Color.RED;
    // highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.5);
    // polygon.highlightAttributes = highlightAttributes;

    // Add the polygon to the layer and the layer to the World Window's layer list.
    polygonsLayer.addRenderable(polygon); */


});
