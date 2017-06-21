var map, heatmap, marker;
var sv;
var safetyCircle;
var gradient = [
  'rgba(216, 229, 0, 0)',
  'rgba(246, 255, 92, 1)',
  'rgba(214, 211, 2, 1)',
  'rgba(212, 193, 5, 1)',
  'rgba(210, 176, 8,1)',
  'rgba(208, 158, 11, 1)',
  'rgba(206, 140, 13, 1)',
  'rgba(204, 123, 16, 1)',
  'rgba(202, 105, 19, 1)',
  'rgba(200, 88, 22, 1)',
  'rgba(200, 88, 22, 1)',
  'rgba(196, 52, 27, 1)',
  'rgba(194, 35, 30, 1)',
  'rgba(192, 17, 33, 1)',
  'rgba(191, 0, 36, 1)'
];
var city = "sanfrancisco";
var cities = {
  "ChIJIQBpAG2ahYAR_6128GcTUEo": "sanfrancisco",
  "ChIJJWNL5x3GyJQRKsJ4IWo65Rc": "campinas",
  "ChIJ0WGkg4FEzpQRrlsz_whLqZs": "saopaulo"}
var citiesGeo = {
  "sanfrancisco": {
    "lat": 37.773972,
    "lng": -122.431297
  },
  "saopaulo": {
    "lat": -23.533773,
    "lng": -46.625290
  },
  "campinas": {
    "lat": -22.907104,
    "lng": -47.063240
  }
};
var crimeUrl = {
  "sanfrancisco": [
    "https://jsonblob.com/api/jsonBlob/66d8d627-550a-11e7-ae4c-e174547a89e4",
    "https://jsonblob.com/api/jsonBlob/dea839ea-550a-11e7-ae4c-63f44d622f58",
    "https://jsonblob.com/api/jsonBlob/47776e8e-550b-11e7-ae4c-13be840abada",
    "https://jsonblob.com/api/jsonBlob/6a12fdb5-550b-11e7-ae4c-a5f33aecc534",
    "https://jsonblob.com/api/jsonBlob/9153f8f8-550b-11e7-ae4c-af74e56a1d3b",
    "https://jsonblob.com/api/jsonBlob/b38d90e8-550b-11e7-ae4c-7d5c835b9d56",
    "https://jsonblob.com/api/jsonBlob/e05d46e1-550b-11e7-ae4c-ef7ea6b6fe4d",
    "https://jsonblob.com/api/jsonBlob/00189953-550c-11e7-ae4c-0b90d5caeebc",
    "https://jsonblob.com/api/jsonBlob/26d37497-550c-11e7-ae4c-870706833c4d",
    "https://jsonblob.com/api/jsonBlob/fc244613-5511-11e7-ae4c-6737be268115"],
  "campinas": ["https://jsonblob.com/api/jsonBlob/8a352e6b-5513-11e7-ae4c-17f6ef9604ff"],
  "saopaulo": [
    "https://jsonblob.com/api/jsonBlob/44743cbe-5512-11e7-ae4c-752b582c7720",
    "https://jsonblob.com/api/jsonBlob/78c777ce-5512-11e7-ae4c-cd2ab1866695"]
};
var crimeData;
var crimeLocations;
var crimeType;
var relevantCrimesIdx;
var relevantCrimes;

$(document).ready(function() {
  $('#photos').slick({
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 2000
  });
});

function displayInfo(){
  var details = document.getElementById('details');
  if(details.style.width != "0px"){
    document.getElementById('map').style.width = "100%";
    document.getElementById('details').style.width = "0px";
  }
  else{
    document.getElementById('map').style.width = "55%";
    document.getElementById('details').style.width = "45%"
  }
    google.maps.event.trigger(map, "resize");
}

