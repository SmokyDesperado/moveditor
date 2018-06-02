'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('ContentService', function () {
        this. serviceParam = 0;

        this.setParam = function (value) {
            this.param = value;
        };

        this.getParam = function () {
            return this.param;
        };
    });
