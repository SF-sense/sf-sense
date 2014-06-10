angular.module('sfSense', ['ionic'])

.factory('googleMaps', function(){
  // OVERVIEW
  // 1. setup map options
  // 2. create map
  // 3. get data for crime lat and lng
  // 4. create markers
  // 5. add markers to map  
  var map;
  var markers = {};
  var filterOn = 'all';
  var selfMarker;

  var iconPath = '../www/img/icons/markers/';

  // TODO: add marker img for each category
  var markerImg = {
    'theft': 'theft.png',
    'assault': 'assult.png',
    'other': 'other.png'
  };

  var createMarker = function(crime) {

    if (markers[crime.id] === undefined) { // If crime isn't displayed yet add it
      var latlng = new google.maps.LatLng(crime.latitude,crime.longitude);

      var icon;

      if(markerImg[crime.type]){
        icon = iconPath + markerImg[crime.type];
      } else {
        icon = iconPath + markerImg.other;
      }

      var newMarker = new google.maps.Marker({
        position: latlng,
        animation: google.maps.Animation.DROP,
        title: crime.category,
        icon: icon,
        id: crime.id,
        category: crime.category,
        date: crime.date,
        time: crime.time,
        description: crime.descript,
        type: crime.type.toLowerCase()
      });

      // Check if the marker should be displayed or not
      if (filterOn === 'all' || filterOn === crime.type) {
        newMarker.setMap(map);
      }
      // Make a new InfoWindow and associate it to the marker
      // *** note infobox can be used as well for more styling ***
      newMarker.info = new google.maps.InfoWindow({
        content: '<div>' + newMarker.description + '</div>',
        maxWidth: 100
      });
      // Add the map listener here
      google.maps.event.addListener(newMarker, 'mouseover', function(){
        // Close all open crime info windows first
        for (var crimeID in markers) {
          markers[crimeID].info.close();
        }
        // Open the pertinent info window
        newMarker.info.open(map, newMarker);
      });
      markers[crime.id] = newMarker; // Add it to the markers object
    }
  };

  return {

    // Add in google maps functions here

    createMap: function(lat, lng){
      var mapOptions = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 17,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        scrollwheel: false
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
      // Returns latlng object with lat() and lng() methods
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

    setSelf: function(lat, lng){

      // remove old selfMarker if it exists
      if (selfMarker.setMap) {
        selfMarker.setMap(null);
      }
      selfMarker = null;

      var latlng = new google.maps.LatLng(lat, lng);
      var icon = iconPath +'selfpin.png';

      selfMarker = new google.maps.Marker({
        position: latlng,
        animation: google.maps.Animation.DROP,
        title: 'You Are Here',
        icon: icon
      });

      selfMarker.setMap(map);

      selfMarker.info = new google.maps.InfoWindow({
        content: '<div>You Are Here</div>',
        maxWidth: 100
      });

      google.maps.event.addListener(newMarker, 'mouseover', function(){
        // Open the pertinent info window
        selfMarker.info.open(map, selfMarker);
      });
      
    },

    filterBy: function(filter){
      filterOn = filter;
      // The filter will match the type field on the markers
      for (var markerID in markers){
        
        var marker = markers[markerID];
        var cat = marker.type;

        // Check if the filter is all, if so, show all markers
        if (filter === 'all') {
          marker.setMap(map);
        } else { // A filter was specified
          if (filter === cat) {
            marker.setMap(map);
          } else {
            marker.setMap(null);
          }
        }
      }
    }
  };
})

.factory('loaderService', function($rootScope, $ionicLoading) {
  return {
    show : function() {
      $ionicLoading.show({

        // The text to display in the loading indicator
        content: '<i class="icon ion-looping"></i> Loading',

        // The animation to use
        animation: 'fade-in',

        // Will a dark overlay or backdrop cover the entire view
        showBackdrop: true,

        // The maximum width of the loading indicator
        // Text will be wrapped if longer than maxWidth
        maxWidth: 200,

        // The delay in showing the indicator
        showDelay: 10
      });
    },

    hide : function(){
      $ionicLoading.hide();
    }
  };
})

.controller('MapCtrl', function($scope, $http, googleMaps, loaderService){

  // add an event listener to update the map location on resume
  document.addEventListener("resume", function(){$scope.resume();}, false);
  
  $scope.filters = ['other', 'assault', 'theft'];
  $scope.searchClear = true;

  var hideKeyboard = function() {
    document.activeElement.blur();
    $("input").blur();
  };

  var init = function() {
    // SF center lat and lng
    var lat = 37.783522;
    var lng = -122.408964;

    googleMaps.createMap(lat, lng);
    $scope.gpsSearchCrime();

    // After map has been created, add listeners here
    googleMaps.addListener('dragend', function(){
      // Get the lng and lat and call getCrimes with them
      var newCenter = googleMaps.getCenter();
      $scope.getCrimes(newCenter.lat(), newCenter.lng());
    });

    $scope.trackLocation(pushAlert);
  };

  $scope.resume = function() {
    $scope.gpsSearchCrime();
  };

  $scope.gpsSearchCrime = function() {

    var onSuccess = function(pos){
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      // display self marker
      googleMaps.setSelf(lat, lng);
      navigator.notification.alert('in gpsSearchCrime after setSelf');
      // display crimes
      googleMaps.searchLoc(lat, lng, function(){ navigator.notification.alert(lat, lng); $scope.getCrimes();});
      navigator.notification.alert('in gpsSearchCrime after getCrimes');
    };

    var onError = function(error) {
      navigator.notification.alert('Code: ' + error.code + '\n' + 'Message:' + error.message);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  };

  $scope.getCrimes = function(lat, lng, cb){

    loaderService.show();

    var url = "http://sf-sense-server.herokuapp.com/near?longitude=" + lng + "&latitude="+ lat + "&distance=0.3";

    $http({
      headers: {
      "Authorization" : "Basic " + btoa("sf-sense:858F8CDDB1F324A762DBEFDC77844")
      },
      url: url,
      dataType: 'json',
      method: "GET"
    }).success(function(response){
      if (!cb){
        googleMaps.createMarkers(response);
        loaderService.hide();
      } else {
        cb(response);
      }
    }).error(function(error){
      loaderService.hide();
      navigator.notification.alert('There was an error: ' + error);
    });
  };

  $scope.searchCrime = function() {
    // $scope.mapSearch is a street address
    // On success, calls getCrimes with the lat/lng
    // If map search if undefined use current location. Placeholder is current location.
    if(!$scope.mapSearch) {
      $scope.gpsSearchCrime();
    } else {
      googleMaps.searchLocByAddress($scope.mapSearch, $scope.getCrimes);
    }

    searchHide();
  };

  $scope.filterBy = function (filterArg) {
    filterArg = filterArg || 'all';
    googleMaps.filterBy(filterArg);
  };

  var pushAlert = function(incidents) {

    var alertMessage = function(incidentsOcc) {
      if (incidentsOcc.assault > 1 && incidentsOcc.theft > 2) {
        return "Warning! You are entering an area where assaults and thefts have been reported";
      } else if (incidentsOcc.assault > 1) {
        return "Warning! You are entering an area where assaults have been reported";
      } else if (incidentsOcc.theft > 2) {
        return "Warning! You are entering an area where thefts have been reported";
      }
    };

    var incidentsOcc = {
      assault : 0,
      theft : 0,
      other : 0
    };

    for (var i = 0; i < incidents.length; i++) {
      incidentsOcc[incidents[i].type]++;
    }

    if (incidentsOcc.assault > 1 || incidentsOcc.theft > 2) {
      window.plugin.notification.local.add({ message: alertMessage(incidentsOcc) });
    }
  };

  $scope.trackLocation = function(onSuccessCallback) {
    var bgGeo = window.plugins.backgroundGeoLocation;

    var onSuccess = function(pos) {
      var lat = pos.latitude;
      var lng = pos.longitude;

      $scope.getCrimes(lat, lng, function(crimes){
        onSuccessCallback(crimes);
      });
    };

    var onError = function(error) {
      navigator.notification.alert('Code: ' + error.code + '\n' + 'Message:' + error.message);
    };

    bgGeo.configure(onSuccess, onError, {
      desiredAccuracy: 1,
      stationaryRadius: 1,
      distanceFilter: 1,
      // debug: true // <-- enable this hear sounds for background-geolocation life-cycle.
    });

    bgGeo.start();
  };

  $scope.onFocusSearch = function(){
    $scope.searchClear = false;
  };

  $scope.clearSearch = function(){
    $scope.mapSearch = '';
  };

  var searchHide = function(){
    $scope.searchClear = true;
    hideKeyboard();
  };

  $scope.cancelSearch = function(){
    searchHide();
    hideKeyboard();
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


