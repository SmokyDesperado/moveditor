'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('MvHelperService', function () {
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
    });
