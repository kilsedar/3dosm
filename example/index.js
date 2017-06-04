define(['libraries/WebWorldWind/src/WorldWind', 'src/OSMLayer'],
  function (WorldWind, OSMLayer) {
    "use strict";

    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_ERROR);
    WorldWind.configuration.baseUrl = "http://localhost/3dosm/libraries/WebWorldWind/";

    // Create the World Window.
    var wwd = new WorldWind.WorldWindow("canvas");

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

    layers[0].layer.detailControl = 1;
    layers[1].layer.detailControl = 1;

    for (var l = 0; l < layers.length; l++) {
        layers[l].layer.enabled = layers[l].enabled;
        wwd.addLayer(layers[l].layer);
    }

    var osmMilanBuilding1 = new OSMLayer(wwd, [45.45, 9.14, 45.46, 9.15], true);
    // osmMilanBuilding1.log();
    osmMilanBuilding1.add();

    var osmMilanBuilding2 = new OSMLayer(wwd, [45.45, 9.15, 45.46, 9.16], true, 'way', 'building');
    // osmMilanBuilding2.log();
    osmMilanBuilding2.add();

    var osmMilanAmenity = new OSMLayer(wwd, [45.45, 9.14, 45.46, 9.16], false, 'node', 'amenity');
    // osmMilanAmenity.log();
    osmMilanAmenity.add();
    osmMilanAmenity.zoom();
});