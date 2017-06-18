var map, heatmap, marker;
var safetyCircle;
var city = "campinas";
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
  "sanfrancisco": "https://raw.githubusercontent.com/ArthurZC23/IA369/filters/webpage/resources/data/sanfrancisco.json?token=AGHU9xGXQYzecMRFasd43o_s_UdzdE7fks5ZUCBdwA%3D%3D",
  "campinas": "https://raw.githubusercontent.com/ArthurZC23/IA369/filters/webpage/resources/data/campinas.json?token=AGHU96Q3X-CiubFzF53S6p3KfZsP7JOHks5ZTzyjwA%3D%3D",
  "saopaulo": "https://raw.githubusercontent.com/alelopes/TestEclipse/master/TestCommmitEclipse/src/main/java/com/bermuda/TestCommmitEclipse/saopaulo.json"
};
var crimeData = new Array();
var crimeLocations = new Array();
var crimeType = {};
var relevantCrimesIdx;
var relevantCrimes;

function myMap() {
// Create a new StyledMapType object, passing it an array of styles,
// and the name to be displayed on the map type control.

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
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

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
    setDangerCircle(place.geometry.location, marker);
  });

}

function setDangerCircle(location, marker) {
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
          .attr("transform", "rotate(-90)");

  svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

  svg.append("text")
          .attr("class", "title")
          .attr("x", (width / 2))
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("text-decoration", "underline")
          .text("Number of registered incidents in 2016.");

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

  $.getJSON(crimeUrl[city], function (data) {

    crimeData = data;
    var loc;
    for (var i = 0; i < crimeData.length; i++) {

      //Get crime location
      lat = crimeData[i].lat;
      lng = crimeData[i].lng;
      crimeLocations[i] = [lat, lng];

      //Count crime types
      if (!(crimeData[i].Category in crimeType)) {
        crimeType[crimeData[i].Category] = 1;
      } else {
        crimeType[data[i].Category] += 1;
      }
    }
    visualizeCrime(null); //Display all crimes of the city
  });
}

function updateRadius(circle, radius) {

  circle.set('radius', parseInt(radius, 10));
}




function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function aboutOnClick() {


  $('.buttonAbout').css({
    'opacity': 0.4
  });

  plotData();

}

function deactivateHeatmap() {
  $('.high-btn').css({
    'opacity': 1
  });
  $('.low-btn').css({
    'opacity': 1
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
      'opacity': 0.4
    });
  } else {
    $('.low-btn').css({
      'opacity': 1
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
      'opacity': 0.4
    });
  } else {
    $('.high-btn').css({
      'opacity': 1
    });
  }
  plotData();

}

function plotData() {
  heatmap.set("data", null);
  var finalPoints = [];
  if (lowSeverityActive) {
    console.log("MULHER")
    finalPoints = finalPoints.concat(getLowSeverityData());

  }
  if (highSeverityActive) {
    console.log("HOUSE ACTIVE");
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

    $('.buttonAbout').css({
      'opacity': 1
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