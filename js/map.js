// map.js *****************************************************************
// Initializes Google map, drops points for service locations (pops)
// Calculates distance and draws lines between pops
// Adds new marker based on user input
// Creates dynamic drop-down menu based on service locations
angular.module('mapsApp', [])
  .controller('MapCtrl', function ($scope, MapSvc) {
    $scope.clientServerPairs = MapSvc.getPairs();

    // Map Variables:
    var usaLat = 37.09024;
    var usaLong = -95.712891;
    var usaLatlng = new google.maps.LatLng(usaLat, usaLong);
    var mapOptions = {
        zoom : 4,
        center : usaLatlng
    };

    // Single CW route to pass through each point
    // Used for network lines
    var route = [
      getByName(serverLocs, "Atlanta"),
      getByName(serverLocs, "Dallas"),
      getByName(serverLocs, "Los Angeles"),
      getByName(serverLocs, "Seattle"),
      getByName(serverLocs, "Chicago"),
      getByName(serverLocs, "New York"),
      getByName(serverLocs, "Washington DC"),
      getByName(serverLocs, "Atlanta"),
      getByName(serverLocs, "Miami"),
      getByName(serverLocs, "Dallas")
    ];

    // Load map & geocoder
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    $scope.geocoder = new google.maps.Geocoder();
    
    // Place markers on map
    for (var i=0; i<serverLocs.length; i++){
      createMarker(serverLocs[i], $scope.map);
    }

    // Place intial network lines on map
    for (var i=0; i<(route.length-1); i++){
      createNetworkLine($scope.map, route[i], route[(i + 1)], 'red', true);
    }
    
    // Create dynamic drop down menu for serverLocs
    document.getElementById("serverNames").options[0]=new Option("Please select an address");
    for (var i = 0; i < serverLocs.length; i++) {
      var serverLoc = serverLocs[i];
      document.getElementById("serverNames").options[ i + 1 ]=new Option(serverLoc.name);
    }  

    // Add event listener to submit button
    document.getElementById('submit').addEventListener('click', function() {
      var clientAddress = document.getElementById('clientAddress').value;
      var serverOptions = document.getElementById('serverNames');
      var serverName = serverOptions.options[serverOptions.selectedIndex].value;

      geocodeAddress($scope.geocoder, $scope.map, route, clientAddress, serverName);
      MapSvc.addPair(clientAddress, serverName);
      //appendToClientServerPairs(clientServerPairs);
    });

  })
  .service("MapSvc", function(){
    var clientServerPairs = [];

    this.addPair = function (clientAddress, serverName) {
      clientServerPairs.push({'clientAddress': clientAddress, 'serverName': serverName});
      var str = JSON.stringify(clientServerPairs);
      localStorage.setItem("clientServerPairs",str);
    }

    this.getPairs = function(){
      var str = localStorage.getItem("clientServerPairs");
      clientServerPairs = JSON.parse(str) || clientServerPairs;
      return clientServerPairs;
    }


  });  

// ****************************************************************
// GET BY NAME ****************************************************
// Loop over array of objects to find with matching name (i.e. Atlanta, Miami...)
var getByName = function (arr, value) {
  for (var i=0; i<arr.length; i++) {
    if (arr[i].name == value) return arr[i];
  };
};

// CREATE MARKER ***************************************************
var createMarker = function (info, map) {
  var infoWindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    position: {lat: info.lat, lng: info.lng},
    map: map,
    title: info.name,
  });

  marker.content = '<div class="infoWindowContent">' + info.address + '</div>';

  google.maps.event.addListener(marker, 'click', function(){
    infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
    infoWindow.open(map, marker);
  });
};

// CREATE NETWORK LINE ***********************************************
// Create "network" connections between two points
// Calculate the distance between two points
// Add distance value to map if distOn is true
var createNetworkLine = function (map, pt1, pt2, color, distOn) {
  var latLng1 = new google.maps.LatLng(pt1.lat, pt1.lng);
  var latLng2 = new google.maps.LatLng(pt2.lat, pt2.lng);

  var networkCoordinates = [
    {lat: pt1.lat, lng: pt1.lng},
    {lat: pt2.lat, lng: pt2.lng},
  ];

  var networkPath = new google.maps.Polyline({
    path: networkCoordinates,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });

  networkPath.setMap(map);

  if(distOn){
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
}

// GEOCODE ADDRESS ***************************************************** 
// Translate client address string to lat / lng & place marker)
// Call findClosestServer() & createNetworkLine to that server
var geocodeAddress = function (geocoder, map, route, clientAddress, finalServerName) {
  geocoder.geocode({'address': clientAddress}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      clientLoc = {
        lat : results[0].geometry.location.lat(),
        lng : results[0].geometry.location.lng(),
        address : clientAddress
      };

      createMarker(clientLoc, map);

      // Find closest server & set line
      closestServer = findClosestServer(clientLoc.lat, clientLoc.lng);
      createNetworkLine(map, clientLoc, closestServer, 'green', false);

      if(closestServer.name != finalServerName){
        createRouteServerToServer(closestServer.name, finalServerName, map, route);
      };

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    };
  });
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
      };
    };
  }; 
  return closestServer;
};

// CREATE ROUTE FOR SERVER TO SERVER ***********************************************
// TODO:  implement logic for shortest route
// calculates the distance between server1 & server2
// plots "network" connections between server1 & server2
var createRouteServerToServer = function (server1, server2, map, route) {
  var server2Match = false;
  var routeDist = 0;
  var pt1 = {};
  var pt2 = {};

  for(var i=0; i<route.length; i++){
    if (server1 == route[i].name) {
      pt1 = route[i];

      for(var j=i+1; j<route.length; j++){
        pt2 = route[j];
        routeDist += distance(pt1.lat, pt1.lng, pt2.lat, pt2.lng);
        createNetworkLine(map, pt1, pt2, "green", false);

        if(server2 == route[j].name){
          server2Match = true;
          break;
        } else {
          pt1 = pt2;
        }

        // start loop over if a server2Match has not been found and on last item
        if(!server2Match && j == (route.length - 1)){
          j = 0;
        };
      };
    };
  };
  console.log('and the total distance is... ', routeDist); 
};

// APPEND TO CLIENT SERVER PAIRS
/*function appendToClientServerPairs(clientServerPairs){
  var clientAddress = document.getElementById('clientAddress').value;
  var serverOptions = document.getElementById('serverNames');
  var serverName = serverOptions.options[serverOptions.selectedIndex].value;

  clientServerPairs.push({
    serverName: serverName,
    clientAddress: clientAddress
  });

  var btnId = 'btn' + (clientServerPairs.length - 1);

  var newRow = "<tr><td>" + serverName + "</td><td>" + clientAddress + "</td>";
  newRow += "<td><button class='btn btn-primary' id="+ btnId + ">View</button></td></tr>"

  var div = document.getElementById('clientServerPairs');

  div.innerHTML = div.innerHTML + newRow;

  document.getElementById(btnId).addEventListener('click', function() {
    clearAndReRoute(btnId, clientServerPairs);
  });
}

function clearAndReRoute(btnId, clientServerPairs){
  console.log("i was clicked!");
  console.log('btnId: ', btnId);
  console.log('clientServerPairs', clientServerPairs);



}*/







    
