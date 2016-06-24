// map.js *****************************************************************
// Initializes Google map, drops points for service locations (pops)
// Calculates distance and draws lines between pops
// Adds new marker based on user input
// Creates dynamic drop-down menu based on service locations
angular.module('mapsApp', [])
  .controller('MapCtrl', function ($scope, $http, MapSvc) {
    var refresh = function () {
      $scope.clientServerPairs = MapSvc.getPairs();
      $scope.pair = {};
    };

    // Map Variables:
    var primaryNetworkline = {};
    var usaLat = 37.09024;
    var usaLong = -95.712891;
    var usaLatlng = new google.maps.LatLng(usaLat, usaLong);
    var mapOptions = {
      zoom: 4,
      center: usaLatlng,
    };

    // these would preferably be set in a .env file
    var geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    var googleMapsAPI_KEY = 'AIzaSyAH9qcwj9QQxgs9xEZylRLUVHO8_aojLEY';

    // mapStyles creates the b&w appearance of map
    var mapStyles = [
      { featureType: 'landscape', stylers: [{ saturation: -100 }, { lightness: 65 }, { visibility: 'on' }] },
      { featureType: 'poi', stylers: [{ saturation: -100 }, { lightness: 51 }, { visibility: 'simplified' }] },
      { featureType: 'road.highway', stylers: [{ saturation: -100 }, { visibility: 'simplified' }] },
      { featureType: 'road.arterial', stylers: [{ saturation: -100 }, { lightness: 30 }, { visibility: 'on' }] },
      { featureType: 'road.local', stylers: [{ saturation: -100 }, { lightness: 40 }, { visibility: 'on' }] },
      { featureType: 'transit', stylers: [{ saturation: -100 }, { visibility: 'simplified' }] },
      { featureType: 'administrative.province', stylers: [{ visibility: 'off' }] },
      { featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'on' }, { lightness: -25 }, { saturation: -100 }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ hue: '#c7d6dd' }, { lightness: -25 }, { saturation: -97 }] }];

    // Single outer CW route to pass through each point
    // Used for network lines
    // TODO: create logic to generate network map dynamically
    // based on nearest neighbors
    // TODO:  create loops for outer CCW, inner CW & CCW
    // (can calc distance & compare to find shortest route)
    var route = [
      getByName(serverLocs, 'Atlanta'),
      getByName(serverLocs, 'Dallas'),
      getByName(serverLocs, 'Los Angeles'),
      getByName(serverLocs, 'Seattle'),
      getByName(serverLocs, 'Chicago'),
      getByName(serverLocs, 'New York'),
      getByName(serverLocs, 'Washington DC'),
      getByName(serverLocs, 'Atlanta'),
      getByName(serverLocs, 'Miami'),
      getByName(serverLocs, 'Dallas'),
    ];

    // Load map
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    $scope.map.set('styles', mapStyles);

    // Place markers on map
    for (var i = 0; i < serverLocs.length; i++) {
      createMarker(serverLocs[i], $scope.map);
    }

    // Place intial network lines on map
    primaryNetworkline = createNetworkLine(route, '#FF1A1A', 2);
    primaryNetworkline.setMap($scope.map);

    // Place distance markers on map
    for (var j = 0; j < (route.length - 1); j++) {
      placeDistance($scope.map, route[j], route[(j + 1)]);
    }

    // For map interactivity (accept client / server pairs & plot):
    $scope.pair = {};
    $scope.serverLocs = serverLocs;
    $scope.clientServerPairs = MapSvc.getPairs();
    $scope.clientMarkers = [];
    $scope.clientToServerLines = [];

    // When a new client / server pair is submitted,
    // geocode client address, map it & call MapSvc to save to local storage
    $scope.onSubmit = function () {
      var clientLoc = {};
      var closestServer = {};
      var clientToServerPath = [];
      var serverToServer = [];

      $http({
        method: 'GET',
        url: geocodeUrl + '?address=' + $scope.pair.client + '&key=' + googleMapsAPI_KEY,
      }).then(function successCallback(response) {
        clientLoc = {
          lat: response.data.results[0].geometry.location.lat,
          lng: response.data.results[0].geometry.location.lng,
          name: '', // TODO:  set these values!
          address: '', // TODO:  set these values!
        };

        // clear any existing clientMarkers & clientToServerPaths
        if ($scope.clientMarker != null) {
          $scope.clientMarker.setMap(null);
        }

        if ($scope.clientToServerLine != null) {
          $scope.clientToServerLine.setMap(null);
        }

        // add clientLoc info from $http call to $scope.pair
        $scope.pair.clientLoc = {
          lat: clientLoc.lat,
          lng: clientLoc.lng,
        };

        $scope.clientMarker = createMarker(clientLoc, $scope.map);

        // Find closest server & set line
        clientToServerPath.push(clientLoc);
        closestServer = findClosestServer(clientLoc.lat, clientLoc.lng);
        clientToServerPath.push(closestServer);

        if (closestServer.name != $scope.pair.server) {
          serverToServer = createRouteServerToServer(closestServer.name, $scope.pair.server, route).pts;
          // get dist as well
          clientToServerPath = clientToServerPath.concat(serverToServer);
        }

        // Add clientToServerPath (array of pts) to $scope.pair
        // Create & place line
        $scope.pair.clientToServerPath = clientToServerPath;
        $scope.clientToServerLine = createNetworkLine(clientToServerPath, '#0024F2', 3);
        $scope.clientToServerLine.setMap($scope.map);

        // Save $scope.pair via MapSvc; refresh $scope
        MapSvc.addPair($scope.pair);
        refresh();
      }, function errorCallback(response) {
        return response.status(200).json(data);
      });
    };

    $scope.viewPair = function (idx) {
      var currentPair = MapSvc.viewPair(idx);

      // Clear any existing markers & path
      if ($scope.clientMarker != null) {
        $scope.clientMarker.setMap(null);
      }

      if ($scope.clientToServerLine != null) {
        $scope.clientToServerLine.setMap(null);
      }

      // Set marker & path for currentPair
      $scope.clientMarker = createMarker(currentPair.clientLoc, $scope.map);
      $scope.clientToServerLine = createNetworkLine(currentPair.clientToServerPath, '#0024F2', 3);
      $scope.clientToServerLine.setMap($scope.map);
    };

    $scope.deletePair = function (idx) {
      MapSvc.deletePair(idx);
      refresh();
    };
  })
  .service('MapSvc', function () {
    var clientServerPairs = [];

    this.addPair = function (pair) {
      clientServerPairs.push({
        client: pair.client,
        server: pair.server,
        clientLoc: pair.clientLoc,
        clientToServerPath: pair.clientToServerPath,
      });

      var str = JSON.stringify(clientServerPairs);
      localStorage.setItem('clientServerPairs', str);
    };

    this.getPairs = function () {
      var str = localStorage.getItem('clientServerPairs');
      clientServerPairs = JSON.parse(str) || clientServerPairs;
      return clientServerPairs;
    };

    this.viewPair = function (pIndex) {
      var str = localStorage.getItem('clientServerPairs', str);
      clientServerPairs = JSON.parse(str);
      return clientServerPairs[pIndex];
    };

    this.deletePair = function (pIndex) {
      clientServerPairs.splice(pIndex, 1);
      var str = JSON.stringify(clientServerPairs);
      localStorage.setItem('clientServerPairs', str);
    };
  });

