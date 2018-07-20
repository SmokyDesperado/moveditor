'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvPreview', ['mvPreviewService',
        function (mvPreviewService) {
            return {
                templateUrl: '/views/directives/mvPreview.html',
                replace: true,
                restrict: 'AE',
                link: function($scope, $element, $attrs) {

                    mvPreviewService.init();

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

                    $scope.loop = false;
                    $scope.setLoop = function () {
                        mvPreviewService.setLoopPlay($scope.loop);
                    }

                    $scope.pos = 0;
                    $scope.jumpToPosition = function (pos) {
                        mvPreviewService.jumpToPosition(pos);
                    }

                    // ====================================================================================================
                    // short keys for controlling preview player
                    // ====================================================================================================

                    document.onkeypress = function(e) {
                        // console.log("KEY PRESS: ", e.which);
                        switch (e.which) {
                            case 13: // enter & num enter
                            case 32: // space
                                mvPreviewService.play();
                                break;
                            case 48: // 0 & num 0
                                if (!e.ctrlKey) {
                                    mvPreviewService.jumpToPosition(0);
                                }
                                break;
                            case 60: // <
                                if (!e.ctrlKey) {
                                    mvPreviewService.jumpToPosition(Math.round(document.getElementById('preview_range_slider').noUiSlider.get()[0].replace('s', '') * 1000));
                                }
                                break;
                            case 108: // L
                                $scope.loop = !$scope.loop;
                                mvPreviewService.setLoopPlay($scope.loop);
                                $scope.$apply();
                                break;
                            default:
                                break;
                        }
                    };

                    document.onkeydown = function (e) {
                        // console.log("KEY DOWN: ", e.which);
                        switch (e.which) {
                            case 109: // num -
                            case 189: // -
                                if (!e.ctrlKey) {
                                    if (e.shiftKey) {
                                        mvPreviewService.jumpToPosition(mvPreviewService.currentPlayTime - 100);
                                    } else {
                                        mvPreviewService.jumpToPosition(mvPreviewService.currentPlayTime - 1000);
                                    }
                                }
                                break;
                            case 107: // num +
                            case 187: // +
                                if (!e.ctrlKey) {
                                    if (e.shiftKey) {
                                        mvPreviewService.jumpToPosition(mvPreviewService.currentPlayTime + 100);
                                    } else {
                                        mvPreviewService.jumpToPosition(mvPreviewService.currentPlayTime + 1000);
                                    }
                                }
                                break;
                            case 40: // arrow down
                                if (!e.altKey) {
                                    $scope.vol = Math.max(0, $scope.vol - 0.05);
                                    mvPreviewService.setVolume($scope.vol);
                                    $scope.$apply();
                                }
                                break;
                            case 38: // arrow up
                                if (!e.altKey) {
                                    $scope.vol = Math.min($scope.vol + 0.05, 1);
                                    mvPreviewService.setVolume($scope.vol);
                                    $scope.$apply();
                                }
                                break;
                            default:
                                break;
                        }
                    };
                }
            };
        }
    ]);
