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
        function (DragAndDropService, MvHelperService) {
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

                    // ##########################################################################################################
                    // Create thumbnail
                    // ##########################################################################################################
                    var container = $element.find('.mv-material__content')[0];

                    if ($scope.materialObject.type == "video") {
                        var canvas = document.createElement('canvas');
                        canvas.className = "media-thumbnail";
                        container.appendChild(canvas);

                        MvHelperService.createVideoThumbnail($scope.materialObject.url, canvas);
                    }

                    if ($scope.materialObject.type == "image") {
                        var image = new Image();
                        image.src = $scope.materialObject.url;
                        image.className = "media-thumbnail";
                        container.appendChild(image);
                    }

                    if ($scope.materialObject.type == "audio") {
                        var image = new Image();

                        // var source = "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=beb0f979ed2a7da134fb95a2ae6290c3&auto=format&fit=crop&w=1350&q=80";
                        var source = "https://thumbs.gfycat.com/SatisfiedThankfulCurassow-max-1mb.gif";
                        image.src = source;
                        image.className = "media-thumbnail";
                        container.appendChild(image);
                    }
                    // ##########################################################################################################

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

                        DragAndDropService.panMove();
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
