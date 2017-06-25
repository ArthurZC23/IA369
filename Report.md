# Walking safe

Walking safe is a interactive visualization tool to help tourist to navigate safely in new cities. It uses open criminal data to inform tourists which locations may be dangerous zones.

## Motivation

When planning trips to new places, tourists don't have the habit of looking for possible risks in the region. As a result, tourists can end up in dangerous places and become crime victims. To avoid this scenario we created Walking Safe, a web visualization tool with the task of helping tourists to navigate safely.

## Proposal

Our proposal is a webapp which display criminal data in a friendly and intuitive manner in a map. We took criminal data available in public repositories, parsed tourist relevant crimes and made available to the public. The webapp has a simple interface for helping toursist to have an overview of the crimes in the city or to zoom and get details about a specific region.

## Development stages

1. Merge the functionalities of the three T3 assignements of IA369 made by the authors. The functionalities were the safety circle, the heatmap and the filter buttons
2. Add more cities to the project (São Paulo and Campinas)
3. Store crimes in [json blobs](https://jsonblob.com/)
4. Style google maps
5. Add information section which more detailed statistics about the crime in the city and its streets
6. Add photo slideshow with images of the local region inside the safety circle.
7. Add cluster button, which display from 1 to 10 cluster criminal points.

## Datasets

Currently the app has crime data for three cities: [San Francisco](https://data.sfgov.org/Public-Safety/Police-Department-Incidents-Previous-Year-2016-/ritf-b9ki) (CA, US), [São Paulo](http://www.ssp.sp.gov.br/transparenciassp/Consulta.aspx) (SP, BR) and [Campinas](http://www.ssp.sp.gov.br/transparenciassp/Consulta.aspx) (SP, BR). The data was preprocessed to select only crimes relevants for tourists (e.g. assault is a crime relevant to tourists, while domestic violence is not). Furthermore, since all the project was written in english, the brazilian crimes were translated to english.
The final data is a list of JSON objects with the following fields:

* Category: type of crime
* lat: latitude of the crime occurrence
* lng: longitude of the crime occurrence
* Severity: severity of the crime (This is a binary attribute, which can be "LOW" or "HIGH")

The JSON files are stores as blobs at [JSON Blob](https://jsonblob.com/). In case of very big json files, the site can stop responding if simply copy and paste the json directly in their text editor. Therefore, we provided a [Python script](https://github.com/ArthurZC23/IA369/blob/master/utils/blobs.py) which takes a JSON blob as inputs and split it in smaller pieces.

## Technologies used

The project was developed using:

* R
* Python
* HTML/CSS/Javascript
* Google maps API
* D3 - deprecated in the final version
* Highcharts
* JSON blobs
* **More**

## Lessons learned

At the end of every project is important to look back and reflect on the most important lessons learned. In this particular example, we learned:

* It is easy to use a D3 template for visualization. But it can be more challenging to alter some parts of the chart without introducing bugs or visual glitches.
* Highcharts provides a more friendly interface to build visualization. You can start from a template and tweak as you like in minutes, because of its friendly interface
* JSON blobs is an excellent way of storing your data, without needing a backend or storing the data at the client
* Google maps API provide several functionalities which are worth to take a look. In our project we used heatmaps, style maps, colored circles, personalized markers, animations and information windows. There are a lot of other useful and fun functionalities. We encourage taking a look at the [development page] https://developers.google.com/maps/
* This quality of this project is a direct consequence of the quality of the data. We can see a large difference between the quality of the data for San Francisco (the better dataset) and Campinas (the worst dataset).

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
4. Save the data as a JSON object
5. Split the JSON into smaller blobs, case need it
6. Upload the JSON blobs at [JSON Blob](https://jsonblob.com/)
7. Update crimeUrl with the JSON blobs URLs





## Future improvements



## Inspiration

Walking safe is a capstone project for the discipline IA369, based on Alexandre Lopes following [R notebook](https://rpubs.com/alelopes/sf_crime_4tourists).

## Authors

* Alexandre Lopes RA: 115968
* Arthur Zanatta da Costa RA: 116194
* Fabio Perez RA: 105967

