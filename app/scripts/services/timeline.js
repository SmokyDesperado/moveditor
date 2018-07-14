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
        this.timelineList = {
            'audio': [],
            'video': []
        };

        this.audioTimelineList = [];
        this.mouseHoverPosX = 0;
        this.timelineWidth = 1920;
        this.timelineWidthAddExtensionInSeconds = 30;
        this.timelineQuantizationValue = 100;
        this.timelineQuantization = 1 / (this.timelineQuantizationValue/1000);

        this.scrollLeft = 0;

        this.pixelPerSeconds = 20;
        this.scales = [];
        this.scaleSteps = 10;

        this.zoomIndexDefault = 4;
        this.zoomIndex = this.zoomIndexDefault;
        this.zoomTable = [
            {pixelPerSeconds: 4, scaleSteps: 30},
            {pixelPerSeconds: 8, scaleSteps: 20},
            {pixelPerSeconds: 12, scaleSteps: 15},
            {pixelPerSeconds: 16, scaleSteps: 12},
            {pixelPerSeconds: 20, scaleSteps: 10},
            {pixelPerSeconds: 32, scaleSteps: 8},
            {pixelPerSeconds: 44, scaleSteps: 4},
            {pixelPerSeconds: 60, scaleSteps: 2},
            {pixelPerSeconds: 80, scaleSteps: 1}
        ];

        this.savedSteps = [];
        this.savedStepsPointer = 0;
        this.savedStepsAmount = 10;

        this.init = function () {
            self.calculateTimelineScales();
        };

        this.resetTimeline = function () {
            this.timelineList = {
                'audio': [],
                'video': []
            };
            this.mouseHoverPosX = 0;
            this.timelineWidth = 1920;
            this.scrollLeft = 0;
            this.scales = [];
            this.scaleSteps = 10;
            this.pixelPerSeconds = 20;

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

        this.createNewChunk = function (contentListObjectId, start, end, offset, mute, name) {
            return {
                objectListId: contentListObjectId,
                start: start,
                end: end,
                offset: offset,
                mute: mute,
                name: name
            };
        };

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
                name: ContentService.contentList[contentListObjectId].name
            };

            timelineObject.end = Math.floor((timelineObject.start + ContentService.contentList[contentListObjectId].length) * self.timelineQuantization) / self.timelineQuantization;
            ContentService.contentList[contentListObjectId].active++;

            self.recalculateChunkPositions(timelineObject, self.getListTypeFromContentListObjectId(contentListObjectId));
            self.sortedAddingObjectToTimelineList(timelineObject, self.getListTypeFromContentListObjectId(contentListObjectId));
            self.calculateTimelineWidth();
            MvHelperService.newChunkAdded(timelineObject, ContentService.getContentList(), self.timelineList, self.audioTimelineList);

            self.saveTimelineStep();
        };

        this.getListTypeFromContentListObjectId = function (contentListObjectId) {
            return (ContentService.contentList[contentListObjectId].type === 'audio') ? 'audio' : 'video';
        };

        this.addLoadedTimelineObjectToList = function (loadedTimelineObject) {
            var timelineObject = {
                objectListId: loadedTimelineObject.objectListId,
                start: Math.round(loadedTimelineObject.start * self.timelineQuantization) / self.timelineQuantization,
                end: Math.floor(loadedTimelineObject.end * self.timelineQuantization) / self.timelineQuantization,
                offset: loadedTimelineObject.offset,
                mute: loadedTimelineObject.mute,
                name: loadedTimelineObject.name
            };

            ContentService.contentList[loadedTimelineObject.objectListId].active++;

            self.recalculateChunkPositions(timelineObject, self.getListTypeFromContentListObjectId(loadedTimelineObject.objectListId));
            self.sortedAddingObjectToTimelineList(timelineObject, self.getListTypeFromContentListObjectId(loadedTimelineObject.objectListId));
            self.calculateTimelineWidth();
            MvHelperService.createVideoElementForChunk(timelineObject, ContentService.getContentList());
        };

        this.calculateTimelineWidth = function () {
            var timelineWidthVideo = 0;
            var timelineWidthAudio = 0;

            if (self.timelineList.video.length > 0) {
                timelineWidthVideo = (self.timelineList.video[self.timelineList.video.length - 1].end + self.timelineWidthAddExtensionInSeconds) * self.pixelPerSeconds;
            }

            if (self.timelineList.audio.length > 0) {
                timelineWidthAudio = (self.timelineList.audio[self.timelineList.audio.length - 1].end + self.timelineWidthAddExtensionInSeconds) * self.pixelPerSeconds;
            }

            if(timelineWidthVideo >= timelineWidthAudio) {
                this.timelineWidth = timelineWidthVideo;
            }
            else {
                this.timelineWidth = timelineWidthAudio;
            }

            if(this.timelineWidth < 1920) {
                this.timelineWidth = 1920;
            }

            self.calculateTimelineScales();
        };

        this.sortedAddingObjectToTimelineList = function(timelineObject, listType) {
            var timelineListIndex = 0;
            for(var i = 0; i < this.timelineList[listType].length; i++) {
                if(timelineObject.start > this.timelineList[listType][i].start) {
                    timelineListIndex = this.timelineList[listType].indexOf(this.timelineList[listType][i]) + 1;
                }
            }
            this.timelineList[listType].splice(timelineListIndex, 0, timelineObject);
        };

        this.recalculateChunkPositions = function (newTimelineObject, listType) {

            // collision of new chunk with an existing chunk
            for(var i = 0; i < this.timelineList[listType].length; i++) {

                if ((this.timelineList[listType][i].start <= newTimelineObject.start && newTimelineObject.start < this.timelineList[listType][i].end) || // start lands in a chunk
                    (this.timelineList[listType][i].start < newTimelineObject.end && newTimelineObject.end <= this.timelineList[listType][i].end) || // end lands a chunk
                    (newTimelineObject.start < this.timelineList[listType][i].start && this.timelineList[listType][i].end < newTimelineObject.end))  // new chunk surrounds an existing chunk
                {
                    // console.log("COLLISION START: ", this.timelineList[i].start <= newTimelineObject.start && newTimelineObject.start < this.timelineList[i].end);
                    // console.log("COLLISION END: ", this.timelineList[i].start < newTimelineObject.end && newTimelineObject.end <= this.timelineList[i].end);
                    // console.log("COLLISION SURROUND: ", newTimelineObject.start < this.timelineList[i].start && this.timelineList[i].end < newTimelineObject.end);
                    // console.log(this.timelineList[i]);

                    var indexedObjectLength = this.timelineList[listType][i].end - this.timelineList[listType][i].start;
                    this.timelineList[listType][i].start = newTimelineObject.end;
                    this.timelineList[listType][i].end = this.timelineList[listType][i].start + indexedObjectLength;

                    // recalculate position of all chunks that come after new chunk
                    for(var j = i + 1; j < this.timelineList[listType].length; j++) {
                        if ((this.timelineList[listType][j].start <= this.timelineList[listType][j-1].start && this.timelineList[listType][j-1].start < this.timelineList[listType][j].end) || // start overlaps in previous chunk
                            (this.timelineList[listType][j].start < this.timelineList[listType][j-1].end && this.timelineList[listType][j-1].end <= this.timelineList[listType][j].end) || // end overlaps in previous chunk
                            (this.timelineList[listType][j-1].start < this.timelineList[listType][j].start && this.timelineList[listType][j].end < this.timelineList[listType][j-1].end) || // chunk surrounds previous chunk
                            (this.timelineList[listType][j].start < this.timelineList[listType][j-1].start && this.timelineList[listType][j].end < this.timelineList[listType][j-1].end)) // complete chunk is incorrectly earlier than previous chunk
                        {
                            indexedObjectLength = this.timelineList[listType][j].end - this.timelineList[listType][j].start;
                            this.timelineList[listType][j].start = this.timelineList[listType][j-1].end;
                            this.timelineList[listType][j].end = this.timelineList[listType][j].start + indexedObjectLength;
                        }
                    }
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
                'amount': parseInt((this.timelineWidth / this.pixelPerSeconds) / this.scaleSteps)
            };

            for(var i = 0; i <= scaleValues.amount; i++) {
                var scale = {
                    display: i * this.scaleSteps,
                    position: (i * this.scaleSteps) * this.pixelPerSeconds
                };

                this.scales.push(scale);
            }
        };

        this.zoomIn = function () {
            self.zoomIndex = Math.min(self.zoomIndex+1, self.zoomTable.length-1);
            self.pixelPerSeconds = self.zoomTable[self.zoomIndex].pixelPerSeconds;
            self.scaleSteps = self.zoomTable[self.zoomIndex].scaleSteps;
            this.scales = [];
            self.calculateTimelineWidth();
        }

        this.zoomOut = function () {
            self.zoomIndex = Math.max(self.zoomIndex-1, 0);
            self.pixelPerSeconds = self.zoomTable[self.zoomIndex].pixelPerSeconds;
            self.scaleSteps = self.zoomTable[self.zoomIndex].scaleSteps;
            this.scales = [];
            self.calculateTimelineWidth();
        }

        this.zoomReset = function () {
            self.zoomIndex = self.zoomIndexDefault;
            self.pixelPerSeconds = self.zoomTable[self.zoomIndex].pixelPerSeconds;
            self.scaleSteps = self.zoomTable[self.zoomIndex].scaleSteps;
            this.scales = [];
            self.calculateTimelineWidth();
        }

        this.roundTime = function (time) {
            return Math.round(time * self.timelineQuantization) / self.timelineQuantization;
        };

        this.swapChunkKeyPositionOneToPositionTwo = function (keyPositionOne, keyPositionTwo, listType) {
            if(angular.isDefined(self.timelineList[listType][keyPositionOne]) && angular.isDefined(self.timelineList[listType][keyPositionTwo])) {
                // change start and end of timelineList object one and object two
                var deltaTimeValueChunkOne = self.roundTime(self.timelineList[listType][keyPositionOne].end - self.timelineList[listType][keyPositionOne].start);
                var deltaTimeValueChunkTwo = self.roundTime(self.timelineList[listType][keyPositionTwo].end - self.timelineList[listType][keyPositionTwo].start);
                var endChunkTwo = self.timelineList[listType][keyPositionTwo].end;
                var startChunkOne = self.timelineList[listType][keyPositionOne].start;

                self.timelineList[listType][keyPositionOne].end = endChunkTwo;
                self.timelineList[listType][keyPositionOne].start = self.roundTime(self.timelineList[listType][keyPositionOne].end - deltaTimeValueChunkOne);

                self.timelineList[listType][keyPositionTwo].start = startChunkOne;
                self.timelineList[listType][keyPositionTwo].end = self.roundTime(self.timelineList[listType][keyPositionTwo].start + deltaTimeValueChunkTwo);

                // change timelineList object key position of object one and object two
                var  tempPosition = self.timelineList[listType][keyPositionOne];
                self.timelineList[listType][keyPositionOne] = self.timelineList[listType][keyPositionTwo];
                self.timelineList[listType][keyPositionTwo] = tempPosition;
            }
        };

        this.swapChunkWithPreviousObject = function (focusedChunkKey, listType) {
            var previousFocusedChunkKey = focusedChunkKey - 1;
            if(angular.isDefined(self.timelineList[listType][focusedChunkKey]) && angular.isDefined(self.timelineList[listType][previousFocusedChunkKey])) {
                self.swapChunkKeyPositionOneToPositionTwo(previousFocusedChunkKey, focusedChunkKey, listType);
            }

            self.saveTimelineStep();
        };

        this.swapChunkWithNextObject = function (focusedChunkKey, listType) {
            var nextFocusedChunkKey = focusedChunkKey + 1;
            if(angular.isDefined(self.timelineList[listType][focusedChunkKey]) && angular.isDefined(self.timelineList[listType][nextFocusedChunkKey])) {
                self.swapChunkKeyPositionOneToPositionTwo(focusedChunkKey, nextFocusedChunkKey, listType);
            }

            self.saveTimelineStep();
        };

        this.cutChunk = function ($event, focusedChunkKey, listType, timeline) {
            var positionInPixel = $event.center.x + timeline[0].scrollLeft;
            var positionInTime = self.roundTime(positionInPixel / self.pixelPerSeconds);
            var newChunkAfterCut = self.createNewChunk(
                self.timelineList[listType][focusedChunkKey].objectListId,
                positionInTime,
                self.timelineList[listType][focusedChunkKey].end,
                self.roundTime((positionInTime - self.timelineList[listType][focusedChunkKey].start + self.timelineList[listType][focusedChunkKey].offset)),
                self.timelineList[listType][focusedChunkKey].mute,
                self.timelineList[listType][focusedChunkKey].name
            );
            self.timelineList[listType][focusedChunkKey].end = positionInTime;
            self.sortedAddingObjectToTimelineList(newChunkAfterCut, listType);

            MvHelperService.updatePreviewPlayerParameters(self.timelineList['video'], self.timelineList['audio'], true);

            self.saveTimelineStep();
        };

        this.saveTimelineStep = function () {
            var savedStepsLength = this.savedSteps.length;

            if(savedStepsLength !== 0) {
                this.savedSteps.splice(this.savedStepsPointer + 1, this.savedSteps.length - (this.savedStepsPointer + 1), JSON.stringify(this.timelineList));
                this.savedStepsPointer++;
            }
            else {
                this.savedSteps.splice(this.savedStepsPointer, this.savedSteps.length - (this.savedStepsPointer + 1), JSON.stringify(this.timelineList));
            }

            if(this.savedStepsPointer >= this.savedStepsAmount) {
                this.savedSteps.shift();
                this.savedStepsPointer = savedStepsLength - 1;
            }

            // console.warn('savedsteps', this.savedSteps, 'pointer', this.savedStepsPointer);
        };

        this.undoTimelineAction = function () {
            if(this.savedStepsPointer > 0) {
                this.savedStepsPointer--;
                // console.log('savedStepsPointer', this.savedStepsPointer, 'savedSteps', this.savedSteps[this.savedStepsPointer]);
                // console.log('before undo:', this.timelineList);
                this.timelineList = JSON.parse(this.savedSteps[this.savedStepsPointer]);
                // console.log('after undo:', this.timelineList);
            }
            else {
                console.error('saved steps pointer is already 0');
            }
        };

        this.redoTimelineAction = function () {
            if(this.savedStepsPointer < this.savedSteps.length - 1) {
                this.savedStepsPointer++;
                // console.log('savedStepsPointer', this.savedStepsPointer, 'savedSteps', this.savedSteps[this.savedStepsPointer]);
                // console.log('before redo:', this.timelineList);
                this.timelineList = JSON.parse(this.savedSteps[this.savedStepsPointer]);
                // console.log('after redo:', this.timelineList);
            }
            else {
                console.error('saved steps pointer is already at end');
            }
        };

        this.init();
    }]);
