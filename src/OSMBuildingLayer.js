/**
 * @exports OSMBuildingLayer
 */
define(['libraries/WebWorldWind/src/WorldWind', 'src/OSMLayer', 'jquery', 'osmtogeojson'], function (WorldWind, OSMLayer, $, osmtogeojson) {
  "use strict";

  /**
   * Constructs an OSM building layer for a specified WorldWindow.
   * @alias OSMBuildingLayer
   * @constructor
   * @classdesc
   * @param
   */
  var OSMBuildingLayer = function (wwd, boundingBox, configuration, extruded) {
    OSMLayer.call(this, wwd, boundingBox, configuration);
    this._type = "way";
    this._tag = "building";
    this._extruded = extruded;
  };

  OSMBuildingLayer.prototype = Object.create(OSMLayer.prototype);

  OSMBuildingLayer.prototype.shapeConfigurationCallback = function (geometry, properties) {
    var configuration = OSMLayer.prototype.shapeConfigurationCallback.call(this, geometry, properties);

    if (this._extruded == true) {
      configuration.extrude = this._extruded;
      configuration.altitude = this._configuration.altitude || 1e2;
      configuration.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    }

    return configuration;
  }

  OSMBuildingLayer.prototype.add = function () {

    var boundingBox = this._boundingBox;
    var wwd = this._wwd;
    var _self = this;

    var data = '[out:json][timeout:25];';
    data += '(' + this._type + '[' + this._tag + '](' + boundingBox[0] + ',' + boundingBox[1] + ',' + boundingBox[2] + ',' + boundingBox[3] + '); ';
    data += 'relation[' + this._tag + '](' + boundingBox[0] + ',' + boundingBox[1] + ',' + boundingBox[2] + ',' + boundingBox[3] + ');); (._;>;); out body qt;';
    console.log("data --> " + data);

    $.ajax({
      url: 'http://overpass-api.de/api/interpreter',
      data: data,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function (dataOverpass) {
        console.log("dataOverpass --> " + JSON.stringify(dataOverpass));
        var dataOverpassGeoJSON = osmtogeojson(dataOverpass, {flatProperties: true, polygonFeatures: {"building": true}});
        var dataOverpassGeoJSONString = JSON.stringify(dataOverpassGeoJSON);
        console.log("dataOverpassGeoJSONString --> " + dataOverpassGeoJSONString);
        var OSMBuildingLayer = new WorldWind.RenderableLayer("OSMBuildingLayer");
        var OSMBuildingLayerGeoJSON = new WorldWind.GeoJSONParser(dataOverpassGeoJSONString);
        OSMBuildingLayerGeoJSON.load(null, _self.shapeConfigurationCallback.bind(_self), OSMBuildingLayer);
        // console.log(OSMBuildingLayerGeoJSON.geoJSONType);
        wwd.addLayer(OSMBuildingLayer);
      },
      error: function (e) {
        console.log("Error: " + JSON.stringify(e));
      }
    });
  };

  OSMLayer.prototype.log = function () {
    console.log(this._boundingBox);
    console.log(this._configuration);
    console.log(this._extruded);
    console.log(this._type);
    console.log(this._tag);
  }

  return OSMBuildingLayer;
});
