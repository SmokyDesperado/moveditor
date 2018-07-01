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

                // ============================================================================
                // preview_player setup
                // ============================================================================
                
                mvPreviewService.initPlayer();

                // ============================================================================
                // Preview range slider
                // ============================================================================

                var rangeSlider = document.getElementById('preview_range_slider');

                noUiSlider.create(rangeSlider, {
                    animate: true,
                    behaviour: 'snap-hover',
                    connect: true,
                    tooltips: true,

                    start: [0, 999999999],
                    step: 100,
                    range: {
                        'min': 0,
                        'max': 999999999
                    },
                    format: {
                        to: function (value) {
                            return Math.round((value / 1000) * 10) / 10 + 's';
                        },
                        from: function (value) {
                            return value.replace('s', '');
                        }
                    }
                });
                rangeSlider.setAttribute('disabled', true);

                rangeSlider.noUiSlider.on('change', function(value){
                    mvPreviewService.setPositionA(Math.round(value[0].replace('s', '') * 1000));
                    mvPreviewService.setPositionB(Math.round(value[1].replace('s', '') * 1000));
                });

                // ============================================================================
                // preview_player controls
                // ============================================================================
                
                $scope.play = function () {
                    mvPreviewService.play();
                }

                $scope.pause = function () {
                    mvPreviewService.pause();
                }

                $scope.goToStart = function () {
                    mvPreviewService.jumpToPosition(0)
                }

                $scope.vol = 1;
                $scope.setVolume = function (vol) {
                    mvPreviewService.setVolume(vol);
                }

                $scope.mute = false;
                $scope.setMute = function () {
                    mvPreviewService.setMute(!$scope.mute);
                }

                $scope.loop = false;
                $scope.setLoop = function () {
                    mvPreviewService.setLoopPlay(!$scope.loop);
                }

                $scope.pos = 0;
                $scope.jumpToPosition = function (pos) {
                    mvPreviewService.jumpToPosition(pos);
                }

                // ============================================================================

            }
        };
    }]);
