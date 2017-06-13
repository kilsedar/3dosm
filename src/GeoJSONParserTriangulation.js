/**
 * @exports GeoJSONParserTriangulation
 */
define(['libraries/WebWorldWind/src/WorldWind',
        'libraries/WebWorldWind/src/formats/geojson/GeoJSONParser',
        'libraries/WebWorldWind/src/geom/Position',
        'libraries/WebWorldWind/src/shapes/Polygon',
        'libraries/WebWorldWind/src/shapes/SurfacePolygon',
        'libraries/WebWorldWind/src/shapes/TriangleMesh',
        'earcut'],
       function (WorldWind, GeoJSONParser, Position, Polygon, SurfacePolygon, TriangleMesh, earcut) {
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

  GeoJSONParserTriangulation.prototype.lateralSurfaces = function (configuration, points) {
    var altitude = configuration && configuration.altitude ? configuration.altitude : null;
    var positions = [], indices = [], longitude_0, latitude_0, reprojectedCoordinate_0, longitude_1, latitude_1, reprojectedCoordinate_1, position;

    for (var positionIndex = 0; positionIndex < points.length-1; positionIndex++) {
      longitude_0 = points[positionIndex][0];
      latitude_0 = points[positionIndex][1];
      reprojectedCoordinate_0 = this.getReprojectedIfRequired(latitude_0, longitude_0, this.crs);

      longitude_1 = points[positionIndex+1][0];
      latitude_1 = points[positionIndex+1][1];
      reprojectedCoordinate_1 = this.getReprojectedIfRequired(latitude_1, longitude_1, this.crs);

      position = new Position(reprojectedCoordinate_0[1], reprojectedCoordinate_0[0], altitude);
      positions.push(position);
      position = new Position(reprojectedCoordinate_1[1], reprojectedCoordinate_1[0], altitude);
      positions.push(position);
      position = new Position(reprojectedCoordinate_0[1], reprojectedCoordinate_0[0], 0);
      positions.push(position);

      position = new Position(reprojectedCoordinate_0[1], reprojectedCoordinate_0[0], 0);
      positions.push(position);
      position = new Position(reprojectedCoordinate_1[1], reprojectedCoordinate_1[0], 0);
      positions.push(position);
      position = new Position(reprojectedCoordinate_1[1], reprojectedCoordinate_1[0], altitude);
      positions.push(position);

      indices.push(positionIndex*6+0, positionIndex*6+1, positionIndex*6+2, positionIndex*6+3, positionIndex*6+4, positionIndex*6+5);
    }

    // console.log("positions --> " + positions);
    // console.log("indices --> " + indices);

    var shape = new TriangleMesh(positions, indices, configuration && configuration.attributes ? configuration.attributes : null);

    // shapeConfigurationCallback sets only "configuration.attributes", not "altitudeMode". configuration object literal currently also returns "altutude" and "extrude".
    shape.altitudeMode = configuration.altitudeMode || WorldWind.RELATIVE_TO_GROUND;
    return shape;
  };

  GeoJSONParserTriangulation.prototype.topSurface = function (configuration, points) {
    var altitude = configuration && configuration.altitude ? configuration.altitude : null;
    var extrude = configuration && configuration.extrude ? configuration.extrude : null;
    var positions = [], longitude, latitude, reprojectedCoordinate, position, shape;

    for (var positionIndex = 0; positionIndex < points.length-1; positionIndex++) {
      longitude = points[positionIndex][0];
      latitude = points[positionIndex][1];
      reprojectedCoordinate = this.getReprojectedIfRequired(latitude, longitude, this.crs);

      position = new Position(reprojectedCoordinate[1], reprojectedCoordinate[0], altitude);
      positions.push(position);
    }

    // console.log("positions --> " + positions);

    if (extrude == false)
      shape = new SurfacePolygon(positions, configuration && configuration.attributes ? configuration.attributes : null);
    else {
      shape = new Polygon(positions, configuration && configuration.attributes ? configuration.attributes : null);
      shape.altitudeMode = configuration.altitudeMode || WorldWind.RELATIVE_TO_GROUND;
    }
    return shape;
  };

  GeoJSONParserTriangulation.prototype.addRenderablesForPolygon = function (layer, geometry, properties) {
    // console.log("Inside GeoJSONParserTriangulation, addRenderablesForPolygon.");
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
    var extrude = configuration && configuration.extrude ? configuration.extrude : null;
    var boundaries = geometry.coordinates;
    var points = [];
    var shape;

    /* console.log("configuration --> " + JSON.stringify(configuration));
    console.log("geometry --> " + JSON.stringify(geometry));
    console.log("boundaries -- > " + boundaries); */

    if (!this.crs || this.crs.isCRSSupported()) {
      // one boundary -> one polygon
      for (var boundariesIndex = 0; boundariesIndex < boundaries.length; boundariesIndex++) {

        // console.log("boundariesIndex -- > " + boundariesIndex);

        points = boundaries[boundariesIndex];
        // console.log("points --> " + points);

        if (extrude == true)
          shape = this.lateralSurfaces(configuration, points);
        shape = this.topSurface(configuration, points);
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
      }
    }
  };

  return GeoJSONParserTriangulation;
});
