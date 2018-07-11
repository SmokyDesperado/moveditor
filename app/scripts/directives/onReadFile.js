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
        'mvPreviewService',
        function (ContentService, TimelineService, MvHelperService, mvPreviewService) {
        return {
            restrict: 'A',
            link: function($scope, $element, attrs) {
                $element.on('change', function(onChangeEvent) {
                    var reader = new FileReader();

                    reader.onload = function(onLoadEvent) {
                        ContentService.setContentList({});
                        TimelineService.resetTimeline();

                        console.log("load session");

                        // TODO: put in one of the listeners
                        ContentService.setContentList({});
                        this.contentObjects = ContentService.getContentList();
                        TimelineService.resetTimeline();

                        var reader = new FileReader();
                            // TODO: check whether input session file is valid
                            MvHelperService.deleteAllVideoElements(document.getElementById('active_media'));
                            mvPreviewService.pause();
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
                            MvHelperService.updatePreviewPlayerParameters(TimelineService.getTimelineList(), TimelineService.getTimelineList(), true);
                            mvPreviewService.jumpToPosition(0);
                            onChangeEvent.target.value = '';
                            $scope.$apply();
                    };

                    reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                });
            }
        };
    }]);
