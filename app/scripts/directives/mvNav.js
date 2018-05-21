'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvNav', ['mvNavService', function (mvNavService) {
        return {
            templateUrl: '/views/directives/mvNav.html',
            replace: true,
            restrict: 'AE',
            link: function(scope, element, attrs) {

            }
        };
    }]);
