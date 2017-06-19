var map;
var safetyCircle;
var city = "sanfrancisco";
var cities = {
  "ChIJIQBpAG2ahYAR_6128GcTUEo": "sanfrancisco",
  "ChIJJWNL5x3GyJQRKsJ4IWo65Rc": "campinas"}
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
  "sanfrancisco": ["https://jsonblob.com/api/jsonBlob/51075681-5394-11e7-ae4c-7f2796e7734b", "https://jsonblob.com/api/jsonBlob/7707e262-5394-11e7-ae4c-8d801a244672", "https://jsonblob.com/api/jsonBlob/ab20ad66-5394-11e7-ae4c-bd4a9d944bc4"],
  "campinas": ["https://jsonblob.com/api/jsonBlob/1558b618-5394-11e7-ae4c-47c3fb90e2a1"]
};
var crimeClusters = {
  "sanfrancisco": 'https://jsonblob.com/api/jsonBlob/cdb16af6-5451-11e7-ae4c-c1ce04d62daf',
  "campinas": 'https://jsonblob.com/api/jsonBlob/a9272b4a-5451-11e7-ae4c-d343c07eb64f'
};
var crimeData;
var crimeLocations;
var crimeType;
var pinIcon;
var relevantCrimesIdx;
var relevantCrimes;
var clusterDisplay;
var clusters;

function myMap() {

  //Default initialization with San Francisco
  var latLng = new google.maps.LatLng(citiesGeo[city]);
  var mapOptions = {
    center: latLng,
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  var marker = new google.maps.Marker({
    position: latLng,
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

  google.maps.event.addListener(map, 'click', function(event) {
    setDangerCircle(event.latLng, marker);
  });

  fetchData(city);

  // Create the search box
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener('places_changed', function() {
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

  pinIcon = new google.maps.MarkerImage(
      "https://www.cogenhr.com/development/wp-content/uploads/2015/03/Red-circle-transparent-1024x1006.png",
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      null, /* anchor is bottom center of the scaled image */
      new google.maps.Size(15, 15)
  );

}

function displayClusters(city){

  // //Get clusters centers
  if (!clusterDisplay){
    $.ajax({
      async: true,
      url: crimeClusters[city],
      success: function(data) {
        clusters = new Array();
        for (center of data){
          var marker = new google.maps.Marker({
            position: {lat: center.lat, lng: center.lng},
            map: map
        });
          marker.setIcon(pinIcon);
          clusters.push(marker)
        }
        clusterDisplay = true;
      }
    });
  }
  else{
    //Remove markers
    for (idx in clusters)
      clusters[idx].setMap(null);
    clusterDisplay = false;

  }

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
  threshold = safetyCircle.get('radius')/1000;
  for(var i = 0; i<crimeLocations.length; i++){
    dist = computeDistanceBetween(myLocation, crimeLocations[i]);
    if(dist < threshold){
      dangerLevel += 1;
      relevantCrimesIdx.push(i);
    }
  }
  visualizeCrime(relevantCrimesIdx);
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
      }
      else {
        filteredCrimeType[crimeData[idx].Category] += 1;
      }
    }
    //Create sorted array for D3
    $.each(filteredCrimeType, function(k, v) {
      var obj = {};
      obj['CrimeType'] = k;
      obj['Number'] = v;
      relevantCrimes.push(obj);
      });
    }
  //Visualize all crimes
  else {
    //Create sorted array for D3
    $.each(crimeType, function(k, v) {
      var obj = {};
      obj['CrimeType'] = k;
      obj['Number'] = v;
      relevantCrimes.push(obj);
    });
  }
  //Sorte array based on key 'Number'
  relevantCrimes.sort(function(a,b) {
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

  relevantCrimes.forEach(function(d) {
    d.CrimeType = d.CrimeType;
    d.Number = +d.Number;
  });

  // scale the range of the data
  x.domain(relevantCrimes.map(function(d) { return d.CrimeType; }));
  y.domain([0, d3.max(relevantCrimes, function(d) { return d.Number; })]);

  // add axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  svg.append("text")
      .attr("class","title")
      .attr("x", (width/ 2))
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
      .attr("x", function(d) { return x(d.CrimeType); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.Number); })
      .attr("height", function(d) { return height - y(d.Number); });
}

function style_circle(dangerLevel) {

  if (dangerLevel <= 1000) {
    safetyCircle.set('fillColor', '#00FF00');
  }
  else if (dangerLevel >= 5000) {
    safetyCircle.set('fillColor', '#FF0000');
  }
  else {
    safetyCircle.set('fillColor', '#FFFF00');
  }
}

//Compute distance between two points on the map
//Computation is based on the haversine formula
function computeDistanceBetween(myLocation, crimeLocation) {

  var R = 6371; // km
  var myLat = myLocation.lat()*(Math.PI/180);
  var crimeLat = crimeLocation[0]*(Math.PI/180);
  var latDist = (crimeLat-myLat);
  var longDist = (crimeLocation[1]-myLocation.lng())*(Math.PI/180);
  var a = Math.sin(latDist/2) * Math.sin(latDist/2) +
          Math.cos(myLat) * Math.cos(crimeLat) *
          Math.sin(longDist/2) * Math.sin(longDist/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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

function updateRadius(circle, radius){

  circle.set('radius', parseInt(radius, 10));
}
