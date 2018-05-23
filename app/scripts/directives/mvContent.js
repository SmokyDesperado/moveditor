'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvContent', [function () {
        return {
            templateUrl: '/views/directives/mv_content.html',
            replace: true,
            restrict: 'AE',
            controller: 'MvContentCtrl',
            bindToController: true,
            controllerAs:'contentCtrl',
            link: function($scope, $element, $attrs, contentCtrl) {
                $scope.click = function(param) {
                    console.log('clicked with param:', param);
                };

                $scope.doStuff = function() {
                    contentCtrl.doStuff();
                }
            }
        };
    }]);
