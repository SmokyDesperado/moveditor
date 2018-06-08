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
        function (ContentService) {

        var self = this;

        var timeDisplay = null;
        var activeMediaContainer = null;
        var timeStepLoop = null;
        var previousChunkPair = [null, null]; // [video/image, audio]

        var currentPlayTime = 0;
        var timeAtStart = 0;
        var timeAtPause = 0;
        var jumpToTime = 0;
        
        var positionA = 0;
        var positionB = 0;

        var isPlaying = false;
        var loopPlay = false;

        var timeStepInterval = 100; // in ms // BUG: bug mit 1000, fängt den ersten step erst nach 1 sekunde an
        var preciseTimeInterval = true;
        var DEBUG_LOGS = false;

        // ====================================================================================================
        // Dummy data
        // ====================================================================================================

        // one drive -> https://1drv.ms/v/s!AsLQUku5IU5olQAMkS7fVnCtyJx8
        //              eingeben und beim ersten redirect load abbrechen.
        //              link danach 'redirect' durch 'download' ersetzen
        // dropbox link -> 'www' durch 'dl'

        var contentList = [
            { id: 0, url: 'http://corrupt-system.de/assets/media/bigbugbunny/bbb_trailer.m4v', type: "video", activeElements: 2 }
            , { id: 1, url: 'http://corrupt-system.de/assets/media/sintel/sintel-trailer.m4v', type: "video", activeElements: 1 }
            , { id: 2, url: 'https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0', type: "video", activeElements: 1 }
            , { id: 3, url: 'https://onedrive.live.com/download?resid=684E21B94B52D0C2!2688&authkey=!AAyRLt9WcK3InHw&ithint=video%2cmp4', type: "video", activeElements: 1 }
            , { id: 4, url: 'https://drive.google.com/uc?export=download&id=0B4BsAbG4atWHQzVfLUU3UnhhZTA', type: "video", activeElements: 1 }
            , { id: 5, url: 'https://www.bensound.com/bensound-music/bensound-betterdays.mp3', type: "audio", activeElements: 0 }
            , { id: 6, url: 'https://jpgames.de/wp-content/uploads/2014/12/One-Piece-Pirate-Warriors-3_2014_12-19-14_004-620x250.jpg?x37583', type: "image", activeElements: 1 }
            , { id: 7, url: 'https://jpgames.de/wp-content/uploads/2018/05/CI_NSwitch_HyruleWarriorsDefinitiveEdition_Link-Triforce_image950w.bmp-620x250.jpg?x37583', type: "image", activeElements: 1 }
        ];

        var videoImageChunkList = [
            { contentID: 0, start: 0, end: 2000, offset: 5000, mute: false }
            , { contentID: 1, start: 2000, end: 4000, offset: 20000, mute: false }
            , { contentID: 2, start: 4000, end: 5000, offset: 3000, mute: false }
            , { contentID: 3, start: 6000, end: 8000, offset: 0, mute: false }
            , { contentID: 4, start: 8000, end: 10000, offset: 5000, mute: false }
            , { contentID: 6, start: 10000, end: 12000, offset: 0, mute: false }
            , { contentID: 7, start: 12000, end: 14000, offset: 0, mute: false }
            , { contentID: 0, start: 14000, end: 16000, offset: 15000, mute: false }
        ];

        var audioChunkList = [
        ];

        // ====================================================================================================
        // Preview player initialization
        // ====================================================================================================

        this.initPlayer = function (timeDisplayElement, activeMediaContainerElement) {

            // save timeDisplay and activeMediaContainer element
            timeDisplay = timeDisplayElement;
            activeMediaContainer = activeMediaContainerElement;

            // delete all video, img and audio elements from activeMediaContainer, just a safety measure
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

            // create video elements for every active video in the timeline area
            for (var i = 0; i < videoImageChunkList.length; i++) {

                // add new video element only once, i.e. only if id doesn't exist yet
                var contentMedia = contentList[videoImageChunkList[i].contentID];
                if (contentMedia.type == "video" && document.getElementById("video_" + videoImageChunkList[i].contentID) == null) {
                    var video = document.createElement("video");
                    video.src = contentMedia.url;
                    video.id = "video_" + contentMedia.id;
                    video.controls = true;
                    video.preload = "true";
                    video.style.zIndex = "-1";
                    activeMediaContainer.appendChild(video);
                }
            }

            // initial positionB is end of timeline
            positionB = Math.max(self.getChunklistLength("video"), self.getChunklistLength("audio"));

            // create only one image element which source will be changed throughout preview play
            var image = document.createElement("img");
            image.src = "";
            image.id = "image_0";
            image.style.zIndex = "-1";
            activeMediaContainer.appendChild(image);

            // create only one audio element which source will be changed throughout preview play
            var audio = document.createElement("audio");
            audio.src = "";
            audio.id = "audio_0";
            audio.style.zIndex = "-1";
            activeMediaContainer.appendChild(audio);

            // if first chunk starts at 0 then bring video/image to the front
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

            // pause active video element and only let current media element be shown
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

            // pause current active video element
            var currentChunkPair = self.getCurrentChunkPair();
            if (currentChunkPair[0] != null) {
                var currentMedia = contentList[currentChunkPair[0].contentID];
                if (currentMedia.type == "video") {
                    var currentVideoElement = document.getElementById("video_" + currentMedia.id);
                    currentVideoElement.pause();
                }
            }
            
            // update time parameters
            currentPlayTime = newPosition;
            jumpToTime = currentPlayTime;
            timeAtStart = new Date().getTime() - jumpToTime;
            timeAtPause = 0;
            
            // update time display
            self.updateTimeDisplay(timeDisplay);

            if (DEBUG_LOGS) {
                console.log("======================= JUMP =======================");
                console.log("NP: " + newPosition + ", CPT: " + currentPlayTime + ", TAS: " + timeAtStart);
                console.log("======================= JUMP =======================");
            }

            // check what video should be active now and calculate its position
            currentChunkPair = self.getCurrentChunkPair();
            var currentVideoElement = self.showCurrentVideoImage(currentChunkPair[0]);
            if (currentVideoElement != null) {
                currentVideoElement.currentTime = self.calculateMediaOffsetTime(currentChunkPair[0]) / 1000;
            }

            // if player is currently playing, then continue playing again
            if (isPlaying) {
                clearTimeout(timeStepLoop);
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
            // set volume of all videos and audio elements
            var videoElements = activeMediaContainer.getElementsByTagName("video");
            for (var i = 0; i < videoElements.length; i++) {
                videoElements[i].volume = vol;
            }
            document.getElementById("audio_0").volume = vol;
        }

        this.setMute = function (mute) {
            // mute all videos and audio elements
            var videoElements = activeMediaContainer.getElementsByTagName("video");
            for (var i = 0; i < videoElements.length; i++) {
                videoElements[i].muted = mute;
            }
            document.getElementById("audio_0").mute = mute;
        }

        // ====================================================================================================
        // Preview player time step loop and further logic
        // ====================================================================================================

        /**
         * @selfAdjustment use self-adjusting algorithm for more accurate preview player time, may use more cpu
         */
        this.timeStep = function (selfAdjustment) {

            // check whether should stop playing or restart on loop if reached the end or positionB
            var endTime = Math.max(self.getChunklistLength("video"), self.getChunklistLength("audio"));
            if (currentPlayTime == positionB || currentPlayTime >= endTime) {
                if (loopPlay) {
                    self.jumpToPosition(positionA);
                } else {
                    self.pause();
                }
                return;
            }

            // increment current time
            currentPlayTime += timeStepInterval;

            // update time display
            self.updateTimeDisplay(timeDisplay);

            // self-adjusting algorithm from https://www.sitepoint.com/creating-accurate-timers-in-javascript/
            var diff = 0;
            if (selfAdjustment) {
                var realTime = new Date().getTime();
                var diff = ((realTime - timeAtStart) + timeAtPause) - currentPlayTime;

                if (DEBUG_LOGS) {
                    console.log("(RT - TAS) + TAP: " + ((realTime - timeAtStart) + timeAtPause) + ", CPT: " + currentPlayTime + ", diff: " + diff);
                    console.log("RT - TAS: " + (realTime - timeAtStart) + ", TAP: " + timeAtPause + ", JTT: " + jumpToTime);
                }
            }

            // BETA: more self-adjustment based on active video playing time
            if (0) {
                diff -= (currentPlayTime - document.getElementById("video_0").currentTime * 1000);
            }

            // when current chunk has changed, then pause previously active video
            var currentChunkPair = self.getCurrentChunkPair();
            if (previousChunkPair[0] != currentChunkPair[0]) {
                if (previousChunkPair[0] != null) {
                    var previousVideoImage = contentList[previousChunkPair[0].contentID];
                    if (previousVideoImage.type == "video") {
                        var previousVideoImageElement = document.getElementById("video_" + previousVideoImage.id);
                        previousVideoImageElement.pause();
                    }
                }
            }

            // if current video/image chunk is of type video, then play new active video element
            var currentVideoElement = self.showCurrentVideoImage(currentChunkPair[0]);
            if (currentVideoElement != null) {

                // if starting a new chunk, then set video offset
                if (previousChunkPair[0] != currentChunkPair[0]) {
                    currentVideoElement.currentTime = self.calculateMediaOffsetTime(currentChunkPair[0]) / 1000;
                }
                currentVideoElement.muted = currentChunkPair[0].mute;
                currentVideoElement.play();                    
            }
            previousChunkPair = currentChunkPair;

            // repeat
            self.startPlayTime(diff);
        }

        this.startPlayTime = function (diff) {
            timeStepLoop = setTimeout(self.timeStep.bind(null, preciseTimeInterval), timeStepInterval - diff);
        }

        // this.newChunkAdded = function (newChunk, type) {

        //     // TODO: maybe pause player before creating new video element, so that no buggy state can be reached

        //     // if chunk is a video, then add new element if video doesn't exist yet
        //     if (type == "video") {
                
        //         var newlyAddedChunk = videoImageChunkList[videoImageChunkList.length - 1];
        //         var newContentMedia = contentList[newlyAddedChunk.contentID];
        //         if (document.getElementById("video_" + newlyAddedChunk.contentID) == null) {
        //             var video = document.createElement("video");
        //             video.src = newContentMedia.url;
        //             video.id = "video_" + newContentMedia.id;
        //             video.controls = true;
        //             video.preload = "true";
        //             video.style.zIndex = "-1";
        //             activeMediaContainer.appendChild(video);
        //         }
        //     }
        // }

        // this.chunkDeleted = function (deletedChunk, type) {
            
        // }

        // ====================================================================================================
        // Helper functions
        // ====================================================================================================

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
                                        (milliseconds > 90 ? milliseconds/10 : "00");
        }

        this.getChunklistLength = function (type) {
            var chunkList = type == "video"? videoImageChunkList : audioChunkList;

            // length of chunklist in seconds is the same as the end time of last chunk
            var endTime = 0;
            if (chunkList.length > 0) {
                endTime = chunkList[chunkList.length - 1].end;
            }
            return endTime;
        }

        this.getCurrentChunkPair = function () {

            var currentChunk = [null, null]; // [video/image, audio]

            // iterate over all video/image chunks and check their start and end time
            for (var i = 0; i < videoImageChunkList.length; i++) {
                var c1 = videoImageChunkList[i];
                if (c1.start <= currentPlayTime && currentPlayTime < c1.end) {
                    currentChunk[0] = c1;
                    break;
                }
            }

            // iterate over all audio chunks and check their start and end time
            for (var i = 0; i < audioChunkList.length; i++) {
                var c2 = audioChunkList[i];
                // found current video/image chunk
                if (c2.start <= currentPlayTime && currentPlayTime < c2.end) {
                    currentChunk[1] = c2;
                    break;
                }
            }

            return currentChunk;
        }

        this.showCurrentVideoImage = function (currentChunk) {

            // hide all other video and image elements
            var videoElements = activeMediaContainer.getElementsByTagName("video");
            for (var i = 0; i < videoElements.length; i++) {
                videoElements[i].style.zIndex = "-1";
            }
            var imageElement = document.getElementById("image_0");
            imageElement.style.zIndex = "-1";

            // bring media element of current chunk to the front
            var currentVideoElement = null;
            if (currentChunk != null) {

                var currentMedia = contentList[currentChunk.contentID];
                if (currentMedia.type == "video") {
                    currentVideoElement = document.getElementById("video_" + currentMedia.id);
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
            return currentChunk.offset + (currentPlayTime - currentChunk.start);
        }

    }]);
