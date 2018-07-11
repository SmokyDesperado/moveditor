'use strict';

/**
 * @ngdoc function
 * @name moveditorApp.controller:MvContentCtrl
 * @description
 * # MvContentCtrl
 * Controller of the moveditorApp
 */
angular.module('moveditorApp')
    .controller('MvContentCtrl', [
        'ContentService',
        'TimelineService',
        'mvPreviewService',
        'MvHelperService',
        function (ContentService, TimelineService, mvPreviewService, MvHelperService) {

            var self = this;

            this.contentObjects = null;
            this.init = function () {
                this.contentObjects = ContentService.getContentList();
            };

            // ============================================================================
            // add content material
            // ============================================================================

            this.addContentMaterial = function (MaterialURL) {
                ContentService.addContentObjectToList("", MvHelperService.getURLMediaType(MaterialURL), 0, MaterialURL, null);
            };

            // ============================================================================
            // save session, modified from http://simey.me/saving-loading-files-with-javascript/
            // ============================================================================

            this.saveContentMaterial = function () {
                console.log("save session");

                // object we want to save
                var objectToSave = {contentArea: this.contentObjects, timelineArea: TimelineService.getTimelineList()};
                // convert to json string
                var JSONToSave = JSON.stringify(objectToSave);
                // create a link DOM fragment
                var tmpLink = $("<a/>");

                // <a download="video_stitching_session.txt" href='data:application/octet-stream,...'></a>
                tmpLink
                  .attr("download", "video_stitching_session.txt")
                  .attr("href", "data:application/octet-stream," + JSONToSave)
                  .appendTo("body")
                  .get(0)
                  .click();
            };

            // ============================================================================
            // load session, modified from http://simey.me/saving-loading-files-with-javascript/
            // ============================================================================

            this.loadContentMaterial = function ($scope) {
                console.log("load session");

                // TODO: put in one of the listeners
                ContentService.setContentList({});
                this.contentObjects = ContentService.getContentList();
                TimelineService.resetTimeline();

                var reader = new FileReader();
                reader.onload = function(ev) {
                    // TODO: check whether input session file is valid
                    // TODO: setCurrentPlayTime = 0
                    MvHelperService.deleteAllVideoElements(document.getElementById('active_media'));
                    document.getElementById('audio_0').pause();
                    document.getElementById('position_slider').max = 0;

                    var contents = JSON.parse(ev.target.result);
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
                    $scope.$apply();

                    console.log("load session complete");
                };

                var field = document.createElement("input");
                field.type = "file";
                field.addEventListener("change", function() {
                    var file = this.files[0];
                    reader.readAsText(file);
                });
                field.click();
            };

            // ============================================================================
            // SQS segmentation and stitching requests
            // ============================================================================

            this.sendStitching = function () {
                // ToDo: HAN
                var contentList = ContentService.getContentList();
                var timelineList = TimelineService.getTimelineList();
                console.log('send stitching');
                console.log('contentList:', contentList);
                console.log('timelineList:', timelineList);
            };

            this.init();
        }
    ]);
