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
        this.timelineWidth = 1920;
        this.scrollLeft = 0;

        this.pixelPerSeconds = 20;

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

        this.setScrollLeft = function (left) {
            this.scrollLeft = left;
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

        this.getScrollLeft = function () {
            return this.scrollLeft;
        };

// =====================================================================================================================
// functions
// =====================================================================================================================

        this.addTimelineObjectToList = function (contentListObjectId) {

            var startPosition = this.getMouseHoverPosX();
            if(this.scrollLeft > 0) {
                startPosition = this.getMouseHoverPosX() + this.scrollLeft;
            }

            var timelineObject = {
                objectListId: contentListObjectId,
                start: startPosition,
                offset: 0,
                end: 0,
                type: ContentService.contentList[contentListObjectId].type,
                length: (ContentService.contentList[contentListObjectId].length * this.pixelPerSeconds),
                mute: false
            };

            timelineObject.end = timelineObject.start + timelineObject.length;
            ContentService.contentList[contentListObjectId].active++;
            self.calculateChunkPositions(timelineObject);
            self.sortedAddingObjectToTimelineList(timelineObject);
            self.calculateTimelineWidth(timelineObject);
            // console.log('added', timelineObject, this.timelineWidth);
        };

        this.calculateTimelineWidth = function (timelineObject) {
            var timelineWidthDifference = 0;
            if(timelineObject.end > this.timelineWidth) {
                timelineWidthDifference = timelineObject.end - this.timelineWidth;
                console.log('timelineWidth updated');
            }

            this.timelineWidth = this.timelineWidth + timelineWidthDifference;
        };

        this.sortedAddingObjectToTimelineList = function(timelineObject) {
            var timelineListIndex = 0;
            for(var i = 0; i < this.timelineList.length; i++) {
                if(timelineObject.start > this.timelineList[i].start) {
                    timelineListIndex = this.timelineList.indexOf(this.timelineList[i]) + 1;
                }
            }
            this.timelineList.splice(timelineListIndex, 0, timelineObject);
        };

        // ToDo: still some bugs
        this.calculateChunkPositions = function (newTimelineObject) {
            console.log('object:', newTimelineObject.start, (newTimelineObject.start + newTimelineObject.length));

            if(this.timelineList.length > 1) {
                console.log('if');
                for(var i = 0; i < (this.timelineList.length - 1); i++) {
                    if(
                        (newTimelineObject.start >= this.timelineList[i].start) &&
                        (newTimelineObject.start <= (this.timelineList[i].start + this.timelineList[i].length))
                    ) {
                        newTimelineObject.start = this.timelineList[i].start + this.timelineList[i].length;
                    }

                    if(
                        ((newTimelineObject.start + newTimelineObject.length) >= this.timelineList[i].start) &&
                        ((newTimelineObject.start + newTimelineObject.length) <= (this.timelineList[i].start +this.timelineList[i].length))
                    ) {
                        newTimelineObject.start = this.timelineList[i].start + this.timelineList[i].length;
                    }

                    if(
                        ((newTimelineObject.start + newTimelineObject.length) >= this.timelineList[i + 1].start) &&
                        ((newTimelineObject.start + newTimelineObject.length) <= (this.timelineList[i + 1].start + this.timelineList[i + 1].length))
                    ) {
                        newTimelineObject.start = this.timelineList[i + 1].start + this.timelineList[i + 1].length;
                    }

                    if(
                        (newTimelineObject.start >= this.timelineList[this.timelineList.length - 1].start) &&
                        (newTimelineObject.start <= (this.timelineList[this.timelineList.length - 1].start + this.timelineList[this.timelineList.length - 1].length))
                    ) {
                        newTimelineObject.start = this.timelineList[this.timelineList.length - 1].start + this.timelineList[this.timelineList.length - 1].length;
                    }

                    newTimelineObject.end = newTimelineObject.start + newTimelineObject.length;
                }
            }
            else {
                var totalEnd = 0;

                for(var i = 0; i < this.timelineList.length; i++) {
                    console.log('chunks:', this.timelineList[i].start, this.timelineList[i].length, this.timelineList[i].start + this.timelineList[i].length);
                    if((newTimelineObject.start > this.timelineList[i].start) && (newTimelineObject.start < (this.timelineList[i].start + this.timelineList[i].length))) {
                        console.error('collide start');

                        if(totalEnd <(this.timelineList[i].start + this.timelineList[i].length)) {
                            totalEnd = this.timelineList[i].start + this.timelineList[i].length;
                        }
                    }

                    if(((newTimelineObject.start + newTimelineObject.length) > this.timelineList[i].start) && ((newTimelineObject.start + newTimelineObject.length) < (this.timelineList[i].start + this.timelineList[i].length))) {
                        console.error('collide end');

                        if(totalEnd <(this.timelineList[i].start + this.timelineList[i].length)) {
                            totalEnd = this.timelineList[i].start + this.timelineList[i].length;
                        }
                    }
                }

                if(newTimelineObject.start <= totalEnd) {
                    newTimelineObject.start = totalEnd;
                    newTimelineObject.end = newTimelineObject.start + newTimelineObject.length;
                }
            }
        };

        this.getTimelinList = function () {
            return this.timelineList;
        };

        this.getTimelineObjectList = function () {
            return this.timelineList;
        };
    }]);
