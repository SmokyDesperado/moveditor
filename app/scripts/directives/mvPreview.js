'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvPreview', ['mvPreviewService', function (mvPreviewService) {
        return {
            templateUrl: '/views/directives/mvPreview.html',
            replace: true,
            restrict: 'AE',
            link: function($scope, $element, $attrs) {

                var chunkIndex = 0;
                var loop = false;
                // var newVidEvent = true;

                // one drive -> https://1drv.ms/v/s!AsLQUku5IU5olQAMkS7fVnCtyJx8
                //              eingeben und beim ersten redirect load abbrechen.
                //              link danach 'redirect' durch 'download' ersetzen
                // dropbox link -> 'www' durch 'dl'
                var activeVideoList = [
                    { url: 'http://corrupt-system.de/assets/media/bigbugbunny/bbb_trailer.m4v' }
                    , { url: 'http://corrupt-system.de/assets/media/sintel/sintel-trailer.m4v' }
                    , { url: 'https://www.bensound.com/bensound-music/bensound-betterdays.mp3' }
                    , { url: 'https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0' }
                    , { url: 'https://onedrive.live.com/download?resid=684E21B94B52D0C2!2688&authkey=!AAyRLt9WcK3InHw&ithint=video%2cmp4' }
                    , { url: 'https://drive.google.com/uc?export=download&id=0B4BsAbG4atWHQzVfLUU3UnhhZTA' }
                ];

                var activeImageList = [
                    { url: 'https://jpgames.de/wp-content/uploads/2014/12/One-Piece-Pirate-Warriors-3_2014_12-19-14_004-620x250.jpg?x37583' }
                    , { url: 'https://jpgames.de/wp-content/uploads/2018/05/CI_NSwitch_HyruleWarriorsDefinitiveEdition_Link-Triforce_image950w.bmp-620x250.jpg?x37583' }
                ];

                var vidImgChunkList = [
                    { URLIndex: 0, start: 0, offset: 17, end: 19, type: "video" }
                    , { URLIndex: 1, start: 0, offset: 15, end: 17, type: "video" }
                    , { URLIndex: 2, start: 0, offset: 15, end: 17, type: "video" }
                    , { URLIndex: 3, start: 0, offset: 15, end: 17, type: "video" }
                    , { URLIndex: 4, start: 0, offset: 15, end: 17, type: "video" }
                    , { URLIndex: 5, start: 0, offset: 2, end: 4, type: "video" }
                    , { URLIndex: 0, start: 0, offset: 0, end: 3, type: "image" }
                    , { URLIndex: 1, start: 0, offset: 0, end: 3, type: "image" }
                ];

                // ============================================================================
                // preview_player setup
                // ============================================================================
                
                var videoAndImagesContainer = document.getElementById('active_videos_and_images');
                var time_display = document.getElementById('time_display');
                mvPreviewService.initPlayer(time_display, activeVideoList, activeImageList, videoAndImagesContainer, vidImgChunkList[0]);

                // ============================================================================
                // preview_player controls
                // ============================================================================
                
                $scope.play = function () {
                    mvPreviewService.play();
                }

                $scope.pause = function () {
                    mvPreviewService.pause();
                }

                $scope.goToStart = function () {
                    mvPreviewService.goToStart();
                }

                $scope.setVolume = function (vol) {
                    mvPreviewService.setVolume(vol);
                }

                $scope.setMute = function (mute) {
                    mvPreviewService.setMute(mute);
                }


                $scope.pos = 0;
                $scope.jumpToPosition = function (newPosition) {
                    mvPreviewService.jumpToPosition(newPosition)
                }

                // ====================================================================================================
                // Different approach
                // ====================================================================================================
                
                // var player = document.getElementById('video_0');
                // var vidURL = activeVideoList[vidImgChunkList[chunkIndex].URLIndex].url;
                // player.src = vidURL + '#t=' + vidImgChunkList[chunkIndex].offset + ',' + vidImgChunkList[chunkIndex].end;
                
                // // player.addEventListener('loadedmetadata', function() {
                // //     // this.currentTime = vidImgChunkList[chunkIndex].offset;
                // //     console.log(player.duration);
                // // }, false);

                // player.addEventListener('ended', playNextEvent, false);
                // //player.addEventListener('pause', playNextEvent, false);
                // function playNextEvent() {

                //     // get next video event index
                //     if (chunkIndex != vidImgChunkList.length-1) {
                //         chunkIndex++;
                //     } else {
                //         if (loop) {
                //             chunkIndex = 0;
                //         } else {
                //             return;
                //         }
                //     }

                //     // play source only in given interval
                //     var vidURL = activeVideoList[vidImgChunkList[chunkIndex].URLIndex].url;
                //     player.src = vidURL + '#t=' + vidImgChunkList[chunkIndex].offset + ',' + [chunkIndex].end;
                //     player.load();
                //     player.play();
                // }

                // ============================================================================

                // player.onplay = function() {
                //     if (newVidEvent) {
                //         newVidEvent = false;
                //         setTimeout(playNextEvent(), 1000);
                //     }
                // }

                // player.onpause = function() {
                //     if (!newVidEvent) {
                //         newVidEvent = true;
                //     }
                //     playNextEvent();
                // }

                // use another audio while playing video
                // var myaudio = document.getElementById("myaudio");
                // var change_time_state = true;

                // player.onplay = function(){
                //     myaudio.play();
                //     if(change_time_state){
                //         myaudio.currentTime = player.currentTime;
                //         change_time_state = false;
                //     }
                // }

                // player.onpause = function(){
                //     myaudio.pause();
                //     change_time_state = true;
                // }

                // ============================================================================

                if (window.webshim) {
                    (function () {
                        
                        webshim.setOptions('mediaelement', {
                            replaceUI: 'auto'
                        });
                        webshim.setOptions({types: 'range'});
                        webshim.setOptions('extendNative', true);
                        webshim.polyfill('mediaelement forms forms-ext');
                    })();
                }

                //add some controls
                jQuery(function ($) {
                    $('div.preview_player').each(function () {
                        var player = this;
                        var getSetCurrentTime = createGetSetHandler(

                        function () {
                            $('input.time-slider', player).prop('value', $.prop(this, 'currentTime'));
                        }, function () {
                            try {
                                $('video, audio', player).prop('currentTime', $.prop(this, 'value'));
                            } catch (er) {}
                        });

                        var getSetVolume = createGetSetHandler(

                        function () {
                            $('input.volume-slider', player).prop('value', $.prop(this, 'volume'));

                        }, function () {
                            $('video, audio', player).prop('volume', $.prop(this, 'value'));
                        });
                        
                        $('video, audio', this).bind('durationchange updateMediaState', function () {
                            var duration = $.prop(this, 'duration');
                            if (!duration) {
                                return;
                            }
                            $('input.time-slider', player).prop({
                                'max': duration,
                                disabled: false
                            });
                            $('span.duration', player).text(duration);
                        }).bind('progress updateMediaState', function () {
                            var buffered = $.prop(this, 'buffered');
                            if (!buffered || !buffered.length) {
                                return;
                            }
                            buffered = getActiveTimeRange(buffered, $.prop(this, 'currentTime'));
                            $('span.progress', player).text(buffered[2]);
                        }).bind('timeupdate', function () {
                            $('span.current-time', player).text($.prop(this, 'currentTime'));
                        }).bind('timeupdate', getSetCurrentTime.get).bind('emptied', function () {
                            $('input.time-slider', player).prop('disabled', true);
                            $('span.duration', player).text('--');
                            $('span.current-time', player).text(0);
                            $('span.network-state', player).text(0);
                            $('span.ready-state', player).text(0);
                            $('span.paused-state', player).text($.prop(this, 'paused'));
                            $('span.height-width', player).text('-/-');
                            $('span.progress', player).text('0');
                        }).bind('waiting playing loadedmetadata updateMediaState', function () {
                            $('span.network-state', player).text($.prop(this, 'networkState'));
                            $('span.ready-state', player).text($.prop(this, 'readyState'));
                        }).bind('play pause', function () {
                            $('span.paused-state', player).text($.prop(this, 'paused'));
                        }).bind('volumechange', function () {
                            var muted = $.prop(this, 'muted');
                            $('span.muted-state', player).text(muted);
                            $('input.muted', player).prop('checked', muted);
                            $('span.volume', player).text($.prop(this, 'volume'));
                        }).bind('volumechange', getSetVolume.get).bind('play pause', function () {
                            $('span.paused-state', player).text($.prop(this, 'paused'));
                        }).bind('loadedmetadata updateMediaState', function () {
                            $('span.height-width', player).text($.prop(this, 'videoWidth') + '/' + $.prop(this, 'videoHeight'));
                        }).each(function () {
                            if ($.prop(this, 'readyState') > $.prop(this, 'HAVE_NOTHING')) {
                                $(this).triggerHandler('updateMediaState');
                            }
                        });

                        $('input.time-slider', player).bind('input', getSetCurrentTime.set).prop('value', 0);
                        $('input.volume-slider', player).bind('input', getSetVolume.set);

                        $('input.play', player).bind('click', function () {
                            $('video, audio', player)[0].play();
                        });
                        $('input.pause', player).bind('click', function () {
                            $('video, audio', player)[0].pause();
                        });
                        $('input.muted', player).bind('click updatemuted', function () {
                            $('video, audio', player).prop('muted', $.prop(this, 'checked'));
                        }).triggerHandler('updatemuted');
                        $('input.controls', player).bind('click', function () {
                            $('video, audio', player).prop('controls', $.prop(this, 'checked'));
                        }).prop('checked', true);

                        $('select.load-media', player).bind('change', function () {
                            var srces = $('option:selected', this).data('src');
                            if (srces) {
                                //the following code can be also replaced by the following line
                                //$('video, audio', player).loadMediaSrc(srces).play();
                                $('video, audio', player).removeAttr('src').find('source').remove().end().each(function () {
                                    var mediaElement = this;
                                    if (typeof srces == 'string') {
                                        srces = [srces];
                                    }
                                    $.each(srces, function (i, src) {

                                        if (typeof src == 'string') {
                                            src = {
                                                src: src
                                            };
                                        }
                                        $(document.createElement('source')).attr(src).appendTo(mediaElement);
                                    });
                                })[0].load();
                                $('video, audio', player)[0].play();
                            }
                        }).prop('selectedIndex', 0);
                    });
                });

                //helper for createing throttled get/set functions (good to create time/volume-slider, which are used as getter and setter)

                function createGetSetHandler(get, set) {
                    var throttleTimer;
                    var blockedTimer;
                    var blocked;
                    return {
                        get: function () {
                            if (blocked) {
                                return;
                            }
                            return get.apply(this, arguments);
                        },
                        set: function () {
                            clearTimeout(throttleTimer);
                            clearTimeout(blockedTimer);

                            var that = this;
                            var args = arguments;
                            blocked = true;
                            throttleTimer = setTimeout(function () {
                                set.apply(that, args);
                                blockedTimer = setTimeout(function () {
                                    blocked = false;
                                }, 30);
                            }, 0);
                        }
                    };
                };

                function getActiveTimeRange(range, time) {
                    var len = range.length;
                    var index = -1;
                    var start = 0;
                    var end = 0;
                    for (var i = 0; i < len; i++) {
                        if (time >= (start = range.start(i)) && time <= (end = range.end(i))) {
                            index = i;
                            break;
                        }
                    }
                    return [index, start, end];
                };

                // ============================================================================

            }
        };
    }]);
