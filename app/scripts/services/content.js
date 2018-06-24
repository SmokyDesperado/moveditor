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
        }]);
