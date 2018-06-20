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
        'MvHelperService',
        function (ContentService, MvHelperService) {

        var self = this;
        this.timelineList = [];
        this.mouseHoverPosX = 0;
        this.timelineWidth = 1920;
        this.scrollLeft = 0;

        this.pixelPerSeconds = 20;

        // ====================================================================================================
        // Dummy data
        // ====================================================================================================

        // this.timelineList = [
        //     { objectListId: "swyUp88ucxE0o00LIzh5", start: 0, end: 2000, offset: 8000, mute: false },
        //     { objectListId: "8kAvuHzBVthTRTnCEOeH", start: 2000, end: 4000, offset: 20000, mute: false },
        //     { objectListId: "SAOo3jBge24zJjhRR1Mp", start: 4000, end: 5000, offset: 3000, mute: false },
        //     { objectListId: "DwyEujIbOXchn9wWVIgg", start: 6000, end: 8000, offset: 0, mute: false },
        //     { objectListId: "tMtBKzzN0gnx6EuV4jLO", start: 8000, end: 10000, offset: 5500, mute: false },
        //     { objectListId: "hj0nfAxlY9eNiqkwY5dl", start: 10000, end: 12000, offset: 0, mute: false },
        //     { objectListId: "h305Qv2ogZPBReFsiV1u", start: 12000, end: 14000, offset: 0, mute: false },
        //     { objectListId: "swyUp88ucxE0o00LIzh5", start: 14000, end: 16000, offset: 15000, mute: false }
        // ];

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
                start: startPosition / this.pixelPerSeconds,
                end: 0,
                offset: 0,
                mute: false,
                length: (ContentService.contentList[contentListObjectId].length)
            };

            timelineObject.end = timelineObject.start + timelineObject.length;
            ContentService.contentList[contentListObjectId].active++;
            self.calculateChunkPositions(timelineObject);
            self.sortedAddingObjectToTimelineList(timelineObject);
            self.calculateTimelineWidth(timelineObject);
            MvHelperService.newChunkAdded(timelineObject, ContentService.getContentList(), self.timelineList, self.timelineList);
        };

        this.calculateTimelineWidth = function (timelineObject) {
            var timelineWidthDifference = 0;
            if((timelineObject.end * this.pixelPerSeconds) > this.timelineWidth) {
                timelineWidthDifference = (timelineObject.end * this.pixelPerSeconds) - this.timelineWidth;
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
            if(this.timelineList.length > 1) {
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
                    if((newTimelineObject.start > this.timelineList[i].start) && (newTimelineObject.start < (this.timelineList[i].start + this.timelineList[i].length))) {
                        if(totalEnd <(this.timelineList[i].start + this.timelineList[i].length)) {
                            totalEnd = this.timelineList[i].start + this.timelineList[i].length;
                        }
                    }

                    if(((newTimelineObject.start + newTimelineObject.length) > this.timelineList[i].start) && ((newTimelineObject.start + newTimelineObject.length) < (this.timelineList[i].start + this.timelineList[i].length))) {
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

        this.getTimelineList = function () {
            return this.timelineList;
        };

        this.setTimelineList = function (list) {
            this.timelineList = list;
        };

        this.getTimelineObjectList = function () {
            return this.timelineList;
        };
    }]);
