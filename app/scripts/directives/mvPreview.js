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
                        mvPreviewService.setLoopPlay(!$scope.loop);
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
                            case 60: // <
                                mvPreviewService.jumpToPosition(0);
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
                            case 37: // arrow left
                                if (!e.ctrlKey) {
                                    if (e.shiftKey) {
                                        mvPreviewService.jumpToPosition(mvPreviewService.currentPlayTime - 100);
                                    } else {
                                        mvPreviewService.jumpToPosition(mvPreviewService.currentPlayTime - 500);
                                    }
                                }
                                break;
                            case 39: // arrow right
                                if (!e.ctrlKey) {
                                    if (e.shiftKey) {
                                        mvPreviewService.jumpToPosition(mvPreviewService.currentPlayTime + 100);
                                    } else {
                                        mvPreviewService.jumpToPosition(mvPreviewService.currentPlayTime + 500);
                                    }
                                }
                                break;
                            case 40: // arrow down
                                $scope.vol = Math.max(0, $scope.vol - 0.05);
                                mvPreviewService.setVolume($scope.vol);
                                $scope.$apply();
                                break;
                            case 38: // arrow up
                                $scope.vol = Math.min($scope.vol + 0.05, 1);
                                mvPreviewService.setVolume($scope.vol);
                                $scope.$apply();
                                break;
                            default:
                                break;
                        }
                    };
                }
            };
        }
    ]);
