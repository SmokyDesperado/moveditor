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
            this.previousChunkPair = {
                video: null,
                audio: null
            }

            // preview player playing state parameters
            this.isPlaying = false;
            this.currentPlayTime = 0; // in ms
            this.timeAtStart = 0;
            this.timeAtPause = 0;
            this.jumpToTime = 0;

            // parameters for loop play
            this.loopPlay = false;
            this.positionA = 0; // in ms
            this.positionB = 0; // in ms

            this.DEBUG_LOGS = false;

            // ====================================================================================================
            // Preview player init
            // ====================================================================================================

            /*
             * Initialize position and range slider.
             */
            this.init = function () {
                document.getElementById('position_slider').step = TimelineService.timelineQuantizationValue;
                self.updateTimeDisplay(self.currentPlayTime);

                var rangeSlider = document.getElementById('preview_range_slider');
                noUiSlider.create(rangeSlider, {
                    animate: true,
                    behaviour: 'snap-hover',
                    connect: true,
                    tooltips: true,

                    start: [0, 999999999],
                    step: 100,
                    range: {
                        'min': 0,
                        'max': 999999999
                    },
                    format: {
                        to: function (value) {
                            return Math.round((value / 1000) * 10) / 10 + 's';
                        },
                        from: function (value) {
                            return value.replace('s', '');
                        }
                    }
                });
                rangeSlider.setAttribute('disabled', true);
                rangeSlider.noUiSlider.on('update', function(value, handle, unencoded, tap, positions){
                    switch (handle) {
                        case 0:
                            self.setPositionA(Math.round(unencoded[0]));
                            break;
                        case 1:
                            self.setPositionB(Math.round(unencoded[1]));
                            break;
                        default:
                            break;
                    }
                });
            }

            // ====================================================================================================
            // Preview player controls
            // ====================================================================================================

            this.play = function () {
                // console.log("play");

                if (!self.isPlaying) {
                    self.isPlaying = true;
                    self.timeAtStart = new Date().getTime() - self.jumpToTime;
                    self.previewPlayStep();
                } else {
                    self.pause();
                }
            }

            this.pause = function () {
                // console.log("pause");

                self.isPlaying = false;
                self.timeAtPause = self.currentPlayTime;
                self.jumpToTime = 0;
                clearTimeout(self.timeUpdateStepTimeout);

                var currentChunkPair = MvHelperService.getCurrentChunkPair(self.currentPlayTime, TimelineService.getTimelineList());
                MvHelperService.showCurrentVideoImage(currentChunkPair.video, ContentService.getContentList());
                var currentVideoElement = MvHelperService.getCurrentVideoElement(currentChunkPair.video, ContentService.getContentList());
                if (currentVideoElement != null) {
                    currentVideoElement.pause(); 
                    // BUG: before every pause(), check whether is promise playing
                    // Uncaught (in promise) DOMException: The play() request was interrupted by a call to pause().
                    // https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
                }

                document.getElementById("audio_0").pause();
            }

            /*
             * @newPosition in ms
             */
            this.jumpToPosition = function (newPosition) {
                // console.log("jump to ", newPosition);

                // pause current active <video> and <audio>
                var currentChunkPair = MvHelperService.getCurrentChunkPair(self.currentPlayTime, TimelineService.getTimelineList());
                if (currentChunkPair.video != null) {
                    var currentMedia = ContentService.getContentList()[currentChunkPair.video.objectListId];
                    if (currentMedia != null) {
                        if (currentMedia.type === "video") {
                            var currentVideoElement = document.getElementById("video_" + currentChunkPair.video.objectListId);
                            if (currentVideoElement != null) {
                                currentVideoElement.pause();
                            }
                        }
                    }
                }

                if (currentChunkPair.audio != null) {
                    var currentMedia = ContentService.getContentList()[currentChunkPair.audio.objectListId];
                    if (currentMedia != null) {
                        if (currentMedia.type === "audio") {
                            document.getElementById("audio_0").pause();
                        }
                    }
                }
                
                // update time parameters
                self.currentPlayTime = Math.max(0, Math.min(newPosition, MvHelperService.getTimelineDuration(TimelineService.getTimelineList())));
                document.getElementById('position_slider').value = self.currentPlayTime;
                TimelineService.setPositionPointer(self.currentPlayTime);
                self.jumpToTime = self.currentPlayTime;
                self.timeAtStart = new Date().getTime() - self.jumpToTime;
                self.timeAtPause = 0;
                self.updateTimeDisplay(self.currentPlayTime);

                if (self.DEBUG_LOGS) {
                    console.log("============================== JUMP ==============================");
                    console.log("NP: " + newPosition + ", CPT: " + self.currentPlayTime + ", TAS: " + self.timeAtStart);
                    console.log("============================== JUMP ==============================");
                }

                MvHelperService.calculateVideoAudioOffsetPosition(self.currentPlayTime, ContentService.getContentList(), TimelineService.getTimelineList());

                // if player is currently playing, then continue playing again
                if (self.isPlaying) {
                    clearTimeout(self.timeUpdateStepTimeout);
                    self.previewPlayStep();
                }
            }

            this.setLoopPlay = function (loop) {
                // console.log("loop: ", loop);
                self.loopPlay = loop;
            }

            /*
             * @position in ms
             */
            this.setPositionA = function (position) {
                // console.log("positionA: ", position);
                self.positionA = position;
                TimelineService.setTimeA(position);
            }

            /*
             * @position in ms
             */
            this.setPositionB = function (position) {
                // console.log("positionB: ", position);
                self.positionB = position;
                TimelineService.setTimeB(position);
            }

            /*
             * Set volume of all <video> and <audio>.
             * @vol volume in range [0.0 ... 1.0]
             */
            this.setVolume = function (vol) {
                // console.log("volume: ", vol);

                var videoElements = document.getElementById('active_media').getElementsByTagName("video");
                for (var i = 0; i < videoElements.length; i++) {
                    videoElements[i].volume = vol;
                }
                document.getElementById("audio_0").volume = vol;
            }

            // ====================================================================================================
            // Preview play and time update step
            // Needed to seperate previewPlayStep() and timeUpdateStep() so that preview player does not 
            // take a timeStepInterval of time before it starts playing.
            // ====================================================================================================

            /**
             * PART 1: Loop for preview play functionalities.
             */
            self.previewPlayStep = function () {

                // when current chunk has changed, then pause previously active video and audio
                var currentChunkPair = MvHelperService.getCurrentChunkPair(self.currentPlayTime, TimelineService.getTimelineList());
                if (self.previousChunkPair.video !== currentChunkPair.video && self.previousChunkPair.video != null) {
                    var previousVideoImage = ContentService.getContentList()[self.previousChunkPair.video.objectListId];
                    if (previousVideoImage != null) {
                        if (previousVideoImage.type === "video") {
                            var previousVideoImageElement = document.getElementById("video_" + self.previousChunkPair.video.objectListId);
                            if (previousVideoImageElement != null) {
                                previousVideoImageElement.pause();
                            }
                        }
                    }
                }

                if (self.previousChunkPair.audio !== currentChunkPair.audio && self.previousChunkPair.audio != null) {
                    var previousAudio = ContentService.getContentList()[self.previousChunkPair.audio.objectListId];
                    if (previousAudio != null) {
                        if (previousAudio.type === "audio") {
                            document.getElementById("audio_0").pause();
                        }
                    }
                }

                // get current active video, image or audio and show/play these at correct offset position
                MvHelperService.showCurrentVideoImage(currentChunkPair.video, ContentService.getContentList());
                var currentVideoElement = MvHelperService.getCurrentVideoElement(currentChunkPair.video, ContentService.getContentList());
                if (currentVideoElement != null) {
                    if (self.previousChunkPair.video !== currentChunkPair.video) {
                        currentVideoElement.currentTime = MvHelperService.calculateMediaOffsetTime(self.currentPlayTime, currentChunkPair.video) / 1000;
                    }
                    currentVideoElement.muted = currentChunkPair.video.mute;
                    if (currentVideoElement.paused) {currentVideoElement.play();}
                }

                var sourceIsSet = MvHelperService.setCurrentAudioSource(currentChunkPair.audio, ContentService.getContentList());
                if (sourceIsSet) {
                    var currentAudioElement = document.getElementById("audio_0");
                    if (self.previousChunkPair.audio !== currentChunkPair.audio) {
                        currentAudioElement.currentTime = MvHelperService.calculateMediaOffsetTime(self.currentPlayTime, currentChunkPair.audio) / 1000;
                    }
                    currentAudioElement.muted = currentChunkPair.audio.mute;
                    if (currentAudioElement.paused) {currentAudioElement.play();}
                }

                self.previousChunkPair = currentChunkPair;

                // check whether player should stop or restart on loop if reached the end or positionB
                if (self.currentPlayTime === self.positionB || self.currentPlayTime >= document.getElementById('position_slider').max) {
                    if (self.loopPlay && self.positionA !== self.positionB && document.getElementById('position_slider').max !== 0) {
                        self.jumpToPosition(self.positionA);
                    } else {
                        self.pause();
                    }
                    return;
                }

                // self-adjusting algorithm for more accuracy from https://www.sitepoint.com/creating-accurate-timers-in-javascript/
                var realTime = new Date().getTime();
                var diff = ((realTime - self.timeAtStart) + self.timeAtPause) - self.currentPlayTime;

                if (self.DEBUG_LOGS) {
                    console.log("(RT - TAS) + TAP: " + ((realTime - self.timeAtStart) + self.timeAtPause) + ", CPT: " + self.currentPlayTime + ", diff: " + diff);
                    console.log("RT - TAS: " + (realTime - self.timeAtStart) + ", TAP: " + self.timeAtPause + ", JTT: " + self.jumpToTime);
                }

                // call pseudo-recursive timeUpdateStepTimeout after a adjusted time amount to keep the loops precise
                self.timeUpdateStepTimeout = setTimeout(self.timeUpdateStep, TimelineService.timelineQuantizationValue - diff);
            }

            /**
             * PART 2: Loop for time display and adjustment logic.
             */
            this.timeUpdateStep = function () {

                // increment current time and update time display
                self.currentPlayTime += TimelineService.timelineQuantizationValue;
                document.getElementById('position_slider').value = self.currentPlayTime;
                TimelineService.setPositionPointer(self.currentPlayTime);
                self.updateTimeDisplay(self.currentPlayTime);

                // call previewPlayStep again
                self.previewPlayStep();
            }

            // ====================================================================================================
            // Preview player helper functions
            // ====================================================================================================

            /*
             * Display in ms in the form of hh:mm:ss:ms, e.g. 02:34:12:20.
             */
            this.updateTimeDisplay = function (time) {

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

        }
    ]);