function myMap() {
// Create a new StyledMapType object, passing it an array of styles,
// and the name to be displayed on the map type control.
  sv = new google.maps.StreetViewService();

  var oldStyledMapType = new google.maps.StyledMapType(
          oldMapStyle,
          {name: 'Old Map'});

  var nightStyledMapType = new google.maps.StyledMapType(
          nightMapStyle,
          {name: 'Night Map'});

  //Default initialization with San Francisco
  var latLng = new google.maps.LatLng(citiesGeo[city]);
  var mapOptions = {
    center: latLng,
    zoom: 13,
//        mapTypeId: google.maps.MapTypeId.ROADMAP
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', , 'satellite', 'terrain', 'styled_map',
        'styled_map2']
    }
  };

  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  marker = new google.maps.Marker({
    position: latLng,
    map: map
  });

  map.mapTypes.set('styled_map', oldStyledMapType);
  map.setMapTypeId('styled_map');
  map.mapTypes.set('styled_map2', nightStyledMapType);
  map.setMapTypeId('styled_map2');

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: getLowSeverityData(),
    map: map
  });

  safetyCircle = new google.maps.Circle({
    strokeColor: '#000000',
    strokeOpacity: 0.5,
    strokeWeight: 0.5,
    fillColor: '#FFFFFF',
    fillOpacity: 0.35,
    map: map,
    center: latLng,
    radius: 1000 //Radius is in m
  });

  google.maps.event.addListener(map, 'click', function (event) {
    setDangerCircle(event.latLng, marker);
    deactivateHeatmap();
  });

  fetchData(city);

  // Create the search box
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function () {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener('places_changed', function () {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    var place = places[0];

    if (!place.geometry) {
      console.log("Returned place contains no geometry");
      return;
    }
    map.setCenter(place.geometry.location);

    if (place.place_id in cities){
      setDangerCircle(place.geometry.location, marker);
      fetchData(cities[place.place_id]);
    }
    else {
      alert("There is no data available for this city");
    }

  });

}

function showSVPhoto(divSelector) {
  return function processSVData(data, status) {
    if (status === 'OK') {
      var pano = data.links[0].pano;
      photoUrl = getStreetView(pano);
      var childDiv = document.createElement("div");
      var elemImg = document.createElement("img");
      elemImg.setAttribute("src", photoUrl);
      elemImg.setAttribute("height", "200px");
      childDiv.appendChild(elemImg);
      $(divSelector).slick('slickAdd', childDiv);
    }
  }
}

function getStreetView(pano) {
  var heading = Math.floor((Math.random() * 110) + 125);
  url = "https://maps.googleapis.com/maps/api/streetview?size=320x240&"
        + "pano=" + pano + "&"
        + "fov=90&"
        + "heading=" + heading.toString() + "&"
        + "pitch=10&"
        + "key=AIzaSyA2lbbygUBcGlfOpC8EC6S-rvNcMMXbWfQ"
  return url;
}

function getNearRandomLocation(location) {
  var latDiff = (Math.floor((Math.random() * 10) - 5))/100;
  var lngDiff = (Math.floor((Math.random() * 10) - 5))/100;
  var lat = location.lat() + latDiff;
  var lng = location.lng() + lngDiff;
  return new google.maps.LatLng(lat, lng);
}

function setDangerCircle(location, marker) {
  // Clear all slides from slick
  $('#photos').slick('removeSlide', null, null, true);

  for (var i = 0; i < 3; i++) {
    var nearLocation = getNearRandomLocation(location);
    sv.getPanorama({location: nearLocation, radius: 100}, showSVPhoto('#photos'));
  }

  safetyCircle.set('center', location);
  marker.set('position', location);
  dangerLevel = dangerEstimation(location);
  style_circle(dangerLevel);
}

function dangerEstimation(myLocation) {

  var dangerLevel = 0;
  relevantCrimesIdx = new Array();
  threshold = safetyCircle.get('radius') / 1000;
  for (var i = 0; i < crimeLocations.length; i++) {
    dist = computeDistanceBetween(myLocation, crimeLocations[i]);
//        console.log(threshold+ ' ' + dist)

    if (dist < threshold) {
      dangerLevel += 1;
      relevantCrimesIdx.push(i);
    }
  }
  visualizeCrime(relevantCrimesIdx);
  console.log(dangerLevel)
  return dangerLevel;
}

