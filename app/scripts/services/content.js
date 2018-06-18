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
        function (MvHelperService) {
            this.contentList = {};

            this.addContentObjectToList = function (contentMaterialObject) {
                if (!this.existInContentList(contentMaterialObject.url)) {
                    var contentIndexHash = MvHelperService.generateRandomHash();
                    this.contentList[contentIndexHash] = contentMaterialObject;
                }
                else {
                    console.log('object already added');
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
