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
            controllerAs:'ContentCtrl',
            link: function($scope, $element, $attrs, contentCtrl) {
                $scope.addContentMaterial = function() {
                    contentCtrl.addContentMaterial();
                };

                $scope.loadContentMaterial = function() {
                    contentCtrl.loadContentMaterial();
                };
            }
        };
    }]);
