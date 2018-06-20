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

        this.alert = function (alertText) {
            alert(alertText + "\n\n" + "If there seems to be a bug or an unexpected behaviour, please contact the developers of this site.");
        };

    }]);
