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

                // ============================================================================

            }
        };
    }]);
