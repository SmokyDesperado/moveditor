'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvContentPreview
 * @description
 * # mvContentPreview
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('mvContentPreviewService', [
        'MvHelperService',
        function (MvHelperService) {
            var self = this;
            this.previewType = "image";

            this.showContent = function (contentURL, type) {
                self.showContentPreviewPopup();
                this.previewType = type;

                switch(type) {
                    case "image":
                        var image = document.createElement("img");
                        image.src = contentURL;
                        image.id = "content_preview_image";
                        image.className = "centered_content";
                        document.getElementById('content_preview_popup').appendChild(image);
                        break;
                    case "audio":
                        var audio = document.createElement("audio");
                        audio.src = contentURL;
                        audio.id = "content_preview_audio";
                        audio.className = "centered_content";
                        audio.controls = true;
                        audio.controlsList = "nodownload"
                        audio.preload = "auto";
                        document.getElementById('content_preview_popup').appendChild(audio);
                        break;
                    case "video":
                        var video = document.createElement("video");
                        video.src = contentURL;
                        video.id = "content_preview_video";
                        video.className = "centered_content";
                        video.controls = "controls";
                        video.controlsList = "nodownload"
                        video.preload = "auto";
                        document.getElementById('content_preview_popup').appendChild(video);
                        break;
                    default:
                        break;
                }
            }

            this.showContentPreviewPopup = function () {
                document.getElementsByClassName('content-preview')[0].style.zIndex = "1000000";
            }

            this.hideContentPreviewPopup = function () {
                var activeMediaContainer = document.getElementById('content_preview_popup');
                switch(this.previewType) {
                    case "image":
                        var imageElements = activeMediaContainer.getElementsByTagName("img");
                        while (imageElements[0]) {
                            imageElements[0].parentNode.removeChild(imageElements[0]);
                        }
                        break;
                    case "audio":
                        var contentPreviewAudio = document.getElementById('content_preview_audio');
                        contentPreviewAudio.pause();

                        var audioElements = activeMediaContainer.getElementsByTagName("audio");
                        while (audioElements[0]) {
                            audioElements[0].parentNode.removeChild(audioElements[0]);
                        }
                        break;
                    case "video":
                        var contentPreviewVideo = document.getElementById('content_preview_video');
                        contentPreviewVideo.pause();

                        MvHelperService.deleteAllVideoElements(activeMediaContainer);
                        break;
                    default:
                        break;
                }
                document.getElementsByClassName('content-preview')[0].style.zIndex = "-1000";
            }
        }
    ]);
