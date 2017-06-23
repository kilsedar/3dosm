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
   * @param {WorldWindow} worldWindow The OSMBuildingLayer is added to this WorldWindow.
   * @param {Float[]} boundingBox Bounding box is expected to be in array format. The order of coordinates of the bounding box is "x1, y1, x2, y2".
   * @param {Object} configuration Configuration is used to set the attributes of {@link ShapeAttributes}. Three more attributes can be defined, which are "extrude", "altitude" and "altitudeMode".
   */
  var OSMBuildingLayer = function (worldWindow, boundingBox, configuration) {
    OSMLayer.call(this, worldWindow, boundingBox, configuration);
    this._type = "way";
    this._tag = "building";
  };

  OSMBuildingLayer.prototype = Object.create(OSMLayer.prototype);

  OSMBuildingLayer.prototype.shapeConfigurationCallback = function (geometry, properties) {
    var configuration = OSMLayer.prototype.shapeConfigurationCallback.call(this, geometry, properties);

    var extrude = this._configuration.extrude ? this._configuration.extrude : false;

    if (extrude == true) {
      configuration.extrude = this._configuration.extrude;
      configuration.altitude = this._configuration.altitude || 1e2;
      configuration.altitudeMode = this._configuration.altitudeMode || WorldWind.RELATIVE_TO_GROUND;
    }

    return configuration;
  }

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
