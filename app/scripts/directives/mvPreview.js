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
                    console.log("Volume: ", vol);
                    mvPreviewService.setVolume(vol);
                }

                $scope.mute = false;
                $scope.setMute = function () {
                    console.log("Mute: ", !$scope.mute);
                    mvPreviewService.setMute(!$scope.mute);
                }

                $scope.loop = false;
                $scope.setLoop = function () {
                    console.log("Loop: ", !$scope.loop);
                    mvPreviewService.setLoopPlay(!$scope.loop);
                }

                $scope.pos = 0;
                $scope.jumpToPosition = function (pos) {
                    mvPreviewService.jumpToPosition(pos);
                }

                $scope.setPositionA = function (posA) {
                    mvPreviewService.setPositionA(posA*1000);
                }

                $scope.setPositionB = function (posB) {
                    mvPreviewService.setPositionB(posB*1000);
                }

                // ============================================================================

            }
        };
    }]);
