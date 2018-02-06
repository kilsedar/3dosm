/**
 * @exports GeoJSONParserOSM
 */
define(['libraries/WebWorldWind/src/formats/geojson/GeoJSONParser',
        'libraries/WebWorldWind/src/geom/Position',
        'libraries/WebWorldWind/src/shapes/Polygon',
        'libraries/WebWorldWind/src/shapes/SurfacePolygon',
        'src/shapes/BuildingShape'],
       function (GeoJSONParser, Position, Polygon, SurfacePolygon, BuildingShape) {
  "use strict";

  /**
   * Creates a subclass of the {@link GeoJSONParser} class.
   * @alias GeoJSONParserOSM
   * @constructor
   * @classdesc
   * @param {String} dataSource The data source in GeoJSON format. Can be a string or a URL for the data.
   */
  var GeoJSONParserOSM = function (dataSource) {
    GeoJSONParser.call(this, dataSource);
  };

  GeoJSONParserOSM.prototype = Object.create(GeoJSONParser.prototype);

  GeoJSONParserOSM.prototype.addRenderablesForPolygon = function (layer, geometry, properties) {
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
    var boundaries = geometry.coordinates;
    var OSMBuildingPolygon = new BuildingShape(properties);
    OSMBuildingPolygon.setAltitude(configuration);
    var altitude = OSMBuildingPolygon.altitude;
    if (configuration.extrude && configuration.heatmap.enabled)
      OSMBuildingPolygon.setColor(configuration);

    if (!this.crs || this.crs.isCRSSupported()) {
      for (var boundaryIndex = 0; boundaryIndex < boundaries.length; boundaryIndex++) {
        var points = boundaries[boundaryIndex];
        var positions = [];

        for (var positionIndex = 0;  positionIndex < points.length; positionIndex++) {
          var longitude = points[positionIndex][0];
          var latitude = points[positionIndex][1];
          var reprojectedCoordinate = this.getReprojectedIfRequired(latitude, longitude, this.crs);
          var position = new Position(reprojectedCoordinate[1], reprojectedCoordinate[0], altitude);
          positions.push(position);
        }

        if (configuration.extrude) {
          var shape = new Polygon(positions, configuration && configuration.attributes ? configuration.attributes : null);
          shape.extrude = configuration.extrude;
        }
        else
          var shape = new SurfacePolygon(positions, configuration && configuration.attributes ? configuration.attributes : null);

        shape.altitudeMode = configuration.altitudeMode;
        if (configuration.highlightAttributes) {
          shape.highlightAttributes = configuration.highlightAttributes;
        }
        if (configuration && configuration.pickDelegate) {
          shape.pickDelegate = configuration.pickDelegate;
        }
        if (configuration && configuration.userProperties) {
          shape.userProperties = configuration.userProperties;
        }
        this.layer.addRenderable(shape);
      }
    }
  };

  GeoJSONParserOSM.prototype.addRenderablesForMultiPolygon = function (layer, geometry, properties) {
    if (!layer) {
      throw new ArgumentError(
        Logger.logMessage(Logger.LEVEL_SEVERE, "GeoJSON", "addRenderablesForMultiPolygon", "missingLayer")
      );
    }

    if (!geometry) {
      throw new ArgumentError(
        Logger.logMessage(Logger.LEVEL_SEVERE, "GeoJSON", "addRenderablesForMultiPolygon", "missingGeometry")
      );
    }

    var configuration = this.shapeConfigurationCallback(geometry, properties);
    var polygons = geometry.coordinates, boundaries = [];
    var OSMBuildingMultiPolygon = new BuildingShape(properties);
    OSMBuildingMultiPolygon.setAltitude(configuration);
    var altitude = OSMBuildingMultiPolygon.altitude;
    if (configuration.extrude && configuration.heatmap.enabled)
      OSMBuildingMultiPolygon.setColor(configuration);

    if (!this.crs || this.crs.isCRSSupported()) {
      for (var polygonIndex = 0; polygonIndex < polygons.length; polygonIndex++) {
        boundaries = polygons[polygonIndex];

        for (var boundaryIndex = 0; boundaryIndex < boundaries.length; boundaryIndex++) {
          var points = boundaries[boundaryIndex];
          var positions = [];

          for (var positionIndex = 0;  positionIndex < points.length; positionIndex++) {
            var longitude = points[positionIndex][0];
            var latitude = points[positionIndex][1];
            var reprojectedCoordinate = this.getReprojectedIfRequired(latitude, longitude, this.crs);
            var position = new Position(reprojectedCoordinate[1], reprojectedCoordinate[0], altitude);
            positions.push(position);
          }

          if (configuration.extrude) {
            var shape = new Polygon(positions, configuration && configuration.attributes ? configuration.attributes : null);
            shape.extrude = configuration.extrude;
          }
          else
            var shape = new SurfacePolygon(positions, configuration && configuration.attributes ? configuration.attributes : null);

          shape.altitudeMode = configuration.altitudeMode;
          if (configuration.highlightAttributes) {
            shape.highlightAttributes = configuration.highlightAttributes;
          }
          if (configuration && configuration.pickDelegate) {
            shape.pickDelegate = configuration.pickDelegate;
          }
          if (configuration && configuration.userProperties) {
            shape.userProperties = configuration.userProperties;
          }
          this.layer.addRenderable(shape);
        }
      }
    }
  };

  return GeoJSONParserOSM;
});
