'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvPreview', ['mvPreviewService', function (mvPreviewService) {
        return {
            templateUrl: '/views/directives/mvPreview.html',
            replace: true,
            restrict: 'AE',
            link: function($scope, $element, $attrs) {
                // ToDo: Nhat - add logik and function of directive here

                $scope.object = {
                    'test': 12,
                    'stuff': 'bla'
                };

                $scope.foo = function () {
                    mvPreviewService.doStuff('service');
                }
            }
        };
    }]);
