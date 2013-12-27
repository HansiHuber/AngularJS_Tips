'use strict';

//------------------------------------------------------------------- App
var tipApp = angular.module('tipApp', [
    'tipControllers',
    'tipServices',
    'tipFilters'
]);

//------------------------------------------------------------------- Controller
var tipControllers = angular.module('tipControllers', []);

tipControllers.controller('tipController', ['$scope', '$http', 'Tips',
    function ($scope, $http, Tips) {
        $scope.done = "Data loading...";
        $scope.nrMatches = 0;
        $scope.matches = [];
        $scope.teams = [];
        $scope.query = '';
        $scope.tippersSelected = [];
        Tips.getData()
            .then(function () {
                $scope.matches = Tips.matches;
                $scope.tippers = Tips.tippers;
                $scope.done = "Data loaded";
                $scope.nrMatches = $scope.matches.length;
                for (var i = 0; i < $scope.matches.length; i++) {
                    var match = $scope.matches[i];
                    //console.log(match.TeamA + ' - ' + match.TeamB);
                    if ($scope.teams.indexOf(match.TeamA) == -1) $scope.teams.push(match.TeamA);
                    if ($scope.teams.indexOf(match.TeamB) == -1) $scope.teams.push(match.TeamB);
                }
                $scope.teams.sort();
                $scope.tipperSelected($scope.tippers[0]);
            },
            function () {
                //error
            }
        );
        //$http.get('http://localhost:3000/tipsProxyXSS.php?URL=http://www.club97.net/lotto/Ranklist').success(function (data) {
        //    console.log('tipsProxyXSS: count=' + data.length);
        //});

        $scope.team2search = '';
        $scope.doHighlight = function (index) {
            var match = $scope.matches[index];
            return match.TeamA == $scope.team2search || match.TeamB == $scope.team2search;
        }

        $scope.tipOkColor = function (tip) {
            var style = {};
            if (!tip.Ok12X && !tip.OkExact) return style;
            var col = 'white';
            if (tip.Ok12X) col = 'orange';
            if (tip.OkExact) col = 'red';
            style['background-color'] = col;
            return style;
        }

        $scope.sortIcon = {};
        $scope.setSorter = function (col) {
            console.log('setSorter ' + col);
            $scope.sortIcon = {};
            if ($scope.sortCol == col) {
                $scope.sortCol = '-' + col;
                $scope.sortIcon[col] = 'img/down.png';
            }
            else if ($scope.sortCol == '-' + col) {
                $scope.sortCol = col;
                $scope.sortIcon[col] = 'img/up.png';
            }
            else {
                $scope.sortCol = col;
                $scope.sortIcon[col] = 'img/up.png';
            }
        }

        $scope.currentSequence = [];
        $scope.selectedGroup = '';
        $scope.doFilterGroup = false;
        $scope.selectedDate = '';
        $scope.doFilterDate = false;
        $scope.clearFilters = function () {
            $scope.doFilterGroup = false;
            $scope.doFilterDate = false;

        }
        $scope.showOnlyGroup = function (match) {
            $scope.clearFilters();
            $scope.doFilterGroup = true;
            if ($scope.selectedGroup == match.Gruppe) $scope.selectedGroup = '';
            else $scope.selectedGroup = match.Gruppe;
        }
        $scope.showOnlyDate = function (match) {
            $scope.clearFilters();
            $scope.doFilterDate = true;
            if ($scope.selectedDate == match.DatumString) $scope.selectedDate = '';
            else $scope.selectedDate = match.DatumString;
        }
        $scope.filterMatches = function (match) {
            var doFilter = true;
            if ($scope.doFilterGroup) {
                doFilter = $scope.selectedGroup.length == 0 || match.Gruppe == $scope.selectedGroup;
            }
            if ($scope.doFilterDate) {
                doFilter = $scope.selectedDate.length == 0 || match.DatumString == $scope.selectedDate;
            }
            return doFilter;
        }

        $scope.tipperSelected = function (tipper) {
            $scope.tippersSelected.push(tipper);
            var idx = $scope.tippers.indexOf(tipper);
            if (idx >= 0) {
                $scope.tippers.splice(idx, 1);
            }
        }
        $scope.tipperUnselected = function (tipper) {
            $scope.tippers.push(tipper);
            var idx = $scope.tippersSelected.indexOf(tipper);
            if (idx >= 0) {
                $scope.tippersSelected.splice(idx, 1);
            }
        }

        $scope.searchName='';
        $scope.showName = function (tipper) {
            return tipper.Name.toLowerCase().indexOf($scope.searchName.toLowerCase()) != -1;
        }

    }]);

//------------------------------------------------------------------- Services
var tipServices = angular.module('tipServices', ['ngResource']);

tipServices.factory('Tips', ['$resource',
    function ($resource) {
        var obj = {};
        obj.getData = function () {
            var deferred = $q.defer();
            $http.get('tipdata.json')
                .then(
                function (result) {
                    obj.matches = result.data.Matches;
                    obj.tippers = result.data.Tippers;
                    deferred.resolve();
                }
                ,
                function () {
                    deferred.reject(); //error - should never happen in this example
                }
            );
            return deferred.promise;
        }

        return obj;
    }]);

//------------------------------------------------------------------- Filters
var tipFilters = angular.module('tipFilters', []);

tipFilters.filter('storeSequence', function () {
    return function (items, scope) {
        scope.currentSequence = [];
        angular.forEach(items, function (item) {
            scope.currentSequence.push(item.Seq);
        });
        return items;
    };
});

tipFilters.filter('orderAndFilterTips', function () {
    return function (items, scope) {
        if (scope.currentSequence.length == 0) return items;
        var filtered = [];
        angular.forEach(scope.currentSequence, function (seq) {
            angular.forEach(items, function (item) {
                if (item.Seq == seq) {
                    filtered.push(item);
                }
            });
        });
        //filtered.sort(function (a, b) {
        //    return (a[field] > b[field]);
        //});
        //if (reverse) filtered.reverse();
        return filtered;
    };
});

