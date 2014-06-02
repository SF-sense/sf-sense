angular.module('sfSense', ['ionic'])

.factory('googleMaps', function(){
  // OVERVIEW
  // 1. setup map options
  // 2. create map
  // 3. get data for crime lat and lng
  // 4. create markers
  // 5. add markers to map  
  var map;
  var markers = [];
  var isViolent = {
    'ASSAULT': true,
    'NON-CRIMINAL': false,
    'OTHER OFFENSES': false,
    'ROBBERY': true,
    'LARCENY/THEFT': false,
    'VANDALISM': false,
    'BURGLARY': false,
    'VEHICLE THEFT': false,
    'FRAUD': false,
    'DRUNKENNESS': false,
    'WARRANTS': false,
    'TRESPASS': false,
    'KIDNAPPING': true,
    'SEX OFFENSES': true,
    'WEAPON LAWS': true,
    'DRUG/NARCOTIC': false,
    'FORGERY/COUNTERFEITING': false,
    'MISSING PERSON': false,
    'LIQUOR LAWS': false,
    'BAD CHECKS': false,
    'RUNAWAY': false,
    'EMBEZZLEMENT': false
  };

  var iconPath = '../www/img/icons/';

  // TODO: add marker img for each category
  var markerImg = {
    'BURGLARY': 'robbery.png',
    'LARCENY/THEFT': 'theft.png',
    'ASSAULT': 'robbery.png',
    'MISSING PERSON': 'missing.png',
    'DEFAULT': 'blast.png'
  };

  var createMarker = function(crime) {
    var latlng = new google.maps.LatLng(crime.latitude,crime.longitude);

    var icon;

    if(markerImg[crime.category]){
      icon = iconPath + markerImg[crime.category];
    } else {
      icon = iconPath + markerImg.DEFAULT;
    }

    markers.push (new google.maps.Marker({
      position: latlng,
      animation: google.maps.Animation.DROP,
      title: crime.category,
      icon: icon,
      map: map
    }));
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

    // CreateMap is not invoked yet so we define addListener to add the event listener
    // Once the map has been created, call addListener
    // Moving method outside of the create call allows access to other services in googleMaps
    // There will only be one map variable so accept only the event and function
    addListener: function(event, func) {
      google.maps.event.addListener(map, event, func);
    },

    createMarkers: function(crimes) {
      for(var i = 0; i < crimes.length; i++){
        createMarker(crimes[i]);
      }
    },

    moveTo: function(lat, lng){
      var latlng = new google.maps.LatLng(lat,lng);
      map.panTo(latlng);
    },

    getCenter: function() {
      // returns latlng object with lat() and lng() methods
      return map.getCenter();
    },

    searchLocByAddress: function(address, cb) {
      var city = 'san francisco';
      var re = RegExp(city, 'i');

      if(!re.exec(address)){
        address = address + ' ' + city;
      }

      geocoder = new google.maps.Geocoder();

      geocoder.geocode( {'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);

          cb(results[0].geometry.location.k, results[0].geometry.location.A);

        } else {
          navigator.notification.alert('Error with find location: ' + status);
        }
      });
    },

    searchLoc: function(lat, lng, cb){
      var latlng = new google.maps.LatLng(lat,lng);
      map.setCenter(latlng);
      cb(lat, lng);
    },

    filterBy: function(filter){
      for (var i = 0; i < markers.length; i++){
        var cat = markers[i].title;
        if (filter === 'violent') {
          // check category against isViolent, if isViolent is false, hide it
          if(!isViolent[cat]) { 
            markers[i].setMap(null);
          } else {
            // it shouldn't be filtered out
            markers[i].setMap(map);
          }
        } else {
          // filter is non-violent, check for the opposite
          if(isViolent[cat]) { 
            markers[i].setMap(null);
          } else {
            markers[i].setMap(map);
          }
        }
      }
    }
  };
})

.controller('MapCtrl', function($scope, $http, googleMaps){

  $scope.filters = ['violent', 'non-violent'];

  var init = function() {
    // SF center lat and lng
    var lat = 37.783522;
    var lng = -122.408964;

    googleMaps.createMap(lat, lng);

    // After map has been created, add listeners here
    googleMaps.addListener('dragend', function(){
      // get the lng and lat and call getCrimes with them
      var newCenter = googleMaps.getCenter();
      $scope.getCrimes(newCenter.lat(), newCenter.lng());
    });
  };

  $scope.gpsSearchCrime = function(){

    var onSuccess = function(pos){
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      googleMaps.searchLoc(lat, lng, $scope.getCrimes);
    };

    var onError = function(error) {
      navigator.notification.alert('Code: ' + error.code + '\n' + 'Message:' + error.message);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  };

  $scope.getCrimes = function(lat, lng){

    var url = "http://sf-sense-server.herokuapp.com/near?longitude=" + lng + "&latitude="+ lat + "&distance=0.3";

    $http({
      url: url,
      dataType: 'json',
      method: "GET"
    }).success(function(response){
      googleMaps.createMarkers(response);
    }).error(function(error){
      navigator.notification.alert('There was an error: ' + error);
    });
  };

  $scope.searchCrime = function() {
    // $scope.mapSearch is a street address
    // on success, calls getCrimes with the lat/lng

    // if map search if undefined use current location. Placeholder is current location.
    if(!$scope.mapSearch) {
      $scope.gpsSearchCrime();
    } else {
      googleMaps.searchLocByAddress($scope.mapSearch, $scope.getCrimes);
    }
  };

  $scope.filterBy = function (filterArg) {
    googleMaps.filterBy(filterArg);
  };

  $scope.trackLocation = function() {
    alert('Tracking');
    var bgGeo = window.plugins.backgroundGeoLocation;

    var onSuccess = function(pos){
      var lat = pos.latitude;
      var lng = pos.longitude;
      alert(lat);
      // googleMaps.searchLoc(lat, lng, $scope.getCrimes);
    };

    var onError = function(error) {
      navigator.notification.alert('Code: ' + error.code + '\n' + 'Message:' + error.message);
    };

    bgGeo.configure(onSuccess, onError, {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        debug: true // <-- enable this hear sounds for background-geolocation life-cycle.
    });

    bgGeo.start();
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


