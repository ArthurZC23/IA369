# Walking safe

Walking safe is a interactive visualization tool to help tourist to navigate safely in new cities. It uses open criminal data to inform tourists which locations may be dangerous zones.

## Overview

Do after finish the app

## [Webapp: Change the URL](https://rpubs.com/alelopes/sf_crime_4tourists)

## Technologies used

v1.0.0 is a client side webapp made with javascript. We used the following libraries in the app:

* Google maps API
* D3
* More

## Data

Currently the app has crime data for three cities: [San Francisco]() (CA, US), [São Paulo]() (SP, BR) and [Campinas]() (SP, BR). The data was preprocessed to select only crimes relevants for tourists (e.g. assault is a crime relevant to tourists, while domestic violence is not). The final data is a list of JSON objects with the following fields:

* Category: type of crime
* lat: latitude of the crime occurrence
* lng: longitude of the crime occurrence
* Severity: severity of the crime

The JSON files are stores as blobs at [JSON Blob](https://jsonblob.com/). In case of very big json files, the site can stop responding if simply copy and paste the json directly in their text editor. Therefore, we provided a [Python script]() which takes a JSON blob as inputs and split it in smaller pieces.

## How to add new data



## Lessons learned

## Future improvements

## Inspiration

Walking safe is a capstone project for the discipline IA369, based on Alexandre Lopes following [R notebook](https://rpubs.com/alelopes/sf_crime_4tourists).

## Authors

* Alexandre Lopes RA: 115968
* Arthur Zanatta da Costa RA: 116194
* Fabio Perez RA: 105967

