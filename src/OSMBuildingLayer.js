/**
 * @exports OSMBuildingLayer
 */
define(['libraries/WebWorldWind/src/error/ArgumentError',
        'libraries/WebWorldWind/src/util/Logger',
        'src/OSMLayer',
        'src/GeoJSONParserTriangulationOSM',
        'jquery'],
       function (ArgumentError, Logger, OSMLayer, GeoJSONParserTriangulationOSM, $) {
  "use strict";

  /**
   * Creates a sublass of the {@link OSMLayer} class.
   * @alias OSMBuildingLayer
   * @constructor
   * @classdesc Fetches OSM buildings, converts them to GeoJSON, and adds them to the WorldWindow.
   * @param {Object} configuration Configuration is used to set the attributes of {@link ShapeAttributes}. Four more attributes can be defined, which are "extrude", "altitude", "altitudeMode" and "heatmap".
   * @param {Object} source Defines the data source of the layer. Its "type" can be either "boundingBox", "GeoJSONFile" or "GeoJSONData".
   * If the "type" is "boundingBox", "coordinates" must be defined. The order of the "coordinates" is "x1, y1, x2, y2".
   * If the "type" is "GeoJSONFile", "path" where the file resides must be defined.
   * If the "type" is "GeoJSONData", "data" itself must be defined.
   */
  var OSMBuildingLayer = function (configuration, source) {
    OSMLayer.call(this, configuration, source);
    this.tag = "building";
    this.type = ["way", "relation"];
  };

  OSMBuildingLayer.prototype = Object.create(OSMLayer.prototype);

  /**
   * Sets the attributes of {@link ShapeAttributes} and four more attributes defined specifically for {@link OSMBuildingLayer}, which are "extrude", "altitude", "altitudeMode" and "heatmap".
   * @param {GeoJSONGeometry} geometry An object containing the geometry of the OSM data in GeoJSON format for the layer.
   * @returns {Object} An object with the attributes {@link ShapeAttributes} and four more attributes, which are "extrude", "altitude", "altitudeMode" and "heatmap", where all of them are defined in the configuration of the layer.
   */
  OSMBuildingLayer.prototype.shapeConfigurationCallback = function (geometry) {
    var configuration = OSMLayer.prototype.shapeConfigurationCallback.call(this, geometry);

    configuration.extrude = this._configuration.extrude ? this._configuration.extrude : false;
    configuration.altitude = this._configuration.altitude ? this._configuration.altitude : null;
    if (configuration.altitude) {
      configuration.altitude.type = this._configuration.altitude.type ? this._configuration.altitude.type : "number";
      if (configuration.altitude.type != "osm")
        configuration.altitude.value = this._configuration.altitude.value ? this._configuration.altitude.value : 15;
    }
    configuration.altitudeMode = this._configuration.altitudeMode ? this._configuration.altitudeMode : WorldWind.RELATIVE_TO_GROUND;
    configuration.heatmap = this._configuration.heatmap ? this._configuration.heatmap : false;
    if (configuration.heatmap) {
      configuration.heatmap.enabled = this._configuration.heatmap.enabled ? this._configuration.heatmap.enabled : false;
      configuration.heatmap.thresholds = this._configuration.heatmap.thresholds ? this._configuration.heatmap.thresholds : [0, 15, 900];
    }

    return configuration;
  };

  /**
   * Sets the "worldWindow" member variable and adds the layer to the WorldWindow.
   * @param {WorldWindow} worldWindow The WorldWindow where the layer is added to.
   */
  OSMBuildingLayer.prototype.add = function (worldWindow) {
    this.worldWindow = worldWindow;
    var _self = this;
    $.when(_self.load()).then(function() {
      var OSMBuildingLayer = new WorldWind.RenderableLayer("OSMBuildingLayer");
      var OSMBuildingLayerGeoJSON = new GeoJSONParserTriangulationOSM(JSON.stringify(_self.data));
      OSMBuildingLayerGeoJSON.load(null, _self.shapeConfigurationCallback.bind(_self), OSMBuildingLayer);
      _self.worldWindow.addLayer(OSMBuildingLayer);
    });
  };

  return OSMBuildingLayer;
});
