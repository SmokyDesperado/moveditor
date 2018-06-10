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
        var videoExtensionList = ["m4v", "mp4"];
        var imageExtensionList = ["png", "jpg", "webp"];
        var audioExtensionList = ["mp3"];

        this.getURLMediaType = function (url) {

            // https://stackoverflow.com/questions/6997262/how-to-pull-url-file-extension-out-of-url-string-using-javascript/47767860#47767860
            var urlExtension = url.split(/\#|\?/)[0].split('.').pop().trim();
            // console.log(urlExtension);

            if (videoExtensionList.indexOf(urlExtension) != -1) {
                return "video";
            }
            if (imageExtensionList.indexOf(urlExtension) != -1) {
                return "image";
            }
            if (audioExtensionList.indexOf(urlExtension) != -1) {
                return "audio";
            }

            // TODO: handle special URLs like gDrive, oneDrive, dropBox

            return null;
        };

        this.createVideoThumbnail = function (URL, canvas) {

            var metaDataPlayer = document.createElement("video");
            metaDataPlayer.style.display = "none";

            metaDataPlayer.addEventListener("loadeddata", function () {
                metaDataPlayer.currentTime = metaDataPlayer.duration/2;
            });

            metaDataPlayer.addEventListener("timeupdate", function () {
                canvas.width = metaDataPlayer.videoWidth;
                canvas.height = metaDataPlayer.videoHeight;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(metaDataPlayer, 0, 0, metaDataPlayer.videoWidth, metaDataPlayer.videoHeight);
            });

            metaDataPlayer.src = URL;
        };

        this.alert = function (alertText) {
            alert(alertText + "\n\n" + "If there seems to be a bug or an unexpected behaviour, please contact the developers of this site.");
        };

    }]);
