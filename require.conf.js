requirejs.config({
  baseUrl: '../',
  paths: {
    'osmtogeojson': 'libraries/osmtogeojson-3.0.0',
    'jquery': 'libraries/jquery-3.2.1.min',
    'earcut': 'libraries/earcut-2.1.1.min',
    'geojson-vt': 'libraries/geojson-vt-master/geojson-vt'
  }
});

requirejs(['example/main']);
