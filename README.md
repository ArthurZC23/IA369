# Walking safe

Walking safe is a interactive visualization tool to help tourists to navigate safely in new cities. It uses open criminal data to inform tourists which locations may be dangerous zones.

## Motivation

When planning trips to new places, tourists don't have the habit of looking for possible risks in the region. As a result, they can end up in dangerous places and become crime victims. To avoid this scenario we created Walking Safe, a web visualization tool with the task of helping tourists to navigate safely.

## Proposal

Our proposal is a webapp which display criminal data in a friendly and intuitive manner in a map. We took crime-related open data, parsed tourist relevant crimes and made available to the public. The webapp has a simple interface for helping toursist to have an overview of the crimes in the city or to zoom and get details about a specific region.

## Functionalities

Walking safe possess the following functionalities:

* A dropdown menu to select the desired city
* A click event on the map, which adds a marker and a safety circle with 1km radius around it. From the color of the safety circle, the user can have an idea of the level of danger around that marker address.
* Two filter buttons to display heatmaps with low severty crimes, high severity crimes or both
* A cluster button to display crime clusters. Clicking on the cluster shows additional information about it
* A display info button, which opens a tab where the top 5 crimes in the city/safety radius region are shown in a bar chart. Moreover the chart shows the date of the dataset as subtitle and has a link to the page of the original dataset in the credits. Finally, right below the chart there is a photo slideshow showing google pictures of the streets inside the safety radius
* User can choose from different map styles

## Wepapp

Check it out the webapp for yourself right [here](https://arthurzc23.github.io/IA369/webpage/)

## Development stages

1. Merge the functionalities of the three T3 assignements of IA369 made by the authors. The functionalities were the safety circle, the heatmap and the filter buttons.
2. Add more cities to the project (São Paulo and Campinas).
3. Store crimes in [json blobs](https://jsonblob.com/).
4. Style google maps.
5. Add information section, with more detailed statistics about the crime in the city and its streets.
6. Add a photo slideshow with images of the streets inside the safety circle.
7. Add cluster button, which display from 1 to 10 cluster criminal points.

## Datasets

Currently the app has crime data for three cities: [San Francisco](https://data.sfgov.org/Public-Safety/Police-Department-Incidents-Previous-Year-2016-/ritf-b9ki) (CA, US), [São Paulo](http://www.ssp.sp.gov.br/transparenciassp/Consulta.aspx) (SP, BR) and [Campinas](http://www.ssp.sp.gov.br/transparenciassp/Consulta.aspx) (SP, BR). The data was preprocessed to select only crimes that are relevant to tourists (e.g. assault is a crime relevant to tourists, while domestic violence is not). Furthermore, since all the project was written in English, the Brazilian crimes were translated to English. Also, Campinas and São Paulo datasets did not include latitude and longitude, so Google Maps Geocoding API was used to get these informations from the available address of the crime.
The final data is a list of JSON objects with the following fields:

* Category: type of crime
* lat: latitude of the crime occurrence
* lng: longitude of the crime occurrence
* Severity: severity of the crime (This is a binary attribute, which can be "LOW" or "HIGH")

Severity was classified in the following way: If the crime type involves person-to-person interaction with force, intimidation, and/or coercion, than it is a High Severy Crime. If it does not involves person-to-person interection, it is a Low Severity Crime.

The JSON files are stores as blobs at [JSON Blob](https://jsonblob.com/). In case of very big JSON files, the site can stop responding if simply copy and paste the JSON directly in their text editor. Therefore, we provided a [Python script](https://github.com/ArthurZC23/IA369/blob/master/utils/blobs.py) which takes a JSON blob as inputs and split it in smaller pieces.

## Working with Google Maps API

For economical and safety reasons, we are not going to share this project with our own Google API Key. It will be available until July 25th,2017. After this, you need to:

1. Visit your [APIs Console Website](https://code.google.com/apis/console) 
2. Click in 'Products and Services' on the top left.
3. Click on 'API Manager'.
4. Activate 'Google Street View Image API', 'Google Places API Web Service' and 'Google Maps JavaScript API'.
5. Click in 'Credentials' in the left side menu.
6. Generate a new Credential and copy your Google API Key.
7. Change HTML code line 49 to insert your key like the following:

```html
src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE&libraries=visualization,places&callback=myMap">

```

## How to add new data

In case you want to add new data to this project, the procedure is very simple:

1. Get some crime data about a city. The data must have the following fields: type of crime, latitude and longitude.
2. Pre-process the data to select only the types of crimes you think are relevant to tourists
3. Add the severity of each type of crime
4. Save crime data as a JSON 
5. Create crime clusters JSON using the crime data JSON and the [cluster script](https://github.com/ArthurZC23/IA369/blob/master/utils/clusters.py) available at this repo
6. Split the crime data JSON into smaller blobs with [blobs script](https://github.com/ArthurZC23/IA369/blob/master/utils/blobs.py), case need it
7. Upload the JSON blobs at [JSON Blob](https://jsonblob.com/) for the crime data and for the clusters
8. Update crimeUrl with the JSON blobs URLs of the crime data
9. Update crimeClusters with the JSON blob URL of the new clusters
10. Update crimeDataSource with the original source of the criminal data

## Technologies used

The project was developed using:

* R
* Python
* HTML/CSS/Javascript
* Google maps API
* D3 - deprecated in the final version
* Highcharts
* JSON blobs
* Bootstrap
* JQuery

## Lessons learned

At the end of every project it's important to look back and reflect on the most important lessons learned. In this particular example, we learned:

* It is easy to use a D3 template for visualization. But it can be more challenging to alter some parts of the chart without introducing bugs or visual glitches.
* Highcharts provides a more friendly interface to build visualization. You can start from a template and tweak as you like in minutes, because of its friendly interface
* JSON blobs is an excellent way of storing your data to test your client, without needing a backend or storing the data at the client
* Google maps API provide several functionalities which are worth to take a look. In our project we used heatmaps, style maps, colored circles, personalized markers, animations and information windows. There are a lot of other useful and fun functionalities. We encourage people to take a look at the [development page] https://developers.google.com/maps/
* The quality of Walking safe is a direct consequence of the quality of the data. We can see a large difference between the quality of the data for San Francisco (the better dataset) and Campinas (the worst dataset).
* Google Maps Geocoding API can give you a non expected pair of latitude and longitude because there are similar addresses names in different cities. Pay attention to filter your data after getting the latitude and longitude or you may add wrong data to your map. It is easy to identify wrong points if you activate the heatmap and start to zoom out the map.

## Future improvements

The first major improvement that the tool need is **more quality criminal datasets**. Other important improvements are:

* Optimize the javascript code.
* Migrate the criminal data from blobs to a proper backend.
* Add time based filter (select crimes based on months or years).
* Build a mobile version.
* Put GPS integration into the mobile version, to warn the user when he is near a very dangerous place.
* Let users input crime data (debatable).

## Inspiration

Walking safe is a capstone project for the discipline IA369, based on Alexandre Lopes following [R notebook](https://rpubs.com/alelopes/sf_crime_4tourists).

## License

See the [LICENSE](https://github.com/ArthurZC23/IA369/blob/master/LICENSE) file for license rights and limitations (MIT).


## Authors

* Alexandre Lopes RA: 115968
* Arthur Zanatta da Costa RA: 116194
* Fábio Perez RA: 105967

