// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('sfSense', ['ionic'])

.factory('GoogleMaps', function(){
  return {
    // add in google maps functions here
  }
})

.controller('MapCtrl', function($scope, GoogleMaps){

  var initialize = function() {
    // create map object
  };

  $scope.searchCrime = function() {
    // create map with google map API

    // OVERVIEW
    // 1. setup map options
    // 2. create map
    // 3. get data for crime lat and lng
    // 4. create markers
    // 5. add markers to map

    // search for address and get lat and log for map creation
    // $scope.mapSearch for user input
    var lat = 37.783522;
    var lng = -122.408964;

    // set map options
    var mapOptions = {
      center: new google.maps.LatLng(lat, lng),
      zoom: 17
    };

    // create map
    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    // search for crimes in the radius of lat and lng from SFSense REST API

    // create markers of google.maps.Marker

    // create lat lng for marker objects
    var myLatlng = new google.maps.LatLng(lat,lng);

    // create marker object
    var marker = new google.maps.Marker({
      position: myLatlng,
      title:"Hello World!"
    });

    // add marker to map
    marker.setMap(map);
  };

})

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


