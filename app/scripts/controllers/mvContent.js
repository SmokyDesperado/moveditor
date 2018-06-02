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
        function (ContentService) {
            this.params = {
                'test': 'test 1'
            };

            this.test = 'test 2';

            this.doStuff = function () {
                console.log('do stuff');
            };

            this.hasStuff = function (stuff) {
                if(stuff) {
                    return true;
                }

                return false;
            };
        }
    ]);
