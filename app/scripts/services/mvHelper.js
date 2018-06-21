'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('MvHelperService', [
        function () {

            var self = this;

            this.generateRandomHash = function (size) {

                if (angular.isUndefined(size)) {
                    size = 20;
                }

                var urlHash = '';
                var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                for (var i = 0; i < size; i++) {
                    urlHash += possible.charAt(Math.floor(Math.random() * possible.length));
                }

                return urlHash;
            };

            this.validateURL = function (url) {
                // https://stackoverflow.com/questions/30970068/js-regex-url-validation
                var result = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
                return result == null? false : true;
            };

            this.alert = function (alertText) {
                alert(alertText + "\n\n" + "If there seems to be a bug or an unexpected behaviour, please contact the developers of this site.");
            };


            // ====================================================================================================
            // Get content media metadata functions
            // ====================================================================================================

            // accepted media extensions for specific media types
            var videoExtensionList = ["flv", "mkv", "m4v", "mp4", "amv", "3gp", "mov"];
            var imageExtensionList = ["png", "jpg", "webp", "bmp", "gif"];
            var audioExtensionList = ["mp3", "ogg", "wav", "webm", "flac"];
            var cloudRegExList = [
                /https:\/\/onedrive\.live\.com\/download\?resid=/, // https://onedrive.live.com/download?resid=684E21B94B52D0C2!2688&authkey=!AAyRLt9WcK3InHw&ithint=video%2cmp4
                /https:\/\/drive\.google\.com\/uc\?export=download\&id=/ // https://drive.google.com/uc?export=download&id=1qXlYazitNrc7Up6XceuGPYZKVb6DXG00
            ];

            this.getURLMediaType = function (url) {

                // https://stackoverflow.com/questions/6997262/how-to-pull-url-file-extension-out-of-url-string-using-javascript/47767860#47767860
                var urlExtension = url.split(/\#|\?/)[0].split('.').pop().trim();
                console.log(urlExtension);

                // also works for Dropbox URLs like https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0
                if (videoExtensionList.indexOf(urlExtension) != -1) {
                    return "video";
                }
                if (imageExtensionList.indexOf(urlExtension) != -1) {
                    return "image";
                }
                if (audioExtensionList.indexOf(urlExtension) != -1) {
                    return "audio";
                }

                // handle other cloud URLs, see cloudRegExList
                for (var i = 0; i < cloudRegExList.length; i++) {
                    if (cloudRegExList[i].test(url)) {
                        console.log(url.match(cloudRegExList[i])[0]);

                        if (/video/.test(url)) {
                            return "video";
                        }
                        if (/image/.test(url)) {
                            return "image";
                        }
                        if (/audio/.test(url)) {
                            return "audio";
                        }
                        return "video";
                    }
                }

                return null;
            };

            this.createVideoThumbnail = function (URL, canvas) {

                var tmpPlayer = document.createElement("video");
                tmpPlayer.style.display = "none";

                tmpPlayer.addEventListener("loadeddata", function () {
                    tmpPlayer.currentTime = tmpPlayer.duration/2;
                });

                tmpPlayer.addEventListener("timeupdate", function () {
                    canvas.width = tmpPlayer.videoWidth;
                    canvas.height = tmpPlayer.videoHeight;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(tmpPlayer, 0, 0, tmpPlayer.videoWidth, tmpPlayer.videoHeight);
                });

                tmpPlayer.src = URL;
            };

            this.getVideoAudioDuration = function (URL, contentObject, $scope) {
                var tmpPlayer = document.createElement("video");
                tmpPlayer.style.display = "none";
                tmpPlayer.src = URL;
                tmpPlayer.onloadeddata = function() {
                    contentObject.length = tmpPlayer.duration;
                    $scope.$apply();
                };
            };

            // ====================================================================================================
            // Preview player functions
            // ====================================================================================================

            this.createVideoElementForChunk = function (chunk, contentList) {

                // if chunk is a video, then add new <video> if video doesn't exist yet
                var content = contentList[chunk.objectListId];
                if (content.type == "video" && document.getElementById("video_" + chunk.objectListId) == null) {
                    var video = document.createElement("video");
                    video.src = content.url;
                    // video.src = content.url + "#t=" + chunk.start + "," + chunk.end;
                    video.id = "video_" + chunk.objectListId;
                    video.controls = false;
                    video.preload = "auto";
                    video.style.zIndex = "-1";
                    document.getElementById('active_media').appendChild(video);
                }
            }

            this.getTimelineDuration = function (videoImageChunkList, audioChunkList) {

                // length of chunklist in ms is the same as the end time of last chunk
                var videoImageTimelineDuration = 0;
                if (videoImageChunkList.length > 0) {
                    videoImageTimelineDuration = videoImageChunkList[videoImageChunkList.length - 1].end * 1000;
                }

                var audioTimelineDuration = 0;
                if (audioChunkList.length > 0) {
                    audioTimelineDuration = audioChunkList[audioChunkList.length - 1].end * 1000;
                }

                return Math.max(videoImageTimelineDuration, audioTimelineDuration);
            }

            // ====================================================================================================
            // Preview player helper functions
            // ====================================================================================================

            this.deleteAllVideoElements = function (activeMediaContainer) {
                var videoElements = activeMediaContainer.getElementsByTagName("video");
                while (videoElements[0]) {
                    videoElements[0].parentNode.removeChild(videoElements[0]);
                }
            }

            // ====================================================================================================
            // Functions to be called by timeline whenever a new chunk is added or deleted to signal preveiw player
            // ====================================================================================================

            this.newChunkAdded = function (newChunk, contentList, videoImageChunkList, audioChunkList) {
                // create <video> if necessary
                self.createVideoElementForChunk(newChunk, contentList);

                // update position slider max value if new chunk was added at the end of timeline
                document.getElementById('position_slider').max = Math.ceil(Math.max(self.getTimelineDuration(videoImageChunkList, audioChunkList)) / 100) * 100;
                console.log("new position slider max: ", document.getElementById('position_slider').max);
            }

            this.chunkDeleted = function (deletedChunk, contentList) {
                // if deleted chunk is of type video and no more active elements exists then remove its <video>
                var content = contentList[deletedChunk.objectListId];
                if (content.type == "video" && content.activeElements == 0) {
                    document.getElementById('active_media').removeChild(document.getElementById("video_" + deletedChunk.objectListId));
                }

                // update position slider max value if deleted chunk was at the end of timeline
                document.getElementById('position_slider').max = Math.max(self.getTimelineDuration(timelineList, timelineList));
            }

        }
    ]);
