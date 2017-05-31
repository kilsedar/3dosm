requirejs.config({
  baseUrl: '../',
  paths: {
    'osmtogeojson': 'libraries/osmtogeojson',
    'jquery': 'libraries/jquery-3.2.1.min'
  }
});

requirejs(['example/index']);
