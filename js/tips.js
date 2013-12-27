'use strict';

//------------------------------------------------------------------- App
var tipApp = angular.module('tipApp', [
    'tipControllers',
    'tipServices',
    'tipFilters',
    'tipDirectives'
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
        Tips.get({}, function (data) {
                $scope.matches = data.Matches;
                $scope.tippers = data.Tippers;
                $scope.champ = data.Champ;
                $scope.semis = data.SemiTeams;
                $scope.extras = data.ExtraResults;
                $scope.teamsOut = data.TeamsOut;
                $scope.done = "Data loaded";
                $scope.nrMatches = $scope.matches.length;
                $scope.maxSeq = $scope.tippers[0].Tips.length;
                $scope.$watch('maxSeq', function (newValue, oldValue, scope) {
                    var curr = angular.copy(scope.tippersSelected);
                    scope.tippersSelected = [];
                    scope.tippersSelected = curr;
                 });
                $scope.maxSeq = 20;// <=====================================================
                for (var i = 0; i < $scope.matches.length; i++) {
                    var match = $scope.matches[i];
                    //console.log(match.TeamA + ' - ' + match.TeamB);
                    if ($scope.teams.indexOf(match.TeamA) == -1) $scope.teams.push(match.TeamA);
                    if ($scope.teams.indexOf(match.TeamB) == -1) $scope.teams.push(match.TeamB);
                }
                $scope.teams.sort();
                $scope.tipperSelected($scope.tippers[0]);
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

        $scope.searchName = '';
        $scope.showName = function (tipper) {
            return tipper.Name.toLowerCase().indexOf($scope.searchName.toLowerCase()) != -1;
        }

        $scope.styleResultClass = function (match) {
            return match.Shot < 0 ? 'tipDescrResultMissing' : 'tipDescrResult';
        }
        $scope.styleTipResultClass = function (tip) {
            var classes = [];
            classes.push('TippedResult');
            if (tip.OkExact) classes.push('Tipped3P');
            if (tip.Ok12X && !tip.OkExact) classes.push('Tipped1P');
            return classes;
        }
        $scope.styleTipSemiCorrectClass = function (team) {
            if ($scope.teamsOut.indexOf(team) != -1) return 'TippedTeamOut';
            var clazz = '';
            angular.forEach($scope.semis, function (item) {
                if (item.Name == team) {
                    clazz = 'TippedTeamCorrect';
                }
            });
            return clazz;
        }
        $scope.styleTipChampCorrectClass = function (team) {
            if ($scope.teamsOut.indexOf(team) != -1) return 'TippedTeamOut';
            if ($scope.champ.Name == team) return 'TippedTeamCorrect';
            return '';
        }

    }]);

//------------------------------------------------------------------- Services
var tipServices = angular.module('tipServices', ['ngResource']);

tipServices.factory('Tips', ['$resource',
    function ($resource) {
        return $resource('tipdata.json')
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

//------------------------------------------------------------------- Directives
var tipDirectives = angular.module('tipDirectives', []);

tipDirectives.directive('tipResult', function () {
    return{
        link: function (scope, element, attrs, controller) {
            var tip = scope.$eval(attrs.tipObject);
            var sResult = tip.Shot + ':' + tip.Received;
            var clazz = '';
            if (tip.Seq > scope.maxSeq) {
                sResult = '';
            }
            else {
                if (tip.OkExact) clazz = 'Tipped3P';
                if (tip.Ok12X && !tip.OkExact) clazz = 'Tipped1P';
            }
            element[0].innerHTML = sResult;
            element[0].className = 'TippedResult ' + clazz;
        }
    };
});

