'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('TimelineService', [
        'ContentService',
        function (ContentService) {

        var self = this;
        this.timelineList = [];

        this.addTimelineObjectToList = function (contentListObjectId) {
            var timelineObject = {
                objectListId: contentListObjectId,
                start: (this.timelineList.length * 10),
                offset: 0,
                end: 0,
                type: ContentService.contentList[contentListObjectId].type,
                mute: false
            };

            self.timelineList.push(timelineObject);
            console.log('added', ContentService.contentList[contentListObjectId]);
        };

        this.getTimelinList = function () {
            return this.timelineList;
        };

        this.getTimelineObjectList = function () {
            return this.timelineList;
        };
    }]);
