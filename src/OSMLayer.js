/**
 * @exports OSMLayer
 */
define(['libraries/WebWorldWind/src/WorldWind'], function (WorldWind) {
  "use strict";

  /**
   * Constructs an OSM layer for a specified [WorldWindow]{@link WorldWindow}.
   * @alias OSMLayer
   * @constructor
   * @classdesc Sets the properties and functions viable for any OSM data. It is intended to be an abstract class, only to be extended for specific OSM data.
   * @param {WorldWindow} worldWindow The WorldWindow to be associated this layer manager with.
   * {Array} boundingBox Bounding box is expected to be in array format, the order of the coordinates for the boundingBox is "x1, y1, x2, y2".
   * {Object literal} configuration Configuration is used to set the attributes of [PlacemarkAttributes]{@link PlacemarkAttributes} or [ShapeAttributes]{@link ShapeAttributes}, depending on the geometry type.
   */
  var OSMLayer = function (worldWindow, boundingBox, configuration) {
    this._worldWindow = worldWindow;
    this._boundingBox = boundingBox;
    this._configuration = configuration;
    this._type = null;
    this._tag = null;
  };

  Object.defineProperties (OSMLayer.prototype, {
    boundingBox: {
      get: function() {
        return this._boundingBox;
      },
      set: function(boundingBox) {
        this._boundingBox = boundingBox;
      }
    },
    configuration: {
      get: function() {
        return this._configuration;
      },
      set: function(configuration) {
        this._configuration = configuration;
      }
    },
    type: {
      get: function() {
        return this._type;
      },
      set: function(type) {
        this._type = type;
      }
    },
    tag: {
      get: function() {
        return this._tag;
      },
      set: function(tag) {
        this._tag = tag;
      }
    }
  });

  OSMLayer.prototype.shapeConfigurationCallback = function (geometry, properties) {
    var configuration = {};

    if (geometry.isPointType() || geometry.isMultiPointType()) {
      var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
      for (var key in this._configuration)
        placemarkAttributes[key] = this._configuration[key];
      configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
    }
    else {
      configuration.attributes =  new WorldWind.ShapeAttributes(null);
      for (var key in this._configuration)
        configuration.attributes[key] = this._configuration[key];
    }

    return configuration;
  };

  OSMLayer.prototype.zoom = function () {
    var boundingBox = this._boundingBox;
    var centerX = (boundingBox[0] + boundingBox[2])/2;
    var centerY = (boundingBox[1] + boundingBox[3])/2;
    this._worldWindow.navigator.lookAtLocation.latitude = centerX;
    this._worldWindow.navigator.lookAtLocation.longitude = centerY;
    // console.log(centerX + ", " + centerY);
    this._worldWindow.navigator.range = 1e4; // Should be automatically calculated.
    this._worldWindow.redraw();
  };

  return OSMLayer;
});
