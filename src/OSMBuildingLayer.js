/**
 * @exports OSMBuildingLayer
 */
define(['libraries/WebWorldWind/src/cache/MemoryCache',
        'libraries/WebWorldWind/src/error/ArgumentError',
        'libraries/WebWorldWind/src/util/Logger',
        'libraries/WebWorldWind/src/geom/BoundingBox',
        'libraries/WebWorldWind/src/geom/Sector',
        'src/OSMLayer',
        'src/GeoJSONParserTriangulationOSM',
        'jquery',
        'osmtogeojson'],
       function (MemoryCache, ArgumentError, Logger, BoundingBox, Sector, OSMLayer, GeoJSONParserTriangulationOSM, $, osmtogeojson) {
  "use strict";

  /**
   * Creates a sublass of the {@link OSMLayer} class.
   * @alias OSMBuildingLayer
   * @constructor
   * @classdesc Fetches OSM buildings, converts them to GeoJSON, and adds them to the WorldWindow.
   * @param {WorldWindow} worldWindow The WorldWindow where the OSMBuildingLayer is added to.
   * @param {Object} source Defines the data source of the {@link OSMBuildingLayer}.
   * @param {Object} configuration Configuration is used to set the attributes of {@link ShapeAttributes}. Four more attributes can be defined, which are "extrude", "heatmap", "altitude" and "altitudeMode".
   */
  var OSMBuildingLayer = function (worldWindow, configuration, source) {
    OSMLayer.call(this, worldWindow, configuration);
    this._type = "way";
    this._tag = "building";

    /**
     * Defines the data source of the {@link OSMBuildingLayer}. Its "type" can be either "boundingBox" or "GeoJSONFile".
     * If the "type" is "boundingBox", "coordinates" must be defined. The order of the "coordinates" is "x1, y1, x2, y2".
     * If the "type" is "GeoJSONFile", "path" where the file resides must be defined.
     * @memberof OSMBuildingLayer.prototype
     * @type {Object}
     */
    this._source = source;

    /**
     * The cache for the geometry of each feature of the OSMBuildingLayer.
     * @memberof OSMBuildingLayer.prototype
     * @type {MemoryCache}
     */
    this._geometryCache = new MemoryCache(30000, 24000);

    /**
     * The cache for the properties of each feature of the OSMBuildingLayer.
     * @memberof OSMBuildingLayer.prototype
     * @type {MemoryCache}
     */
    this._propertiesCache = new MemoryCache(50000, 40000);
  };

  OSMBuildingLayer.prototype = Object.create(OSMLayer.prototype);

  /**
   * Sectorizes a bounding box. Each sector initially will be 0.01 to 0.01 degrees for all the zoom levels.
   * @param {Float[]} boundingBox The bounding box to be sectorized. Intended to be the bounding box of the whole layer.
   */
  OSMBuildingLayer.prototype.createSectors = function(boundingBox) {
    var sectorSize = 0.01;
    var decimalCount = 5; // Can be derived from the coordinates.
    var sectors = [];
    var sectorsOnXCount = Math.ceil((boundingBox[2]-boundingBox[0]).toFixed(decimalCount)/sectorSize);
    var sectorsOnYCount = Math.ceil((boundingBox[3]-boundingBox[1]).toFixed(decimalCount)/sectorSize);

    // console.log((x2-x1).toFixed(5) + ", " + (y2-y1).toFixed(5) + ", " + sectorsOnXCount + ", " + sectorsOnYCount);

    for (var indexY = 0; indexY < sectorsOnYCount; indexY++) {
      for (var indexX = 0; indexX < sectorsOnXCount; indexX++) {
        var x1 = (boundingBox[0]+sectorSize*indexX).toFixed(decimalCount);

        if (indexX+1 == sectorsOnXCount)
          var x2 = boundingBox[2].toFixed(decimalCount);
        else
          var x2 = (boundingBox[0]+sectorSize*(indexX+1)).toFixed(decimalCount);

        var y1 = (boundingBox[1]+sectorSize*indexY).toFixed(decimalCount);

        if (indexY+1 == sectorsOnYCount)
          var y2 = boundingBox[3].toFixed(decimalCount);
        else
        var y2 = (boundingBox[1]+sectorSize*(indexY+1)).toFixed(decimalCount);

        sectors.push(new Sector(y1, y2, x1, x2));
      }
    }
    // console.log(sectors);
  };

  /**
   * Checks if a given bounding box is visible.
   * @param {Float[]} boundingBox Intended to be a bounding box for a {@link Sector} of the OSMBuildingLayer.
   * @returns {boolean} True if the bounding box intersects the frustum, otherwise false.
   */
  OSMBuildingLayer.prototype.intersectsVisible = function(boundingBox) {
    var boundingBox = new BoundingBox();
    boundingBox.setToSector(new Sector(boundingBox[1], boundingBox[3], boundingBox[0], boundingBox[2]), this._worldWindow.drawContext.globe, 0, 15); // Maximum elevation 15 should be changed.

    return boundingBox.intersectsFrustum(this._worldWindow.drawContext.navigatorState.frustumInModelCoordinates);
  };

  /**
   * Caches the features of the {@link OSMBuildingLayer}. The features' geometry is cached in the layer's "_geometryCache" member variable, properties are cached in the layer's "_propertiesCache" member variable.
   * @param {Object} dataOverpassGeoJSON GeoJSON object to be cached.
   */
  OSMBuildingLayer.prototype.cache = function(dataOverpassGeoJSON) {
    // console.log(JSON.stringify(dataOverpassGeoJSON));
    for (var featureIndex = 0; featureIndex < dataOverpassGeoJSON.features.length; featureIndex++) {
      this._geometryCache.putEntry(dataOverpassGeoJSON.features[featureIndex].id, dataOverpassGeoJSON.features[featureIndex].geometry, Object.keys(dataOverpassGeoJSON.features[featureIndex].geometry).length);
      this._propertiesCache.putEntry(dataOverpassGeoJSON.features[featureIndex].id, dataOverpassGeoJSON.features[featureIndex].properties, Object.keys(dataOverpassGeoJSON.features[featureIndex].properties).length);
      /* console.log(Object.keys(dataOverpassGeoJSON.features[featureIndex].geometry).length);
      console.log(dataOverpassGeoJSON.features[featureIndex].geometry);
      console.log(Object.keys(dataOverpassGeoJSON.features[featureIndex].properties).length);
      console.log(dataOverpassGeoJSON.features[featureIndex].properties); */
    }
    /* console.log(this._geometryCache);
    console.log(this._propertiesCache); */
  };

  /**
   * Sets the attributes of {@link ShapeAttributes} and four more attributes defined specifically for OSMBuildingLayer, which are "extrude", "heatmap", "altitude" and "altitudeMode".
   * @param {GeoJSONGeometry} geometry An object containing the geometry of the OSM data in GeoJSON format for the OSMBuildingLayer.
   * @returns {Object} An object with the attributes {@link ShapeAttributes} and four more attributes, which are "extrude", "heatmap", "altitude" and "altitudeMode", where all of them are defined in the configuration of the OSMBuildingLayer.
   */
  OSMBuildingLayer.prototype.shapeConfigurationCallback = function (geometry) {
    var configuration = OSMLayer.prototype.shapeConfigurationCallback.call(this, geometry);

    configuration.extrude = this._configuration.extrude ? this._configuration.extrude : false;
    configuration.heatmap = this._configuration.heatmap ? this._configuration.heatmap : false;
    if (configuration.heatmap) {
      configuration.heatmap.enabled = this._configuration.heatmap.enabled ? this._configuration.heatmap.enabled : false;
      configuration.heatmap.thresholds = this._configuration.heatmap.thresholds ? this._configuration.heatmap.thresholds : [0, 15, 900];
    }
    configuration.altitude = this._configuration.altitude ? this._configuration.altitude : 15;
    configuration.altitudeMode = this._configuration.altitudeMode ? this._configuration.altitudeMode : WorldWind.RELATIVE_TO_GROUND;

   // console.log(JSON.stringify(configuration));

    return configuration;
  };

  /**
   * Calls [addByBoundingBox]{@link OSMBuildingLayer#addByBoundingBox} if the "type" of the layer's "_source" member variable is "boundingBox" and the "coordinates" of the layer's "_source" member variable is defined.
   * Calls [addByGeoJSONFile]{@link OSMBuildingLayer#addByGeoJSONFile} if the "type" of the layer's "_source" member variable is "GeoJSONFile" and the "path" of the layer's "_source" member variable is defined.
   * @throws {ArgumentError} If the source definition is wrong.
   */
  OSMBuildingLayer.prototype.add = function () {
    if (this._source.type == "boundingBox" && this._source.coordinates)
      this.addByBoundingBox();
    else if (this._source.type == "GeoJSONFile" && this._source.path)
      this.addByGeoJSONFile();
    else {
      throw new ArgumentError(
        Logger.logMessage(Logger.LEVEL_SEVERE, "OSMBuildingLayer", "add", "The source definition of the layer is wrong.")
      );
    }
  };

  /**
   * Makes an AJAX request to fetch the OSM building data using the "coordinates" of the layer's "_source" member variable and Overpass API, converts it to GeoJSON using osmtogeojson API,
   * adds the GeoJSON to the {@link WorldWindow} using the {@link GeoJSONParserTriangulationOSM}.
   * It also sets the "_boundingBox" member variable of the layer.
   * @throws {ArgumentError} If the "coordinates" of the layer's "_source" member variable doesn't have four values.
   * @throws {ArgumentError} If the request to OSM fails.
   */
  OSMBuildingLayer.prototype.addByBoundingBox = function () {

    if (this._source.coordinates.length != 4) {
      throw new ArgumentError(
        Logger.logMessage(Logger.LEVEL_SEVERE, "OSMBuildingLayer", "addByBoundingBox", "The bounding box is invalid.")
      );
    }

    this._boundingBox = this._source.coordinates;
    var worldWindow = this._worldWindow;
    var _self = this;

    var data = '[out:json][timeout:25];';
    data += '(' + this._type + '[' + this._tag + '](' + this._boundingBox[1] + ',' + this._boundingBox[0] + ',' + this._boundingBox[3] + ',' + this._boundingBox[2] + '); ';
    // data += 'relation[' + this._tag + '](' + this._boundingBox[1] + ',' + this._boundingBox[0] + ',' + this._boundingBox[3] + ',' + this._boundingBox[2] + ');); (._;>;); out body qt;';
    data += 'relation[' + this._tag + '](' + this._boundingBox[1] + ',' + this._boundingBox[0] + ',' + this._boundingBox[3] + ',' + this._boundingBox[2] + ');); out body; >; out skel qt;';
    // console.log("data --> " + data);

    $.ajax({
      url: 'http://overpass-api.de/api/interpreter',
      data: data,
      type: 'POST',
      success: function(dataOverpass) {
        // console.log("dataOverpass --> " + JSON.stringify(dataOverpass));
        // var dataOverpassGeoJSON = osmtogeojson(dataOverpass, {flatProperties: true, polygonFeatures: {"building": true}});
        var dataOverpassGeoJSON = osmtogeojson(dataOverpass);
        _self.cache(dataOverpassGeoJSON);
        var dataOverpassGeoJSONString = JSON.stringify(dataOverpassGeoJSON);
        // console.log("dataOverpassGeoJSONString --> " + dataOverpassGeoJSONString);
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
      error: function(e) {
        throw new ArgumentError(
          Logger.logMessage(Logger.LEVEL_SEVERE, "OSMBuildingLayer", "addByBoundingBox", "Request failed. Error: " + JSON.stringify(e))
        );
      }
    });
  };

  /**
   * Calculates the bounding box of a GeoJSON object, where its features are expected to be of type "Polygon" or "MultiPolygon".
   * It also sets the "_boundingBox" member variable of the layer.
   * @param {Object} dataOverpassGeoJSON GeoJSON object of which the bounding box is calculated.
   */
  OSMBuildingLayer.prototype.calculateBoundingBox = function (dataGeoJSON) {
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
    this._boundingBox = boundingBox;
    // console.log(this._boundingBox);
  };

  /**
   * Makes an AJAX request using the "path" of the layer's "_source" member variable to fetch the GeoJSON file, adds the GeoJSON to the {@link WorldWindow} using the {@link GeoJSONParserTriangulationOSM}.
   * It also sets the "_boundingBox" member variable of the layer by calling [calculateBoundingBox]{@link OSMBuildingLayer#calculateBoundingBox}.
   * @throws {ArgumentError} If the data returned from the request is empty.
   * @throws {ArgumentError} If the request fails.
   */
  OSMBuildingLayer.prototype.addByGeoJSONFile = function () {
    var worldWindow = this._worldWindow;
    var _self = this;

    $.ajax({
      dataType: "json",
      url: this._source.path,
      success: function(data) {
        if (data.length == 0) {
          throw new ArgumentError(
            Logger.logMessage(Logger.LEVEL_SEVERE, "OSMBuildingLayer", "addByGeoJSONFile", "File is empty.")
          );
        }
        _self.calculateBoundingBox(data);
        var GeoJSONString = JSON.stringify(data);
        var OSMBuildingLayer = new WorldWind.RenderableLayer("OSMBuildingLayer");
        var OSMBuildingLayerGeoJSON = new GeoJSONParserTriangulationOSM(GeoJSONString);
        OSMBuildingLayerGeoJSON.load(null, _self.shapeConfigurationCallback.bind(_self), OSMBuildingLayer);
        worldWindow.addLayer(OSMBuildingLayer);
        _self.zoom();
      },
      error: function(e) {
        throw new ArgumentError(
          Logger.logMessage(Logger.LEVEL_SEVERE, "OSMBuildingLayer", "addByGeoJSONFile", "Request failed. Error: " + JSON.stringify(e))
        );
      }
    });
  };

  return OSMBuildingLayer;
});
