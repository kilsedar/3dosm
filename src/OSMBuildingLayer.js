/**
 * @exports OSMBuildingLayer
 */
define(['libraries/WebWorldWind/src/WorldWind', 'src/OSMLayer', 'src/GeoJSONParserTriangulation', 'jquery', 'osmtogeojson'], function (WorldWind, OSMLayer, GeoJSONParserTriangulation, $, osmtogeojson) {
  "use strict";

  /**
   * Creates a sublass of the {@link OSMLayer} class.
   * @alias OSMBuildingLayer
   * @constructor
   * @classdesc Fetches OSM buildings, converts them to GeoJSON, and adds them to the WorldWindow.
   * @param {WorldWindow} worldWindow The WorldWindow where the OSMBuildingLayer is added to.
   * @param {Float[]} boundingBox It defines the bounding box of the OSM data for the OSMLayer. The order of coordinates of the bounding box is "x1, y1, x2, y2".
   * @param {Object} configuration Configuration is used to set the attributes of {@link ShapeAttributes}. Three more attributes can be defined, which are "extrude", "altitude" and "altitudeMode".
   */
  var OSMBuildingLayer = function (worldWindow, boundingBox, configuration) {
    OSMLayer.call(this, worldWindow, boundingBox, configuration);
    this._type = "way";
    this._tag = "building";
  };

  OSMBuildingLayer.prototype = Object.create(OSMLayer.prototype);

  /**
   * Sets the attributes of {@link ShapeAttributes} and three more attributes defined specifically for OSMBuildingLayer, which are "extrude", "altitude" and "altitudeMode".
   * @param {GeoJSONGeometry} geometry An object containing the geometry of the OSM data in GeoJSON format for the OSMBuildingLayer.
   * @returns {Object} An object with the attributes {@link ShapeAttributes} and three more attributes, which are "extrude", "altitude" and "altitudeMode", where all of them are defined in the configuration of the OSMBuildingLayer.
   * The default value for extrude is false. If extrude is set true, the default value for altitude is "1e2" and the default value for altitudeMode is "RELATIVE_TO_GROUND".
   */
  OSMBuildingLayer.prototype.shapeConfigurationCallback = function (geometry) {
    var configuration = OSMLayer.prototype.shapeConfigurationCallback.call(this, geometry);

    var extrude = this._configuration.extrude ? this._configuration.extrude : false;

    if (extrude == true) {
      configuration.extrude = this._configuration.extrude;
      configuration.altitude = this._configuration.altitude || 1e2;
      configuration.altitudeMode = this._configuration.altitudeMode || WorldWind.RELATIVE_TO_GROUND;
    }

    return configuration;
  }

  /**
   * Using the boundingBox of the OSMBuildingLayer, fetches the OSM building data using Overpass API, converts it to GeoJSON using osmtogeojson API,
   * adds the GeoJSON data to the WorldWindow using the {@link GeoJSONParserTriangulation}.
   */
  OSMBuildingLayer.prototype.add = function () {

    var boundingBox = this._boundingBox;
    var worldWindow = this._worldWindow;
    var _self = this;

    var data = '[out:json][timeout:25];';
    data += '(' + this._type + '[' + this._tag + '](' + boundingBox[0] + ',' + boundingBox[1] + ',' + boundingBox[2] + ',' + boundingBox[3] + '); ';
    // data += 'relation[' + this._tag + '](' + boundingBox[0] + ',' + boundingBox[1] + ',' + boundingBox[2] + ',' + boundingBox[3] + ');); (._;>;); out body qt;';
    data += 'relation[' + this._tag + '](' + boundingBox[0] + ',' + boundingBox[1] + ',' + boundingBox[2] + ',' + boundingBox[3] + ');); out body; >; out skel qt;';
    console.log("data --> " + data);

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
        var dataOverpassGeoJSONString = JSON.stringify(dataOverpassGeoJSON);
        // console.log("dataOverpassGeoJSONString --> " + dataOverpassGeoJSONString);
        console.log("dataOverpassGeoJSON.features.length (number of polygons) --> " + dataOverpassGeoJSON.features.length);
        console.time("creatingOSMBuildingLayer");
        var OSMBuildingLayer = new WorldWind.RenderableLayer("OSMBuildingLayer");
        var OSMBuildingLayerGeoJSON = new GeoJSONParserTriangulation(dataOverpassGeoJSONString);
        // var OSMBuildingLayerGeoJSON = new WorldWind.GeoJSONParser(dataOverpassGeoJSONString);
        OSMBuildingLayerGeoJSON.load(null, _self.shapeConfigurationCallback.bind(_self), OSMBuildingLayer);
        console.timeEnd("creatingOSMBuildingLayer");
        worldWindow.addLayer(OSMBuildingLayer);
      },
      error: function (e) {
        console.log("Error: " + JSON.stringify(e));
      }
    });
  };

  return OSMBuildingLayer;
});