function visualizeCrime(relevantCrimesIdx) {

  relevantCrimes = new Array();

  //Filtered crimes
  if (relevantCrimesIdx) {
    filteredCrimeType = {};
    for (idx in relevantCrimesIdx) {
      if (!(crimeData[idx].Category in filteredCrimeType)) {
        filteredCrimeType[crimeData[idx].Category] = 1;
      } else {
        filteredCrimeType[crimeData[idx].Category] += 1;
      }
    }
    //Create sorted array for D3
    $.each(filteredCrimeType, function (k, v) {
      var obj = {};
      obj['CrimeType'] = k;
      obj['Number'] = v;
      relevantCrimes.push(obj);
    });
  }
  //Visualize all crimes
  else {
    //Create sorted array for D3
    $.each(crimeType, function (k, v) {
      var obj = {};
      obj['CrimeType'] = k;
      obj['Number'] = v;
      relevantCrimes.push(obj);
    });
  }
  //Sorte array based on key 'Number'
  relevantCrimes.sort(function (a, b) {
    return parseInt(b.Number) - parseInt(a.Number);
  });
  //Visualize
  barChart(relevantCrimes);
}

function barChart(relevantCrimes) {

  //Remove previous plot and add new one
  d3.select("svg > *")
          .remove();
  // set the dimensions of the canvas
  var margin = {top: 20, right: 20, bottom: 200, left: 40},
          width = 600 - margin.left - margin.right,
          height = 450 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
  var y = d3.scale.linear().range([height, 0]);

  // define the axis
  var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
  var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10);

  // add the SVG element
  var svg = d3.select("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

  relevantCrimes.forEach(function (d) {
    d.CrimeType = d.CrimeType;
    d.Number = +d.Number;
  });

  // scale the range of the data
  x.domain(relevantCrimes.map(function (d) {
    return d.CrimeType;
  }));
  y.domain([0, d3.max(relevantCrimes, function (d) {
      return d.Number;
    })]);

  // add axis
  svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-45)");

  svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

  // Add bar chart
  svg.selectAll("bar")
          .data(relevantCrimes)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function (d) {
            return x(d.CrimeType);
          })
          .attr("width", x.rangeBand())
          .attr("y", function (d) {
            return y(d.Number);
          })
          .attr("height", function (d) {
            return height - y(d.Number);
          });
}

function style_circle(dangerLevel) {
  lowDanger = 0.01 * crimeData.length;
  highDanger = 0.08 * crimeData.length;
  if (dangerLevel <= lowDanger) {
    safetyCircle.set('fillColor', '#00FF00');
  } else if (dangerLevel >= highDanger) {
    safetyCircle.set('fillColor', '#FF0000');
  } else {
    safetyCircle.set('fillColor', '#FFFF00');
  }
}

//Compute distance between two points on the map
//Computation is based on the haversine formula
function computeDistanceBetween(myLocation, crimeLocation) {

  var R = 6371; // km
  var myLat = myLocation.lat() * (Math.PI / 180);
  var crimeLat = crimeLocation[0] * (Math.PI / 180);
  var latDist = (crimeLat - myLat);
  var longDist = (crimeLocation[1] - myLocation.lng()) * (Math.PI / 180);
  var a = Math.sin(latDist / 2) * Math.sin(latDist / 2) +
          Math.cos(myLat) * Math.cos(crimeLat) *
          Math.sin(longDist / 2) * Math.sin(longDist / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

//Get SF crime data
function fetchData(city) {

  crimeData =  new Array();
  crimeLocations = new Array();
  crimeType = {};

  //Fill crimeData with JSON blobs content
  for (var idx in crimeUrl[city]) {
    $.ajax({
    async: true,
    url: crimeUrl[city][idx],
    success: function(data) {
      //Get crime location
      var locations = new Array();
      crimeData = crimeData.concat(data);
      for (var i = 0; i < data.length; i++) {
        locations[i] = [crimeData[i].lat, crimeData[i].lng];
        //Determine crime types
        if (!(crimeData[i].Category in crimeType)) {
          crimeType[crimeData[i].Category] = 1;
        }
        else {
          crimeType[crimeData[i].Category] += 1;
        }
      }
      crimeLocations = crimeLocations.concat(locations);
      if (idx == crimeUrl[city].length - 1)
        visualizeCrime(null); //Display all crimes of the city
      }
    });
  }
}

function updateRadius(circle, radius) {

  circle.set('radius', parseInt(radius, 10));
}




function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function aboutOnClick() {


  $('.about-btn').css({
    'opacity': 1
  });

  plotData();

}

function deactivateHeatmap() {
  $('.high-btn').css({
    'opacity': 0.4
  });
  $('.low-btn').css({
    'opacity': 0.4
  });
  if (lowSeverityActive || highSeverityActive) {
    console.log(lowSeverityActive + ' ' + highSeverityActive)
    lowSeverityActive = false;
    highSeverityActive = false;
    plotData();
  }
}

var lowSeverityActive = false;

function lowSeverityOnClick() {
  safetyCircle.set('center', null);
  marker.set('position', null);

  lowSeverityActive = !lowSeverityActive;
  if (lowSeverityActive) {
    $('.low-btn').css({
      'opacity': 1
    });
  } else {
    $('.low-btn').css({
      'opacity': 0.4
    });
  }
  plotData();
}

var highSeverityActive = false;


function highSeverityOnClick() {
  safetyCircle.set('center', null);
  marker.set('position', null);
  highSeverityActive = !highSeverityActive;
  if (highSeverityActive) {
    $('.high-btn').css({
      'opacity': 1
    });
  } else {
    $('.high-btn').css({
      'opacity': 0.4
    });
  }
  plotData();

}

function plotData() {
  heatmap.set("data", null);
  var finalPoints = [];
  if (lowSeverityActive) {
    finalPoints = finalPoints.concat(getLowSeverityData());

  }
  if (highSeverityActive) {
    finalPoints = finalPoints.concat(getHighSeverityData());
  }

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: finalPoints,
    map: map
  });

  setHeatmapStyle(city, heatmap);



}

