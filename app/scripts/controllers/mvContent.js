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
                console.warn('contentObjects:', this.contentObjects);
            };

            this.init();
        }
    ]);
