'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvMaterial', [
        'DragAndDropService',
        function (DragAndDropService) {
            return {
                templateUrl: '/views/directives/mvMaterial.html',
                replace: true,
                restrict: 'AE',
                scope: {
                    materialObject: '=',
                    contentObjectKey: '='
                },
                link: function ($scope, $element, $attrs) {
                    var self = this;

                    this.dragClone = null;

                    $scope.panStart = function ($event) {
                        self.dragClone = angular.copy($event.target);
                        angular.element(self.dragClone).addClass('drag--clone');
                        $event.element[0].parentElement.parentElement.parentElement.prepend(self.dragClone);
                        self.dragClone.style['position'] = 'absolute';

                        DragAndDropService.panMoveStarted($scope.contentObjectKey);
                    };

                    $scope.hammerPanMove = function ($event) {
                        var x = $event.center.x - $event.target.offsetWidth / 2,
                            y = $event.center.y - $event.target.offsetHeight;

                        self.dragClone.style['left'] = x + 'px';
                        self.dragClone.style['top'] = y + 'px';

                        DragAndDropService.panMove($event);
                    };

                    $scope.panEnd = function ($event) {
                        angular.element(self.dragClone).remove();
                        self.dragClone = null;

                        DragAndDropService.panMoveEnd($event, $scope.contentObjectKey);
                    };

                    $scope.panDoubletap = function ($event) {
                        console.log('pan double tap', $event);
                    };

                    $scope.hammerTap = function ($event) {
                        console.log('pan tap');
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
