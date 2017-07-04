/**
 * @exports OSMBuildingShape
 */
define([''], function () {
  "use strict";

  /**
   *
   * @alias OSMBuildingShape
   * @constructor
   * @classdesc Sets the color and altitude of the OSMBuildingShape, which can be either {@link Polygon} or {@link MultiPolygon}.
   * @param {Object} properties The properties related to the shape's geometry.
   */
   var OSMBuildingShape = function (properties) {
     this._properties = properties;

     // Documented in defineProperties below.
     this._altitude;

     // Documented in defineProperties below.
     this._color;
   };

   Object.defineProperties (OSMBuildingShape.prototype, {
     /**
      * The altitude of the shape.
      * @memberof OSMBuildingShape.prototype
      * @type {Float}
      */
     altitude: {
       get: function() {
         return this._altitude;
       },
       set: function(altitude) {
         this._altitude = altitude;
       }
     },
     /**
      * The color of the shape.
      * @memberof OSMBuildingShape.prototype
      * @type {Color}
      */
     color: {
       get: function() {
         return this._color;
       },
       set: function(color) {
         this._color = color;
       }
     }
   });

  /**
   * Colors the shape ({@link Polygon} or {@link MultiPolygon}) based on their altitude.
   * As the altitude increases the red component of the color increases.
   * The thresholds could be calculated automatically based on the data.
   * @param {Object} configuration Configuration is the object returned by [shapeConfigurationCallback]{@link OSMBuildingLayer#shapeConfigurationCallback}.
   */
  OSMBuildingShape.prototype.setColor = function (configuration) {

    var numberOfThresholds = configuration.heatmap.thresholds.length;
    var heat = 0.5/(numberOfThresholds-2);
    // console.log(configuration.heatmap.thresholds + ", " + heat);

    if (configuration.attributes.interiorColor.red < 0.5) {
      for (var thresholdIndex = 0; thresholdIndex < numberOfThresholds-1; thresholdIndex++) {
        // console.log(heat*thresholdIndex);
        if (this._altitude > configuration.heatmap.thresholds[thresholdIndex] && this._altitude <= configuration.heatmap.thresholds[thresholdIndex+1])
          configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red+heat*thresholdIndex, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
      }
    }
    else {
      for (var thresholdIndex = 0; thresholdIndex < numberOfThresholds-1; thresholdIndex++) {
        // console.log(heat*thresholdIndex);
        if (this._altitude > configuration.heatmap.thresholds[thresholdIndex] && this._altitude <= configuration.heatmap.thresholds[thresholdIndex+1])
          configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red-heat*(numberOfThresholds-thresholdIndex), configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
      }
    }
  };

  /**
   * Sets the altitude of the shape ({@link Polygon} or {@link MultiPolygon}).
   * For the {@link OSMBuildingLayer} if extrude is true and altitude is set to "osm", if available the value of OSM "height" tag is used. If the "height" tag is not available an approximate height value is calculated using "building:levels" tag. Every level is considered to be 3 meters. If both are not available, 15 is used by default.
   * For the {@link OSMBuildingLayer} if extrude is true and altitude is set to a floating-point number, the set value is used.
   * For the {@link OSMBuildingLayer} if extrude is true and altitude is not set, 15 is used by default.
   * For the {@link OSMBuildingLayer} if extrude is false, 0 is used.
   * @param {Object} configuration Configuration is the object returned by [shapeConfigurationCallback]{@link OSMBuildingLayer#shapeConfigurationCallback}.
   */
  OSMBuildingShape.prototype.setAltitude = function (configuration) {
    var altitude;
    if (configuration.extrude && configuration.altitude == "osm") {
      if (this._properties.tags.height)
        altitude = this._properties.tags.height;
      else if (this._properties.tags["building:levels"])
        altitude = this._properties.tags["building:levels"]*3;
      else
        altitude = 15;
    }
    else if (configuration.extrude && configuration.altitude)
      altitude = configuration.altitude;
    else if (configuration.extrude)
      altitude = 15;
    else
      altitude = 0;

    // console.log("altitude --> " + altitude);

    this._altitude = altitude;
  };

  return OSMBuildingShape;
});
