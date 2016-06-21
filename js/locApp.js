// Angular app for client / server location form
angular.module("locApp",[])
  .controller("ClientLocCtrl",function($scope, clientLocSvc){
    $scope.data = {
      repeatSelect: null,
      serverLocs: serverLocs
     };

     $scope.clientLoc = {};

    $scope.onSubmit = function(){
      console.log($scope.clientLoc);
      clientLocSvc.addClientLoc($scope.clientLoc);
      $scope.clientLoc = {};
    }

    $scope.clientLocArray = clientLocSvc.fetchAllClientLoc();

  }) // closes clientLocCtrl

  .service("clientLocSvc",function(){
    clientLocArray = [];

    this.addClientLoc = function(pItem){
      // take address and geocode to get lat & long
      console.log('pItem: ', pItem);
      /*request('http://api.giphy.com/v1/gifs/search?q=' + query.tags + '&api_key=' + giphy_key, function (err, response, body) {
      if (err) return res.status(500).json(err);

      const giphyObjects = JSON.parse(body).data;
      const formattedObjects = formatGifObjects(giphyObjects, query.tags);*/






      clientLocArray.push(pItem);
      var str = JSON.stringify(clientLocArray);
      localStorage.setItem("clientLocArray", str);
    }

    this.fetchAllClientLoc = function(){
      var str = localStorage.getItem("clientLocArray", str);
      clientLocArray = JSON.parse(str);
      return clientLocArray;
    }

  }) // closes clientLocSvc 