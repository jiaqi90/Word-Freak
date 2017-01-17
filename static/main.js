(function () {

  'use strict';

  angular.module('WordcountApp', [])

  .controller('WordcountController', ['$scope', '$log', '$http', '$timeout',
    function($scope, $log, $http, $timeout) {

    $scope.submitButtonText = 'Submit';
    $scope.loading = false;
    $scope.urlerror = false;
    $scope.showSearchResults = false;
    $scope.countDirection = true //high to low;
    $scope.alphabeticalDirection = true; //A-Z;
    $scope.wordToSearch = null;
    $scope.wordSearchFreq = 0;

    $scope.getResults = function() {

      $log.log('test');

      // get the URL from the input
      var userInput = $scope.url;

      // fire the API request
      $http.post('/start', {'url': userInput}).
        success(function(results) {
          $log.log(results);
          getWordCount(results);
          $scope.wordcounts = null;
          $scope.loading = true;
          $scope.submitButtonText = 'Loading...';
          $scope.urlerror = false;
        }).
        error(function(error) {
          $log.log(error);
        });

    };

    $scope.showSearch = function(){
      if($scope.wordToSearch){
        $scope.showSearchResults = true;
        if($scope.wordcounts && $scope.wordcounts.length > 0){
          var found = false;
          $scope.wordcounts.forEach(function(element) {
            if(element[0] == $scope.wordToSearch){
              $scope.wordSearchFreq = element[1];
              found = true;
            }
          });
          if(!found){
            $scope.wordSearchFreq = 0;
          }
        }
      }
      console.log($scope.wordToSearch);
      console.log($scope.wordSearchFreq);
    };

    $scope.sortByResultsByCount = function(){
      if($scope.wordcounts.length > 0){
        //high to low sorted then change to low to high
        if($scope.countDirection){
          $scope.wordcounts = $scope.wordcounts.sort(sortIncreasing);
        }
        //low to high sorted, change to high to low
        else{
          $scope.wordcounts = $scope.wordcounts.sort(sortDecreasing);
        }
        $scope.countDirection = !$scope.countDirection;
      }
    }

    $scope.sortByResultsName = function(){
      if($scope.wordcounts.length > 0){
        //current A-Z, go from Z-A
        if($scope.alphabeticalDirection){
          $scope.wordcounts = $scope.wordcounts.sort(sortAlphabetical);
        }
        //current Z-A, go from A-Z
        else{
          $scope.wordcounts = $scope.wordcounts.sort(sortReverseAlphabetical);
        }
        $scope.alphabeticalDirection = !$scope.alphabeticalDirection;
      }
    }

    function sortIncreasing(a, b) {
      if (a[1] === b[1]) {
          return 0;
      }
      else {
          return (a[1] < b[1]) ? -1 : 1;
      }
    }

    function sortDecreasing(a, b) {
      if (a[1] === b[1]) {
          return 0;
      }
      else {
          return (a[1] > b[1]) ? -1 : 1;
      }
    }

    function sortAlphabetical(a, b) {
      if (a[0] === b[0]) {
          return 0;
      }
      else {
          return (a[0] < b[0]) ? -1 : 1;
      }
    }

    function sortReverseAlphabetical(a, b) {
      if (a[0] === b[0]) {
          return 0;
      }
      else {
          return (a[0] > b[0]) ? -1 : 1;
      }
    }

    function getWordCount(jobID) {

      var timeout = '';

      var poller = function() {
        // fire another request
        $http.get('/results/'+jobID).
          success(function(data, status, headers, config) {
            if(status === 202) {
              $log.log(data, status);
            } else if (status === 200){
              $log.log(data);
              $scope.loading = false;
              $scope.submitButtonText = "Submit";
              $scope.wordcounts = data;
              $timeout.cancel(timeout);
              return false;
            }
            // continue to call the poller() function every 2 seconds
            // until the timeout is cancelled
            timeout = $timeout(poller, 2000);
          }).
          error(function(error) {
            $log.log(error);
            $scope.loading = false;
            $scope.submitButtonText = "Submit";
            $scope.urlerror = true;
          });
      };

      poller();

    }

  }
  ]);

}());
