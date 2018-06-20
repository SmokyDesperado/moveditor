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

        // ====================================================================================================
        // Dummy data
        // ====================================================================================================

        this.timelineList = [
            { objectListId: "swyUp88ucxE0o00LIzh5", start: 0, end: 2000, offset: 8000, mute: false },
            { objectListId: "8kAvuHzBVthTRTnCEOeH", start: 2000, end: 4000, offset: 20000, mute: false },
            { objectListId: "SAOo3jBge24zJjhRR1Mp", start: 4000, end: 5000, offset: 3000, mute: false },
            { objectListId: "DwyEujIbOXchn9wWVIgg", start: 6000, end: 8000, offset: 0, mute: false },
            { objectListId: "tMtBKzzN0gnx6EuV4jLO", start: 8000, end: 10000, offset: 5500, mute: false },
            { objectListId: "hj0nfAxlY9eNiqkwY5dl", start: 10000, end: 12000, offset: 0, mute: false },
            { objectListId: "h305Qv2ogZPBReFsiV1u", start: 12000, end: 14000, offset: 0, mute: false },
            { objectListId: "swyUp88ucxE0o00LIzh5", start: 14000, end: 16000, offset: 15000, mute: false }
        ];

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
            self.calculateJunkPositions(timelineObject);

            self.sortedAddingObjectToTimelineList(timelineObject);
            // console.log('added', ContentService.contentList[contentListObjectId]);
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

        this.calculateJunkPositions = function (newTimelineObject) {
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
                }
            }
            else {
                var totalEnd = 0;

                for(var i = 0; i < this.timelineList.length; i++) {
                    console.log('junks:', this.timelineList[i].start, this.timelineList[i].length, this.timelineList[i].start + this.timelineList[i].length);
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
