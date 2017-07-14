/**
 * @exports OSMBuildingLayer
 */
define(['libraries/WebWorldWind/src/cache/MemoryCache',
        'src/OSMLayer',
        'src/GeoJSONParserTriangulationOSM',
        'jquery',
        'osmtogeojson'],
       function (MemoryCache, OSMLayer, GeoJSONParserTriangulationOSM, $, osmtogeojson) {
  "use strict";

  /**
   * Creates a sublass of the {@link OSMLayer} class.
   * @alias OSMBuildingLayer
   * @constructor
   * @classdesc Fetches OSM buildings, converts them to GeoJSON, and adds them to the WorldWindow.
   * @param {WorldWindow} worldWindow The WorldWindow where the OSMBuildingLayer is added to.
   * @param {Object} configuration Configuration is used to set the attributes of {@link ShapeAttributes}. Four more attributes can be defined, which are "extrude", "heatmap", "altitude" and "altitudeMode".
   */
  var OSMBuildingLayer = function (worldWindow, configuration) {
    OSMLayer.call(this, worldWindow, configuration);
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
    configuration.heatmap = this.configuration.heatmap ? this.configuration.heatmap : false;
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
   * Using the boundingBox fetches the OSM building data using Overpass API, converts it to GeoJSON using osmtogeojson API,
   * adds the GeoJSON to the WorldWindow using the {@link GeoJSONParserTriangulationOSM}.
   * It also sets the boundingBox of the {@link OSMLayer}.
   * @param {Float[]} boundingBox It defines the bounding box of the OSM data to add.
   */
  OSMBuildingLayer.prototype.addByBoundingBox = function (boundingBox) {

    this.boundingBox = boundingBox;
    var worldWindow = this.worldWindow;
    /* var dc = this.worldWindow.drawContext;
    console.log("dc.globe --> " + dc.globe); */
    var _self = this;

    var data = '[out:json][timeout:25];';
    data += '(' + this._type + '[' + this._tag + '](' + boundingBox[1] + ',' + boundingBox[0] + ',' + boundingBox[3] + ',' + boundingBox[2] + '); ';
    // data += 'relation[' + this._tag + '](' + boundingBox[1] + ',' + boundingBox[0] + ',' + boundingBox[3] + ',' + boundingBox[2] + ');); (._;>;); out body qt;';
    data += 'relation[' + this._tag + '](' + boundingBox[1] + ',' + boundingBox[0] + ',' + boundingBox[3] + ',' + boundingBox[2] + ');); out body; >; out skel qt;';
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
        console.log("dataOverpassGeoJSONString --> " + dataOverpassGeoJSONString);
        // console.log("dataOverpassGeoJSON.features.length (number of polygons) --> " + dataOverpassGeoJSON.features.length);
        // console.time("creatingOSMBuildingLayer");
        var OSMBuildingLayer = new WorldWind.RenderableLayer("OSMBuildingLayer");
        var OSMBuildingLayerGeoJSON = new GeoJSONParserTriangulationOSM(dataOverpassGeoJSONString);
        // var OSMBuildingLayerGeoJSON = new WorldWind.GeoJSONParser(dataOverpassGeoJSONString);
        OSMBuildingLayerGeoJSON.load(null, _self.shapeConfigurationCallback.bind(_self), OSMBuildingLayer);
        // console.timeEnd("creatingOSMBuildingLayer");
        worldWindow.addLayer(OSMBuildingLayer);
        _self.zoom();
      },
      error: function (e) {
        console.log("Error: " + JSON.stringify(e));
      }
    });
  };

  /**
   *
   * @param
   */
  OSMBuildingLayer.prototype.calculateBoundingBox = function (GeoJSON) {
    var boundingBox = [Infinity, Infinity, -Infinity, -Infinity], polygons, coordinates, latitude, longitude;

    for (var featureIndex = 0; featureIndex < GeoJSON.features.length; featureIndex++) {
      polygons = GeoJSON.features[featureIndex].geometry.coordinates;

      for (var polygonsIndex = 0; polygonsIndex < polygons.length; polygonsIndex++) {
        for (var coordinatesIndex = 0; coordinatesIndex < polygons[polygonsIndex].length; coordinatesIndex++) {
          longitude = polygons[polygonsIndex][coordinatesIndex][0];
          latitude = polygons[polygonsIndex][coordinatesIndex][1];
          // console.log(longitude + ", " + latitude);
          boundingBox[0] = boundingBox[0] < longitude ? boundingBox[0] : longitude; // minimum longitude (x1)
          boundingBox[1] = boundingBox[1] < latitude ? boundingBox[1] : latitude; // minimum latitude (y1)
          boundingBox[2] = boundingBox[2] > longitude ? boundingBox[2] : longitude; // maximum longitude (x2)
          boundingBox[3] = boundingBox[3] > latitude ? boundingBox[3] : latitude; // maximum latitude (y2)
        }
      }
    }
    this.boundingBox = boundingBox;
    // console.log(this.boundingBox);
  };

  /**
   *
   * @param
   */
  OSMBuildingLayer.prototype.addByGeoJSONFile = function (path) {
    var worldWindow = this.worldWindow;
    var _self = this;

    $.getJSON(path, function(data) {
      _self.calculateBoundingBox(data);
      var GeoJSONString = JSON.stringify(data);
      var OSMBuildingLayer = new WorldWind.RenderableLayer("OSMBuildingLayer");
      var OSMBuildingLayerGeoJSON = new GeoJSONParserTriangulationOSM(GeoJSONString);
      OSMBuildingLayerGeoJSON.load(null, _self.shapeConfigurationCallback.bind(_self), OSMBuildingLayer);
      worldWindow.addLayer(OSMBuildingLayer);
      _self.zoom();
    })
  };

  return OSMBuildingLayer;
});
