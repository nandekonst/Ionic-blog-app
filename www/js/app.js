
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var App = angular.module('starter', ['ionic', 'ngCordova']);


App.service("getData", function ($http, $log, $cordovaLocalNotification, $ionicPlatform) {

  var service = this;

  var JexiaClient = window.jexiaClientBrowser.JexiaClient;

  this.getBlog = function () {

    var client;
    
   

		 return client = new JexiaClient({
        appId: '97bf9520-e9d1-11e5-9c1d-337c49e0a8d3',
        appKey: '4520c79f162cdaa8bc2f8367d7dbffec',
        appSecret: '7acf5d40cfd3ebd30e7323b4185c950284f15dd4ec7c163b'
      }).then(function (app) {
        // you can start interacting with your app
        var posts = app.dataset('posts');

        posts.subscribe("*", function (message) {
          service.notify(message);
        });

        return posts.list().then(function (posts) {
          //posts array
          return posts;
        });

    });

  } // end of getBlog function

  this.notify = function (message) {

    $cordovaLocalNotification.add({
      id: 1,
      text: 'A new post from was added',
      title: 'New post from:',
    })
      .then(function () {
        //alert("Instant Notification set");
      });
       
  }

})

App.controller("AppCtrl", ["$scope", "getData", function ($scope, getData) {

  $scope.refresh = function () {

    getData.getBlog().then(function (data) {
      $scope.posts = data;
         $scope.$broadcast("scroll.refreshComplete");

      //$scope.$apply();
    });


  }

  $scope.refresh();


}]);
