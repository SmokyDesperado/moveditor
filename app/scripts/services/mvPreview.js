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

        var tenMilliseconds = 0, seconds = 0, minutes = 0, hours = 0;
        var timeOut = null;
        var timeDisplay = null;
        var isPlaying = false;
        var playTimeStart = 0;
        var timeAtPause = 0;
        var currentPlayTime = 0;
        var timeElapsed = '0.0'; 
        var timeStepInterval = 100; // in ms

        var isLooped = false;
        var positionA = 0;
        var positionB = 0;

        this.play = function () {
            if (!isPlaying) {
                isPlaying = true;
                playTimeStart = new Date().getTime();
                startPlayTime(0);
            } else {
                this.pause();
            }
        }

        this.pause = function () {
            isPlaying = false;
            timeAtPause = currentPlayTime;
            clearTimeout(timeOut);
        }

        this.goToStart = function () {
            
            // reset all parameters
            timeDisplay.textContent = "00:00:00:00";
            tenMilliseconds = 0;
            seconds = 0;
            minutes = 0;
            hours = 0;

            currentPlayTime = 0;
            timeElapsed = '0.0';
            timeAtPause = 0;

            // if player is currently playaing, then start playing again
            if (isPlaying) {
                clearTimeout(timeOut);
                playTimeStart = new Date().getTime();
                startPlayTime(0);
            }
        }

        this.setLoop = function (loop) {
            isLooped = loop;
        }

        this.setPositionA = function (position) {
            positionA = position;
        }

        this.setPositionB = function (position) {
            positionB = position;
        }

        this.setVolume = function (vol) {
            console.log(vol);
        }

        this.setMute = function (mute) {
            console.log(mute);
        }

        this.jumpToPosition = function (position) {
            console.log(position);
        }

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
            for(var i = 0; i < activeVideoList.length; i++) {               
                var video = document.createElement("video");
                video.src = activeVideoList[vidIndex].url;
                video.id = "video_" + vidIndex;
                video.controls = true;
                video.preload = "true";
                video.style.zIndex = "-1";
                vidIndex++;

                videoAndImagesContainer.appendChild(video);
            }

            // create one image element which source will be changed only throughout preview play
            var image = document.createElement("img");
            image.src = activeImageList[0].url;
            image.id = "image_0";
            image.style.zIndex = "-1";
            videoAndImagesContainer.appendChild(image);

            // bring first chunk to the front if starts with video or image
            if (firstChunk.start == 0) {
                if (firstChunk.type == "video") {
                    document.getElementById("video_" + firstChunk.URLIndex).style.zIndex = "0";
                    // this.play();
                    // document.getElementById("video_" + firstChunk.URLIndex).play();
                }
                else if (firstChunk.type == "image") {
                    var firstImage = document.getElementById("image_0");
                    firstImage.style.zIndex = "0";
                    firstImage.src = activeImageList[firstChunk.URLIndex].url;
                }
            }

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

        // ====================================================================================================

        this.getChunkListTimeInSeconds = function (chunkList) {
            var timeInSeconds = 0;
            for(var i = 0; i < chunkList.length; i++) {
                timeInSeconds = timeInSeconds + (chunkList[i].end - chunkList[i].start);
            }
            return timeInSeconds;
        }

        // create a stop watch class for current play time
        this.getCurrentPlayTime = function () {

        }

        // ====================================================================================================
        // Stopwatch
        // ====================================================================================================

        /**
         * @selfAdjustment use self-adjusting algorithm for more accurate preveiw player time, may use more cpu
         */
        function timeStep(selfAdjustment, displayTimeStyle, debugTime) {

            // modified timer display from https://jsfiddle.net/Daniel_Hug/pvk6p/
            currentPlayTime += timeStepInterval;
            tenMilliseconds += timeStepInterval;

            if (tenMilliseconds >= 1000) {
                tenMilliseconds = 0;
                seconds++;
                if (seconds >= 60) {
                    seconds = 0;
                    minutes++;
                    if (minutes >= 60) {
                        minutes = 0;
                        hours++;
                    }
                }
            }
            
            if (displayTimeStyle == 1) {

                // display in h:m:s:ms
                timeDisplay.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" +
                                            (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" +
                                            (seconds ? (seconds > 9 ? seconds : "0" + seconds) : "00") + ":" +
                                            (tenMilliseconds > 90 ? tenMilliseconds/10 : "00");
            } else {

                // display only in seconds
                timeElapsed = Math.floor(currentPlayTime / 100) / 10;
                if(Math.round(timeElapsed) == timeElapsed) { timeElapsed += '.0'; }
                timeDisplay.textContent = timeElapsed + "s";
            }

            // self-adjusting algorithm from https://www.sitepoint.com/creating-accurate-timers-in-javascript/
            var diff = 0;
            if (selfAdjustment) {
                var realTime = new Date().getTime();
                var diff = ((realTime - playTimeStart) + timeAtPause) - currentPlayTime;

                if (debugTime) {
                    console.log("(RT - PTS) + TAP: " + ((realTime - playTimeStart) + timeAtPause) + "ms, currentPlayTime: " + currentPlayTime + ", diff: " + diff + "ms");
                    console.log("RT - PTS: " + (realTime - playTimeStart) + ", TAP: "+timeAtPause);                    
                }
            }

            // TODO: check chunks to be played

            // repeat
            startPlayTime(diff);
        }

        function startPlayTime(diff) {
            timeOut = setTimeout(timeStep.bind(null, true, 1, false), timeStepInterval - diff);
        }

    });
