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
        function (ContentService, TimelineService, MvHelperService) {

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

                // get the file field
                var field = document.createElement("input");
                field.type = "file";
                field.style.display = "none";

                // when it changes (ie: user selects a file)
                field.addEventListener("change", function() {
                    // get the file item from the input field
                    var file = this.files[0];
                    // read the file as text so that load event will trigger
                    reader.readAsText(file);
                });

                // create a new FileReader object
                var reader = new FileReader();

                // remove all objects of current list
                ContentService.setContentList({});
                this.contentObjects = ContentService.getContentList();
                TimelineService.resetTimeline();

                // when the file has finished reading, store it's contents to a variable (async)
                reader.onload = function(ev) {
                    var contents = JSON.parse(ev.target.result);

                    // TODO: check whether input session file is valid
                    // add objects from session file
                    for (var hash in contents.contentArea) {
                        ContentService.addContentObjectToList(
                            contents.contentArea[hash].name,
                            contents.contentArea[hash].type,
                            contents.contentArea[hash].length,
                            contents.contentArea[hash].url,
                            hash);
                    }

                    // remove all previous <video> and add new one if necessary
                    var activeMediaContainer = document.getElementById('active_media');
                    MvHelperService.deleteAllVideoElements(activeMediaContainer);
                    document.getElementById('position_slider').max = 0; // TODO: setCurrentPlayTime = 0

                    for (var i = contents.timelineArea.length - 1; i >= 0; i--) {
                        TimelineService.addLoadedTimelineObjectToList(contents.timelineArea[i], $scope);
                    }

                    console.log("load session complete");

                    $scope.$apply();
                };

                field.click();
            };

            this.init();
        }
    ]);
