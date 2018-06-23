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
        'Content',
        'TimelineService',
        'MvHelperService',
        function (ContentService, Content, TimelineService, MvHelperService) {

            this.contentObjects = null;

            this.init = function () {
                this.contentObjects = ContentService.getContentList();
            };

            // ============================================================================
            // add content material
            // ============================================================================

            this.addContentMaterial = function (MaterialURL) {
                console.log("add content material: ", MaterialURL);

                // check for valid URL
                if (MvHelperService.validateURL(MaterialURL)) {
                    // get media type of provided URL
                    var type = MvHelperService.getURLMediaType(MaterialURL);

                    if (type != null) {

                        var length = 0;
                        var name = "";

                        // create new content object and add it to the content object list
                        // var newContentObject = Content.create(name, type, length, MaterialURL);
                        ContentService.addContentObjectToList(name, type, length, MaterialURL);
                    } else {
                        MvHelperService.alert("Provided URL is not among accepted media types or could not be rendered!");
                    }
                } else {
                    MvHelperService.alert("Provided URL was not valid!");
                }
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
                // encode any special characters in the JSON
                var text = encodeURIComponent(JSONToSave);

                // <a download="video_stitching_session.txt" href='data:application/octet-stream,...'></a>
                tmpLink
                  .attr("download", "video_stitching_session.txt")
                  .attr("href", "data:application/octet-stream," + text)
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

                // when the file has finished reading, store it's contents to a variable (async)
                reader.onload = function(ev) {
                    var contents = JSON.parse(decodeURIComponent(ev.target.result));

                    // TODO: check whether input session file is valid
                    // update content and timeline data objects
                    // ContentService.setContentList(contents.contentArea);
                    // this.contentObjects = ContentService.getContentList();

                    for (var hash in contents.contentArea) {

                        // check for valid URL
                        if (MvHelperService.validateURL(contents.contentArea[hash].url)) {
                            // get media type of provided URL
                            var type = MvHelperService.getURLMediaType(contents.contentArea[hash].url);

                            if (type != null) {

                                var length = 0;
                                var name = "";

                                // create new content object and add it to the content object list
                                // var newContentObject = Content.create(name, type, length, MaterialURL);
                                ContentService.addLoadedContentObjectToList(hash, contents.contentArea[hash]);
                            } else {
                                MvHelperService.alert("Provided URL is not among accepted media types or could not be rendered!");
                            }
                        } else {
                            MvHelperService.alert("Provided URL was not valid!");
                        }
                    }

                    // remove all previous <video> and add new one if necessary
                    var activeMediaContainer = document.getElementById('active_media');
                    MvHelperService.deleteAllVideoElements(activeMediaContainer);
                    document.getElementById('position_slider').max = 0;

                    // add each chunk seperately and call MvHelperService.newChunkAdded()
                    TimelineService.setTimelineList(contents.timelineArea);

                    for (var i = 0; i < TimelineService.getTimelineList().length; i++) {
                        MvHelperService.newChunkAdded(TimelineService.getTimelineList()[i], ContentService.getContentList(), TimelineService.getTimelineList(), TimelineService.getTimelineList());
                    }
                    console.log("load session complete");

                    $scope.$apply();
                };

                field.click();
            };

            this.init();
        }
    ]);
