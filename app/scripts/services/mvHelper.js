'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.MvHelperService
 * @description
 * # MvHelperService
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

            this.alert = function (alertText) {
                alert(alertText + "\n\n" + "If there seems to be a bug or an unexpected behaviour, please contact the developers of this site.");
            };

            // ====================================================================================================
            // Content media and metadata functions
            // ====================================================================================================

            // ====================================================================================================
            // one drive -> https://1drv.ms/v/s!AsLQUku5IU5olQAMkS7fVnCtyJx8
            //              enter and stop further loading after first redirect then replace 'redirect' with 'download' in that url
            //              e.g. https://onedrive.live.com/download?resid=684E21B94B52D0C2!2688&authkey=!AAyRLt9WcK3InHw&ithint=video%2cmp4
            // dropbox -> replace 'www' with 'dl' e.g. https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0
            // google drive -> take file id of google drive public shared url and create a url in the format of
            //                 e.g. https://drive.google.com/uc?export=download&id=1qXlYazitNrc7Up6XceuGPYZKVb6DXG00
            // ====================================================================================================

            // accepted media extensions for specific media types
            this.videoExtensionList = ["3gp", "amv", "flv", "m4v", "mp4", "mkv", "mov", "ogv", "ogg", "webm"];
            this.imageExtensionList = ["bmp", "gif", "jpg", "png", "webp"];
            this.audioExtensionList = ["mp3", "flac", "ogg", "wav"];
            this.cloudRegExList = [
                /https:\/\/onedrive\.live\.com\/download\?resid=/,
                /https:\/\/drive\.google\.com\/uc\?export=download\&id=/
            ];

            // from https://stackoverflow.com/questions/30970068/js-regex-url-validation
            this.validateURL = function (url) {
                var result = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
                return result == null? false : true;
            };

            this.getURLMediaType = function (url) {

                // from https://stackoverflow.com/questions/6997262/how-to-pull-url-file-extension-out-of-url-string-using-javascript/47767860#47767860
                var urlExtension = url.split(/\#|\?/)[0].split('.').pop().trim();
                console.log(urlExtension);

                // also works for Dropbox URLs like https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0
                if (self.videoExtensionList.indexOf(urlExtension) != -1) {
                    return "video";
                } else if (self.imageExtensionList.indexOf(urlExtension) != -1) {
                    return "image";
                } else if (self.audioExtensionList.indexOf(urlExtension) != -1) {
                    return "audio";
                }

                // handle other cloud URLs
                for (var i = 0; i < self.cloudRegExList.length; i++) {
                    if (self.cloudRegExList[i].test(url)) {
                        console.log(url.match(self.cloudRegExList[i])[0]);

                        if (/video/.test(url)) {
                            return "video";
                        } else if (/image/.test(url)) {
                            return "image";
                        } else if (/audio/.test(url)) {
                            return "audio";
                        } else {
                            return "video";
                        }
                    }
                }
            };

            /**
             * @URL video URL
             * @canvas element to draw thumb on
             */
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

            /**
             * Get duration of video or audio URL and set metadata in contentObject.
             * @URL video or audio URL
             * @contentObject for saving metadata
             */
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
            // Functions to be called by timeline whenever a new chunk is added or deleted to signal preveiw player
            // ====================================================================================================

            /**
             * Create <video> if necessary and update preview player parameters.
             */
            this.newChunkAdded = function (newChunk, contentList, videoImageChunkList, audioChunkList) {
                self.createVideoElementForChunk(newChunk, contentList);
                self.updatePreviewPlayerParameters(videoImageChunkList, audioChunkList, false);
            }

            /**
             * Create a new <video> for specified chunk and its media source if such element doesn't exist yet.
             */
            this.createVideoElementForChunk = function (chunk, contentList) {
                var content = contentList[chunk.objectListId];
                if (content != null) {
                    if (content.type == "video" && document.getElementById("video_" + chunk.objectListId) == null) {
                        var video = document.createElement("video");
                        video.src = content.url;
                        video.id = "video_" + chunk.objectListId;
                        video.controls = false;
                        video.preload = "auto";
                        video.style.zIndex = "-1";
                        document.getElementById('active_media').appendChild(video);
                    }
                }
            }

            /**
             * Update max value of preview player's position slider and range parameters according to updated timeline list.
             * @maxRange true: range goes from 0 to end of last chunk; false: keep range slider values 
             */
            this.updatePreviewPlayerParameters = function (videoImageChunkList, audioChunkList, maxRange) {
                var newCeil = Math.ceil(Math.max(self.getTimelineDuration(videoImageChunkList, audioChunkList)) / 100) * 100; // in ms
                document.getElementById('position_slider').max = newCeil;

                var rangeSlider = document.getElementById('preview_range_slider');
                var rangeValues = rangeSlider.noUiSlider.get();
                rangeSlider.noUiSlider.updateOptions({
                    range: {
                        'min': 0,
                        'max': newCeil != 0? newCeil : 999999999
                    }
                });
                if (newCeil == 0) {
                    rangeSlider.setAttribute('disabled', true);
                } else {
                    rangeSlider.removeAttribute('disabled');
                }

                if (maxRange) {
                    rangeSlider.noUiSlider.set([0, newCeil != 0? newCeil : 999999999]);
                } else {
                    rangeSlider.noUiSlider.set([Math.round(rangeValues[0].replace('s', '') * 1000), newCeil != 0? Math.round(rangeValues[1].replace('s', '') * 1000) : 999999999]);
                }

                // console.log("new position_slider and position_b max: " + newCeil / 1000 + "s");
            }

            this.getTimelineDuration = function (videoImageChunkList, audioChunkList) {

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

            /**
             * If deleted chunk is of type video and no more active elements exists then remove its <video>.
             * Afterwards update the preview player parameters.
             */
            this.chunkDeleted = function (deletedChunk, contentList, videoImageChunkList, audioChunkList) {
                var content = contentList[deletedChunk.objectListId];
                if (content !== null) {
                    contentList[deletedChunk.objectListId].active--;
                    if (content.type === "video" && content.active === 0) {
                        document.getElementById('active_media').removeChild(document.getElementById("video_" + deletedChunk.objectListId));
                    }
                }
                self.updatePreviewPlayerParameters(videoImageChunkList, audioChunkList, false);
            }

            this.deleteAllVideoElements = function (activeMediaContainer) {
                var videoElements = activeMediaContainer.getElementsByTagName("video");
                while (videoElements[0]) {
                    videoElements[0].parentNode.removeChild(videoElements[0]);
                }
            }

        }
    ]);
