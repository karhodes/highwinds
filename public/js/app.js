function distance(a,t,h,M){var n=Math.PI*a/180,s=Math.PI*h/180,c=t-M,o=Math.PI*c/180,i=Math.sin(n)*Math.sin(s)+Math.cos(n)*Math.cos(s)*Math.cos(o);return i=Math.acos(i),i=180*i/Math.PI,i=60*i*1.1515,i=Math.round(i)}
angular.module("mapsApp",[]).controller("MapCtrl",["$scope","$http","MapSvc",function(e,t,r){var a=function(){e.clientServerPairs=r.getPairs(),e.pair={}},n=37.09024,i=-95.712891,s=new google.maps.LatLng(n,i),l={zoom:4,center:s},o="https://maps.googleapis.com/maps/api/geocode/json",c="AIzaSyAH9qcwj9QQxgs9xEZylRLUVHO8_aojLEY",g=[{featureType:"landscape",stylers:[{saturation:-100},{lightness:65},{visibility:"on"}]},{featureType:"poi",stylers:[{saturation:-100},{lightness:51},{visibility:"simplified"}]},{featureType:"road.highway",stylers:[{saturation:-100},{visibility:"simplified"}]},{featureType:"road.arterial",stylers:[{saturation:-100},{lightness:30},{visibility:"on"}]},{featureType:"road.local",stylers:[{saturation:-100},{lightness:40},{visibility:"on"}]},{featureType:"transit",stylers:[{saturation:-100},{visibility:"simplified"}]},{featureType:"administrative.province",stylers:[{visibility:"off"}]},{featureType:"water",elementType:"labels",stylers:[{visibility:"on"},{lightness:-25},{saturation:-100}]},{featureType:"water",elementType:"geometry",stylers:[{hue:"#c7d6dd"},{lightness:-25},{saturation:-97}]}],p=[getByName(serverLocs,"Atlanta"),getByName(serverLocs,"Dallas"),getByName(serverLocs,"Los Angeles"),getByName(serverLocs,"Seattle"),getByName(serverLocs,"Chicago"),getByName(serverLocs,"New York"),getByName(serverLocs,"Washington DC"),getByName(serverLocs,"Atlanta"),getByName(serverLocs,"Miami"),getByName(serverLocs,"Dallas")];e.map=new google.maps.Map(document.getElementById("map"),l),e.map.set("styles",g);for(var v=0;v<serverLocs.length;v++)createMarker(serverLocs[v],e.map);primaryNetworkline=createNetworkLine(p,"#FF1A1A",2),primaryNetworkline.setMap(e.map);for(var v=0;v<p.length-1;v++)placeDistance(e.map,p[v],p[v+1]);e.pair={},e.serverLocs=serverLocs,e.clientServerPairs=r.getPairs(),e.clientMarkers=[],e.clientToServerLines=[],e.onSubmit=function(){var n={},i={},s=[],l=[];t({method:"GET",url:o+"?address="+e.pair.client+"&key="+c}).then(function(t){n={lat:t.data.results[0].geometry.location.lat,lng:t.data.results[0].geometry.location.lng,name:"",address:""},null!=e.clientMarker&&e.clientMarker.setMap(null),null!=e.clientToServerLine&&e.clientToServerLine.setMap(null),e.pair.clientLoc={lat:n.lat,lng:n.lng},e.clientMarker=createMarker(n,e.map),s.push(n),i=findClosestServer(n.lat,n.lng),s.push(i),i.name!=e.pair.server&&(l=createRouteServerToServer(i.name,e.pair.server,p),s=s.concat(l)),e.pair.clientToServerPath=s,e.clientToServerLine=createNetworkLine(s,"#0024F2",3),e.clientToServerLine.setMap(e.map),r.addPair(e.pair),a()},function(e){return e.status(200).json(data)})},e.viewPair=function(t){var a=r.viewPair(t);null!=e.clientMarker&&e.clientMarker.setMap(null),null!=e.clientToServerLine&&e.clientToServerLine.setMap(null),e.clientMarker=createMarker(a.clientLoc,e.map),e.clientToServerLine=createNetworkLine(a.clientToServerPath,"#0024F2",3),e.clientToServerLine.setMap(e.map)},e.deletePair=function(e){r.deletePair(e),a()}}]).service("MapSvc",function(){var e=[];this.addPair=function(t){e.push({client:t.client,server:t.server,clientLoc:t.clientLoc,clientToServerPath:t.clientToServerPath});var r=JSON.stringify(e);localStorage.setItem("clientServerPairs",r)},this.getPairs=function(){var t=localStorage.getItem("clientServerPairs");return e=JSON.parse(t)||e},this.viewPair=function(t){var r=localStorage.getItem("clientServerPairs",r);return e=JSON.parse(r),e[t]},this.deletePair=function(t){e.splice(t,1);var r=JSON.stringify(e);localStorage.setItem("clientServerPairs",r)}});var getByName=function(e,t){for(var r=0;r<e.length;r++)if(e[r].name==t)return e[r]},createMarker=function(e,t){var r=new google.maps.InfoWindow,a=new google.maps.Marker({position:{lat:e.lat,lng:e.lng},map:t,title:e.name});return a.content='<div class="infoWindowContent">'+e.address+"</div>",google.maps.event.addListener(a,"click",function(){r.setContent("<h2>"+a.title+"</h2>"+a.content),r.open(t,a)}),a},createNetworkLine=function(e,t,r){for(var a=[],n=0;n<e.length;n++)a.push({lat:e[n].lat,lng:e[n].lng});var i=new google.maps.Polyline({path:a,geodesic:!0,strokeColor:t,strokeOpacity:1,strokeWeight:r});return i},placeDistance=function(e,t,r){var a={},n=new google.maps.LatLng(t.lat,t.lng),i=new google.maps.LatLng(r.lat,r.lng);a=google.maps.geometry.spherical.interpolate(n,i,.5);var s=distance(t.lat,t.lng,r.lat,r.lng),l=new MapLabel({text:s+" mi",position:a,map:e,fontSize:20});l.set("position",a)},findClosestServer=function(e,t){for(var r={},a=[],n=0,r={},i=0;i<serverLocs.length;i++){var s=serverLocs[i];a[i]=distance(e,t,s.lat,s.lng),0==i?(n=a[i],r=s):a[i]<n&&(n=a[i],r=serverLocs[i])}return r},createRouteServerToServer=function(e,t,r){for(var a=!1,n=0,i={},s={},l=[],o=0;o<r.length;o++)if(e===r[o].name){i=r[o];for(var c=o+1;c<r.length;c++){if(s=r[c],n+=distance(i.lat,i.lng,s.lat,s.lng),l.push(i),t===r[c].name){a=!0;break}i=s,a||c!==r.length-1||(c=0)}}return l.push(s),console.log("and the total distance is... ",n),l};
function MapLabel(t){this.set("fontFamily","sans-serif"),this.set("fontSize",12),this.set("fontColor","#000000"),this.set("strokeWeight",4),this.set("strokeColor","#ffffff"),this.set("align","center"),this.set("zIndex",1e3),this.setValues(t)}MapLabel.prototype=new google.maps.OverlayView,window.MapLabel=MapLabel,MapLabel.prototype.changed=function(t){switch(t){case"fontFamily":case"fontSize":case"fontColor":case"strokeWeight":case"strokeColor":case"align":case"text":return this.drawCanvas_();case"maxZoom":case"minZoom":case"position":return this.draw()}},MapLabel.prototype.drawCanvas_=function(){var t=this.canvas_;if(t){var e=t.style;e.zIndex=this.get("zIndex");var a=t.getContext("2d");a.clearRect(0,0,t.width,t.height),a.strokeStyle=this.get("strokeColor"),a.fillStyle=this.get("fontColor"),a.font=this.get("fontSize")+"px "+this.get("fontFamily");var o=Number(this.get("strokeWeight")),i=this.get("text");if(i){o&&(a.lineWidth=o,a.strokeText(i,o,o)),a.fillText(i,o,o);var s=a.measureText(i),n=s.width+o;e.marginLeft=this.getMarginLeft_(n)+"px",e.marginTop="-0.4em"}}},MapLabel.prototype.onAdd=function(){var t=this.canvas_=document.createElement("canvas"),e=t.style;e.position="absolute";var a=t.getContext("2d");a.lineJoin="round",a.textBaseline="top",this.drawCanvas_();var o=this.getPanes();o&&o.mapPane.appendChild(t)},MapLabel.prototype.onAdd=MapLabel.prototype.onAdd,MapLabel.prototype.getMarginLeft_=function(t){switch(this.get("align")){case"left":return 0;case"right":return-t}return t/-2},MapLabel.prototype.draw=function(){var t=this.getProjection();if(t&&this.canvas_){var e=this.get("position");if(e){var a=t.fromLatLngToDivPixel(e),o=this.canvas_.style;o.top=a.y+"px",o.left=a.x+"px",o.visibility=this.getVisible_()}}},MapLabel.prototype.draw=MapLabel.prototype.draw,MapLabel.prototype.getVisible_=function(){var t=this.get("minZoom"),e=this.get("maxZoom");if(void 0===t&&void 0===e)return"";var a=this.getMap();if(!a)return"";var o=a.getZoom();return t>o||o>e?"hidden":""},MapLabel.prototype.onRemove=function(){var t=this.canvas_;t&&t.parentNode&&t.parentNode.removeChild(t)},MapLabel.prototype.onRemove=MapLabel.prototype.onRemove;
var serverLocs=[{name:"New York",address:"111 8th Ave, New York, NY 10011",lat:40.741355,lng:-74.003203},{name:"Washington DC",address:"21715 Filigree Ct., Ashburn VA 20147",lat:39.016363,lng:-77.459022},{name:"Atlanta",address:"56 Marietta St., Atlanta, GA 30303",lat:33.755456,lng:-84.39153},{name:"Dallas",address:"1950 Stemmons Frwy",lat:32.799852,lng:-96.820433},{name:"Los Angeles",address:"624 S. Grand Ave, Los Angeles, CA 90017",lat:34.047908,lng:-118.255536},{name:"Chicago",address:"350 E Cermak Rd, Chicago, IL 60616",lat:41.854159,lng:-87.619014},{name:"Seattle",address:"2001 Sixth Ave, Seattle WA, 98121",lat:47.6143,lng:-122.3388},{name:"Miami",address:"50 Northeast 9th Street, Miami, FL",lat:25.782648,lng:-80.193157}];