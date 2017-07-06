/**
 * @exports OSMBuildingLayer
 */
define(['libraries/WebWorldWind/src/WorldWind',
        'libraries/WebWorldWind/src/cache/MemoryCache',
        'src/OSMLayer',
        'src/GeoJSONParserTriangulation',
        'jquery',
        'osmtogeojson'],
       function (WorldWind, MemoryCache, OSMLayer, GeoJSONParserTriangulation, $, osmtogeojson) {
  "use strict";

  /**
   * Creates a sublass of the {@link OSMLayer} class.
   * @alias OSMBuildingLayer
   * @constructor
   * @classdesc Fetches OSM buildings, converts them to GeoJSON, and adds them to the WorldWindow.
   * @param {WorldWindow} worldWindow The WorldWindow where the OSMBuildingLayer is added to.
   * @param {Float[]} boundingBox It defines the bounding box of the OSM data for the OSMLayer. The order of coordinates of the bounding box is "x1, y1, x2, y2".
   * @param {Object} configuration Configuration is used to set the attributes of {@link ShapeAttributes}. Four more attributes can be defined, which are "extrude", "heatmap", "altitude" and "altitudeMode".
   */
  var OSMBuildingLayer = function (worldWindow, boundingBox, configuration) {
    OSMLayer.call(this, worldWindow, boundingBox, configuration);
    this.type = "way";
    this.tag = "building";
    this._geometryCache = new MemoryCache(30000, 24000);
    this._propertiesCache = new MemoryCache(50000, 40000);
  };

  OSMBuildingLayer.prototype = Object.create(OSMLayer.prototype);

  Object.defineProperties (OSMBuildingLayer.prototype, {
    /**
     * The cache for the geometry of each feature of the OSMBuildingLayer.
     * @memberof OSMBuildingLayer.prototype
     * @type {MemoryCache}
     */
    geometryCache: {
      get: function() {
        return this._geometryCache;
      },
      set: function(geometryCache) {
        this._geometryCache = geometryCache;
      }
    },
    /**
     * The cache for the properties of each feature of the OSMBuildingLayer.
     * @memberof OSMBuildingLayer.prototype
     * @type {MemoryCache}
     */
    propertiesCache: {
      get: function() {
        return this._propertiesCache;
      },
      set: function(propertiesCache) {
        this._propertiesCache = propertiesCache;
      }
    }
  });

  OSMBuildingLayer.prototype.cache = function(dataOverpassGeoJSON) {
    // console.log(JSON.stringify(dataOverpassGeoJSON));
    for (var featureIndex = 0; featureIndex < dataOverpassGeoJSON.features.length; featureIndex++) {
      this.geometryCache.putEntry(dataOverpassGeoJSON.features[featureIndex].id, dataOverpassGeoJSON.features[featureIndex].geometry, Object.keys(dataOverpassGeoJSON.features[featureIndex].geometry).length);
      this.propertiesCache.putEntry(dataOverpassGeoJSON.features[featureIndex].id, dataOverpassGeoJSON.features[featureIndex].properties, Object.keys(dataOverpassGeoJSON.features[featureIndex].properties).length);
      /* console.log(Object.keys(dataOverpassGeoJSON.features[featureIndex].geometry).length);
      console.log(dataOverpassGeoJSON.features[featureIndex].geometry);
      console.log(Object.keys(dataOverpassGeoJSON.features[featureIndex].properties).length);
      console.log(dataOverpassGeoJSON.features[featureIndex].properties); */
    }
    /* console.log(this.geometryCache);
    console.log(this.propertiesCache); */
  };

  /**
   * Sets the attributes of {@link ShapeAttributes} and three more attributes defined specifically for OSMBuildingLayer, which are "extrude", "altitude" and "altitudeMode".
   * @param {GeoJSONGeometry} geometry An object containing the geometry of the OSM data in GeoJSON format for the OSMBuildingLayer.
   * @returns {Object} An object with the attributes {@link ShapeAttributes} and four more attributes, which are "extrude", "heatmap", "altitude" and "altitudeMode", where all of them are defined in the configuration of the OSMBuildingLayer.
   */
  OSMBuildingLayer.prototype.shapeConfigurationCallback = function (geometry) {
    var configuration = OSMLayer.prototype.shapeConfigurationCallback.call(this, geometry);

    configuration.extrude = this.configuration.extrude ? this.configuration.extrude : false;
    configuration.heatmap = this.configuration.heatmap ? this.configuration.heatmap : undefined;
    if (configuration.heatmap) {
      configuration.heatmap.enabled = this.configuration.heatmap.enabled ? this.configuration.heatmap.enabled : false;
      configuration.heatmap.thresholds = this.configuration.heatmap.thresholds ? this.configuration.heatmap.thresholds : [0, 15, 900];
    }
    configuration.altitude = this.configuration.altitude ? this.configuration.altitude : 15;
    configuration.altitudeMode = this.configuration.altitudeMode ? this.configuration.altitudeMode : WorldWind.RELATIVE_TO_GROUND;

   // console.log(JSON.stringify(configuration));

    return configuration;
  };

  /**
   * Using the boundingBox of the OSMBuildingLayer, fetches the OSM building data using Overpass API, converts it to GeoJSON using osmtogeojson API,
   * adds the GeoJSON data to the WorldWindow using the {@link GeoJSONParserTriangulation}.
   */
  OSMBuildingLayer.prototype.add = function () {

    var boundingBox = this.boundingBox;
    var worldWindow = this.worldWindow;
    var _self = this;

    var data = '[out:json][timeout:25];';
    data += '(' + this._type + '[' + this._tag + '](' + boundingBox[0] + ',' + boundingBox[1] + ',' + boundingBox[2] + ',' + boundingBox[3] + '); ';
    // data += 'relation[' + this._tag + '](' + boundingBox[0] + ',' + boundingBox[1] + ',' + boundingBox[2] + ',' + boundingBox[3] + ');); (._;>;); out body qt;';
    data += 'relation[' + this._tag + '](' + boundingBox[0] + ',' + boundingBox[1] + ',' + boundingBox[2] + ',' + boundingBox[3] + ');); out body; >; out skel qt;';
    // console.log("data --> " + data);

    $.ajax({
      url: 'http://overpass-api.de/api/interpreter',
      data: data,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function (dataOverpass) {
        // console.log("dataOverpass --> " + JSON.stringify(dataOverpass));
        // var dataOverpassGeoJSON = osmtogeojson(dataOverpass, {flatProperties: true, polygonFeatures: {"building": true}});
        var dataOverpassGeoJSON = osmtogeojson(dataOverpass);
        _self.cache(dataOverpassGeoJSON);
        var dataOverpassGeoJSONString = JSON.stringify(dataOverpassGeoJSON);
        // console.log("dataOverpassGeoJSONString --> " + dataOverpassGeoJSONString);
        // console.log("dataOverpassGeoJSON.features.length (number of polygons) --> " + dataOverpassGeoJSON.features.length);
        // console.time("creatingOSMBuildingLayer");
        var OSMBuildingLayer = new WorldWind.RenderableLayer("OSMBuildingLayer");
        var OSMBuildingLayerGeoJSON = new GeoJSONParserTriangulation(dataOverpassGeoJSONString);
        // var OSMBuildingLayerGeoJSON = new WorldWind.GeoJSONParser(dataOverpassGeoJSONString);
        OSMBuildingLayerGeoJSON.load(null, _self.shapeConfigurationCallback.bind(_self), OSMBuildingLayer);
        // console.timeEnd("creatingOSMBuildingLayer");
        worldWindow.addLayer(OSMBuildingLayer);
      },
      error: function (e) {
        console.log("Error: " + JSON.stringify(e));
      }
    });
  };

  return OSMBuildingLayer;
});
