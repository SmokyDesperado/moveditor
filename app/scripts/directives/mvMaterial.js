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
            link: function($scope, $element, $attrs) {
                $scope.hammerPanMove = function($event) {
                    var x = $event.center.x,
                        y = $event.center.y;

                    // console.log('x:', x, '- y:', y, ' || ', $event);
                    $event.target.style['left'] = x + 'px';
                    $event.target.style['top'] = y + 'px';

                    console.log('dx:', $event.deltaX, 'dy', $event.deltaY);

                    console.log('element', $event.target.style, $event.center);
                };

                $scope.hammerTap = function($event) {
                    // var x = $event.center.x,
                    //     y = $event.center.y;
                    //
                    // console.log(x, ' || ', y);
                    // $event.target.style['left'] = x + 'px';
                    // $event.target.style['top'] = y + 'px';
                    //
                    // console.log($event.target.style.left);

                    // console.warn('element', $element[0].children[0]);
                    console.log('target', $event.target.style, $event.center);
                    //
                    // if($event.target === $element[0].children[0]){
                    //     var element = $element[0].children[0];
                    //     element.style['background'] = "red";
                    // }
                    // else {
                    //     console.log('nah');
                    // }
                }
            }
        };
    }]);