// ****************************************************************
// GET BY NAME ****************************************************
// Loop over array of objects to find with matching name (i.e. Atlanta, Miami...)
var getByName = function (arr, value) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].name === value) return arr[i];
  } //TODO:  create case for else?
};

// CREATE MARKER ***************************************************
var createMarker = function (info, map) {
  var infoWindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    position: { lat: info.lat, lng: info.lng },
    map: map,
    title: info.name,
  });

  marker.content = '<div class="infoWindowContent">' + info.address + '</div>';

  google.maps.event.addListener(marker, 'click', function(){
    infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
    infoWindow.open(map, marker);
  });

  return marker;
};

// CREATE NETWORK LINE ***********************************************
// Create "network" connections between array of points
var createNetworkLine = function (pts, color, strokeWeight) {
  var networkCoordinates = [];

  for (var i = 0; i < pts.length; i++) {
    networkCoordinates.push({ lat: pts[i].lat, lng:pts[i].lng });
  }

  var networkLine = new google.maps.Polyline({
    path: networkCoordinates,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: strokeWeight,
  });

  return networkLine;
};

// PLACE DISTANCE *****************************************************
// Adds distance label to polyline at half way point
var placeDistance = function (map, pt1, pt2) {
  var inBetween = {};
  var latLng1 = new google.maps.LatLng(pt1.lat, pt1.lng);
  var latLng2 = new google.maps.LatLng(pt2.lat, pt2.lng);

  // get the point half-way between the two markers
  inBetween = google.maps.geometry.spherical.interpolate(latLng1, latLng2, 0.5);

  // calculate distance between two points
  var dist = distance(pt1.lat, pt1.lng, pt2.lat, pt2.lng);

  // place mapLabel on map
  var mapLabel = new MapLabel({
    text: dist + ' mi',
    position: inBetween,
    map: map,
    fontSize: 20,
  });

  mapLabel.set('position', inBetween);
};

// FIND CLOSEST SERVER ***********************************************
var findClosestServer = function (clientLat, clientLng) {
  var closestServer = {};
  var calcDist = [];
  var closestDist = 0;
  var closestServer = {};

  // get all distances
  for (var i = 0; i < serverLocs.length; i++) {
    var serverLoc = serverLocs[i];
    calcDist[i] = distance(clientLat, clientLng, serverLoc.lat, serverLoc.lng);
    if (i == 0) {
      closestDist = calcDist[i];
      closestServer = serverLoc;
    } else {
      if (calcDist[i] < closestDist) {
        closestDist = calcDist[i];
        closestServer = serverLocs[i];
      }
    }
  }
  return closestServer;
};

// CREATE ROUTE FOR SERVER TO SERVER ***********************************************
// TODO:  implement logic for shortest route
// calculates the distance between server1 & server2
// return array of pts from server1 to server 2
var createRouteServerToServer = function (server1, server2, route) {
  var server2Match = false;
  var routeDist = 0;
  var pt1 = {};
  var pt2 = {};
  var pts = [];
  var data = {};

  for (var i = 0; i < route.length; i++) {
    if (server1 === route[i].name) {
      pt1 = route[i];

      for (var j = i + 1; j < route.length; j++) {
        pt2 = route[j];
        routeDist += distance(pt1.lat, pt1.lng, pt2.lat, pt2.lng);
        pts.push(pt1);

        if (server2 === route[j].name) {
          server2Match = true;
          break;
        } else {
          pt1 = pt2;
        }

        // start loop over if a server2Match has not been found and on last item
        if (!server2Match && j === (route.length - 1)) j = 0;
      }
    }
  }

  pts.push(pt2);

  console.log('and the total distance is... ', routeDist);
  // return pts;

  data = {
    pts: pts,
    dist: routeDist,
  };

  return data;

};
