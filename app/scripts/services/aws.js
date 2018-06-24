'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('AWSService', [
        'MvHelperService',
        'ContentService',
        function (MvHelperService, ContentService) {
            var self = this;

            this.aws = null;

            this.init = function () {
                this.aws = new AWS.SQS();
                console.log('init:', this.aws);
            };

            this.requestSegmentation = function (contetnMaterialIndex, url) {
                // ToDo: do stuff
            };

            this.init();
        }]);
