angular.module('sfSense', ['ionic'])

.factory('googleMaps', function(){
  // OVERVIEW
  // 1. setup map options
  // 2. create map
  // 3. get data for crime lat and lng
  // 4. create markers
  // 5. add markers to map  
  var map;
  var createMarker = function(lat, lng, title) {
    var latlng = new google.maps.LatLng(lat,lng);

    new google.maps.Marker({
      position: latlng,
      animation: google.maps.Animation.DROP,
      title: title,
      map: map
    });
  };

  return {

    // Add in google maps functions here

    createMap: function(lat, lng){
      var mapOptions = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 17
      };

      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    },
    createMarkers: function(markerLocs) {
      for(var i = 0; i < markerLocs.length; i++){
        var lat = markerLocs[i].lat;
        var lng = markerLocs[i].lng;
        var title = markerLocs[i].title;
        createMarker(lat,lng,title);
      }
    },
    moveTo: function(lat, lng){
      var latlng = new google.maps.LatLng(lat,lng);
      map.panTo(latlng);
    }
  }
})

.controller('MapCtrl', function($scope, GoogleMaps){

  var init = function() {
    // SF center lat and lng
    var lat = 37.783522;
    var lng = -122.408964;

    googleMaps.createMap(lat, lng);
  };

  $scope.searchCrime = function() {

    // $scope.mapSearch for user input
    // Testing lat and long and panTo
    var testLat = 37.783522;
    var testLng = -122.409999;

    googleMaps.moveTo(testLat, testLng);

    // Testing crime locations
    var testCrimeLocs = [
      { 
        lat: 37.783522,
        lng: -122.408999,
        title: 'test1'
      },
      { 
        lat: 37.783522,
        lng: -122.409999,
        title: 'test2'
      },
      { 
        lat: 37.783522,
        lng: -122.409878,
        title: 'test3'
      }      
    ];

    // search for crimes in the radius of lat and lng from SFSense REST API
    googleMaps.createMarkers(testCrimeLocs);
  };

  init();
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


