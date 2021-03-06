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
        'MvHelperService',
        'SQSService',
        function (ContentService, TimelineService, MvHelperService, SQSService) {

            var self = this;
            this.alreadyWarnedForAudioFiles = false;

            // ============================================================================
            // add content material
            // ============================================================================

            this.addContentMaterial = function (MaterialURL) {
                if (MvHelperService.getURLMediaType(MaterialURL) === "audio" && !self.alreadyWarnedForAudioFiles) {
                    alert("The current version of the Fraunhofer FOKUS backend does not support audio files yet. Nevertheless you can add and edit audio files with this app and save sessions for a later version.");
                    self.alreadyWarnedForAudioFiles = true;
                }
                ContentService.addContentObjectToList("", MvHelperService.getURLMediaType(MaterialURL), 0, MaterialURL, null);
            };

            // ============================================================================
            // save session, modified from http://simey.me/saving-loading-files-with-javascript/
            // ============================================================================

            this.saveContentMaterial = function () {
                console.log("save session");

                var objectToSave = {contentArea: ContentService.getContentList(), timelineArea: TimelineService.getTimelineList()};
                var JSONToSave = angular.toJson(objectToSave);
                var tmpLink = $("<a/>");

                tmpLink
                  .attr("download", "video_stitching_session.txt")
                  .attr("href", "data:application/octet-stream," + encodeURIComponent(JSONToSave))
                  .appendTo("body")
                  .get(0)
                  .click();
            };

            // ============================================================================
            // SQS segmentation and stitching requests
            // ============================================================================

            this.sendStitching = function () {

                var timelineList = TimelineService.getTimelineList();
                if (timelineList['video'].length > 0) {
                    if (!SQSService.isInProcess) {
                        console.log('send stitching');
                        SQSService.requestSegmentation(0);
                    }
                }
            };

            this.abortStitching = function () {
                SQSService.stopStitchingProcess();
            };

            this.receive = function () {
                SQSService.receive10();
            };

        }
    ]);
