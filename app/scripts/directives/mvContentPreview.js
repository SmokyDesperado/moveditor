'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:mvContentPreview
 * @description
 * # content preview
 */
angular.module('moveditorApp')
    .directive('mvContentPreview', ['mvContentPreviewService', function (mvContentPreviewService) {
        return {
            templateUrl: '/views/directives/mvContentPreview.html',
            replace: true,
            restrict: 'AE',
            link: function($scope, $element, $attrs) {
                
                $scope.hide = function ($event) {
                    if ($event.target == document.getElementById('content_preview_popup')) {
                        mvContentPreviewService.hideContentPreviewPopup();
                    }
                }

                $scope.coypURL = function () {
                    document.getElementById('content_url').select();
                    document.execCommand("copy");
                }
            }
        };
    }]);
