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

            this.dummyObjects = {};
            this.dummyIndex = 0;

            this.contentObjects = '';

            this.init = function () {
                this.contentObjects = ContentService.getContentList();
                this.initDummyObject();
                console.log('content list initialized:', this.contentObjects, this.dummyObjects);
            };

            this.addContentMaterial = function () {

                if(this.dummyIndex < 10) {
                    ContentService.addContentObjectToList(this.dummyObjects[this.dummyIndex]);
                    this.dummyIndex++;

                    console.log('object added');
                }
                else {
                    console.warn('all dummy objects added');
                }
            };

            this.loadContentMaterial = function () {
                console.warn('contentObjects:', this.contentObjects);
            };

            this.initDummyObject = function () {
                for(var i = 0; i < 10; i++) {
                    var testName = 'object ' + i;
                    var testUrl = 'URL - ' + i + ': ' + MvHelperService.generateRandomHash();
                    this.dummyObjects[i] = Content.create(testName, 'video', i, testUrl);
                }
            };

            this.init();
        }
    ]);
