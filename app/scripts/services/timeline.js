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
        this.audioTimelineList = [];
        this.mouseHoverPosX = 0;
        this.timelineWidth = 1920;
        this.timelineWidthAddExtensionInSeconds = 30;
        this.timelineQuantizationValue = 100;
        this.timelineQuantization = 1 / (this.timelineQuantizationValue/1000);

        this.scrollLeft = 0;

        this.pixelPerSeconds = 20;
        this.scales = [];

        this.init = function () {
            self.calculateTimelineScales();
        };

        this.resetTimeline = function () {
            this.timelineList = [];
            this.mouseHoverPosX = 0;
            this.timelineWidth = 1920;
            this.scrollLeft = 0;
            this.scales = [];

            self.calculateTimelineScales();
        };

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
                start: Math.round((startPosition / this.pixelPerSeconds) * self.timelineQuantization) / self.timelineQuantization,
                end: 0,
                offset: 0,
                mute: false,
            };

            timelineObject.end = Math.floor((timelineObject.start + ContentService.contentList[contentListObjectId].length) * self.timelineQuantization) / self.timelineQuantization;
            ContentService.contentList[contentListObjectId].active++;

            self.recalculateChunkPositions(timelineObject);
            self.sortedAddingObjectToTimelineList(timelineObject);
            self.calculateTimelineWidth();
            MvHelperService.newChunkAdded(timelineObject, ContentService.getContentList(), self.timelineList, self.audioTimelineList);
        };

        this.addLoadedTimelineObjectToList = function (loadedTimelineObject, $scope) {
            console.log('loadedTimelineObject', loadedTimelineObject);

            var timelineObject = {
                objectListId: loadedTimelineObject.objectListId,
                start: Math.round(loadedTimelineObject.start * self.timelineQuantization) / self.timelineQuantization,
                end: Math.floor(loadedTimelineObject.end * self.timelineQuantization) / self.timelineQuantization,
                offset: loadedTimelineObject.offset,
                mute: loadedTimelineObject.mute,
            };

            ContentService.contentList[loadedTimelineObject.objectListId].active++;

            self.recalculateChunkPositions(timelineObject);
            self.sortedAddingObjectToTimelineList(timelineObject);
            self.calculateTimelineWidth();
            MvHelperService.createVideoElementForChunk(timelineObject, ContentService.getContentList());
        };

        this.calculateTimelineWidth = function () {
            this.timelineWidth = (self.timelineList[self.timelineList.length - 1].end + self.timelineWidthAddExtensionInSeconds) * self.pixelPerSeconds;;

            if(this.timelineWidth < 1920) {
                this.timelineWidth = 1920;
            }

            self.calculateTimelineScales();
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

        this.recalculateChunkPositions = function (newTimelineObject) {

            // collision of new chunk with an existing chunk
            for(var i = 0; i < this.timelineList.length; i++) {

                if ((this.timelineList[i].start <= newTimelineObject.start && newTimelineObject.start < this.timelineList[i].end) || // start lands in a chunk
                    (this.timelineList[i].start < newTimelineObject.end && newTimelineObject.end <= this.timelineList[i].end) || // end lands a chunk
                    (newTimelineObject.start < this.timelineList[i].start && this.timelineList[i].end < newTimelineObject.end))  // new chunk surrounds an existing chunk
                {
                    // console.log("COLLISION START: ", this.timelineList[i].start <= newTimelineObject.start && newTimelineObject.start < this.timelineList[i].end);
                    // console.log("COLLISION END: ", this.timelineList[i].start < newTimelineObject.end && newTimelineObject.end <= this.timelineList[i].end);
                    // console.log("COLLISION SURROUND: ", newTimelineObject.start < this.timelineList[i].start && this.timelineList[i].end < newTimelineObject.end);
                    // console.log(this.timelineList[i]);

                    var indexedObjectLength = this.timelineList[i].end - this.timelineList[i].start;
                    this.timelineList[i].start = newTimelineObject.end;
                    this.timelineList[i].end = this.timelineList[i].start + indexedObjectLength;

                    // recalculate position of all chunks that come after new chunk
                    for(var j = i + 1; j < this.timelineList.length; j++) {
                        if ((this.timelineList[j].start <= this.timelineList[j-1].start && this.timelineList[j-1].start < this.timelineList[j].end) || // start overlaps in previous chunk
                            (this.timelineList[j].start < this.timelineList[j-1].end && this.timelineList[j-1].end <= this.timelineList[j].end) || // end overlaps in previous chunk
                            (this.timelineList[j-1].start < this.timelineList[j].start && this.timelineList[j].end < this.timelineList[j-1].end) || // chunk surrounds previous chunk
                            (this.timelineList[j].start < this.timelineList[j-1].start && this.timelineList[j].end < this.timelineList[j-1].end)) // complete chunk is incorrectly earlier than previous chunk
                        {
                            indexedObjectLength = this.timelineList[j].end - this.timelineList[j].start;
                            this.timelineList[j].start = this.timelineList[j-1].end;
                            this.timelineList[j].end = this.timelineList[j].start + indexedObjectLength;
                        }
                    }
                    // break;
                }
            }
        };

        this.getTimelineList = function () {
            return this.timelineList;
        };

        this.getAudioTimelineList = function () {
            return this.audioTimelineList;
        };

        this.setTimelineList = function (list) {
            this.timelineList = list;
        };

        this.getTimelineObjectList = function () {
            return this.timelineList;
        };

        this.calculateTimelineScales = function () {
            var scaleValues = {
                'amount': parseInt((this.timelineWidth / this.pixelPerSeconds) / 10)
            };

            for(var i = 0; i <= scaleValues.amount; i++) {
                var scale = {
                    display: i * 10,
                    position: (i * 10) * this.pixelPerSeconds
                };

                this.scales.push(scale);
            }
        };

        this.roundTime = function (time) {
            return Math.round(time * self.timelineQuantization) / self.timelineQuantization;
        };

        this.init();
    }]);
