// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});



// function initialize() {
//   var mapOptions = {
//     center: new google.maps.LatLng(37.783522, -122.408964),
//     zoom: 17,
//     scaleControl: true
//   };
//   window.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
//   addCrime();
// }
// google.maps.event.addDomListener(window, 'load', initialize);


// var addCrime = function (loc, data) {
//   // modify once we know what data to add to the info window
//   var info;
//   var marker;

//   info = new google.maps.InfoWindow({
//     content: 'matt met some big blokes and a rough time'
//   });

//   marker = new google.maps.Marker({
//     position: {lat: 37.784319, lng: -122.411067},
//     map: map,
//     title: "matt was beat on"
//   });

//   google.maps.event.addListener(marker, 'click', function(){
//     info.open(map, marker);
//   });
// };
/*
0. create object with options for map generation
   var mapOptions = {
    center: new google.maps.LatLng(37.783522, -122.408964), // we should modify this to a generic center of SF location
    zoom: 17,
    scaleControl: true
  };
1. make new map
  var crimeMap = new google.maps.Map($('#map'), mapOptions)
2. add pins
  var crimePins = [];
3. parse search address
  on search input
  parse search address into form https://http://maps.googleapis.com/maps/api/geocode/json?address=[number]+[streetname]+[street/blvd/etc],+city,+state,+zip
    note: replace spaces in search query with '+' signs ex: http://maps.googleapis.com/maps/api/geocode/json?address=944market+street,+san+francisco
4. take returned json and access: response.results[0].geometry.location to get a lat/long location object of form {lat: 123123, lng: 123123}
5. call map.setCenter(location object) to update map center

