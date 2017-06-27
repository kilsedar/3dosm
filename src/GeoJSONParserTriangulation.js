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
   * Creates a subclass of the {@link GeoJSONParser} class.
   * @alias GeoJSONParserTriangulation
   * @constructor
   * @classdesc Triangulates polygons, which can be {@link Polygon}s or {@link MultiPolygon}s. Triangulated polygons improves rendering and painting performance compared to extruded polygons.
   * @param {String} dataSource The data source in GeoJSON format. Can be a string or a URL for the data.
   */
  var GeoJSONParserTriangulation = function (dataSource) {
    GeoJSONParser.call(this, dataSource);
  };

  GeoJSONParserTriangulation.prototype = Object.create(GeoJSONParser.prototype);

  /**
   * Colors the polygons based on their altitude.
   * As the altitude increases the red component of the color increases.
   * The thresholds could be calculated automatically based on the data.
   * @param {Object} configuration Configuration is the object returned by [shapeConfigurationCallback]{@link Shapefile#shapeConfigurationCallback}.
   * @param {Float} altitude The altitude of the polygon.
   */
  GeoJSONParserTriangulation.prototype.setColor = function (configuration, altitude) {
    /* if (altitude < 30)
      configuration.attributes.interiorColor = new WorldWind.Color(0.25, 0.31, 0.95, 1.0); // rgba(66, 80, 244, 1.0)
    else if (altitude >= 30 && altitude < 50)
      configuration.attributes.interiorColor = new WorldWind.Color(0.25, 0.95, 0.61, 1.0); // rgba(66, 244, 158, 1.0)
    else if (altitude >= 50 && altitude < 100)
      configuration.attributes.interiorColor = new WorldWind.Color(0.95, 0.74, 0.25, 1.0); // rgba(244, 191, 66, 1.0)
    else if (altitude >= 100)
      configuration.attributes.interiorColor = new WorldWind.Color(0.95, 0.32, 0.25, 1.0); // rgba(244, 83, 66, 1.0) */

    /* if (altitude < 30)
      configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 0.7);
    else if (altitude >= 30 && altitude < 50)
      configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 0.8);
    else if (altitude >= 50 && altitude < 100)
      configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 0.9);
    else if (altitude >= 100)
      configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0); */

    /* if (configuration.attributes.interiorColor.red > 0.5) {
      if (altitude < 30)
        configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red-0.5, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
      else if (altitude >= 30 && altitude < 50)
        configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red-0.3, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
      else if (altitude >= 50 && altitude < 100)
        configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red-0.1, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
      else if (altitude >= 100)
        configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
    }
    else {
      if (altitude < 30)
        configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
      else if (altitude >= 30 && altitude < 50)
        configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red+0.1, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
      else if (altitude >= 50 && altitude < 100)
        configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red+0.3, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
      else if (altitude >= 100)
        configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red+0.5, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
    } */

    var numberOfThresholds = configuration.heatmap.thresholds.length;
    var heat = 0.5/(numberOfThresholds-2);
    // console.log(configuration.heatmap.thresholds + ", " + heat);

    if (configuration.attributes.interiorColor.red < 0.5) {
      for (var thresholdIndex = 0; thresholdIndex < numberOfThresholds-1; thresholdIndex++) {
        // console.log(heat*thresholdIndex);
        if (altitude > configuration.heatmap.thresholds[thresholdIndex] && altitude <= configuration.heatmap.thresholds[thresholdIndex+1])
          configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red+heat*thresholdIndex, configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
      }
    }
    else {
      for (var thresholdIndex = 0; thresholdIndex < numberOfThresholds-1; thresholdIndex++) {
        // console.log(heat*thresholdIndex);
        if (altitude > configuration.heatmap.thresholds[thresholdIndex] && altitude <= configuration.heatmap.thresholds[thresholdIndex+1])
          configuration.attributes.interiorColor = new WorldWind.Color(configuration.attributes.interiorColor.red-heat*(numberOfThresholds-thresholdIndex), configuration.attributes.interiorColor.green, configuration.attributes.interiorColor.blue, 1.0);
      }
    }
  };

  /**
   * Sets the altitudes of the buildings.
   * If altitude is set to "osm", if available the value of OSM "height" tag is used. If the "height" tag is not available an approximate height value is calculated using "building:levels" tag. Every level is considered to be 3 meters.
   * If both are not available, a default value "15" is set.
   * If altitude is set to a floating-point number, the set value is used for all the buildings.
   * If altitude is not set, a default value "15" is set.
   * @param {Object} configuration Configuration is the object returned by [shapeConfigurationCallback]{@link Shapefile#shapeConfigurationCallback}.
   * @param {Object} properties The properties related to the polygon's geometry.
   */
  GeoJSONParserTriangulation.prototype.setAltitude = function (configuration, properties) {
    var altitude;
    if (configuration.extrude && configuration.altitude == "osm") {
      if (properties.tags.height)
        altitude = properties.tags.height;
      else if (properties.tags["building:levels"])
        altitude = properties.tags["building:levels"]*3;
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

    return altitude;
  };

  /**
   * Invokes [lateralSurfaces]{@link GeoJSONParserTriangulation#lateralSurfaces} and/or [topSurface]{@link GeoJSONParserTriangulation#topSurface} to create a {@link TriangleMesh} for [Polygon]{@link GeoJSONGeometryPolygon} geometry.
   * <p>This method also invokes this GeoJSON's [shapeConfigurationCallback]{@link GeoJSONParser#shapeConfigurationCallback} for the geometry. [shapeConfigurationCallback]{@link Shapefile#shapeConfigurationCallback} is extended by three attributes in the {@link OSMBuildingLayer}.
   * These attributes are "extrude", "altitude" and "altitudeMode". If extrude is true, this function calls [lateralSurfaces]{@link GeoJSONParserTriangulation#lateralSurfaces} and [topSurface]{@link GeoJSONParserTriangulation#topSurface}. Otherwise it only calls [topSurface]{@link GeoJSONParserTriangulation#topSurface}.</p>
   * Applications typically do not call this method directly. It is called by [addRenderablesForGeometry]{@link GeoJSONParser#addRenderablesForGeometry}.
   * @param {RenderableLayer} layer The layer in which to place the newly created shapes.
   * @param {GeoJSONGeometryPolygon} geometry The Polygon geometry object.
   * @param {Object} properties The properties related to the Polygon geometry.
   * @throws {ArgumentError} If the specified layer is null or undefined.
   * @throws {ArgumentError} If the specified geometry is null or undefined.
   */
  GeoJSONParserTriangulation.prototype.addRenderablesForPolygon = function (layer, geometry, properties) {
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
    var boundaries = geometry._coordinates;
    var altitude = this.setAltitude(configuration, properties);
    if (configuration.extrude && configuration.heatmap.enabled)
      this.setColor(configuration, altitude);


    // console.log("configuration --> " + JSON.stringify(configuration));
    // console.log("geometry --> " + JSON.stringify(geometry));
    // console.log("boundaries --> " + boundaries);
    // console.log("boundaries.length --> " + boundaries.length);
    // console.log("properties --> " + JSON.stringify(properties));
    // console.log("properties.tags.height --> " + properties.tags.height);
    // console.log("altitude --> " + altitude);

    if (!this.crs || this.crs.isCRSSupported()) {
      if (configuration.extrude == true)
        this.lateralSurfaces(configuration, altitude, boundaries);
      this.topSurface(configuration, altitude, boundaries);
    }
  };

  /**
   * Invokes [lateralSurfaces]{@link GeoJSONParserTriangulation#lateralSurfaces} and/or [topSurface]{@link GeoJSONParserTriangulation#topSurface} to create a {@link TriangleMesh} for [MultiPolygon]{@link GeoJSONGeometryMultiPolygon} geometry.
   * <p>This method also invokes this GeoJSON's [shapeConfigurationCallback]{@link GeoJSONParser#shapeConfigurationCallback} for the geometry. [shapeConfigurationCallback]{@link Shapefile#shapeConfigurationCallback} is extended by three attributes in the {@link OSMBuildingLayer}.
   * These attributes are "extrude", "altitude" and "altitudeMode". If extrude is true, this function calls [lateralSurfaces]{@link GeoJSONParserTriangulation#lateralSurfaces} and [topSurface]{@link GeoJSONParserTriangulation#topSurface}. Otherwise it only calls [topSurface]{@link GeoJSONParserTriangulation#topSurface}.</p>
   * Applications typically do not call this method directly. It is called by [addRenderablesForGeometry]{@link GeoJSONParser#addRenderablesForGeometry}.
   * @param {RenderableLayer} layer The layer in which to place the newly created shapes.
   * @param {GeoJSONGeometryMultiPolygon} geometry The MultiPolygon geometry object.
   * @param {Object} properties The properties related to the MultiPolygon geometry.
   * @throws {ArgumentError} If the specified layer is null or undefined.
   * @throws {ArgumentError} If the specified geometry is null or undefined.
   */
  GeoJSONParser.prototype.addRenderablesForMultiPolygon = function (layer, geometry, properties) {
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
    var polygons = geometry._coordinates, boundaries = [];
    var altitude = this.setAltitude(configuration, properties);
    if (configuration.extrude && configuration.heatmap.enabled)
      this.setColor(configuration, altitude);

    // console.log("properties --> " + JSON.stringify(properties));
    // console.log("properties.tags.height (MultiPolygon) --> " + properties.tags.height);
    // console.log("altitude --> " + altitude);

    if (!this.crs || this.crs.isCRSSupported()) {
      for (var polygonsIndex = 0; polygonsIndex < polygons.length; polygonsIndex++) {
        boundaries = polygons[polygonsIndex];
        if (configuration.extrude == true)
          this.lateralSurfaces(configuration, altitude, boundaries);
        this.topSurface(configuration, altitude, boundaries);
      }
    }
  };

  /**
   * Creates a {@link TriangleMesh} for the lateral surfaces of polygons. It creates two triangles for each lateral surface.
   * @param {Object} configuration Configuration is the object returned by [shapeConfigurationCallback]{@link Shapefile#shapeConfigurationCallback}.
   * @param {Object | Object[]} boundaries Boundaries of the polygons. If the geometry is [Polygon]{@link GeoJSONGeometryPolygon} the number of boundaries is one.
   * If the geometry is [MultiPolygon]{@link GeoJSONGeometryMultiPolygon} the number of boundaries is more than one.
   */
  GeoJSONParserTriangulation.prototype.lateralSurfaces = function (configuration, altitude, boundaries) {
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

    this.addTriangleMesh(positions, indices, configuration);
  };

  /**
   * Creates a {@link TriangleMesh} for the top surface of polygons, using earcut algorithm.
   * @param {Object} configuration Configuration is the object returned by [shapeConfigurationCallback]{@link Shapefile#shapeConfigurationCallback}.
   * @param {Object | Object[]} boundaries Boundaries of the polygons. If the geometry is [Polygon]{@link GeoJSONGeometryPolygon} the number of boundaries is one.
   * If the geometry is [MultiPolygon]{@link GeoJSONGeometryMultiPolygon} the number of boundaries is more than one.
   */
  GeoJSONParserTriangulation.prototype.topSurface = function (configuration, altitude, boundaries) {
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

    this.addTriangleMesh(positions, indices, configuration);
  };

  /**
   * Invoked by [lateralSurfaces]{@link GeoJSONParserTriangulation#lateralSurfaces} or [topSurface]{@link GeoJSONParserTriangulation#topSurface}, it adds the {@link TriangleMesh} to the layer.
   * @param {Position[]} positions Positions of the vertices of the triangles given in order, which means starting from index 0, every three vertices constitutes one triangle.
   * @param {Integer[]} indices Indices of the positions in the positions array.
   * @param {Object} configuration Configuration is the object returned by [shapeConfigurationCallback]{@link Shapefile#shapeConfigurationCallback}.
   */
  GeoJSONParserTriangulation.prototype.addTriangleMesh = function (positions, indices, configuration) {
    var shape = new TriangleMesh(positions, indices, configuration && configuration.attributes ? configuration.attributes : null);
    // shapeConfigurationCallback sets only "configuration.attributes", not "altitudeMode". configuration object literal currently also returns "altitude" and "extrude".
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
    this._layer.addRenderable(shape);
  }

  return GeoJSONParserTriangulation;
});
