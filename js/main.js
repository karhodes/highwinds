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
  setNetworkLine(map, pops[0], pops[1]); // NY to DC
  setNetworkLine(map, pops[1], pops[2]); // DC to Atl
  setNetworkLine(map, pops[2], pops[7]); // Atl to Mia
  setNetworkLine(map, pops[2], pops[3]); // Atl to DFW
  setNetworkLine(map, pops[3], pops[7]); // DFW to Mia
  setNetworkLine(map, pops[3], pops[4]); // DFW to LAX
  setNetworkLine(map, pops[4], pops[6]); // LAX to Seattle
  setNetworkLine(map, pops[6], pops[5]); // Seattle to Chicago
  setNetworkLine(map, pops[5], pops[0]); // Chicago to NYC

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
  function setNetworkLine(map, pt1, pt2){
    var pt1Lat = pt1[1];
    var pt1Long = pt1[2];
    var pt2Lat = pt2[1];
    var pt2Long = pt2[2];

    latLng1 = new google.maps.LatLng(pt1Lat, pt1Long);
    latLng2 = new google.maps.LatLng(pt2Lat, pt2Long);

    var networkCoordinates = [
      {lat: pt1Lat, lng: pt1Long},
      {lat: pt2Lat, lng: pt2Long},
    ];

    var networkPath = new google.maps.Polyline({
      path: networkCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    networkPath.setMap(map);
    console.log(pt1[0], ' to ', pt2[0]);
    console.log(distance(pt1Lat, pt1Long, pt2Lat, pt2Long));

    // get the point half-way between the two markers
    inBetween = google.maps.geometry.spherical.interpolate(latLng1, latLng2, 0.5); 

    // calculate distance between two points
    var dist = distance(pt1Lat, pt1Long, pt2Lat, pt2Long);
    
    var mapLabel = new MapLabel({
      text: dist + ' mi',
      position: inBetween,
      map: map,
      fontSize: 20,
    });

    mapLabel.set('position', inBetween);



  };
};

google.maps.event.addDomListener(window, 'load', initialize);

