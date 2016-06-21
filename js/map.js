// map.js *****************************************************************
// Initializes Google map, drops points for service locations (pops)
// Calculates distance and draws lines between pops
// Adds new marker based on user input
// Creates dynamic drop-down menu based on service locations
function initialize() {
  // Create new google map
  var usaLat = 37.09024;
  var usaLong = -95.712891;
  var usaLatlng = new google.maps.LatLng(usaLat, usaLong);
  var mapOptions = {
      zoom : 4,
      center : usaLatlng
  };
  var map = new google.maps.Map(document.getElementById('map'),
    mapOptions);
  var geocoder = new google.maps.Geocoder();

  setMarkers(map);
  setNetworkLine(map, serverLocs[0], serverLocs[1], 'red', true); // NY to DC
  setNetworkLine(map, serverLocs[1], serverLocs[2], 'red', true); // DC to Atl
  setNetworkLine(map, serverLocs[2], serverLocs[7], 'red', true); // Atl to Mia
  setNetworkLine(map, serverLocs[2], serverLocs[3], 'red', true); // Atl to DFW
  setNetworkLine(map, serverLocs[3], serverLocs[7], 'red', true); // DFW to Mia
  setNetworkLine(map, serverLocs[3], serverLocs[4], 'red', true); // DFW to LAX
  setNetworkLine(map, serverLocs[4], serverLocs[6], 'red', true); // LAX to Seattle
  setNetworkLine(map, serverLocs[6], serverLocs[5], 'red', true); // Seattle to Chicago
  setNetworkLine(map, serverLocs[5], serverLocs[0], 'red', true); // Chicago to NYC

  
  // Create dynamic drop down menu for serverLocs
  document.getElementById("serverAddress").options[0]=new Option("Please select an address");
  for (var i = 0; i < serverLocs.length; i++) {
    var serverLoc = serverLocs[i];
    document.getElementById("serverAddress").options[ i + 1 ]=new Option(serverLoc.name);
  }  

  // Add event listener to submit button
  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });
};

// SET MARKERS *********************************************************
// Create markers for points of presence (serverLocs)
// Loop through array of serverLocs
function setMarkers(map){
  var shape = {
    coords: [1, 1, 1, 20, 18, 20, 18, 1],
    type: 'poly'
  };

  for (var i = 0; i < serverLocs.length; i++) {
    var serverLoc = serverLocs[i];
    var marker = new google.maps.Marker({
      position: {lat: serverLoc.lat, lng: serverLoc.lng},
      map: map,
      shape: shape,
      title: serverLoc.name,
    });
  };  
};

// SET NETWORK LINE ***************************************************
// Create "network" connections between two points
// Calculate the distance between two points
// Add distance value to map
function setNetworkLine(map, pt1, pt2, color, distOn){
  var pt1Lat = pt1.lat;
  var pt1Long = pt1.lng;
  var pt2Lat = pt2.lat;
  var pt2Long = pt2.lng;

  latLng1 = new google.maps.LatLng(pt1Lat, pt1Long);
  latLng2 = new google.maps.LatLng(pt2Lat, pt2Long);

  var networkCoordinates = [
    {lat: pt1Lat, lng: pt1Long},
    {lat: pt2Lat, lng: pt2Long},
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
    var dist = distance(pt1Lat, pt1Long, pt2Lat, pt2Long);
    
    // place mapLabel on map
    var mapLabel = new MapLabel({
      text: dist + ' mi',
      position: inBetween,
      map: map,
      fontSize: 20,
    });

    mapLabel.set('position', inBetween);
  };
};

// GEOCODE ADDRESS ***************************************************** 
// Translate client address string to lat / lng & place marker)
// Call findClosestServer
function geocodeAddress (geocoder, resultsMap) {
  var clientAddress = document.getElementById('clientAddress').value;
  var serverOptions = document.getElementById('serverAddress');
  var serverValue = serverOptions.options[serverOptions.selectedIndex].value;
  console.log('serverValue: ', serverValue);

  geocoder.geocode({'address': clientAddress}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      clientLoc = {
        lat : results[0].geometry.location.lat(),
        lng : results[0].geometry.location.lng()
      }
      clientLat = results[0].geometry.location.lat();
      clientLng = results[0].geometry.location.lng();

      // Set new marker
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });

      // Find closest server & set line
      closestObj = findClosestServer(clientLoc.lat, clientLoc.lng);
      setNetworkLine(resultsMap, clientLoc, closestObj.server, 'green', false);

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

// FIND CLOSEST SERVER ***********************************************
function findClosestServer (lat, lng) {
  var closestServer = {};
  var calcDist = [];
  var closestDist = 0;
  var closestObj = {};

  // get all distances
  for (var i = 0; i < serverLocs.length; i++) {
    var serverLoc = serverLocs[i];
    calcDist[i] = distance(lat, lng, serverLoc.lat, serverLoc.lng);
  }; 

  // set the closest distance and server to the first item
  closestDist = calcDist[0];
  closestServer = serverLocs[0];

  // loop through to find the closest & update distance and server var's
  for (var i = 1; i < calcDist.length; i++) {
    if (calcDist[i] < closestDist){
      closestDist = calcDist[i];
      closestServer = serverLocs[i];
    };
  };

  closestObj = {
    dist : closestDist,
    server : closestServer
  }

  return closestObj;

};

// ON LOAD INITIALIZATION ************************************************
google.maps.event.addDomListener(window, 'load', initialize);

