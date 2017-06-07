requirejs.config({
  baseUrl: '../',
  paths: {
    'osmtogeojson': 'libraries/osmtogeojson-3.0.0',
    'jquery': 'libraries/jquery-3.2.1.min'
  }
});

requirejs(['example/index']);
