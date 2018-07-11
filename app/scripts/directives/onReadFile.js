'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('onReadFile', [
        'ContentService',
        'TimelineService',
        'MvHelperService',
        function (ContentService, TimelineService, MvHelperService) {
        return {
            restrict: 'A',
            link: function($scope, $element, attrs) {
                $element.on('change', function(onChangeEvent) {
                    var reader = new FileReader();

                    reader.onload = function(onLoadEvent) {
                        ContentService.setContentList({});
                        TimelineService.resetTimeline();

                        MvHelperService.deleteAllVideoElements(document.getElementById('active_media'));
                        document.getElementById('position_slider').max = 0;

                        var contents = JSON.parse(onLoadEvent.target.result);
                        for (var hash in contents.contentArea) {
                            ContentService.addContentObjectToList(
                                contents.contentArea[hash].name,
                                contents.contentArea[hash].type,
                                contents.contentArea[hash].length,
                                contents.contentArea[hash].url,
                                hash);
                        }
                        for (var i in contents.timelineArea) {
                            TimelineService.addLoadedTimelineObjectToList(contents.timelineArea[i], $scope);
                        }
                        MvHelperService.updatePreviewPlayerParameters(TimelineService.getTimelineList(), TimelineService.getTimelineList());
                        $scope.$apply();
                    };

                    reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                });
            }
        };
    }]);
