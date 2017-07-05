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
   * @param {Object} configuration Configuration is used to set the attributes of {@link ShapeAttributes}. Four more attributes can be defined, which are "extrude", "heatmap", "altitude" and "altitudeMode".
   */
  var OSMBuildingLayer = function (worldWindow, boundingBox, configuration) {
    OSMLayer.call(this, worldWindow, boundingBox, configuration);
    this.type = "way";
    this.tag = "building";
  };

  OSMBuildingLayer.prototype = Object.create(OSMLayer.prototype);

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
