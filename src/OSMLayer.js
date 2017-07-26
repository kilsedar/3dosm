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
    /**
     * The WorldWindow where the OSMLayer is added to.
     * @memberof OSMLayer.prototype
     * @type {WorldWindow}
     */
    this._worldWindow = worldWindow;

    /**
     * Configuration is used to set the attributes of {@link PlacemarkAttributes} if the geometry is Point or MultiPoint; or of {@link ShapeAttributes} otherwise.
     * @memberof OSMLayer.prototype
     * @type {Object}
     */
    this._configuration = configuration;

    /**
     * The type of the OSM data. It can be "node", "way", or "relation".
     * @memberof OSMLayer.prototype
     * @type {String}
     */
    this._type = null;

    /**
     * The tag of the OSM data. It can have values defined at http://wiki.openstreetmap.org/wiki/Map_Features.
     * Some examples are "amenity", "amenity=education"; "building", "building=farm" ...
     * @memberof OSMLayer.prototype
     * @type {String}
     */
    this._tag = null;

    this._boundingBox = null;
  };

  Object.defineProperties (OSMLayer.prototype, {
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

  /**
   * Zooms to the OSMLayer, by setting the center of the viewport to the center of the bounding box.
   * It uses an arbitrary value for the range of {@link LookAtNavigator}.
   * To be removed later.
   * @throws {ArgumentError} If boundingBox of the layer is null.
   */
  OSMLayer.prototype.zoom = function () {
    if (this._boundingBox != null) {
      var boundingBox = this._boundingBox;
      var centerX = (boundingBox[0] + boundingBox[2])/2;
      var centerY = (boundingBox[1] + boundingBox[3])/2;
      this._worldWindow.navigator.lookAtLocation.longitude = centerX;
      this._worldWindow.navigator.lookAtLocation.latitude = centerY;
      // console.log(centerX + ", " + centerY);
      this._worldWindow.navigator.range = 4e3; // Should be automatically calculated.
      this._worldWindow.redraw();
    }
    else {
      throw new ArgumentError(
        Logger.logMessage(Logger.LEVEL_SEVERE, "OSMLayer", "zoom", "The bounding box of the layer is null.")
      );
    }
  };

  return OSMLayer;
});
