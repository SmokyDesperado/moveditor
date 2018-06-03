'use strict';

/**
 * @ngdoc function
 * @name moveditorApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the moveditorApp
 */
angular.module('moveditorApp')
    .controller('MainCtrl', function () {
        this.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        this.timelineChunkList = {};
    });
