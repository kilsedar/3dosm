/**
 * @exports OSM3D
 */
define(['osmtogeojson'],
  function (osmtogeojson) {
    "use strict";

    /**
     * Constructs a layer manager for a specified {@link WorldWindow}.
     * @alias OSM3D
     * @constructor
     * @classdesc
     * @param
     */
    var OSM3D = function (x1, x2, y1, y2, tags) {
      this.x1 = x1;
      this.x2 = x2;
      this.y1 = y1;
      this.y2 = y2;

      this.tags = tags;
    };

    /*OSM3D.prototype.get = function() {

      var data = `[out:json][timeout:25];(`;

      var tags = this.tags;

      for (var x = 0; x < tags.length; x++) {
        data += `way[` + tags[x] + `](` + bbox + `);
        relation[` + tags[x] + `](` + bbox + `);`
      }
      data += `);out ;>;out skel qt;`;

      $.ajax({
        url: CONFIG.OVERPASS,
        data: data,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data) {
          if (data.elements.length < 1) {
            console.log("no features found");
            return;
          }
          data = osmtogeojson(data);
        },
        error: function (e) {
          console.log("error: " + JSON.stringify(e));
        }
      });
    };*/

    return OSM3D;
});
