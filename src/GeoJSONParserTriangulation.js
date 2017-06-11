/**
 * @exports GeoJSONParserTriangulation
 */
define(['libraries/WebWorldWind/src/WorldWind',
        'libraries/WebWorldWind/src/formats/geojson/GeoJSONParser',
        'libraries/WebWorldWind/src/geom/Position',
        'libraries/WebWorldWind/src/shapes/Polygon',
        'libraries/WebWorldWind/src/shapes/SurfacePolygon',
        'libraries/WebWorldWind/src/shapes/TriangleMesh'],
       function (WorldWind, GeoJSONParser, Position, Polygon, SurfacePolygon, TriangleMesh) {
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

    /* if (!this.crs || this.crs.isCRSSupported()) {
      for (var boundariesIndex = 0, boundaries = geometry.coordinates; boundariesIndex < boundaries.length; boundariesIndex++) {
        console.log("geometry --> " + JSON.stringify(geometry));
        console.log("boundaries -- > " + boundaries);
        console.log("boundariesIndex -- > " + boundariesIndex);

        var positions = [];

        for (var positionIndex = 0, points = boundaries[boundariesIndex]; positionIndex < points.length; positionIndex++) {

          console.log("points --> " + points);
          console.log("positionIndex --> " + positionIndex);

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
      }
    } */

    if (!this.crs || this.crs.isCRSSupported()) {
      // one boundary -> one polygon
      for (var boundariesIndex = 0, boundaries = geometry.coordinates; boundariesIndex < boundaries.length; boundariesIndex++) {

        console.log("geometry --> " + JSON.stringify(geometry));
        console.log("boundaries -- > " + boundaries);
        console.log("boundariesIndex -- > " + boundariesIndex);
        console.log("configuration --> " + JSON.stringify(configuration));

        var extrude = configuration && configuration.extrude ? configuration.extrude : null;

        if (extrude == true) {
          var positionsLateralSurfaces = [];
          var positionsTop = [];
          var indices = [];
          var altitude = configuration && configuration.altitude ? configuration.altitude : null;

          for (var positionIndex = 0, points = boundaries[boundariesIndex]; positionIndex < points.length-1; positionIndex++) {
            var longitude_0 = points[positionIndex][0];
            var latitude_0 = points[positionIndex][1];
            var reprojectedCoordinate_0 = this.getReprojectedIfRequired(latitude_0, longitude_0, this.crs);

            var longitude_1 = points[positionIndex+1][0];
            var latitude_1 = points[positionIndex+1][1];
            var reprojectedCoordinate_1 = this.getReprojectedIfRequired(latitude_1, longitude_1, this.crs);

            var position;

            position = new Position(reprojectedCoordinate_0[1], reprojectedCoordinate_0[0], altitude);
            positionsLateralSurfaces.push(position);
            positionsTop.push(position);
            position = new Position(reprojectedCoordinate_1[1], reprojectedCoordinate_1[0], altitude);
            positionsLateralSurfaces.push(position);
            position = new Position(reprojectedCoordinate_0[1], reprojectedCoordinate_0[0], 0);
            positionsLateralSurfaces.push(position);

            position = new Position(reprojectedCoordinate_0[1], reprojectedCoordinate_0[0], 0);
            positionsLateralSurfaces.push(position);
            position = new Position(reprojectedCoordinate_1[1], reprojectedCoordinate_1[0], 0);
            positionsLateralSurfaces.push(position);
            position = new Position(reprojectedCoordinate_1[1], reprojectedCoordinate_1[0], altitude);
            positionsLateralSurfaces.push(position);

            indices.push(positionIndex*6+0, positionIndex*6+1, positionIndex*6+2, positionIndex*6+3, positionIndex*6+4, positionIndex*6+5);
          }

          console.log("positionsLateralSurfaces --> " + positionsLateralSurfaces);
          console.log("indices --> " + indices);

          var shapeLateralSurfaces = new TriangleMesh(positionsLateralSurfaces, indices, configuration && configuration.attributes ? configuration.attributes : null);
          // shapeConfigurationCallback sets only "configuration.attributes", not "altitudeMode". configuration object literal currently also returns "altutude" and "extrude".
          shapeLateralSurfaces.altitudeMode = configuration.altitudeMode || WorldWind.RELATIVE_TO_GROUND;
          layer.addRenderable(shapeLateralSurfaces);

          console.log("positionsTop --> " + positionsTop);
          var shapeTop = new Polygon(positionsTop, configuration && configuration.attributes ? configuration.attributes : null);
          shapeTop.altitudeMode = configuration.altitudeMode || WorldWind.RELATIVE_TO_GROUND;
          layer.addRenderable(shapeTop);
        }
        else {
          // It is same as the top surface of 3D buildings, except the altitude is zero.
          var positions = [];

          for (var positionIndex = 0, points = boundaries[boundariesIndex]; positionIndex < points.length-1; positionIndex++) {
            var longitude = points[positionIndex][0];
            var latitude = points[positionIndex][1];
            var reprojectedCoordinate = this.getReprojectedIfRequired(latitude, longitude, this.crs);

            var position = new Position(reprojectedCoordinate[1], reprojectedCoordinate[0], 0);
            positions.push(position);
          }

          console.log("positions --> " + positions);
          var shape = new SurfacePolygon(positions, configuration && configuration.attributes ? configuration.attributes : null);
          layer.addRenderable(shape);
        }
      }
    }
  };

  return GeoJSONParserTriangulation;
});
