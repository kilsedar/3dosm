requirejs.config({
  baseUrl: '../../',
  paths: {
    'osmtogeojson': 'libraries/osmtogeojson-3.0.0',
    'jquery': 'libraries/jquery-3.2.1.min',
    'earcut': 'libraries/earcut-2.1.1.min',
    'colorpicker': 'examples/NASAEuropaChallenge/libraries/bootstrap-colorpicker/js/bootstrap-colorpicker.min',
    'bootstrap': 'examples/NASAEuropaChallenge/libraries/bootstrap-3.3.7-dist/js/bootstrap.min'
  }
});

requirejs(['examples/NASAEuropaChallenge/main.min']);
