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
        this.contentUrlList = [];

        this.addContentObjectToList = function (contentMaterialObject) {
            if(angular.isUndefined(this.contentUrlList[contentMaterialObject.url])) {
                var contentIndexHash = MvHelperService.generateRandomHash();
                this.contentList[contentIndexHash] = contentMaterialObject;
                this.contentUrlList.push(contentMaterialObject.url);
            }
            else {
                console.log('object already added');
            }
        };

        this.removecontentObjectFromList = function (contetnMaterialIndex) {
            if(angular.isDefined(this.contentList[contetnMaterialIndex])) {
                var contentUrlListIndex = this.contentUrlList.indexOf(this.contentList[contetnMaterialIndex].url);
                this.contentUrlList.splice(contentUrlListIndex, 1);
                delete this.contentList[contetnMaterialIndex];
            }
            else {
                console.log('element not in content list');
            }
        };
    }]);
