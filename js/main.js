console.log('js loaded');

function initialize() {
  var usaLat = 37.09024;
  var usaLong = -95.712891;

  var usaLatlng = new google.maps.LatLng(usaLat, usaLong);
  var mapOptions = {
      zoom : 4,
      center : usaLatlng
  };

  var map = new google.maps.Map(document.getElementById('map'),
    mapOptions);

}

google.maps.event.addDomListener(window, 'load', initialize);

