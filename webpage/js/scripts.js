var map;
var safetyCircle;
var sanFrancisco = {lat: 37.773972, lng: -122.431297};
var crimeData = new Array()
var crimeLocations = new Array();
var dangerAudio = new Audio("https://raw.githubusercontent.com/ArthurZC23/T3/master/project/data/Audio/danger.mp3");
var carefulAudio = new Audio("https://raw.githubusercontent.com/ArthurZC23/T3/master/project/data/Audio/careful.mp3");
var safeAudio = new Audio("https://raw.githubusercontent.com/ArthurZC23/T3/master/project/data/Audio/safe.mp3");
var crimeType = {};
var relevantCrimesIdx;
var relevantCrimes;

function myMap() {

  var latLng = new google.maps.LatLng(sanFrancisco);
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

  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterControl(centerControlDiv, map);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

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
      safetyCircle.set('center', event.latLng);
      marker.set('position', event.latLng);
      dangerLevel = dangerEstimation(event.latLng);
      style_circle(dangerLevel);

  });

}

function dangerEstimation(myLocation){

  var dangerLevel = 0
  relevantCrimesIdx = new Array();
  threshold = safetyCircle.get('radius')/1000
  for(var i = 0; i<crimeLocations.length; i++){
    dist = computeDistanceBetween(myLocation, crimeLocations[i])
    if(dist < threshold){
      dangerLevel += 1
      relevantCrimesIdx.push(i)
    }
  }
  visualizeCrime(relevantCrimesIdx)
  return dangerLevel
}

function visualizeCrime(relevantCrimesIdx){

  relevantCrimes = new Array();

  //Filtered crimes
  if (relevantCrimesIdx){
    filteredCrimeType = {};
    for (idx in relevantCrimesIdx){
      if (!(crimeData[idx].Category in filteredCrimeType)){
        filteredCrimeType[crimeData[idx].Category] = 1;
      }
      else{
        filteredCrimeType[crimeData[idx].Category] += 1;
      }
    }
    //Create sorted array for D3
    $.each(filteredCrimeType, function(k, v){
      var obj = {}
      obj['CrimeType'] = k
      obj['Number'] = v
      relevantCrimes.push(obj)
      });
    }
  //Visualize all crimes
  else{
    //Create sorted array for D3
    $.each(crimeType, function(k, v){
      var obj = {}
      obj['CrimeType'] = k
      obj['Number'] = v
      relevantCrimes.push(obj)
    });
  }
  //Sorte array based on key 'Number'
  relevantCrimes.sort(function(a,b){
    return parseInt(b.Number) - parseInt(a.Number)
  });
  //Visualize
  barChart(relevantCrimes);
}

function barChart(relevantCrimes){

  //Remove previous plot and add new one
  d3.select("svg > *")
    .remove()
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

function style_circle(dangerLevel){

  if (dangerLevel <= 1000){
    safetyCircle.set('fillColor', '#00FF00')
    safeAudio.play()
  }
  else if (dangerLevel >= 5000){
    safetyCircle.set('fillColor', '#FF0000')
    dangerAudio.play()
  }
  else{
    safetyCircle.set('fillColor', '#FFFF00')
    carefulAudio.play()
  }
}

//Compute distance between two points on the map
//Computation is based on the haversine formula
function computeDistanceBetween(myLocation, crimeLocation){

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
$.getJSON("https://raw.githubusercontent.com/ArthurZC23/IA369/arthur/webpage/resources/data/PDI/sfCrimeTourist2016.json?token=ATPc0w4gYSU0lqtyrFKcN2X63pAANSCVks5ZPczfwA%3D%3D", function(data){
  //data is the JSON string
  //alert('success');
  crimeData = data;
  var loc;
  for (var i = 0; i < crimeData.length; i++){
    //Get crime location
    loc = crimeData[i].Location;
    loc = loc.substring(1, loc.length-1);
    loc = JSON.parse("[" + loc + "]");
    crimeLocations[i] = [loc[0], loc[1]];
    //Count crime types
    if (!(crimeData[i].Category in crimeType)){
      crimeType[crimeData[i].Category] = 1;
    }
    else{
      crimeType[data[i].Category] += 1;
    }
  }
  visualizeCrime(null);
});

function updateRadius(circle, radius){

  circle.set('radius', parseInt(radius, 10));
}

function CenterControl(controlDiv, map) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map  in SF';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Center Map in SF';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', function() {
    map.setCenter(sanFrancisco);
    map.setZoom(13)
  });
}
