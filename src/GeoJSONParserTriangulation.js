/**
 * @exports GeoJSONParserTriangulation
 */
define(['libraries/WebWorldWind/src/WorldWind',
        'libraries/WebWorldWind/src/formats/geojson/GeoJSONParser',
        'libraries/WebWorldWind/src/geom/Position',
        'libraries/WebWorldWind/src/shapes/TriangleMesh',
        'earcut'],
       function (WorldWind, GeoJSONParser, Position, TriangleMesh, earcut) {
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

  GeoJSONParserTriangulation.prototype.lateralSurfaces = function (configuration, boundaries) {
    var altitude = configuration && configuration.altitude ? configuration.altitude : 1e2;
    var points = [], positions = [], indices = [], longitude_0, latitude_0, reprojectedCoordinate_0, longitude_1, latitude_1, reprojectedCoordinate_1, position;

    for (var boundariesIndex = 0; boundariesIndex < boundaries.length; boundariesIndex++) {

      // console.log("boundariesIndex -- > " + boundariesIndex);

      points = boundaries[boundariesIndex];
      // console.log("points --> " + points);

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
    }

    // console.log("positions --> " + positions);
    // console.log("indices --> " + indices);

    var shape = new TriangleMesh(positions, indices, configuration && configuration.attributes ? configuration.attributes : null);

    // shapeConfigurationCallback sets only "configuration.attributes", not "altitudeMode". configuration object literal currently also returns "altitude" and "extrude".
    shape.altitudeMode = configuration && configuration.altitudeMode ? configuration.altitudeMode : WorldWind.RELATIVE_TO_GROUND;
    if (configuration.highlightAttributes) {
      shape.highlightAttributes = configuration.highlightAttributes;
    }
    if (configuration && configuration.pickDelegate) {
      shape.pickDelegate = configuration.pickDelegate;
    }
    if (configuration && configuration.userProperties) {
      shape.userProperties = configuration.userProperties;
    }
    this._layer.addRenderable(shape);
  };

  GeoJSONParserTriangulation.prototype.topSurface = function (configuration, boundaries) {
    var extrude = configuration && configuration.extrude ? configuration.extrude : false;
    // If altitude is not defined in the example, it is defined '1e2' in OSMBuildingLayer if extrude is set true in the example, so the case 'if extrude is true, but altitude is undefined' is not checked.
    var altitude = configuration && configuration.extrude && configuration.altitude ? configuration.altitude : 0;
    // console.log(altitude);
    var positions = [], indices = [], triangleVertexIndex, longitude, latitude, reprojectedCoordinate, position;

    // console.log("boundaries --> " + boundaries);

    var boundariesFlattened = earcut.flatten(boundaries);
    var trianglesVertexIndices = earcut(boundariesFlattened.vertices, boundariesFlattened.holes);
    // console.log("trianglesVertexIndices --> " + trianglesVertexIndices);
    var vertices = boundariesFlattened.vertices;
    // console.log("vertices --> " + vertices);

    // Loops through vertex indices.
    for (var trianglesVertexCount = 0; trianglesVertexCount < trianglesVertexIndices.length; trianglesVertexCount += 3) {
      // Looping through each triangle's vertex indices, creates one triangle.
      for (var triangleVertexCount = 0; triangleVertexCount < 3; triangleVertexCount++) {
        triangleVertexIndex = trianglesVertexIndices[trianglesVertexCount+triangleVertexCount];
        longitude = vertices[triangleVertexIndex*2];
        latitude = vertices[triangleVertexIndex*2+1];
        reprojectedCoordinate = this.getReprojectedIfRequired(latitude, longitude, this.crs);
        position = new Position(reprojectedCoordinate[1], reprojectedCoordinate[0], altitude);
        positions.push(position);
      }
      indices.push(trianglesVertexCount, trianglesVertexCount+1, trianglesVertexCount+2);
    }

    // console.log("positions --> " + positions);
    // console.log("indices --> " + indices);

    var shape = new TriangleMesh(positions, indices, configuration && configuration.attributes ? configuration.attributes : null);

    // shapeConfigurationCallback sets only "configuration.attributes", not "altitudeMode". configuration object literal currently also returns "altitude" and "extrude".
    shape.altitudeMode = configuration && configuration.altitudeMode ? configuration.altitudeMode : WorldWind.RELATIVE_TO_GROUND;
    if (configuration.highlightAttributes) {
      shape.highlightAttributes = configuration.highlightAttributes;
    }
    if (configuration && configuration.pickDelegate) {
      shape.pickDelegate = configuration.pickDelegate;
    }
    if (configuration && configuration.userProperties) {
      shape.userProperties = configuration.userProperties;
    }
    this._layer.addRenderable(shape);
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
    var extrude = configuration && configuration.extrude ? configuration.extrude : false;
    var boundaries = geometry._coordinates;

    // console.log("configuration --> " + JSON.stringify(configuration));
    // console.log("geometry --> " + JSON.stringify(geometry));
    // console.log("boundaries --> " + boundaries);
    // console.log("boundaries.length --> " + boundaries.length);

    if (!this.crs || this.crs.isCRSSupported()) {
        if (extrude == true)
          this.lateralSurfaces(configuration, boundaries);
        this.topSurface(configuration, boundaries);
    }
  };

  return GeoJSONParserTriangulation;
});
