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
        'MvHelperService',
        function (ContentService, Content, MvHelperService) {

            this.contentObjects = '';

            this.init = function () {
                this.contentObjects = ContentService.getContentList();
            };

            this.addContentMaterial = function (MaterialURL) {

                // check for valid URL
                if (MvHelperService.validateURL(MaterialURL)) {
                    // get media type of provided URL
                    var type = MvHelperService.getURLMediaType(MaterialURL);

                    if (type != null) {

                        // TODO: extract length from video or audio URL
                        // var tmpPlayer = document.createElement("video");
                        // tmpPlayer.style.display = "none";
                        // tmpPlayer.addEventListener("loadedmetadata", function () {
                        //     console.log("addEventListener");
                        //     var length = tmpPlayer.duration;
                        //     var name = "";

                        //     console.log(length);

                        //     // create new content object and add it to the content object list
                        //     var newContentObject = Content.create(name, type, length, MaterialURL);
                        //     ContentService.addContentObjectToList(newContentObject);
                        // });
                        // tmpPlayer.src = MaterialURL;

                        var length = 0;
                        var name = "";

                        // create new content object and add it to the content object list
                        var newContentObject = Content.create(name, type, length, MaterialURL);
                        ContentService.addContentObjectToList(newContentObject);
                    } else {
                        MvHelperService.alert("Provided URL is not among accepted media types or could not be rendered!");
                    }
                } else {
                    MvHelperService.alert("Provided URL was not valid!");
                }
            };

            this.loadContentMaterial = function () {
                // console.warn('contentObjects:', this.contentObjects);

                this.addContentMaterial("http://corrupt-system.de/assets/media/bigbugbunny/bbb_trailer.m4v");
                this.addContentMaterial("http://corrupt-system.de/assets/media/sintel/sintel-trailer.m4v");
                this.addContentMaterial("https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0");
                this.addContentMaterial("https://onedrive.live.com/download?resid=684E21B94B52D0C2!2688&authkey=!AAyRLt9WcK3InHw&ithint=video%2cmp4");
                this.addContentMaterial("https://drive.google.com/uc?export=download&id=1qXlYazitNrc7Up6XceuGPYZKVb6DXG00");
                this.addContentMaterial("https://www.bensound.com/bensound-music/bensound-betterdays.mp3");
                this.addContentMaterial("https://jpgames.de/wp-content/uploads/2014/12/One-Piece-Pirate-Warriors-3_2014_12-19-14_004-620x250.jpg?x37583");
                this.addContentMaterial("https://jpgames.de/wp-content/uploads/2018/05/CI_NSwitch_HyruleWarriorsDefinitiveEdition_Link-Triforce_image950w.bmp-620x250.jpg?x37583");
            };

            this.init();
        }
    ]);
