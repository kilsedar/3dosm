/**
 * @exports OSMLayer
 */
define(['WorldWind', 'jquery', 'osmtogeojson'],
  function (WorldWind, $, osmtogeojson) {
    "use strict";

    /**
     * Constructs an OSM layer for a specified WorldWindow.
     * @alias OSMLayer
     * @constructor boundingBox is expected to be in array format, the order of the coordinates for the boundingBox is "x1, y1, x2, y2". The type can be either "node" or "way". Refer to "http://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide" and "http://wiki.openstreetmap.org/wiki/Map_Features" to match the type and the tag correctly.
     * @classdesc Fetches and if possible extrudes OSM data.
     * @param wwd is the WorldWindow to be associated to this OSM layer with.
     */
    var OSMLayer = function (wwd, boundingBox, type, tag) {
      this.wwd = wwd;
      this.boundingBox = boundingBox;
      this.type = type;
      this.tag = tag;
    };

    OSMLayer.prototype.log = function () {
      console.log(this.boundingBox);
      console.log(this.type);
      console.log(this.tag);
    }

    OSMLayer.prototype.shapeConfigurationCallback = function (geometry, properties) {
      var configuration = {};

      // Set up the common placemark attributes.
      var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
      placemarkAttributes.imageScale = 0.05;
      placemarkAttributes.imageColor = WorldWind.Color.WHITE;
      placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
          WorldWind.OFFSET_FRACTION, 0.5,
          WorldWind.OFFSET_FRACTION, 1.5);
      placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/white-dot.png";

      if (geometry.isPointType() || geometry.isMultiPointType()) {
        configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);

        if (properties && (properties.name || properties.Name || properties.NAME)) {
          configuration.name = properties.name || properties.Name || properties.NAME;
        }
        if (properties && properties.POP_MAX) {
          var population = properties.POP_MAX;
          configuration.attributes.imageScale = 0.01 * Math.log(population);
        }
      }
      else if (geometry.isLineStringType() || geometry.isMultiLineStringType()) {
        configuration.attributes =  new WorldWind.ShapeAttributes(null);
        configuration.attributes.drawOutline = true;
        configuration.attributes.outlineColor = new WorldWind.Color(
          0.1 * configuration.attributes.interiorColor.red,
          0.3 * configuration.attributes.interiorColor.green,
          0.7 * configuration.attributes.interiorColor.blue,
          1.0);
        configuration.attributes.outlineWidth = 1.0;
      }
      else if(geometry.isPolygonType() || geometry.isMultiPolygonType()) {
        configuration.attributes = new WorldWind.ShapeAttributes(null);

        // Fill the polygon with a random pastel color.
        configuration.attributes.interiorColor = new WorldWind.Color(
          0.375 + 0.5 * Math.random(),
          0.375 + 0.5 * Math.random(),
          0.375 + 0.5 * Math.random(),
          0.1);
        // Paint the outline in a darker variant of the interior color.
        configuration.attributes.outlineColor = new WorldWind.Color(
          0.5 * configuration.attributes.interiorColor.red,
          0.5 * configuration.attributes.interiorColor.green,
          0.5 * configuration.attributes.interiorColor.blue,
          1.0);
      }

      return configuration;
    };

    OSMLayer.prototype.get = function () {

      var data = '[out:json][timeout:25];';

      var boundingBox = this.boundingBox;

      data += '(' + this.type + '[' + this.tag + '](' + boundingBox[0] + ',' + boundingBox[1] + ',' + boundingBox[2] + ',' + boundingBox[3] + '); ';
      data += 'relation[' + this.tag + '](' + boundingBox[0] + ',' + boundingBox[1] + ',' + boundingBox[2] + ',' + boundingBox[3] + ');); (._;>;); out skel qt;';

      console.log(data);

      var wwd = this.wwd;

      $.ajax({
        url: 'http://overpass-api.de/api/interpreter',
        data: data,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (dataOverpass) {
          if (dataOverpass.elements.length < 1) {
            console.log("No features are found.");
            return;
          }
          var dataOverpassGeoJSON = osmtogeojson(dataOverpass);
          var dataOverpassGeoJSONString = JSON.stringify(dataOverpassGeoJSON);
          // console.log(dataOverpassGeoJSONString);
          var OSMLayer = new WorldWind.RenderableLayer("OSMLayer");
          var OSMLayerGeoJSON = new WorldWind.GeoJSONParser(dataOverpassGeoJSONString);
          OSMLayerGeoJSON.load(null, this.shapeConfigurationCallback, OSMLayer);
          wwd.addLayer(OSMLayer);
        },
        error: function (e) {
          console.log("Error: " + JSON.stringify(e));
        }
      });
    };

    OSMLayer.prototype.zoomToLayer = function () {
      var boundingBox = this.boundingBox;
      var centerX = (boundingBox[0] + boundingBox[2])/2;
      var centerY = (boundingBox[1] + boundingBox[3])/2;
      this.wwd.navigator.lookAtLocation.latitude = centerX;
      this.wwd.navigator.lookAtLocation.longitude = centerY;
      // console.log(centerX + ", " + centerY);
      this.wwd.navigator.range = 5e3; // Should be automatically calculated. 
      this.wwd.redraw();
    };

    return OSMLayer;
});
