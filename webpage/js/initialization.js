var map;
var safetyCircle;
var sanFrancisco = {lat: 37.773972, lng: -122.431297};


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
}
