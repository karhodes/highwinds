// Angular app for client / server location form
angular.module("locApp",[])
  .controller("ClientLocCtrl",function($scope, clientLocSvc){
    console.log("ClientLocCtrl loaded");

    $scope.data = {
      repeatSelect: null,
      serverLocs: serverLocs
     };

    $scope.onSubmit = function(){
      console.log("i was clicked!");
    }

  }) // clientLocCtrl

  .service("clientLocSvc",function(){
    console.log("clientLocSvc loaded");

  }) // closes clientLocSvc 