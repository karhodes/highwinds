function initialize(){function e(e){for(var o=[["New York",40.741355,-74.003203],["Ashburn",39.016363,-77.459022],["Atlanta",33.755456,-84.39153],["Dallas",32.799852,-96.820433],["Los Angeles",34.047908,-118.255536],["Chicago",41.854159,-87.619014],["Seattle",47.6143,-122.3388],["Miami",25.782648,-80.193157]],a={coords:[1,1,1,20,18,20,18,1],type:"poly"},n=0;n<o.length;n++){var l=o[n];new google.maps.Marker({position:{lat:l[1],lng:l[2]},map:e,shape:a,title:l[0]})}}var o=37.09024,a=-95.712891,n=new google.maps.LatLng(o,a),l={zoom:4,center:n},t=new google.maps.Map(document.getElementById("map"),l);e(t)}console.log("js loaded"),google.maps.event.addDomListener(window,"load",initialize);
var pops=[["New York",40.741355,-74.003203],["Ashburn",39.016363,-77.459022],["Atlanta",33.755456,-84.39153],["Dallas",32.799852,-96.820433],["Los Angeles",34.047908,-118.255536],["Chicago",41.854159,-87.619014],["Seattle",47.6143,-122.3388],["Miami",25.782648,-80.193157]];