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

  // create markers for points of presence (pops)
  function setMarkers(map) {
    var pops = [
      ['New York', 40.741355, -74.003203],
      ['Ashburn', 39.016363, -77.459022],
      ['Atlanta', 33.755456, -84.39153],
      ['Dallas', 32.799852, -96.820433],
      ['Los Angeles', 34.047908, -118.255536],
      ['Chicago', 41.854159, -87.619014],
      ['Seattle', 47.6143, -122.3388],
      ['Miami', 25.782648, -80.193157],
    ];

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

}

google.maps.event.addDomListener(window, 'load', initialize);

