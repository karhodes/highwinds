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

    // Routes for network lines
    // TODO: create logic to generate network map dynamically
    // based on nearest neighbors
    var outerCwRoute = [
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

    var outerCcwRoute = outerCwRoute.slice();
    outerCcwRoute.reverse();
    var innerCwRoute = outerCwRoute.slice(0,8); // remove Miami, Dallas
    var innerCcwRoute = innerCwRoute.slice();
    innerCcwRoute.reverse();

    var routes = [outerCwRoute, outerCcwRoute, innerCwRoute, innerCcwRoute];

    // Load map
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    $scope.map.set('styles', mapStyles);

    // Place markers on map
    for (var i = 0; i < serverLocs.length; i++) {
      createMarker(serverLocs[i], $scope.map);
    }

    // Place intial network lines on map
    primaryNetworkline = createNetworkLine(outerCwRoute, '#FF1A1A', 2);
    primaryNetworkline.setMap($scope.map);

    // Place distance markers on map
    for (var j = 0; j < (outerCwRoute.length - 1); j++) {
      placeDistance($scope.map, outerCwRoute[j], outerCwRoute[(j + 1)]);
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
      var closestServerData = {};
      var serverToServerPts = [];
      var serverToServerData = {};
      var routeDist = 0;

      $http({
        method: 'GET',
        url: geocodeUrl + '?address=' + $scope.pair.client + '&key=' + googleMapsAPI_KEY,
      }).then(function successCallback(response) {
        clientLoc = {
          lat: response.data.results[0].geometry.location.lat,
          lng: response.data.results[0].geometry.location.lng,
          name: 'Client Location', 
          address: response.data.results[0].formatted_address,
        };

        $scope.pair.client = response.data.results[0].formatted_address;

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
        closestServerData = findClosestServer(clientLoc.lat, clientLoc.lng);
        closestServer = closestServerData.closestServer;
        routeDist += closestServerData.dist;
        clientToServerPath.push(closestServer);

        if (closestServer.name != $scope.pair.server) {
          serverToServerData = createRouteServerToServer(closestServer.name, $scope.pair.server, routes);
          serverToServerPts = serverToServerData.pts;
          routeDist += serverToServerData.dist;
          clientToServerPath = clientToServerPath.concat(serverToServerPts);
        }

        $scope.pair.dist = routeDist;

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
      var currentPair = MapSvc.viewPair(idx);

      MapSvc.deletePair(idx);
      refresh();
    };

    $scope.clearMap = function(){
      // Clear any existing markers & path
      if ($scope.clientMarker != null) {
        $scope.clientMarker.setMap(null);
      }

      if ($scope.clientToServerLine != null) {
        $scope.clientToServerLine.setMap(null);
      }

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
        dist: pair.dist,
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
    zIndex: 100,
  });

  mapLabel.set('position', inBetween);
};

// FIND CLOSEST SERVER ***********************************************
var findClosestServer = function (clientLat, clientLng) {
  var closestServer = {};
  var calcDist = [];
  var closestDist = 0;
  var closestServer = {};
  var data = {};

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

  data = {
    dist: closestDist,
    closestServer: closestServer,
  };

  return data;
};

// CREATE ROUTE FOR SERVER TO SERVER ***********************************************
// TODO:  implement logic for shortest route
// calculates the distance between server1 & server2
// return array of pts from server1 to server 2
var createRouteServerToServer = function (server1, server2, routes) {
  var server2Match = false;
  var routeDist = 0;
  var pt1 = {};
  var pt2 = {};
  var pts = [];
  var data = {};
  var routeCalcs = [];
  var route = [];
  var minDist = 0;
  var minIndex = 0;
  var popRoutes = routes.slice();

  // case if start or end server is Miami 
  // (basically routes[2] & route[3] will loop indefinetly)
  if (server1 == 'Miami' || server2 == 'Miami') popRoutes.splice(2,2);

  // Loop over all potential routes
  for (var k = 0; k < popRoutes.length; k++) {
    route = popRoutes[k];

    // Loop over all pops in route
    for (var i = 0; i < route.length; i++) {  
      
      // Find the index in route where server1 is a match
      // Set pt1 equal to that item
      if (server1 === route[i].name) {
        pt1 = route[i];

        // Continue looping  over route starting at the next item
        // Add the distance to the total distance
        // push the point into the points array
        for (var j = i + 1; j < route.length; j++) {
          pt2 = route[j];
          routeDist += distance(pt1.lat, pt1.lng, pt2.lat, pt2.lng);
          pts.push(pt1);

          // Look for a match on the server2 name
          // Break out of the loop if a match
          // otherwise, reset pt1 to pt2 to continue the loop
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

    data = {
      pts: pts.slice(),
      dist: routeDist,
    };

    routeCalcs.push(data);

    // reset server2Match, routeDist & pts
    routeDist = 0;
    pts = [];
    pt1 = {};
    pt2 = {};
    server2Match = false;
  }

  minDist = routeCalcs[0].dist;

  for (var x = 0; x < routeCalcs.length; x++) {
    if (routeCalcs[x].dist < minDist) {
      minDist = routeCalcs[x].dist;
      minIndex = x;
    }  
  }

  return routeCalcs[minIndex];
};
