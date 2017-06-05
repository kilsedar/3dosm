/**
 * @exports OSMLayer
 */
define(['libraries/WebWorldWind/src/WorldWind'], function (WorldWind) {
  "use strict";

  /**
   * Constructs an OSM layer for a specified WorldWindow.
   * @alias OSMLayer
   * @constructor boundingBox is expected to be in array format, the order of the coordinates for the boundingBox is "x1, y1, x2, y2".
   * @classdesc
   * @param
   */
  var OSMLayer = function (wwd, boundingBox, configuration) {
    this._wwd = wwd;
    this._boundingBox = boundingBox;
    this._configuration = configuration;
  };

  Object.defineProperties (OSMLayer.prototype, {
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
        placemarkAttributes.attributes[key] = this._configuration[key];
      configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
    }
    else {
      configuration.attributes =  new WorldWind.ShapeAttributes(null);
      for (var key in this._configuration)
        configuration.attributes[key] = this._configuration[key];
    }

    return configuration;
  }

  OSMLayer.prototype.zoom = function () {
    var boundingBox = this._boundingBox;
    var centerX = (boundingBox[0] + boundingBox[2])/2;
    var centerY = (boundingBox[1] + boundingBox[3])/2;
    this._wwd.navigator.lookAtLocation.latitude = centerX;
    this._wwd.navigator.lookAtLocation.longitude = centerY;
    // console.log(centerX + ", " + centerY);
    this._wwd.navigator.range = 5e3; // Should be automatically calculated.
    this._wwd.redraw();
  };

  return OSMLayer;
});
