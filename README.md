# 2017 GSoC project "3D OSM Plugin API"

The goal of this project is to create a plugin API to display OpenStreetMap (OSM) data on <a href="https://github.com/NASAWorldWind/WebWorldWind">NASA Web WorldWind</a> virtual globe in three dimensions. The API fetches the OSM data in real time based on a bounding box, or uses a local file or the data itself in GeoJSON format. The project focuses on the performance of the visualization of 3D OSM buildings, and for this purpose creates triangle meshes based on the footprint available in OSM database. Height to the buildings can be assigned using the OSM database, a property in a GeoJSON file or an arbitrary value. The API can also create a heatmap based on the heights of the buildings. The API also offers caching and sectorizing (tiling) to improve the performance.

More can be found at <a href="http://osm.eoapps.eu/">http://osm.eoapps.eu/</a>.

<b>Milan buildings in 3D, where the height of the buildings is extracted from Lidar using GRASS. A local file is used.</b>
![milan](examples/screenshots/milan.png)

<b>New York buildings in 3D, where the height information is coming from OSM. The data is fetched in real time.</b>
![newYork](examples/screenshots/newYork_2.png)

## Installation instructions for Ubuntu 16.04:

sudo apt-get install apache2

cd /var/www/html/

sudo apt-get install git

sudo git clone https://github.com/kilsedar/3dosm.git

Visit http://localhost/3dosm/examples/NASAEuropaChallenge

<b>NOTE:</b> switching between examples requires to edit the require.conf.js file.

### To run the unit tests follow the following steps:

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

sudo apt-get install nodejs

sudo npm install -g karma-cli

karma start

### To install JSDoc run the following:

npm install -g jsdoc
