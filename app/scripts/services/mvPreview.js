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
        this.positionB = 0;

        // config parameters
        this.timeStepInterval = 100; // in ms
        this.DEBUG_LOGS = false;

        // ====================================================================================================
        // Dummy data
        // ====================================================================================================

        // one drive -> https://1drv.ms/v/s!AsLQUku5IU5olQAMkS7fVnCtyJx8
        //              eingeben und beim ersten redirect load abbrechen.
        //              link danach 'redirect' durch 'download' ersetzen
        // dropbox link -> 'www' durch 'dl'

        var contentList = [
            { id: 0, url: 'http://corrupt-system.de/assets/media/bigbugbunny/bbb_trailer.m4v', type: "video", activeElements: 2 },
            { id: 1, url: 'http://corrupt-system.de/assets/media/sintel/sintel-trailer.m4v', type: "video", activeElements: 1 },
            { id: 2, url: 'https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0', type: "video", activeElements: 1 },
            { id: 3, url: 'https://onedrive.live.com/download?resid=684E21B94B52D0C2!2688&authkey=!AAyRLt9WcK3InHw&ithint=video%2cmp4', type: "video", activeElements: 1 },
            { id: 4, url: 'https://drive.google.com/uc?export=download&id=0B4BsAbG4atWHQzVfLUU3UnhhZTA', type: "video", activeElements: 1 },
            { id: 5, url: 'https://www.bensound.com/bensound-music/bensound-betterdays.mp3', type: "audio", activeElements: 0 },
            { id: 6, url: 'https://jpgames.de/wp-content/uploads/2014/12/One-Piece-Pirate-Warriors-3_2014_12-19-14_004-620x250.jpg?x37583', type: "image", activeElements: 1 },
            { id: 7, url: 'https://jpgames.de/wp-content/uploads/2018/05/CI_NSwitch_HyruleWarriorsDefinitiveEdition_Link-Triforce_image950w.bmp-620x250.jpg?x37583', type: "image", activeElements: 1 }
        ];

        var videoImageChunkList = [
            { contentID: 0, start: 0, end: 2000, offset: 8000, mute: false },
            { contentID: 1, start: 2000, end: 4000, offset: 20000, mute: false },
            { contentID: 2, start: 4000, end: 5000, offset: 3000, mute: false },
            { contentID: 3, start: 6000, end: 8000, offset: 0, mute: false },
            { contentID: 4, start: 8000, end: 10000, offset: 5500, mute: false },
            { contentID: 6, start: 10000, end: 12000, offset: 0, mute: false },
            { contentID: 7, start: 12000, end: 14000, offset: 0, mute: false },
            { contentID: 0, start: 14000, end: 16000, offset: 15000, mute: false }
        ];

        var audioChunkList = [
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
            for (var i = 0; i < videoImageChunkList.length; i++) {
                // add new <video> only once, i.e. only if id doesn't exist yet
                self.createVideoElementForChunk(videoImageChunkList[i]);
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
            self.positionB = Math.max(self.getChunklistLength("video"), self.getChunklistLength("audio"));
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
                var currentMedia = contentList[currentChunkPair[0].contentID];
                if (currentMedia.type == "video") {
                    var currentVideoElement = document.getElementById("video_" + currentMedia.id);
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
                    var previousVideoImage = contentList[self.previousChunkPair[0].contentID];
                    if (previousVideoImage.type == "video") {
                        var previousVideoImageElement = document.getElementById("video_" + previousVideoImage.id);
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
            var endTime = Math.max(self.getChunklistLength("video"), self.getChunklistLength("audio"));
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
        // Functions to be called by timeline when a new chunk is added or deleted
        // ====================================================================================================

        this.newChunkAdded = function (newChunk) {
            // create <video> if neccessary
            self.createVideoElementForChunk(newChunk);

            // update position slider max value if new chunk was added at the end of timeline
            document.getElementById('position_slider').max = Math.max(self.getChunklistLength("video"), self.getChunklistLength("audio"));
        }

        this.chunkDeleted = function (deletedChunk) {

            // if deleted chunk is of type video and no more active elements exists then remove its <video>
            var content = contentList[deletedChunk.contentID];
            if (content.type == "video" && content.activeElements == 0) {
                document.getElementById('active_media').removeChild(document.getElementById("video_" + content.id));
            }

            // update position slider max value if deleted chunk was at the end of timeline
            document.getElementById('position_slider').max = Math.max(self.getChunklistLength("video"), self.getChunklistLength("audio"));
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
                if (c1.start <= self.currentPlayTime && self.currentPlayTime < c1.end) { // TODO: at the end preview player is black, should be paused video
                    currentChunk[0] = c1;
                    break;
                }
            }

            // iterate over all audio chunks and check their start and end time
            for (var i = 0; i < audioChunkList.length; i++) {
                var c2 = audioChunkList[i];
                // found current video/image chunk
                if (c2.start <= self.currentPlayTime && self.currentPlayTime < c2.end) {
                    currentChunk[1] = c2;
                    break;
                }
            }

            return currentChunk;
        }

        this.createVideoElementForChunk = function (chunk) {

            // if chunk is a video, then add new <video> if video doesn't exist yet
            var content = contentList[chunk.contentID];
            if (content.type == "video" && document.getElementById("video_" + content.id) == null) {
                var video = document.createElement("video");
                video.src = content.url;
                // video.src = content.url + "#t=" + chunk.start + "," + chunk.end;
                video.id = "video_" + content.id;
                video.controls = false;
                video.preload = "auto";
                video.style.zIndex = "-1";
                document.getElementById('active_media').appendChild(video);
            }
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
            return currentChunk.offset + (self.currentPlayTime - currentChunk.start);
        }

    }]);