function setHeatmapStyle(city, heatmap) {
  if (city == "saopaulo") {
    heatmap.set('gradient', gradient);
    heatmap.set('radius', 12);
    heatmap.set('maxIntensity', 30);
  } else if (city == "campinas") {
    heatmap.set('gradient', gradient);
    heatmap.set('radius', 17);
    heatmap.set('maxIntensity', 15);
  } else if (city == "sanfrancisco") {
    heatmap.set('gradient', gradient);
    heatmap.set('radius', 10);
    heatmap.set('maxIntensity', 140);
  }
}

function getLowSeverityData() {
  arrayVal = [];
  for (var i in crimeData) {
    if (crimeData[i].Severity == "LOW") {
      var X = crimeData[i].lat;
      var Y = crimeData[i].lng;
      var value = new google.maps.LatLng(X, Y);
      arrayVal.push(value);
    }
  }
  return arrayVal;
}

function getHighSeverityData() {
  arrayVal = [];
  for (var i in crimeData) {
    if (crimeData[i].Severity == "HIGH") {
      var X = crimeData[i].lat;
      var Y = crimeData[i].lng;
      var value = new google.maps.LatLng(X, Y);
      arrayVal.push(value);
    }
  }
  return arrayVal;
}

$(function () {
  //----- OPEN
  $('[data-popup-open]').on('click', function (e) {
    var targeted_popup_class = jQuery(this).attr('data-popup-open');
    $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);

    e.preventDefault();
  });

  //----- CLOSE
  $('[data-popup-close]').on('click', function (e) {
    var targeted_popup_class = jQuery(this).attr('data-popup-close');
    $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);

    e.preventDefault();

    $('.about-btn').css({
      'opacity': 0.4
    });

  });
});


var nightMapStyle = [
  {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#263c3f'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b9a76'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#212a37'}]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#9ca5b3'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#746855'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#1f2835'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{color: '#f3d19c'}]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{color: '#2f3948'}]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#515c6d'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#17263c'}]
  }
];

var oldMapStyle = [
  {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{color: '#c9b2a6'}]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'geometry.stroke',
    stylers: [{color: '#dcd2be'}]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{color: '#ae9e90'}]
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{color: '#dfd2ae'}]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{color: '#dfd2ae'}]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#93817c'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{color: '#a5b076'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#447530'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#f5f1e6'}]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{color: '#fdfcf8'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#f8c967'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#e9bc62'}]
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{color: '#e98d58'}]
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry.stroke',
    stylers: [{color: '#db8555'}]
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{color: '#806b63'}]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{color: '#dfd2ae'}]
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.fill',
    stylers: [{color: '#8f7d77'}]
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#ebe3cd'}]
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{color: '#dfd2ae'}]
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{color: '#b9d3c2'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#92998d'}]
  }
];
