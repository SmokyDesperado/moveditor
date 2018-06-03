'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvMaterial', [function () {
        return {
            templateUrl: '/views/directives/mvMaterial.html',
            replace: true,
            restrict: 'AE',
            scope: {
                materialObject: '='
            },
            link: function($scope, $element, $attrs) {
                var self = this;

                $scope.panStart = function($event) {
                    console.log('pan start', $event);
                };

                $scope.hammerPanMove = function($event) {
                    var x = $event.center.x - $event.target.offsetWidth/2,
                        y = $event.center.y - $event.target.offsetHeight;

                    $event.target.style['left'] = x + 'px';
                    $event.target.style['top'] = y + 'px';

                    // self.out('pan', $event);
                    console.log('pan move');
                };

                $scope.panEnd = function($event) {
                    console.log('pan end', $event);
                };

                $scope.panDoubletap = function($event) {
                    console.log('pan double tap', $event);
                };

                $scope.hammerTap = function($event) {
                    console.log('pan tap');
                    // self.out('tap', $event);
                };

                this.out = function (type, $event) {
                    console.log(type);

                    console.log('event', $event);
                    console.log('dx:', $event.deltaX, 'dy', $event.deltaY);
                    console.log('mouse pos in element', $event.center);
                    console.log('style left', $event.target.style.left, '|| top', $event.target.style.top);
                    console.log('style', $event.target.style);
                };
            }
        };
    }]);
