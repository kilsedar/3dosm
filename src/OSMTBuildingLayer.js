/**
 * @exports OSMTBuildingLayer
 */
define(['libraries/WebWorldWind/src/cache/MemoryCache',
        'libraries/WebWorldWind/src/error/ArgumentError',
        'libraries/WebWorldWind/src/util/Logger',
        'libraries/WebWorldWind/src/geom/BoundingBox',
        'libraries/WebWorldWind/src/geom/Sector',
        'libraries/WebWorldWind/src/gesture/GestureRecognizer',
        'libraries/WebWorldWind/src/gesture/DragRecognizer',
        'libraries/WebWorldWind/src/gesture/PanRecognizer',
        'libraries/WebWorldWind/src/gesture/ClickRecognizer',
        'libraries/WebWorldWind/src/gesture/TapRecognizer',
        'libraries/WebWorldWind/src/gesture/PinchRecognizer',
        'libraries/WebWorldWind/src/gesture/RotationRecognizer',
        'libraries/WebWorldWind/src/gesture/TiltRecognizer',
        'src/OSMBuildingLayer',
        'src/GeoJSONParserTriangulationOSM',
        'jquery',
        'osmtogeojson'],
       function (MemoryCache, ArgumentError, Logger, BoundingBox, Sector, GestureRecognizer, DragRecognizer, PanRecognizer, ClickRecognizer, TapRecognizer, PinchRecognizer, RotationRecognizer, TiltRecognizer, OSMBuildingLayer, GeoJSONParserTriangulationOSM, $, osmtogeojson) {
  "use strict";

  /**
   * Creates a sublass of the {@link OSMBuildingLayer} class.
   * @alias OSMTBuildingLayer
   * @constructor
   * @classdesc Attempts to create tiles (sectors) using the bounding box of the layer with a fixed size for all the zoom levels. For each sector makes a new request to OSM if the sector is visible.
   * Upon gestures, adds and/or removes the [layers]{@link OSMBuildingLayer} corresponding to the sectors.
   * @param {WorldWindow} worldWindow The WorldWindow where the OSMTBuildingLayer is added to.
   * @param {Object} configuration Configuration is used to set the attributes of {@link ShapeAttributes}. Four more attributes can be defined, which are "extrude", "heatmap", "altitude" and "altitudeMode".
   * @param {Object} source Defines the data source of the {@link OSMTBuildingLayer}.
   */
  var OSMTBuildingLayer = function (worldWindow, configuration, source) {
    OSMBuildingLayer.call(this, worldWindow, configuration, source);

    /**
     * Holds the {@link OSMBuildingLayer} for each sector.
     * @memberof OSMTBuildingLayer.prototype
     * @type {MemoryCache}
     */
    this._cache = new MemoryCache(100000, 80000);

    /**
     * An array holding both the sectors making up the layer's bounding box and their state of being added to the {@link WorldWindow} or not.
     * @memberof OSMTBuildingLayer.prototype
     * @type {Object[]}
     */
    this._sectors = [];
  };

  OSMTBuildingLayer.prototype = Object.create(OSMBuildingLayer.prototype);

  /**
   * The callback for [GestureRecognizers]{@link GestureRecognizer}, which are {@link DragRecognizer}, {@link PanRecognizer}, {@link ClickRecognizer}, {@link TapRecognizer}, {@link PinchRecognizer}, {@link RotationRecognizer} and {@link TiltRecognizer}.
   * For each sector of the layer, checks if it is visible. If it is and its layer is not added to the WorldWindow, checks the cache.
   * If the layer corresponding to the sector is in the cache uses the cache, otherwise makes a request to OSM. If it is not visible and it is added to the WorldWindow, removes it.
   */
  OSMTBuildingLayer.prototype.gestureRecognizerCallback = function () {
    // console.log("sectors -> " + JSON.stringify(this._sectors));
    for (var sectorIndex = 0; sectorIndex < this._sectors.length; sectorIndex++) {
      if (this.intersectsVisible(this._sectors[sectorIndex].sector) && !this._sectors[sectorIndex].added) {
        console.log("The layer in this sector has to be added.");
        if (this._cache.entryForKey(this._sectors[sectorIndex].sector.minLatitude + ',' + this._sectors[sectorIndex].sector.minLongitude + ',' + this._sectors[sectorIndex].sector.maxLatitude + ',' + this._sectors[sectorIndex].sector.maxLongitude) != null) {
          this._worldWindow.addLayer(this._cache.entryForKey(this._sectors[sectorIndex].sector.minLatitude + ',' + this._sectors[sectorIndex].sector.minLongitude + ',' + this._sectors[sectorIndex].sector.maxLatitude + ',' + this._sectors[sectorIndex].sector.maxLongitude));
          this._sectors[sectorIndex].added = true;
        }
        else
          this.addBySector(this._sectors[sectorIndex]);
      }
      else if (!this.intersectsVisible(this._sectors[sectorIndex].sector) && this._sectors[sectorIndex].added) {
        console.log("The layer in this sector has to be removed.");
        this._worldWindow.removeLayer(this._cache.entryForKey(this._sectors[sectorIndex].sector.minLatitude + ',' + this._sectors[sectorIndex].sector.minLongitude + ',' + this._sectors[sectorIndex].sector.maxLatitude + ',' + this._sectors[sectorIndex].sector.maxLongitude));
        this._sectors[sectorIndex].added = false;
      }
      else {
        console.log("No need to do something.");
      }
      console.log("the number of layers -> " + this._worldWindow.layers.length);
    }
  };

  /**
   * Sectorizes a bounding box. Each sector initially will be 0.02 to 0.02 degrees for all the zoom levels.
   * @param {Float[]} boundingBox The bounding box to be sectorized. Intended to be the bounding box of the whole layer.
   */
  OSMTBuildingLayer.prototype.createSectors = function(boundingBox) {
    var sectorSize = 0.02;
    var decimalCount = 5; // Can be derived from the coordinates.
    var sectorsOnXCount = Math.ceil((boundingBox[2]-boundingBox[0]).toFixed(decimalCount)/sectorSize);
    var sectorsOnYCount = Math.ceil((boundingBox[3]-boundingBox[1]).toFixed(decimalCount)/sectorSize);

    for (var indexY = 0; indexY < sectorsOnYCount; indexY++) {
      for (var indexX = 0; indexX < sectorsOnXCount; indexX++) {
        var x1 = (boundingBox[0]+sectorSize*indexX).toFixed(decimalCount);

        if (indexX+1 == sectorsOnXCount)
          var x2 = boundingBox[2].toFixed(decimalCount);
        else
          var x2 = (boundingBox[0]+sectorSize*(indexX+1)).toFixed(decimalCount);

        var y1 = (boundingBox[1]+sectorSize*indexY).toFixed(decimalCount);

        if (indexY+1 == sectorsOnYCount)
          var y2 = boundingBox[3].toFixed(decimalCount);
        else
        var y2 = (boundingBox[1]+sectorSize*(indexY+1)).toFixed(decimalCount);

        this._sectors.push({sector: new Sector(y1, y2, x1, x2), added: false});
      }
    }
  };

  /**
   * Checks if a given sector is visible.
   * @param {Sector} sector A {@link Sector} of the OSMTBuildingLayer.
   * @returns {boolean} True if the sector intersects the frustum, otherwise false.
   */
  OSMTBuildingLayer.prototype.intersectsVisible = function(sector) {
    var boundingBox = new BoundingBox();
    boundingBox.setToSector(sector, this._worldWindow.drawContext.globe, 0, 15); // Maximum elevation 15 should be changed.

    return boundingBox.intersectsFrustum(this._worldWindow.drawContext.navigatorState.frustumInModelCoordinates);
  };

  /**
   * Calls [createSectors]{@link OSMTBuildingLayer#createSectors} and [addBySector]{@link OSMTBuildingLayer#addBySector} if the "type" of the layer's "_source" member variable is "boundingBox" and the "coordinates" of the layer's "_source" member variable is defined.
   * Also registers the [GestureRecognizers]{@link GestureRecognizer}, which are {@link DragRecognizer}, {@link PanRecognizer}, {@link ClickRecognizer}, {@link TapRecognizer}, {@link PinchRecognizer}, {@link RotationRecognizer} and {@link TiltRecognizer}.
   * Calls [addByGeoJSONFile]{@link OSMBuildingLayer#addByGeoJSONFile} if the "type" of the layer's "_source" member variable is "GeoJSONFile" and the "path" of the layer's "_source" member variable is defined.
   * @throws {ArgumentError} If the source definition is wrong.
   */
  OSMTBuildingLayer.prototype.add = function () {
    if (this._source.type == "boundingBox" && this._source.coordinates) {
      this.boundingBox = this._source.coordinates;
      this.zoom(); // temporary
      this.createSectors(this.boundingBox);
      for (var sectorIndex = 0; sectorIndex < this._sectors.length; sectorIndex++){
        if (this.intersectsVisible(this._sectors[sectorIndex].sector))
          this.addBySector(this._sectors[sectorIndex].sector);
      }

      var dragRecognizer = new DragRecognizer(this._worldWindow.canvas, this.gestureRecognizerCallback.bind(this)); // desktop
      var panRecognizer = new PanRecognizer(this._worldWindow.canvas, this.gestureRecognizerCallback.bind(this)); // mobile
      var clickRecognizer = new ClickRecognizer(this._worldWindow.canvas, this.gestureRecognizerCallback.bind(this)); // desktop
      var tapRecognizer = new TapRecognizer(this._worldWindow.canvas, this.gestureRecognizerCallback.bind(this)); // mobile
      var pinchRecognizer = new PinchRecognizer(this._worldWindow.canvas, this.gestureRecognizerCallback.bind(this)); // mobile
      var rotationRecognizer = new RotationRecognizer(this._worldWindow.canvas, this.gestureRecognizerCallback.bind(this)); // mobile
      var tiltRecognizer = new TiltRecognizer(this._worldWindow.canvas, this.gestureRecognizerCallback.bind(this)); // mobile
    }
    else if (this._source.type == "GeoJSONFile" && this._source.path)
      this.addByGeoJSONFile();
    else {
      throw new ArgumentError(
        Logger.logMessage(Logger.LEVEL_SEVERE, "OSMTBuildingLayer", "add", "The source definition of the layer is wrong.")
      );
    }
  };

  /**
   * Makes an AJAX request to fetch the OSM building data using the sector's minimum and maximum latitude and longitude and Overpass API, converts it to GeoJSON using osmtogeojson API,
   * adds the GeoJSON to the {@link WorldWindow} using the {@link GeoJSONParserTriangulationOSM}.
   * Also caches the {@link OSMBuildingLayer} corresponding to the sector using as id the sector's minimum and maximum latitude and longitude.
   * @param {Sector} sector A {@link Sector} of the OSMTBuildingLayer.
   */
  OSMTBuildingLayer.prototype.addBySector = function (sector) {

    var worldWindow = this._worldWindow;
    var _self = this;

    var data = '[out:json][timeout:25];';
    data += '(' + this._type + '[' + this._tag + '](' + sector.minLatitude + ',' + sector.minLongitude + ',' + sector.maxLatitude + ',' + sector.maxLongitude + '); ';
    data += 'relation[' + this._tag + '](' + sector.minLatitude + ',' + sector.minLongitude + ',' + sector.maxLatitude + ',' + sector.maxLongitude + ');); out body; >; out skel qt;';

    $.ajax({
      url: 'http://overpass-api.de/api/interpreter',
      data: data,
      type: 'POST',
      success: function(dataOverpass) {
        var dataOverpassGeoJSON = osmtogeojson(dataOverpass);
        var dataOverpassGeoJSONString = JSON.stringify(dataOverpassGeoJSON);
        var OSMTBuildingLayer = new WorldWind.RenderableLayer("OSMTBuildingLayer");
        var OSMTBuildingLayerGeoJSON = new GeoJSONParserTriangulationOSM(dataOverpassGeoJSONString);
        OSMTBuildingLayerGeoJSON.load(null, _self.shapeConfigurationCallback.bind(_self), OSMTBuildingLayer);
        worldWindow.addLayer(OSMTBuildingLayer);
        _self._cache.putEntry(sector.minLatitude + ',' + sector.minLongitude + ',' + sector.maxLatitude + ',' + sector.maxLongitude, OSMTBuildingLayer, dataOverpassGeoJSON.features.length);
        var sectorIndex = _self._sectors.findIndex(s => s.sector === sector);
        _self._sectors[sectorIndex].added = true;
      },
      error: function(e) {
        throw new ArgumentError(
          Logger.logMessage(Logger.LEVEL_SEVERE, "OSMTBuildingLayer", "addBySector", "Request failed. Error: " + JSON.stringify(e))
        );
      }
    });
  };

  return OSMTBuildingLayer;
});
