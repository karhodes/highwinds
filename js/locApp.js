// Angular app for client / server location form
angular.module("locApp",[])
  .controller("ClientLocCtrl",function($scope, clientLocSvc){
    console.log("ClientLocCtrl loaded");

    $scope.data = {
      repeatSelect: null,
      serverLocs: serverLocs
     };

     $scope.clientLoc = {};

    $scope.onSubmit = function(){
      console.log($scope.clientLoc);
      clientLocSvc.addClientLoc($scope.clientLoc);
      console.log('$scope.clientLoc inside onSubmit - ctrl: ', $scope.clientLoc);
      $scope.clientLoc = {};
    }

    $scope.clientLocArray = clientLocSvc.fetchAllClientLoc();

  }) // closes clientLocCtrl

  .service("clientLocSvc",function(){
    console.log("clientLocSvc loaded");

    clientLocArray = [];

    this.addClientLoc = function(pItem){
      console.log('this.addClientLoc touched');
      clientLocArray.push(pItem);
      console.log('clientLocArray: ', clientLocArray);
      var str = JSON.stringify(clientLocArray);
      localStorage.setItem("clientLocArray", str);
    }

    this.fetchAllClientLoc = function(){
      var str = localStorage.getItem("clientLocArray", str);
      clientLocArray = JSON.parse(str);
      return clientLocArray;
    }

  }) // closes clientLocSvc 