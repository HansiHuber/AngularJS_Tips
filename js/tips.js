'use strict';

var chartTipRanks;

$(document).ready(function () {
    $('body').keydown(keyPressed);
    chartTipRanks = initChartScatter();
});
function keyPressed(event) {
    var keyCode = event.keyCode;
    if (keyCode != 37 && keyCode != 39) return;
    var scope = angular.element($("#mainTipList")).scope();
    var seq = scope.maxSeq;
    if (keyCode == 37)//left
    {
        if (seq > 0) {
            seq--;
        }
    }
    if (keyCode == 39)//right
    {
        if (seq < scope.nrMatches) {
            seq++;
        }
    }
    scope.$apply(function () {
        scope.maxSeq = seq;
    })
}

function initChartLine() {
    var labels = ["RobertG"];
    var values = [];
//    var values = [
//        [60, 71, 57, 55, 55, 44, 31, 65, 31, 25, 12, 3, 4, 4, 4, 6, 2, 1, 1],
//        [60, 50, 43, 32, 32, 31, 27, 27, 25, 22, 18, 13, 14, 47, 40, 36, 32, 21, 11]
//    ];
    var yMax = 120;
    var yNrLines = 12;
    var fontSizeLabels = 8;
    var lineWidth = 3;
    var offsetChartLeft = 30;
    var barLine = new RGraph.Line('lineRankHist', values)
        //.Set('labels.above', true)
        .Set('labels.above.size', fontSizeLabels)
        .Set('text.color', 'black')
        .Set('strokestyle', 'white')
        .Set('linewidth', lineWidth)
        .Set('gutter.left', offsetChartLeft)
        .Set('background.grid.hlines', true)
        .Set('background.grid.vlines', false)
        .Set('hmargin', 0)
        .Set('ymax', yMax)
        .Set('background.grid.autofit.numhlines', yNrLines)
        .Set('ylabels.count', yNrLines)
        .Set('numyticks', yNrLines)
        .Set('background.grid.color', '#bbb')
        .Set('colors', ['red', 'blue', 'green', 'orange'])
        .Draw();
    return barLine;
}
function initChartScatter() {
    var labels = ["RobertG"];
    var values = [];
//    var values = [
//        [[0,60,'red'],[1,65,'red'],[2,71,'red'],[3,57,'red'],[4,55,'red'],[5,44,'red'],[6,25,'red']],
//        [[0,60,'red'],[1,55,'blue'],[2,50,'blue'],[3,43,'blue'],[4,32,'blue'],[5,27,'blue'],[6,12,'blue']]
//    ];
    var yMax = 120;
    var yNrLines = 12;
    var fontSizeLabels = 8;
    var lineWidth = 3;
    var offsetChartLeft = 30;
    var xNrTicks = 48;
    var barLine = new RGraph.Scatter('lineRankHist', values)
        .Set('chart.line', true)
        //.Set('labels.above', true)
        .Set('labels.above.size', fontSizeLabels)
        .Set('text.color', 'black')
        .Set('strokestyle', 'white')
        .Set('line.linewidth', lineWidth)
        .Set('gutter.left', offsetChartLeft)
        .Set('background.grid.hlines', true)
        .Set('background.grid.vlines', false)
        .Set('hmargin', 0)
        .Set('xmax', 50)
        .Set('ymax', yMax)
        .Set('background.grid.autofit.numhlines', yNrLines)
        .Set('ylabels.count', yNrLines)
        .Set('numyticks', yNrLines)
        .Set('numxticks', xNrTicks)
        .Set('tickmarks', null)
        .Set('background.grid.color', '#bbb')
        //.Set('colors', ['red', 'blue'])
        .Draw();
    return barLine;
}

function redrawChartLine(values) {
    chartTipRanks.original_data = values;
    RGraph.Redraw();
}

function updateRankHistory4ChartLine(scope) {
    var nrLines = scope.tippersSelected.length;
    var values = [];
    angular.forEach(scope.tippersSelected, function (tipper) {
        var line = [];
        var history = tipper.History;
        var i = 0;
        angular.forEach(tipper.History, function (data) {
            if (i < scope.maxSeq) line.push(data.R);
            i++;
        });
        try {
            values.push(line);
        }
        catch (exc) {
            console.log(exc.message);
        }
    });
    var nrCharts = values.length;
    redrawChartLine(values);
}

function redrawChartScatter(values) {
    RGraph.Clear(document.getElementById('lineRankHist'));
    chartTipRanks.data = values;
    RGraph.Redraw();
}
function updateRankHistory4Chart(scope) {
    console.log('updateRankHistory4Chart');
    var colors = ['red', 'blue', 'green', 'orange'];
    var nrLines = scope.tippersSelected.length;
    var values = [];
    angular.forEach(scope.tippersSelected, function (tipper) {
        var line = [];
        var history = tipper.History;
        var i = 0;
        angular.forEach(tipper.History, function (data) {
            if (i < scope.maxSeq) {
                var point = [];
                point.push(i);
                point.push(data.R);
                point.push(colors[values.length%colors.length]);
                line.push(point);
            }
            i++;
        });
        try {
            console.log('Line with color ' + colors[values.length%colors.length]);
            values.push(line);
        }
        catch (exc) {
            console.log(exc.message);
        }
    });
    var nrCharts = values.length;
    redrawChartScatter(values);
}

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
                var nrs = [];
                for (var i = 1; i <= $scope.nrMatches; i++) {
                    nrs.push(i);
                }
                $scope.matchSequence = nrs;
                var nr = 0;
                angular.forEach($scope.matches, function (match) {
                    if (match.Shot >= 0) {
                        nr++;
                    }
                });
                $scope.nrMatchesPlayed = nr;
                $scope.maxSeq = $scope.tippers[0].Tips.length;
                $scope.$watch('maxSeq', function (newValue, oldValue, scope) {
                    var curr = angular.copy(scope.tippersSelected);
                    scope.tippersSelected = [];
                    scope.tippersSelected = curr;
                    updateRankHistory4Chart(scope);
                });
                //$scope.maxSeq = 20;// <=====================================================
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
            updateRankHistory4Chart($scope);
        }
        $scope.tipperUnselected = function (tipper) {
            $scope.tippers.push(tipper);
            var idx = $scope.tippersSelected.indexOf(tipper);
            if (idx >= 0) {
                $scope.tippersSelected.splice(idx, 1);
            }
            updateRankHistory4Chart($scope);
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

tipDirectives.directive('tipTendency', function () {
    return{
        link: function (scope, element, attrs, controller) {
            var tendencyVal = scope.$eval(attrs.tendencyVal);
            var direction = 'right';
            switch (tendencyVal) {
                case -2:
                    direction = 'down';
                    break;
                case -1:
                    direction = 'down_middle';
                    break;
                case 0:
                    direction = 'right';
                    break;
                case 1:
                    direction = 'up_middle';
                    break;
                case 2:
                    direction = 'up';
                    break;
            }
            var sFileName = 'arrow_' + direction + '.png';
            element[0].innerHTML = '<div><img src="img/' + sFileName + '"/></div>';
        }
    };
});

