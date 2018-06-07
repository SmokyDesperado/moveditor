'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvPreview
 * @description
 * # mvPreview
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('mvPreviewService', function () {

        var self = this;

        var timeDisplay = null;
        var timeStepLoop = null;
        var activeVideo = null;

        var currentPlayTime = 0;
        var timeAtStart = 0;
        var timeAtPause = 0;
        var jumpToTime = 0;

        var positionA = 0;
        var positionB = 33000;

        var isPlaying = false;
        var loopPlay = false;

        var timeStepInterval = 100; // in ms
        var DEBUG = false;

        // ====================================================================================================
        // Preview player logic
        // ====================================================================================================

        this.initPlayer = function (timeDisplayElement, activeVideoList, activeImageList, videoAndImagesContainer, firstChunk) {

            // save timeDisplay element
            timeDisplay = timeDisplayElement;

            // delete all videos and images, just a safety measure
            var videoElements = videoAndImagesContainer.getElementsByTagName("video");
            var imgElements = videoAndImagesContainer.getElementsByTagName("img");
            while (videoElements[0]) {
                videoElements[0].parentNode.removeChild(videoElements[0]);
            }
            while (imgElements[0]) {
                imgElements[0].parentNode.removeChild(imgElements[0]);
            }

            // create video elements for every active video in the timeline area
            var vidIndex = 0;
            for (var i = 0; i < activeVideoList.length; i++) {
                var video = document.createElement("video");
                video.src = activeVideoList[vidIndex].url;
                video.id = "video_" + vidIndex;
                video.controls = true;
                video.preload = "true";
                video.style.zIndex = "-1";
                vidIndex++;

                videoAndImagesContainer.appendChild(video);
            }

            // create one only image element which source will be changed throughout preview play
            var image = document.createElement("img");
            image.src = activeImageList[0].url;
            image.id = "image_0";
            image.style.zIndex = "-1";
            videoAndImagesContainer.appendChild(image);

            // TODO: create only one audio element which source will be changed only throughout preview play
            var audio = document.createElement("audio");
            audio.src = "";
            audio.id = "audio_0";
            audio.style.zIndex = "-1";
            videoAndImagesContainer.appendChild(audio);

            // bring first chunk to the front if starts with video or image
            if (firstChunk != null && firstChunk.start == 0) {
                if (firstChunk.type == "video") {
                    document.getElementById("video_" + firstChunk.URLIndex).style.zIndex = "0";
                }
                else if (firstChunk.type == "image") {
                    var firstImage = document.getElementById("image_0");
                    firstImage.style.zIndex = "0";
                    firstImage.src = activeImageList[firstChunk.URLIndex].url;
                }
            }

            // document.getElementById("video_0").ontimeupdate = function () {self.timeStep(false)};
            // document.getElementById("video_0").play();
            // self.play();
        }

        this.changeActiveVideoOrImage = function (activeVideoList, activeImageList, currentChunk, nextChunk) {
            // TODO: changed currently visible video or image element
        }

        this.updateActiveVideoList = function () {
            console.log("updateActiveVideoList");
        }

        this.updateVideoChunkOrder = function () {
            console.log("updateVideoChunkOrder");
        }

        this.playCurrentChunk = function () {

        }

        // ====================================================================================================
        // Preview player controls
        // ====================================================================================================

        this.play = function () {
            if (!isPlaying) {
                isPlaying = true;
                timeAtStart = new Date().getTime() - jumpToTime;
                self.startPlayTime(0);
            } else {
                self.pause();
            }
        }

        this.pause = function () {
            isPlaying = false;
            timeAtPause = currentPlayTime;
            jumpToTime = 0;
            clearTimeout(timeStepLoop);

            // TODO: pause current active video element
            document.getElementById("video_0").pause();
        }

        this.goToStart = function () {

            // reset all time parameters update time display
            currentPlayTime = 0;
            timeAtPause = 0;
            self.updateTimeDisplay(timeDisplay);

            // TODO: bring first chunk to the front
            document.getElementById("video_0").currentTime = 0;

            // if player is currently playing, then continue playing again
            if (isPlaying) {
                clearTimeout(timeStepLoop);
                timeAtStart = new Date().getTime();
                self.startPlayTime(0);
            }
        }

        this.setLoopPlay = function (loop) {
            loopPlay = loop;
        }

        this.setPositionA = function (position) {
            positionA = position;
        }

        this.setPositionB = function (position) {
            positionB = position;
        }

        this.setVolume = function (vol) {
            // TODO: set volume of all active video elements
            //       what about audios?
        }

        this.setMute = function (mute) {
            // TODO: mute all active video elements
            //       what about audios?
        }

        this.jumpToPosition = function (newPosition) {

            currentPlayTime = newPosition;
            jumpToTime = currentPlayTime;
            timeAtPause = 0;

            // update time display
            self.updateTimeDisplay(timeDisplay);
            timeAtStart = new Date().getTime() - jumpToTime;

            if (DEBUG) {
                console.log("======================= JUMP =======================");
                console.log("NP: " + newPosition + ", CPT: " + currentPlayTime + ", TAS: " + timeAtStart);
                console.log("======================= JUMP =======================");
            }

            // TODO: check what video should be active now and calculate its position
            document.getElementById("video_0").currentTime = newPosition / 1000;

            // if player is currently playing, then continue playing again
            if (isPlaying) {
                clearTimeout(timeStepLoop);
                self.startPlayTime(0);
            }
        }

        // ====================================================================================================
        // Preview player time step loop
        // ====================================================================================================

        /**
         * @selfAdjustment use self-adjusting algorithm for more accurate preview player time, may use more cpu
         */
        this.timeStep = function (selfAdjustment) {

            if (currentPlayTime == positionB) {
                if (loopPlay) {
                    self.jumpToPosition(positionA);
                } else {
                    self.pause();
                }
                return;
            }

            currentPlayTime += timeStepInterval;

            // update time display
            self.updateTimeDisplay(timeDisplay);

            // self-adjusting algorithm from https://www.sitepoint.com/creating-accurate-timers-in-javascript/
            var diff = 0;
            if (selfAdjustment) {
                var realTime = new Date().getTime();
                var diff = ((realTime - timeAtStart) + timeAtPause) - currentPlayTime;

                if (DEBUG) {
                    console.log("(RT - TAS) + TAP: " + ((realTime - timeAtStart) + timeAtPause) + ", CPT: " + currentPlayTime + ", diff: " + diff);
                    console.log("RT - TAS: " + (realTime - timeAtStart) + ", TAP: " + timeAtPause + ", JTT: " + jumpToTime);
                }
            }

            // BETA: more self-adjustment based on active video playing time
            if (1) {
                diff -= (currentPlayTime - document.getElementById("video_0").currentTime * 1000);
            }

            // TODO: check whether chunks should start or end and do accordingly 
            document.getElementById("video_0").play();

            // repeat
            self.startPlayTime(diff);
        }

        this.startPlayTime = function (diff) {
            timeStepLoop = setTimeout(self.timeStep.bind(null, true), timeStepInterval - diff);
        }

        // ====================================================================================================
        // Auxiliary functions
        // ====================================================================================================

        this.getTimeLineLength = function (videoChunkList, audioChunkList) {

            // only need to check end time of last video or audio chunk
            var endTimeVideo = videoChunkList[videoChunkList.length - 1].end;
            var endTimeAudio = audioChunkList[audioChunkList.length - 1].end;

            return Math.max(endTimeVideo, endTimeAudio);
        }

        this.updateTimeDisplay = function (timeDisplay) {

            // display in "h:m:s:ms"
            var milliseconds = Math.floor((currentPlayTime % 1000));
            var seconds = Math.floor(currentPlayTime / 1000) % 60;
            var minutes = Math.floor(Math.floor(currentPlayTime / 1000) / 60) % 60;
            var hours = Math.floor(Math.floor(currentPlayTime / 1000) / 60 / 60) % 60;

            // modified timer display from https://jsfiddle.net/Daniel_Hug/pvk6p/
            timeDisplay.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" +
                (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" +
                (seconds ? (seconds > 9 ? seconds : "0" + seconds) : "00") + ":" +
                (milliseconds > 90 ? milliseconds / 10 : "00");
        }

    });
