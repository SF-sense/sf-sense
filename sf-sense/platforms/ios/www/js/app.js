angular.module('sfSense', ['ionic'])

.factory('googleMaps', function(){
  // OVERVIEW
  // 1. setup map options
  // 2. create map
  // 3. get data for crime lat and lng
  // 4. create markers
  // 5. add markers to map  
  var map;

  var iconPath = '../img/icons/';

  // TODO: add marker img for each category
  var markerImg = {
    'BURGLARY': 'robbery.png',
    'LARCENY/THEFT': 'theft.png',
    'ASSAULT': 'robbery.png',
    'MISSING PERSON': 'missing.png'
  };

  var createMarker = function(marker) {
    var latlng = new google.maps.LatLng(marker.lat,marker.lng);

    // create marker object
    new google.maps.Marker({
      position: latlng,
      animation: google.maps.Animation.DROP,
      title: marker.title,
      icon: iconPath + markerImg[marker.category],
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
        createMarker(markerLocs[i]);
      }
    },
    moveTo: function(lat, lng){
      var latlng = new google.maps.LatLng(lat,lng);
      map.panTo(latlng);
    },
    searchLocByAddress: function(address) {

      // format address to included san francisco
      var city = 'san francisco';

      var re = RegExp(city, 'i');

      if(!re.exec(address)){
        address = address + ' ' + city;
      }

      geocoder = new google.maps.Geocoder();

      geocoder.geocode( {'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);

          // Add a center search location marker. Customise colour

          // var marker = new google.maps.Marker({
          //     map: map,
          //     position: results[0].geometry.location
          // });

        } else {
          // return a message if an error occurs

          // alert('Geocode was not successful for the following reason: ' + status);
        }
      });

    },
    searchLoc: function(lat, lng){
      var latlng = new google.maps.LatLng(lat,lng);
      map.setCenter(latlng);
    }
  }
})

.controller('MapCtrl', function($scope, $http, googleMaps){

  var init = function() {
    // SF center lat and lng
    var lat = 37.783522;
    var lng = -122.408964;

    googleMaps.createMap(lat, lng);
  };

  $scope.gpsSearchCrime = function(){

    var onSuccess = function(pos){
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      googleMaps.searchLoc(lat, lng);

      // fetch crime locations
      // diplay markers
    };

    var onError = function(error) {
      alert('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  };

  $scope.searchCrime = function() {

    googleMaps.searchLocByAddress($scope.mapSearch);

    // $http({
    //   url: "http://sf-sense-server.herokuapp.com/near?longitude=-122&latitude=37",
    //   dataType: 'json',
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json; charset=utf-8"
    //   }
    // }).success(function(response){
    //   console.log('SUCCESS');
    // }).error(function(error){
    //   console.log("ERROR");
    // });

    // Testing crime locations
    var testCrimeLocs = [
      { 
        lat: 37.783522,
        lng: -122.408999,
        category: 'LARCENY/THEFT',
        title: 'test1'
      },
      { 
        lat: 37.783522,
        lng: -122.409999,
        category: 'ASSAULT',
        title: 'test2'
      },
      { 
        lat: 37.783522,
        lng: -122.409878,
        category: 'MISSING PERSON',
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


