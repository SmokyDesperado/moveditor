'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('DragAndDropService', [
        'MvHelperService',
        'TimelineService',
        function (MvHelperService, TimelineService) {

            var self = this;

            this.init = function () {
                console.log('drag and drop service');
            };

            this.panMoveStarted = function (id) {
                TimelineService.addTimelineObjectToList(id);
            };

            this.panMove = function () {
                console.log('pan move');
            };

            this.panMoveEnd = function () {
                var list = TimelineService.getTimelineObjectList();
                console.log('end:', list);
            };

            this.init();
        }]);
