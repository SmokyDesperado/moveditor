'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('ContentService', [
        'MvHelperService',
        'Content',
        function (MvHelperService, Content) {
            this.contentList = {};

            // ====================================================================================================
            // Dummy data
            // ====================================================================================================

            // one drive -> https://1drv.ms/v/s!AsLQUku5IU5olQAMkS7fVnCtyJx8
            //              eingeben und beim ersten redirect load abbrechen.
            //              link danach 'redirect' durch 'download' ersetzen
            // dropbox link -> 'www' durch 'dl'

            // this.contentList = {
            //     "swyUp88ucxE0o00LIzh5":{"name":"","type":"video","length":33.023333,"url":"http://corrupt-system.de/assets/media/bigbugbunny/bbb_trailer.m4v","active":0,"mpd":""},
            //     "8kAvuHzBVthTRTnCEOeH":{"name":"","type":"video","length":52.208333,"url":"http://corrupt-system.de/assets/media/sintel/sintel-trailer.m4v","active":0,"mpd":""},
            //     "SAOo3jBge24zJjhRR1Mp":{"name":"","type":"video","length":41.424399,"url":"https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0","active":0,"mpd":""},
            //     "DwyEujIbOXchn9wWVIgg":{"name":"","type":"video","length":41.424399,"url":"https://onedrive.live.com/download?resid=684E21B94B52D0C2!2688&authkey=!AAyRLt9WcK3InHw&ithint=video%2cmp4","active":0,"mpd":""},
            //     "tMtBKzzN0gnx6EuV4jLO":{"name":"","type":"video","length":9.01,"url":"https://drive.google.com/uc?export=download&id=0B4BsAbG4atWHQzVfLUU3UnhhZTA","active":0,"mpd":""},
            //     "hMRPSnf1cPVD9oIpbWa1":{"name":"","type":"audio","length":0,"url":"https://www.bensound.com/bensound-music/bensound-betterdays.mp3","active":0,"mpd":""},
            //     "hj0nfAxlY9eNiqkwY5dl":{"name":"","type":"image","length":0,"url":"https://jpgames.de/wp-content/uploads/2014/12/One-Piece-Pirate-Warriors-3_2014_12-19-14_004-620x250.jpg?x37583","active":0,"mpd":""},
            //     "h305Qv2ogZPBReFsiV1u":{"name":"","type":"image","length":0,"url":"https://jpgames.de/wp-content/uploads/2018/05/CI_NSwitch_HyruleWarriorsDefinitiveEdition_Link-Triforce_image950w.bmp-620x250.jpg?x37583","active":0,"mpd":""}
            // }

            // ====================================================================================================

            this.addContentObjectToList = function (name, type, length, MaterialURL, hash) {

                if (MvHelperService.validateURL(MaterialURL)) {
                    if (type != null) {
                        if (!this.existInContentList(MaterialURL)) {
                            var contentMaterialObject = Content.create(name, type, length, MaterialURL);

                            if (hash === null) {
                                hash = MvHelperService.generateRandomHash();
                            }
                            this.contentList[hash] = contentMaterialObject;
                        } else {
                            console.log('object already added');
                        }
                    } else {
                        MvHelperService.alert("Provided URL is not among accepted media types or could not be rendered!");
                    }
                } else {
                    MvHelperService.alert("Provided URL was not valid!");
                }
            };

            this.removecontentObjectFromList = function (contetnMaterialIndex) {
                if (angular.isDefined(this.contentList[contetnMaterialIndex])) {
                    delete this.contentList[contetnMaterialIndex];
                }
                else {
                    console.log('element not in content list');
                }
            };

            this.setLengthOfContentListObject = function (contetnMaterialIndex, length) {
                if(angular.isDefined(this.contentList[contetnMaterialIndex])) {
                    this.contentList[contetnMaterialIndex].length = length;
                    console.log(this.contentList[contetnMaterialIndex]);
                }
            };

            this.resetContentList = function () {
                this.contentList = {};
            };

            this.setContentList = function (list) {
                this.contentList = list;
            };

            this.getContentList = function () {
                return this.contentList;
            };

            this.existInContentList = function (url) {
                for (var i in this.contentList) {
                    if (url == this.contentList[i].getUrl()) {
                        return true;
                    }
                }
                return false;
            };

            // ToDo: check functionality and correctness
            this.addMpdForContentObject = function (contetnMaterialIndex, mpd) {
                this.contentList[contetnMaterialIndex].setMdp(mpd);
            };
        }]);
