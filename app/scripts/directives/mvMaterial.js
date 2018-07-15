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
        'MvHelperService',
        'ContentService',
        'mvContentPreviewService',
        function (DragAndDropService, MvHelperService, ContentService, mvContentPreviewService) {
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

                    this.dragIndicator = null;

                    // ##########################################################################################################
                    // Create thumbnail
                    // ##########################################################################################################
                    var container = $element.find('.mv-material__content')[0];

                    switch ($scope.materialObject.type) {
                        case "video":
                            var canvas = document.createElement('canvas');
                            canvas.className = "media-thumbnail";
                            container.appendChild(canvas);
                            MvHelperService.createVideoThumbnail($scope.materialObject.url, canvas);
                            MvHelperService.getVideoAudioDuration($scope.materialObject.url, ContentService.contentList[$scope.contentObjectKey], $scope);
                            break;
                        case "image":
                            var image = new Image();
                            image.src = $scope.materialObject.url;
                            image.className = "media-thumbnail";
                            container.appendChild(image);
                            ContentService.contentList[$scope.contentObjectKey].length = 1;
                            break;
                        case "audio":
                            var image = new Image();
                            var source = "https://thumbs.gfycat.com/SatisfiedThankfulCurassow-max-1mb.gif";
                            image.src = source;
                            image.className = "media-thumbnail";
                            container.appendChild(image);
                            MvHelperService.getVideoAudioDuration($scope.materialObject.url, ContentService.contentList[$scope.contentObjectKey], $scope);
                            break;
                        default:
                            break;
                    }

                    // ##########################################################################################################

                    $scope.panStart = function ($event) {

                        self.dragIndicator = document.createElement("div");
                        self.dragIndicator.style.width = "30px";
                        self.dragIndicator.style.height = "30px";
                        self.dragIndicator.style.borderStyle = "dashed";
                        self.dragIndicator.style.borderStyle = "3p";
                        self.dragIndicator.style.position = "absolute";
                        angular.element(self.dragIndicator).addClass('drag--clone');
                        document.body.appendChild(self.dragIndicator);
                        ContentService.contentDrag = true;

                        DragAndDropService.panMoveStarted($scope.contentObjectKey);
                    };

                    $scope.hammerPanMove = function ($event) {
                        self.dragIndicator.style['left'] = ($event.center.x - self.dragIndicator.style.width.replace('px', '') / 2) + 'px';
                        self.dragIndicator.style['top'] = ($event.center.y - self.dragIndicator.style.width.replace('px', '') / 2) + 'px';

                        DragAndDropService.panMove($event);
                    };

                    $scope.panEnd = function ($event) {
                        angular.element(self.dragIndicator).remove();
                        self.dragIndicator = null;
                        ContentService.contentDrag = false;

                        DragAndDropService.panMoveEnd($event, $scope.contentObjectKey);
                    };

                    $scope.panDoubletap = function ($event) {
                        console.log('pan double tap', $event);
                        mvContentPreviewService.showContent($scope.materialObject);
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
