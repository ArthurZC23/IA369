# Walking safe

Walking safe is a interactive visualization tool to help tourist to navigate safely in new cities. It uses open criminal data to inform tourists which locations may be dangerous zones.

## Overview

Do after finish the app

## [Webapp]()

## Technologies used

v1.0.0 is a client side webapp made with javascript. We used the following libraries in the app:

* Google maps API
* D3
* **More**

## Data

Currently the app has crime data for three cities: [San Francisco](https://data.sfgov.org/Public-Safety/Police-Department-Incidents-Previous-Year-2016-/ritf-b9ki) (CA, US), [São Paulo](http://www.ssp.sp.gov.br/transparenciassp/Consulta.aspx) (SP, BR) and [Campinas](http://www.ssp.sp.gov.br/transparenciassp/Consulta.aspx) (SP, BR). The data was preprocessed to select only crimes relevants for tourists (e.g. assault is a crime relevant to tourists, while domestic violence is not). The final data is a list of JSON objects with the following fields:

* Category: type of crime
* lat: latitude of the crime occurrence
* lng: longitude of the crime occurrence
* Severity: severity of the crime

The JSON files are stores as blobs at [JSON Blob](https://jsonblob.com/). In case of very big json files, the site can stop responding if simply copy and paste the json directly in their text editor. Therefore, we provided a [Python script]() which takes a JSON blob as inputs and split it in smaller pieces.

## How to add new data

In case you want to add new data to this project, the procedure is very simple:

1. Get some crime data about a city. The data must have the following fields: type of crime, latitude and longitude.
2. Pre-process the data to select only the types of crimes you think are relevant to tourists
3. Add the severity of each type of crime
4. Save the data as a JSON object
5. Split the JSON into smaller blobs, case need it
6. Upload the JSON blobs at [JSON Blob](https://jsonblob.com/)
7. Update crimeUrl with the JSON blobs URLs

## Lessons learned



## Future improvements



## Inspiration

Walking safe is a capstone project for the discipline IA369, based on Alexandre Lopes following [R notebook](https://rpubs.com/alelopes/sf_crime_4tourists).

## Authors

* Alexandre Lopes RA: 115968
* Arthur Zanatta da Costa RA: 116194
* Fabio Perez RA: 105967

