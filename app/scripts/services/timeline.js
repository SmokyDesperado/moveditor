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
        this.mouseHoverPosX = 0;
        this.timelineWidth = 100;

// =====================================================================================================================
// setter
// =====================================================================================================================

        this.setMouseHoverPosX = function (posX) {
            this.mouseHoverPosX = posX;
            // console.log('setMouseHoverPosX', this.mouseHoverPosX);
        };

        this.setTimelineWidth = function (width) {
            this.timelineWidth = width;
        };

// =====================================================================================================================
// getter
// =====================================================================================================================

        this.getMouseHoverPosX = function () {
            return this.mouseHoverPosX;
        };

        this.getTimelineWidth = function () {
            return this.timelineWidth;
        };

// =====================================================================================================================
// functions
// =====================================================================================================================

        this.addTimelineObjectToList = function (contentListObjectId) {
            var timelineObject = {
                objectListId: contentListObjectId,
                start: this.getMouseHoverPosX(),
                offset: 0,
                end: 0,
                type: ContentService.contentList[contentListObjectId].type,
                length: ((ContentService.contentList[contentListObjectId].length + 10) * 10),
                mute: false
            };

            ContentService.contentList[contentListObjectId].active++;
            this.calculateJunkPositions(timelineObject);

            self.timelineList.push(timelineObject);
            // console.log('added', ContentService.contentList[contentListObjectId]);
        };

        this.calculateJunkPositions = function (newTimelineObject) {
            console.log('object:', newTimelineObject.start, (newTimelineObject.start + newTimelineObject.length));

            var totalEnd = 0;
            for(var i = 0; i < this.timelineList.length; i++) {
                console.log('junks:', this.timelineList[i].start, this.timelineList[i].length, this.timelineList[i].start + this.timelineList[i].length);
                if((newTimelineObject.start > this.timelineList[i].start) && (newTimelineObject.start < (this.timelineList[i].start + this.timelineList[i].length))) {
                    console.error('collide start');

                    if(totalEnd <(this.timelineList[i].start + this.timelineList[i].length)) {
                        totalEnd = this.timelineList[i].start + this.timelineList[i].length;
                    }
                    // console.log(newTimelineObject.start, (this.timelineList[i].start +  this.timelineList[i].length));
                }

                if(((newTimelineObject.start + newTimelineObject.length) > this.timelineList[i].start) && ((newTimelineObject.start + newTimelineObject.length) < (this.timelineList[i].start + this.timelineList[i].length))) {
                    console.error('collide end');

                    if(totalEnd <(this.timelineList[i].start + this.timelineList[i].length)) {
                        totalEnd = this.timelineList[i].start + this.timelineList[i].length;
                    }
                    // console.log(newTimelineObject.length, this.timelineList[i].start, this.timelineList[i].length)
                }
            }

            if(newTimelineObject.start <= totalEnd) {
                newTimelineObject.start = totalEnd;
            }
        };

        this.getTimelinList = function () {
            return this.timelineList;
        };

        this.getTimelineObjectList = function () {
            return this.timelineList;
        };
    }]);
