# 2017 GSoC project "3D OSM Plugin API"

The goal of this project is to create a plugin API to display OpenStreetMap (OSM) data on NASA Web World Wind virtual globe in three dimensions. The OSM data is going to be fetched in real time based on a bounding box or a URL for OSM data and some keywords. The adapter will offer a function to extrude the polygons present in the fetched data using an arbitrary height value. Additionally the project may extract the real heights of buildings using DSM data and apply these heights to extrusion, improve performance via various caching techniques, and tile the data. In case the tiling will be implemented, a new adapter may be created to tile any GeoJSON data.


## Installation instructions for Ubuntu 16.04:

sudo apt-get install apache2

sudo apt-get install git

cd /var/www/html/3dosm

sudo git clone https://github.com/kilsedar/3dosm.git

Visit http://localhost/3dosm/example

### To run the unit tests follow the following steps:

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

sudo apt-get install nodejs

sudo npm install

sudo npm install -g karma-cli

karma start
