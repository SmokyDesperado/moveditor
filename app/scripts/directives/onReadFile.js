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

                        var reader = new FileReader();
                            // TODO: check whether input session file is valid
                            MvHelperService.deleteAllVideoElements(document.getElementById('active_media'));
                            mvPreviewService.pause();

                            var contents = JSON.parse(onLoadEvent.target.result);
                            for (var hash in contents.contentArea) {
                                ContentService.addContentObjectToList(
                                    contents.contentArea[hash].name,
                                    contents.contentArea[hash].type,
                                    contents.contentArea[hash].length,
                                    contents.contentArea[hash].url,
                                    hash);
                            }

                            for (var i in contents.timelineArea.audio) {
                                TimelineService.addLoadedTimelineObjectToList(contents.timelineArea.audio[i]);
                            }

                            for (var i in contents.timelineArea.video) {
                                TimelineService.addLoadedTimelineObjectToList(contents.timelineArea.video[i]);
                            }

                            MvHelperService.updatePreviewPlayerParameters(TimelineService.timelineList, true);
                            mvPreviewService.jumpToPosition(0);
                            onChangeEvent.target.value = '';
                            $scope.$apply();
                    };

                    reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                });
            }
        };
    }]);
