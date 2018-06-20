'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvPreview
 * @description
 * # mvPreview
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('mvPreviewService', [
        'ContentService',
        'TimelineService',
        'MvHelperService',
        function (ContentService, TimelineService, MvHelperService) {

        var self = this;

        // ====================================================================================================
        // Preview player parameters
        // ====================================================================================================

        // objects for interaction between function calls
        this.timeUpdateStepTimeout = null;
        this.previousChunkPair = [null, null]; // [video/image, audio]

        // preview player playing state parameters
        this.isPlaying = false;
        this.currentPlayTime = 0;
        this.timeAtStart = 0;
        this.timeAtPause = 0;
        this.jumpToTime = 0;

        // parameters for loop play
        this.loopPlay = false;
        this.positionA = 0;
        this.positionB = 60000;

        // config parameters
        this.timeStepInterval = 100; // in ms
        this.DEBUG_LOGS = false;

        // ====================================================================================================
        // Dummy data
        // ====================================================================================================

        this.audioChunkList = [
        ];

        // ====================================================================================================
        // Preview player initialization
        // ====================================================================================================

        this.initPlayer = function () {

            // delete all <video>, <img> and <audio> from activeMediaContainer, just a safety measure
            var activeMediaContainer = document.getElementById('active_media');
            var videoElements = activeMediaContainer.getElementsByTagName("video");
            var imgElements = activeMediaContainer.getElementsByTagName("img");
            var audioElements = activeMediaContainer.getElementsByTagName("audio");
            while (videoElements[0]) {
                videoElements[0].parentNode.removeChild(videoElements[0]);
            }
            while (imgElements[0]) {
                imgElements[0].parentNode.removeChild(imgElements[0]);
            }
            while (audioElements[0]) {
                audioElements[0].parentNode.removeChild(audioElements[0]);
            }

            // create <video> for every active video in the timeline area
            for (var i = 0; i < TimelineService.getTimelineList().length; i++) {
                // add new <video> only once, i.e. only if id doesn't exist yet
                self.createVideoElementForChunk(TimelineService.getTimelineList()[i], ContentService.getContentList());
            }

            // create only one <img> which source will be changed throughout preview play
            var image = document.createElement("img");
            image.src = "";
            image.id = "image_0";
            image.style.zIndex = "-1";
            activeMediaContainer.appendChild(image);

            // create only one <audio> which source will be changed throughout preview play
            var audio = document.createElement("audio");
            audio.src = "";
            audio.id = "audio_0";
            audio.style.zIndex = "-1";
            activeMediaContainer.appendChild(audio);

            // init time display
            self.updateTimeDisplay(self.currentPlayTime);

            // setup initial positionB which is the end of chunkList and position slider parameters
            self.positionB = Math.max(MvHelperService.getTimelineDuration(TimelineService.getTimelineList(), self.audioChunkList), self.positionB);
            document.getElementById('position_slider').max = self.positionB;
            document.getElementById('position_slider').step = self.timeStepInterval;

            // if first video/image chunk starts at 0 then bring that element to the front
            var currentChunkPair = self.getCurrentChunkPair();
            var currentVideoElement = self.showCurrentVideoImage(currentChunkPair[0]);
            if (currentVideoElement != null) {
                currentVideoElement.currentTime = self.calculateMediaOffsetTime(currentChunkPair[0]) / 1000;
            }
        }

        // ====================================================================================================
        // Preview player controls
        // ====================================================================================================

        this.play = function () {
            console.log("play");

            if (!self.isPlaying) {
                self.isPlaying = true;
                self.timeAtStart = new Date().getTime() - self.jumpToTime;
                self.previewPlayStep();
            } else {
                self.pause();
            }
        }

        this.pause = function () {
            console.log("pause");

            self.isPlaying = false;
            self.timeAtPause = self.currentPlayTime;
            self.jumpToTime = 0;
            clearTimeout(self.timeUpdateStepTimeout);

            // pause active <video> and only let current media element be shown
            var currentChunkPair = self.getCurrentChunkPair();
            var currentVideoElement = self.showCurrentVideoImage(currentChunkPair[0]);
            if (currentVideoElement != null) {
                currentVideoElement.pause(); 
                // BUG: before every pause(), check whether is promise playing
                // Uncaught (in promise) DOMException: The play() request was interrupted by a call to pause().
                // https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
            }
        }

        this.jumpToPosition = function (newPosition) {
            console.log("jump to ", newPosition);

            // pause current active <video>
            var currentChunkPair = self.getCurrentChunkPair();
            if (currentChunkPair[0] != null) {
                var currentMedia = ContentService.getContentList()[currentChunkPair[0].objectListId];
                if (currentMedia.type == "video") {
                    var currentVideoElement = document.getElementById("video_" + currentChunkPair[0].objectListId);
                    currentVideoElement.pause();
                }
            }
            
            // update time parameters
            self.currentPlayTime = newPosition;
            document.getElementById('position_slider').value = self.currentPlayTime;
            self.jumpToTime = self.currentPlayTime;
            self.timeAtStart = new Date().getTime() - self.jumpToTime;
            self.timeAtPause = 0;
            
            // update time display
            self.updateTimeDisplay(self.currentPlayTime);

            if (self.DEBUG_LOGS) {
                console.log("============================== JUMP ==============================");
                console.log("NP: " + newPosition + ", CPT: " + self.currentPlayTime + ", TAS: " + self.timeAtStart);
                console.log("============================== JUMP ==============================");
            }

            // check what video should be active now and calculate its position
            currentChunkPair = self.getCurrentChunkPair();
            var currentVideoElement = self.showCurrentVideoImage(currentChunkPair[0]);
            if (currentVideoElement != null) {
                currentVideoElement.currentTime = self.calculateMediaOffsetTime(currentChunkPair[0]) / 1000;
            }

            // if player is currently playing, then continue playing again
            if (self.isPlaying) {
                clearTimeout(self.timeUpdateStepTimeout);
                self.previewPlayStep();
            }
        }

        this.setLoopPlay = function (loop) {
            console.log("loop: ", loop);
            self.loopPlay = loop;
        }

        this.setPositionA = function (position) {
            console.log("positionA: ", position);
            self.positionA = position;
        }

        this.setPositionB = function (position) {
            console.log("positionB: ", position);
            self.positionB = position;
        }

        this.setVolume = function (vol) {
            console.log("volume: ", vol);

            // set volume of all videos and <audio>
            var videoElements = document.getElementById('active_media').getElementsByTagName("video");
            for (var i = 0; i < videoElements.length; i++) {
                videoElements[i].volume = vol;
            }
            document.getElementById("audio_0").volume = vol;
        }

        this.setMute = function (mute) {
            console.log("mute: ", vol);

            // mute all videos and <audio>
            var videoElements = document.getElementById('active_media').getElementsByTagName("video");
            for (var i = 0; i < videoElements.length; i++) {
                videoElements[i].muted = mute;
            }
            document.getElementById("audio_0").mute = mute;
        }

        // ====================================================================================================
        // Preview play and time update step
        // Needed to seperate previewPlayStep() and timeUpdateStep() so that preview player does not 
        // take a timeStepInterval of time before it starts playing.
        // ====================================================================================================

        /**
         * Loop for preview play functionalities.
         * @diff
         */
        self.previewPlayStep = function () {

            // when current chunk has changed, then pause previously active video
            var currentChunkPair = self.getCurrentChunkPair();
            if (self.previousChunkPair[0] != currentChunkPair[0]) {
                if (self.previousChunkPair[0] != null) {
                    var previousVideoImage = ContentService.getContentList()[self.previousChunkPair[0].objectListId];
                    if (previousVideoImage.type == "video") {
                        var previousVideoImageElement = document.getElementById("video_" + self.previousChunkPair[0].objectListId);
                        previousVideoImageElement.pause();
                    }
                }
            }

            // if current video/image chunk is of type video, then play new active <video>
            var currentVideoElement = self.showCurrentVideoImage(currentChunkPair[0]);
            if (currentVideoElement != null) {

                // if starting a new chunk, then set video offset
                if (self.previousChunkPair[0] != currentChunkPair[0]) {
                    currentVideoElement.currentTime = self.calculateMediaOffsetTime(currentChunkPair[0]) / 1000;
                }
                currentVideoElement.muted = currentChunkPair[0].mute;
                currentVideoElement.play();                    
            }
            self.previousChunkPair = currentChunkPair;

            // check whether should stop playing or restart on loop if reached the end or positionB
            var endTime = Math.max(MvHelperService.getTimelineDuration(TimelineService.getTimelineList(), self.audioChunkList));
            if (self.currentPlayTime == self.positionB || self.currentPlayTime >= endTime) {
                if (self.loopPlay && self.positionA != self.positionB) {
                    self.jumpToPosition(self.positionA);
                } else {
                    self.pause();
                }
                return;
            }

            // self-adjusting algorithm from https://www.sitepoint.com/creating-accurate-timers-in-javascript/
            var realTime = new Date().getTime();
            var diff = ((realTime - self.timeAtStart) + self.timeAtPause) - self.currentPlayTime;

            if (self.DEBUG_LOGS) {
                console.log("(RT - TAS) + TAP: " + ((realTime - self.timeAtStart) + self.timeAtPause) + ", CPT: " + self.currentPlayTime + ", diff: " + diff);
                console.log("RT - TAS: " + (realTime - self.timeAtStart) + ", TAP: " + self.timeAtPause + ", JTT: " + self.jumpToTime);
            }

            // call timeUpdateStepTimeout after a specific time amount
            self.timeUpdateStepTimeout = setTimeout(self.timeUpdateStep, self.timeStepInterval - diff);
        }

        /**
         * Loop for time display and adjustment logic.
         */
        this.timeUpdateStep = function () {

            // increment current time and update time display
            self.currentPlayTime += self.timeStepInterval;
            document.getElementById('position_slider').value = self.currentPlayTime;
            self.updateTimeDisplay(self.currentPlayTime);

            // call previewPlayStep again, but with adjusted time amount to keep the loops precise
            self.previewPlayStep();
        }

        // ====================================================================================================
        // Helper functions
        // ====================================================================================================

        this.updateTimeDisplay = function (time) {

            // display in "h:m:s:ms"
            var milliseconds = Math.floor((time % 1000));
            var seconds = Math.floor(time / 1000) % 60;
            var minutes = Math.floor(Math.floor(time / 1000) / 60) % 60;
            var hours = Math.floor(Math.floor(time / 1000) / 60 / 60) % 60;

            // modified timer display from https://jsfiddle.net/Daniel_Hug/pvk6p/
            document.getElementById('time_display').textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" +
                                        (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" +
                                        (seconds ? (seconds > 9 ? seconds : "0" + seconds) : "00") + ":" +
                                        (milliseconds > 90 ? milliseconds/10 : "00");
        }

        this.getCurrentChunkPair = function () {

            var currentChunk = [null, null]; // [video/image, audio]

            // iterate over all video/image chunks and check their start and end time
            for (var i = 0; i < TimelineService.getTimelineList().length; i++) {
                var c1 = TimelineService.getTimelineList()[i];
                if (c1.start * 1000 <= self.currentPlayTime && self.currentPlayTime < c1.end * 1000) { // TODO: at the end preview player is black, should be paused video
                    currentChunk[0] = c1;
                    break;
                }
            }

            // iterate over all audio chunks and check their start and end time
            for (var i = 0; i < self.audioChunkList.length; i++) {
                var c2 = self.audioChunkList[i];
                // found current video/image chunk
                if (c2.start * 1000 <= self.currentPlayTime && self.currentPlayTime < c2.end * 1000) {
                    currentChunk[1] = c2;
                    break;
                }
            }

            return currentChunk;
        }

        this.showCurrentVideoImage = function (currentChunk) {

            // hide all other <video> and <img>
            var videoElements = document.getElementById('active_media').getElementsByTagName("video");
            for (var i = 0; i < videoElements.length; i++) {
                videoElements[i].style.zIndex = "-1";
            }
            var imageElement = document.getElementById("image_0");
            imageElement.style.zIndex = "-1";

            // bring media element of current chunk to the front
            var currentVideoElement = null;
            if (currentChunk != null) {

                var currentMedia = ContentService.getContentList()[currentChunk.objectListId];
                if (currentMedia.type == "video") {
                    currentVideoElement = document.getElementById("video_" + currentChunk.objectListId);
                    currentVideoElement.style.zIndex = "0";
                } else { // if (currentMedia.type == "image")
                    var imageElement = document.getElementById("image_0");
                    imageElement.src = currentMedia.url;
                    imageElement.style.zIndex = "0";
                }
            }
            return currentVideoElement;
        }

        this.calculateMediaOffsetTime = function (currentChunk) {
            return currentChunk.offset + (self.currentPlayTime - currentChunk.start * 1000);
        }

    }]);
