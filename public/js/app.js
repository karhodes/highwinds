function distance(a,t,h,M){var s=Math.PI*a/180,c=Math.PI*h/180,n=t-M,o=Math.PI*n/180,i=Math.sin(s)*Math.sin(c)+Math.cos(s)*Math.cos(c)*Math.cos(o);return i=Math.acos(i),i=180*i/Math.PI,i=60*i*1.1515}
function initialize(){function o(o){for(var p={coords:[1,1,1,20,18,20,18,1],type:"poly"},s=0;s<pops.length;s++){var l=pops[s];new google.maps.Marker({position:{lat:l[1],lng:l[2]},map:o,shape:p,title:l[0]})}}function p(o){var p=[{lat:pops[0][1],lng:pops[0][2]},{lat:pops[1][1],lng:pops[1][2]},{lat:pops[2][1],lng:pops[2][2]},{lat:pops[7][1],lng:pops[7][2]},{lat:pops[3][1],lng:pops[3][2]},{lat:pops[4][1],lng:pops[4][2]},{lat:pops[6][1],lng:pops[6][2]},{lat:pops[5][1],lng:pops[5][2]},{lat:pops[0][1],lng:pops[0][2]}],s=new google.maps.Polyline({path:p,geodesic:!0,strokeColor:"#FF0000",strokeOpacity:1,strokeWeight:2}),l=[{lat:pops[2][1],lng:pops[2][2]},{lat:pops[3][1],lng:pops[3][2]}],e=new google.maps.Polyline({path:l,geodesic:!0,strokeColor:"#FF0000",strokeOpacity:1,strokeWeight:2});s.setMap(o),e.setMap(o)}var s=37.09024,l=-95.712891,e=new google.maps.LatLng(s,l),n={zoom:4,center:e},t=new google.maps.Map(document.getElementById("map"),n);o(t),p(t),console.log(pops[0][0]," to ",pops[1][0]),console.log(distance(pops[0][1],pops[0][2],pops[1][1],pops[1][1])),console.log(pops[1][0]," to ",pops[2][0]),console.log(distance(pops[1][1],pops[1][2],pops[2][1],pops[2][1])),console.log(pops[2][0]," to ",pops[7][0]),console.log(distance(pops[2][1],pops[2][2],pops[7][1],pops[7][1])),console.log(pops[7][0]," to ",pops[3][0]),console.log(distance(pops[7][1],pops[7][2],pops[3][1],pops[3][1])),console.log(pops[3][0]," to ",pops[4][0]),console.log(distance(pops[3][1],pops[3][2],pops[4][1],pops[4][1])),console.log(pops[4][0]," to ",pops[6][0]),console.log(distance(pops[4][1],pops[4][2],pops[6][1],pops[6][1])),console.log(pops[6][0]," to ",pops[5][0]),console.log(distance(pops[6][1],pops[6][2],pops[5][1],pops[5][1])),console.log(pops[5][0]," to ",pops[0][0]),console.log(distance(pops[5][1],pops[5][2],pops[0][1],pops[0][1])),console.log(pops[2][0]," to ",pops[3][0]),console.log(distance(pops[2][1],pops[2][2],pops[3][1],pops[3][1]))}console.log("js loaded"),google.maps.event.addDomListener(window,"load",initialize);
var pops=[["New York",40.741355,-74.003203],["Ashburn",39.016363,-77.459022],["Atlanta",33.755456,-84.39153],["Dallas",32.799852,-96.820433],["Los Angeles",34.047908,-118.255536],["Chicago",41.854159,-87.619014],["Seattle",47.6143,-122.3388],["Miami",25.782648,-80.193157]];