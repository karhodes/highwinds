console.log('js loaded');

function initialize() {
  // create new google map
  var usaLat = 37.09024;
  var usaLong = -95.712891;
  var usaLatlng = new google.maps.LatLng(usaLat, usaLong);
  var mapOptions = {
      zoom : 4,
      center : usaLatlng
  };
  var map = new google.maps.Map(document.getElementById('map'),
    mapOptions);

  setMarkers(map);
  setNetwork(map);

  // create markers for points of presence (pops)
  function setMarkers(map){
    var shape = {
      coords: [1, 1, 1, 20, 18, 20, 18, 1],
      type: 'poly'
    };

    for (var i = 0; i < pops.length; i++) {
      var pop = pops[i];
      var marker = new google.maps.Marker({
        position: {lat: pop[1], lng: pop[2]},
        map: map,
        shape: shape,
        title: pop[0],
      });
    };  
  };

  // create "network" connections
  function setNetwork(map){
    var networkCoordinates1 = [
      {lat: pops[0][1], lng: pops[0][2]}, // New York
      {lat: pops[1][1], lng: pops[1][2]}, // DC
      {lat: pops[2][1], lng: pops[2][2]}, // Atlanta
      {lat: pops[7][1], lng: pops[7][2]}, // Miami
      {lat: pops[3][1], lng: pops[3][2]}, // Dallas
      {lat: pops[4][1], lng: pops[4][2]}, // LAX
      {lat: pops[6][1], lng: pops[6][2]}, // Seattle
      {lat: pops[5][1], lng: pops[5][2]}, // Chicago
      {lat: pops[0][1], lng: pops[0][2]}, // New York
    ];

    var networkPath1 = new google.maps.Polyline({
      path: networkCoordinates1,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    var networkCoordinates2 = [
      {lat: pops[2][1], lng: pops[2][2]}, // Atlanta
      {lat: pops[3][1], lng: pops[3][2]}, // Dallas
    ];

    var networkPath2 = new google.maps.Polyline({
      path: networkCoordinates2,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

  networkPath1.setMap(map);
  networkPath2.setMap(map);
  };

  // calculate distances
  console.log(pops[0][0], ' to ', pops[1][0]);
  console.log(distance(pops[0][1], pops[0][2], pops[1][1], pops[1][1])); // NY to DC
  
  console.log(pops[1][0], ' to ', pops[2][0]);
  console.log(distance(pops[1][1], pops[1][2], pops[2][1], pops[2][1])); // DC to Atl
  
  console.log(pops[2][0], ' to ', pops[7][0]);
  console.log(distance(pops[2][1], pops[2][2], pops[7][1], pops[7][1])); // Atl to Mia
  
  console.log(pops[7][0], ' to ', pops[3][0]);
  console.log(distance(pops[7][1], pops[7][2], pops[3][1], pops[3][1])); // Mia to DFW
  
  console.log(pops[3][0], ' to ', pops[4][0]);
  console.log(distance(pops[3][1], pops[3][2], pops[4][1], pops[4][1])); // DFW to LAX
  
  console.log(pops[4][0], ' to ', pops[6][0]);
  console.log(distance(pops[4][1], pops[4][2], pops[6][1], pops[6][1])); // LAX to Seattle
  
  console.log(pops[6][0], ' to ', pops[5][0]);
  console.log(distance(pops[6][1], pops[6][2], pops[5][1], pops[5][1])); // Seattle to Chicago

  console.log(pops[5][0], ' to ', pops[0][0]);
  console.log(distance(pops[5][1], pops[5][2], pops[0][1], pops[0][1])); // Chicago to NYC

  console.log(pops[2][0], ' to ', pops[3][0]);
  console.log(distance(pops[2][1], pops[2][2], pops[3][1], pops[3][1])); // Atl to DFW

};

google.maps.event.addDomListener(window, 'load', initialize);

