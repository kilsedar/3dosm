/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * Illustrates how to display and pick Polygons.
 *
 * @version $Id: Polygons.js 3320 2015-07-15 20:53:05Z dcollins $
 */

/*requirejs.config({
  baseUrl: './src',
  paths: {
    'osmtogeojson': '../osmtogeojson',
    'WorldWind': 'WorldWind',
    'LayerManager': '../LayerManager',
    'OSM3D': '../OSM3D'
  }
});*/

requirejs.config({
  baseUrl: './WebWorldWind/src',
  paths: {
    'WorldWind': 'WorldWind',
    'LayerManager': '../LayerManager',
    'OSM3D': '../../libraries/OSM3D',
    'osmtogeojson': '../../libraries/osmtogeojson'
  }
});

define(['WorldWind', 'OSM3D'],
  function (WorldWind, OSM3D) {
    "use strict";

    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_INFO);
    WorldWind.configuration.baseUrl = "http://localhost/3dosm/"

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

    layers[0].detailControl = 1;
    layers[1].detailControl = 1;

    for (var l = 0; l < layers.length; l++) {
        layers[l].layer.enabled = layers[l].enabled;
        wwd.addLayer(layers[l].layer);
    }

    var osmMilan = new OSM3D(9, 10, 48, 49, ['buildings']);
});
