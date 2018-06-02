'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvTimeline', [function () {
        return {
            templateUrl: '/views/directives/mvTimeline.html',
            replace: true,
            restrict: 'AE',
            controller: 'MvTimelineCtrl',
            bindToController: true,
            controllerAs:'TimelineCtrl',
            link: function($scope, $element, $attrs, contentCtrl) {
                $scope.click = function(param) {
                    console.log('clicked with param:', param);
                };

                $scope.doStuff = function() {
                    contentCtrl.doStuff();
                };
            }
        };
    }]);
