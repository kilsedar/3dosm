module.exports = function (grunt) {
  grunt.initConfig({
    requirejs: {
      compile: {
        options: {
          preserveLicenseComments: false,
          baseUrl: '',
          paths: {
            'jquery': 'libraries/jquery-3.2.1.min',
            'osmtogeojson': 'libraries/osmtogeojson-3.0.0',
            'earcut': 'libraries/earcut-2.1.1.min',
            'colorpicker': 'examples/NASAEuropaChallenge/libraries/bootstrap-colorpicker/js/bootstrap-colorpicker.min',
            'bootstrap': 'examples/NASAEuropaChallenge/libraries/bootstrap-3.3.7-dist/js/bootstrap.min'
          },
          name: 'tools/almond',
          include: ['examples/NASAEuropaChallenge/main'],
          out: 'examples/NASAEuropaChallenge/main.min.js',
          insertRequire: ['examples/NASAEuropaChallenge/main']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.registerTask('default', ['requirejs']);
};
