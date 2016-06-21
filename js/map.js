// initializes Google map, drops points for service locations (pops), 
// calculates distance and draws lines between pops
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
  setNetworkLine(map, serverLocs[0], serverLocs[1]); // NY to DC
  setNetworkLine(map, serverLocs[1], serverLocs[2]); // DC to Atl
  setNetworkLine(map, serverLocs[2], serverLocs[7]); // Atl to Mia
  setNetworkLine(map, serverLocs[2], serverLocs[3]); // Atl to DFW
  setNetworkLine(map, serverLocs[3], serverLocs[7]); // DFW to Mia
  setNetworkLine(map, serverLocs[3], serverLocs[4]); // DFW to LAX
  setNetworkLine(map, serverLocs[4], serverLocs[6]); // LAX to Seattle
  setNetworkLine(map, serverLocs[6], serverLocs[5]); // Seattle to Chicago
  setNetworkLine(map, serverLocs[5], serverLocs[0]); // Chicago to NYC

  // create markers for points of presence (serverLocs)
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

  // create "network" connections
  function setNetworkLine(map, pt1, pt2){
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
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    networkPath.setMap(map);

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

google.maps.event.addDomListener(window, 'load', initialize);

