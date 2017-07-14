/**
 * @exports OSMLayer
 */
define(['libraries/WebWorldWind/src/error/ArgumentError',
        'libraries/WebWorldWind/src/util/Logger'],
       function (ArgumentError, Logger) {
  "use strict";

  /**
   * Constructs an OSMLayer for a specified {@link WorldWindow}.
   * @alias OSMLayer
   * @constructor
   * @classdesc Sets the properties and functions viable for any OSM data. It is intended to be an abstract class, only to be extended for specific OSM data.
   * @param {WorldWindow} worldWindow The WorldWindow where the OSMLayer is added to.
   * @param {Object} configuration Configuration is used to set the attributes of {@link PlacemarkAttributes} or {@link ShapeAttributes}.
   */
  var OSMLayer = function (worldWindow, configuration) {
    this._worldWindow = worldWindow;
    this._configuration = configuration;
    this._boundingBox = null;
    this._type = null;
    this._tag = null;
  };

  Object.defineProperties (OSMLayer.prototype, {
    /**
     * The WorldWindow where the OSMLayer is added to.
     * @memberof OSMLayer.prototype
     * @type {WorldWindow}
     * @readonly
     */
    worldWindow: {
      get: function() {
        return this._worldWindow;
      }
    },
    /**
     * Configuration is used to set the attributes of {@link PlacemarkAttributes} if the geometry is Point or MultiPoint; or of {@link ShapeAttributes} otherwise.
     * @memberof OSMLayer.prototype
     * @type {Object}
     */
    configuration: {
      get: function() {
        return this._configuration;
      },
      set: function(configuration) {
        this._configuration = configuration;
      }
    },
    /**
     * It defines the bounding box of the OSM data for the OSMLayer. The order of coordinates of the bounding box is "x1, y1, x2, y2".
     * @memberof OSMLayer.prototype
     * @type {Float[]}
     */
    boundingBox: {
      get: function() {
        return this._boundingBox;
      },
      set: function(boundingBox) {
        this._boundingBox = boundingBox;
      }
    },
    /**
     * The type of the OSM data. It can be "node", "way", or "relation".
     * @memberof OSMLayer.prototype
     * @type {String}
     */
    type: {
      get: function() {
        return this._type;
      },
      set: function(type) {
        this._type = type;
      }
    },
    /**
     * The tag of the OSM data. It can have values defined at http://wiki.openstreetmap.org/wiki/Map_Features.
     * Some examples are "amenity", "amenity=education"; "building", "building=farm" ...
     * @memberof OSMLayer.prototype
     * @type {String}
     */
    tag: {
      get: function() {
        return this._tag;
      },
      set: function(tag) {
        this._tag = tag;
      }
    }
  });

  /**
   * Sets the attributes of {@link PlacemarkAttributes} if the geometry is Point or MultiPoint; or of {@link ShapeAttributes} otherwise.
   * @param {GeoJSONGeometry} geometry An object containing the geometry of the OSM data in GeoJSON format for the OSMLayer.
   * @returns {Object} An object with its attributes set as {@link PlacemarkAttributes} or {@link ShapeAttributes},
   * where for both their attributes are defined in the configuration of the OSMLayer.
   */
  OSMLayer.prototype.shapeConfigurationCallback = function (geometry) {
    var configuration = {};

    if (geometry.isPointType() || geometry.isMultiPointType()) {
      var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
      for (var key in this.configuration)
        placemarkAttributes[key] = this.configuration[key];
      configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
    }
    else {
      configuration.attributes =  new WorldWind.ShapeAttributes(null);
      for (var key in this.configuration)
        configuration.attributes[key] = this.configuration[key];
    }

    return configuration;
  };

  /**
   * Zooms to the OSMLayer, by setting the center of the viewport to the center of the bounding box.
   * It uses an arbitrary value for the range of {@link LookAtNavigator}.
   * @throws {ArgumentError} If boundingBox of the layer is null.
   */
  OSMLayer.prototype.zoom = function () {
    if (this.boundingBox != null) {
      var boundingBox = this.boundingBox;
      var centerX = (boundingBox[0] + boundingBox[2])/2;
      var centerY = (boundingBox[1] + boundingBox[3])/2;
      this.worldWindow.navigator.lookAtLocation.latitude = centerX;
      this.worldWindow.navigator.lookAtLocation.longitude = centerY;
      // console.log(centerX + ", " + centerY);
      this.worldWindow.navigator.range = 1e4; // Should be automatically calculated.
      this.worldWindow.redraw();
    }
    else {
      throw new ArgumentError(
        Logger.logMessage(Logger.LEVEL_SEVERE, "OSMLayer", "zoom", "The bounding box of the layer is null.")
      );
    }
  };

  return OSMLayer;
});
