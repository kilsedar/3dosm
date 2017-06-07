/**
 * @exports GeoJSONParserTriangulation
 */
define(['libraries/WebWorldWind/src/WorldWind',
        'libraries/WebWorldWind/src/formats/geojson/GeoJSONParser',
        'libraries/WebWorldWind/src/geom/Position',
        'libraries/WebWorldWind/src/shapes/Polygon'],
       function (WorldWind, GeoJSONParser, Position, Polygon) {
  "use strict";

  /**
   * Triangulates polygons to improve the performance.
   * @alias GeoJSONParserTriangulation
   * @constructor
   * @classdesc
   * @param
   */
  var GeoJSONParserTriangulation = function (dataSource) {
    GeoJSONParser.call(this, dataSource);
  };

  GeoJSONParserTriangulation.prototype = Object.create(GeoJSONParser.prototype);

  GeoJSONParserTriangulation.prototype.log = function () {
    console.log("GeoJSONParserTriangulation object is successfully created.");
  };

  GeoJSONParserTriangulation.prototype.addRenderablesForPolygon = function (layer, geometry, properties) {
    console.log("Inside GeoJSONParserTriangulation, addRenderablesForPolygon.");
    if (!layer) {
      throw new ArgumentError(
        Logger.logMessage(Logger.LEVEL_SEVERE, "GeoJSON", "addRenderablesForPolygon", "missingLayer")
      );
    }

    if (!geometry) {
      throw new ArgumentError(
        Logger.logMessage(Logger.LEVEL_SEVERE, "GeoJSON", "addRenderablesForPolygon", "missingGeometry")
      );
    }

    var configuration = this.shapeConfigurationCallback(geometry, properties);

    if (!this.crs || this.crs.isCRSSupported()) {
      /* for (var boundariesIndex = 0, boundaries = geometry.coordinates; boundariesIndex < boundaries.length; boundariesIndex++) {
        var positions = [];

        for (var positionIndex = 0, points = boundaries[boundariesIndex]; positionIndex < points.length; positionIndex++) {
          var longitude = points[positionIndex][0],
          latitude = points[positionIndex][1],
          // altitude = points[positionIndex][2] ?  points[positionIndex][2] : 0,
          altitude = configuration && configuration.altitude ? configuration.altitude : null,
          position;
          var reprojectedCoordinate = this.getReprojectedIfRequired(latitude, longitude, this.crs);
          if (altitude) {
            position = new Position(reprojectedCoordinate[1], reprojectedCoordinate[0], altitude);
          }
          else {
            position = new Location(reprojectedCoordinate[1], reprojectedCoordinate[0]);
          }
          positions.push(position);
        }

        var shape;
        if (altitude) {
          shape = new Polygon(positions, configuration && configuration.attributes ? configuration.attributes : null);
          if (configuration && configuration.extrude) {
            shape.extrude = configuration.extrude;
          }
          shape.altitudeMode = configuration.altitudeMode || WorldWind.RELATIVE_TO_GROUND;
        }
        else {
          shape = new SurfacePolygon(positions, configuration && configuration.attributes ? configuration.attributes : null);
        }
        if (configuration.highlightAttributes) {
          shape.highlightAttributes = configuration.highlightAttributes;
        }
        if (configuration && configuration.pickDelegate) {
          shape.pickDelegate = configuration.pickDelegate;
        }
        if (configuration && configuration.userProperties) {
          shape.userProperties = configuration.userProperties;
        }
        layer.addRenderable(shape);
      } */
    }
  };

  return GeoJSONParserTriangulation;
});
