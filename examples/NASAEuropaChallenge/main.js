function resize(){
  $("#searchBox").css("top", "0px");

  if($("#menu").css("left") == "0px")
    $("#menuToLeft").css("left",($("#menu").width()+10));
  else {
    $("#menu").css("left", -($("#menu").width()+10));
    $("#menuToLeft").css("left", "-40px");
  }

  if ($(window).width() < 810) {
    $("#searchBox").css("left", "0px");
    $("#searchBox").css("right", "auto");
    $("#menu").css("top", "40px");
    $("#menu").css("max-height", $(window).height()-120);
    $("#menuToLeft, #menuToRight").css("top", "50px");
  }
  else {
    $("#searchBox").css("right", "0px");
    $("#searchBox").css("left", "auto");
    $("#menu").css("top", "0px");
    $("#menu").css("max-height", $(window).height()-80);
    $("#menuToLeft, #menuToRight").css("top", "10px");
  }
}

define(['libraries/WebWorldWind/src/WorldWind',
        'libraries/WebWorldWind/src/gesture/ClickRecognizer',
        'libraries/WebWorldWind/src/gesture/TapRecognizer',
        'libraries/WebWorldWind/src/shapes/SurfacePolygon',
        'libraries/WebWorldWind/examples/LayerManager',
        'src/OSMLayer',
        'src/OSMBuildingLayer',
        'src/OSMTBuildingLayer',
        'jquery',
        'colorpicker'],
       function (WorldWind, ClickRecognizer, TapRecognizer, SurfacePolygon, LayerManager, OSMLayer, OSMBuildingLayer, OSMTBuildingLayer, $, colorpicker) {
  "use strict";

  WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_ERROR);
  WorldWind.configuration.baseUrl = "../../libraries/WebWorldWind/";

  /** Create the WorldWindow. **/
  var worldWindow = new WorldWind.WorldWindow("canvas");

  /** Add imagery layers. **/
  worldWindow.addLayer(new WorldWind.BMNGOneImageLayer());
  worldWindow.addLayer(new WorldWind.BingAerialLayer());
  // var bingAerialWithLabels = new WorldWind.BingAerialWithLabelsLayer();
  // bingAerialWithLabels.detailControl = 1;
  // worldWindow.addLayer(bingAerialWithLabels);
  worldWindow.addLayer(new WorldWind.CoordinatesDisplayLayer(worldWindow));
  worldWindow.addLayer(new WorldWind.ViewControlsLayer(worldWindow));
  /* var starFieldLayer = new WorldWind.StarFieldLayer();
  starFieldLayer.time = new Date();
  worldWindow.addLayer(starFieldLayer); */
  /* var atmosphereLayer = new WorldWind.AtmosphereLayer();
  atmosphereLayer.lightLocation = WorldWind.SunPosition.getAsGeographicLocation(starFieldLayer.time);
  worldWindow.addLayer(atmosphereLayer); */

  var layerManger = new LayerManager(worldWindow);

  /** Used in the case bounding box is set clicking twice on the globe.  **/
  var position, clickCoordinates = {latitude: [], longitude: []}, boundingBoxLayer = new WorldWind.RenderableLayer();
  worldWindow.addLayer(boundingBoxLayer);

  /** Used in the case a file is uploaded. **/
  var data = {}, dataSize = 0;

  var source = {}, boundingBox = [];

  var configurationOSMTagged = {
    imageSource: "images/marker_36x49.png", // for Point or MultiPoint - PlacemarkAttributes & ShapeAttributes
    outlineWidth: 2.0 // ShapeAttributes
  };
  var OSMTagged = new OSMLayer(configurationOSMTagged, {});

  var configurationOSMBuildings = {
    interiorColor: new WorldWind.Color(1.0, 1.0, 1.0, 1.0),
    applyLighting: true,
    extrude: false,
    altitude: {},
    altitudeMode: WorldWind.RELATIVE_TO_GROUND,
    heatmap: {}
  };
  var OSMBuildings = new OSMBuildingLayer(configurationOSMBuildings, {});

  function handleClick (recognizer) {
    var x = recognizer.clientX, y = recognizer.clientY;
    var pickList = worldWindow.pick(worldWindow.canvasCoordinates(x, y));
    if (pickList.objects.length == 1 && pickList.objects[0].isTerrain) {
      var position = pickList.objects[0].position;

      if (($("#OSMTagTypeContent").is(":visible") && $("#inputCheckboxByBoundingBox").prop("checked")) || ($("#OSMBuildingsContent").is(":visible") && $('#inputRadioByBoundingBox').prop("checked"))) {

        clickCoordinates.latitude.push(position.latitude);
        clickCoordinates.longitude.push(position.longitude);
        // console.log(clickCoordinates);

        if (clickCoordinates.latitude.length == 2 && clickCoordinates.longitude.length == 2) {

          boundingBoxLayer.removeAllRenderables();

          var latMin = Math.min(clickCoordinates.latitude[0], clickCoordinates.latitude[1]);
          var latMax = Math.max(clickCoordinates.latitude[0], clickCoordinates.latitude[1]);
          var longMin = Math.min(clickCoordinates.longitude[0], clickCoordinates.longitude[1]);
          var longMax = Math.max(clickCoordinates.longitude[0], clickCoordinates.longitude[1]);

          // console.log(latMin + ", " + latMax + ", " + longMin + ", " + longMax);

          var boundingBoxOfShape = [new WorldWind.Location(latMin, longMin), new WorldWind.Location(latMax, longMin), new WorldWind.Location(latMax, longMax), new WorldWind.Location(latMin, longMax)];

          var attributes = new WorldWind.ShapeAttributes(null);
          attributes.outlineColor = WorldWind.Color.WHITE;
          attributes.outlineWidth = 2.0;
          attributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.1);

          var boundingBoxShape = new WorldWind.SurfacePolygon(boundingBoxOfShape, attributes);

          boundingBoxLayer.addRenderable(boundingBoxShape);


          source = {type: "boundingBox", coordinates: [longMin, latMin, longMax, latMax]};
          boundingBox = [longMin, latMin, longMax, latMax];


          clickCoordinates = {latitude: [], longitude: []};
          // console.log(clickCoordinates);
        }
      }
    }
  }

  var clickRecognizer = new WorldWind.ClickRecognizer(worldWindow, handleClick);
  var tapRecognizer = new WorldWind.TapRecognizer(worldWindow, handleClick);

  $(function(){
    resize();

    $("#menuToLeft").click(function() {
      $("#menu").animate({left: -($("#menu").width()+10)}, 400);
      $("#menuToLeft").animate({left: "-40px"}, 400);
      $("#menuToRight").animate({left: "0px"}, 400);
    });

    $("#menuToRight").click(function() {
      $("#menu").animate({left: "0px"}, 400);
      $("#menuToLeft").animate({left: ($("#menu").width()+10)}, 400);
      $("#menuToRight").animate({left: "-40px"}, 400);
    });

    $("#OSMTagTypeTitle").click(function() {
      $("#OSMTagTypeContent").show();
      $("#OSMTagTypeTitle").css("background-color", "rgba(80, 83, 147, 1.0)");
      $("#OSMTagTypeTitle").removeClass('hover');
      $("#OSMBuildingsContent").hide();
      $("#OSMBuildingsTitle").css("background-color", "rgba(80, 83, 147, 0.3)");
      $("#OSMBuildingsTitle").addClass('hover');
    });

    $("#OSMBuildingsTitle").click(function() {
      $("#OSMBuildingsContent").show();
      $("#OSMBuildingsTitle").css("background-color", "rgba(80, 83, 147, 1.0)");
      $("#OSMBuildingsTitle").removeClass('hover');
      $("#OSMTagTypeContent").hide();
      $("#OSMTagTypeTitle").css("background-color", "rgba(80, 83, 147, 0.3)");
      $("#OSMTagTypeTitle").addClass('hover');
    });

    $("#colorpickerTagType").colorpicker({format: 'rgba'});
    $("#colorpickerBuildings").colorpicker({format: 'rgba'});

    $("#inputCheckboxExtrusion").change(function() {
      if($(this).prop("checked")) {
        $("#extrusionSettings input[type='radio']").prop("disabled", false);
        $("#inputCheckboxHeatmap").prop("disabled", false);
      }
      else {
        $("#extrusionSettings *").prop("disabled", true);
        $("#heatmap *").prop("disabled", true);
      }
    });

    $("#extrusionSettings input[type='radio']").change(function() {
      if($("#inputRadioAltitudeNumber").prop("checked")) {
        $("#inputTextAltitudeNumber").prop("disabled", false);
        $("#inputTextAltitudeProperty").prop("disabled", true);
      }
      else if($("#inputRadioAltitudeProperty").prop("checked")) {
        $("#inputTextAltitudeNumber").prop("disabled", true);
        $("#inputTextAltitudeProperty").prop("disabled", false);
      }
      else if($("#inputRadioAltitudeOSM").prop("checked")) {
        $("#inputTextAltitudeNumber").prop("disabled", true);
        $("#inputTextAltitudeProperty").prop("disabled", true);
      }
    });

    $("#inputCheckboxHeatmap").change(function() {
      if($(this).prop("checked"))
        $("#inputTextHeatmapThresholds").prop("disabled", false);
      else
        $("#inputTextHeatmapThresholds").prop("disabled", true);
    });

    $("#dataSourceOSMBuildings input[type='radio']").change(function() {
      if($("#inputRadioByBoundingBox").prop("checked"))
        $("#inputFile").prop("disabled", true);
      else
        $("#inputFile").prop("disabled", false);
    });

    $("#inputFile").change(function(event) {

      $(".ldsEclipse").css("display", "block");

      var reader = new FileReader();

      reader.onload = function(event) {
        data = event.target.result;

        source = {type: "GeoJSONData", data: JSON.parse(data)};
        boundingBox = OSMBuildings.calculateBoundingBox(JSON.parse(data));

        $(".ldsEclipse").css("display", "none");

        $("#inputFile").val('');

        if (!isJSON(data)){
          alert ("Data type should be JSON.");
          return;
        }
      };
      reader.readAsText(event.target.files[0]);
      dataSize = event.target.files[0].size;
    });

    $("#buttonGoOSMTagType").click(function() {
      if ($.isEmptyObject(source)) {
        alert ("Please specify the source of the layer.");
        return;
      }

      boundingBoxLayer.removeAllRenderables();
      $("#inputCheckboxByBoundingBox").prop("checked", false);

      OSMTagged.source = source;
      source = {};
      OSMTagged.boundingBox = boundingBox;
      boundingBox = [];

      /** color settings **/
      var rgba = $("#colorpickerTagType").colorpicker("getValue");
      rgba = rgba.substring(5, rgba.length-1).split(",");
      configurationOSMTagged.imageColor = new WorldWind.Color(parseFloat((rgba[0]/255).toFixed(3)), parseFloat((rgba[1]/255).toFixed(3)), parseFloat((rgba[2]/255).toFixed(3)), rgba[3]); // for Point or MultiPoint - PlacemarkAttributes
      configurationOSMTagged.interiorColor = new WorldWind.Color(parseFloat((rgba[0]/255).toFixed(3)), parseFloat((rgba[1]/255).toFixed(3)), parseFloat((rgba[2]/255).toFixed(3)), rgba[3]); // ShapeAttributes
      configurationOSMTagged.outlineColor = new WorldWind.Color(parseFloat((rgba[0]/255).toFixed(3)), parseFloat((rgba[1]/255).toFixed(3)), parseFloat((rgba[2]/255).toFixed(3)), rgba[3]); // ShapeAttributes

      /** tag settings **/
      if ($('#inputTextOSMTag').val() != "")
        OSMTagged.tag = $('#inputTextOSMTag').val();
      else
        alert("Please set the tag.");

      /** type settings **/
      OSMTagged.type = [];
      if ($('#inputCheckboxOSMTypeNode').prop("checked"))
        OSMTagged.type.push($('#inputCheckboxOSMTypeNode').val());
      if ($('#inputCheckboxOSMTypeWay').prop("checked"))
        OSMTagged.type.push($('#inputCheckboxOSMTypeWay').val());
      if ($('#inputCheckboxOSMTypeRelation').prop("checked"))
        OSMTagged.type.push($('#inputCheckboxOSMTypeRelation').val());

      $.when(OSMTagged.load()).then(function() {
        if (OSMTagged.dataSize > 10000000) {
          alert ("The area you drew is too big (contains data larger than 10 MB), please choose a smaller area.");
          return;
        }
        else {
          OSMTagged.add(worldWindow);
          // OSMTagged.zoom();
        }
      });
    });

    $("#buttonGoOSMBuildings").click(function() {
      if ($.isEmptyObject(source)) {
        alert ("Please specify the source of the layer.");
        return;
      }

      boundingBoxLayer.removeAllRenderables();
      $("#inputRadioByBoundingBox, #inputRadioByGeoJSONData").prop("checked", false);

      OSMBuildings.source = source;
      source = {};
      OSMBuildings.boundingBox = boundingBox;
      boundingBox = [];
      OSMBuildings.dataSize = 0;
      if (OSMBuildings.source.type == "GeoJSONData") {
        OSMBuildings.dataSize = dataSize;
        dataSize = 0;
      }

      /** color settings **/
      var rgba = $("#colorpickerBuildings").colorpicker("getValue");
      rgba = rgba.substring(5, rgba.length-1).split(",");
      configurationOSMBuildings.interiorColor = new WorldWind.Color(parseFloat((rgba[0]/255).toFixed(3)), parseFloat((rgba[1]/255).toFixed(3)), parseFloat((rgba[2]/255).toFixed(3)), rgba[3]);

      /** extrusion settings **/
      if ($('#inputCheckboxExtrusion').prop("checked")) {
        configurationOSMBuildings.extrude = true;
        if($("#inputRadioAltitudeNumber").prop("checked")) {
          configurationOSMBuildings.altitude.type = "number";
           if ($('#inputTextAltitudeNumber').val())
             configurationOSMBuildings.altitude.value = $('#inputTextAltitudeNumber').val();
        }
        else if ($("#inputRadioAltitudeOSM").prop("checked")) {
          configurationOSMBuildings.altitude.type = "osm";
        }
        else if ($("#inputRadioAltitudeProperty").prop("checked")) {
          configurationOSMBuildings.altitude.type = "property";
          if ($('#inputTextAltitudeProperty').val())
            configurationOSMBuildings.altitude.value = $('#inputTextAltitudeProperty').val();
        }
      }

      /** heatmap settings **/
      if ($('#inputCheckboxHeatmap').prop("checked")) {
        configurationOSMBuildings.heatmap.enabled = true;
        if ($('#inputTextHeatmapThresholds').val()) {
          var thresholds = $('#inputTextHeatmapThresholds').val().split(",");
          for (var indexThresholds = 0; indexThresholds < thresholds.length; indexThresholds++) {
            thresholds[indexThresholds] = parseInt(thresholds[indexThresholds]);
          }
          thresholds.sort(sortNumber);
          configurationOSMBuildings.heatmap.thresholds = thresholds;
        }
      }

      $.when(OSMBuildings.load()).then(function() {
        // console.log(OSMBuildings.dataSize);
        // if data is bigger that 10MB
        if (OSMBuildings.dataSize > 10000000) {
          if (OSMBuildings.source.type == "GeoJSONData")
            alert ("Your file is bigger than 10MB, please upload a smaller file.");
          else if (OSMBuildings.source.type == "boundingBox")
            alert ("The area you drew is too big (contains data larger than 10 MB), please choose a smaller area.");
          return;
        }
        else {
          OSMBuildings.add(worldWindow);
          if (OSMBuildings.source.type == "GeoJSONData")
            OSMBuildings.zoom();
        }
      });
    });
  });
});
