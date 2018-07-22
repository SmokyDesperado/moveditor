'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvTimeline', [
        'TimelineService',
        '$document',
        'ContentService',
        'MvHelperService',
        'DragAndDropService',
        function (TimelineService, $document, ContentService, MvHelperService, DragAndDropService) {
        return {
            templateUrl: '/views/directives/mvTimeline.html',
            replace: true,
            restrict: 'AE',
            controller: 'MvTimelineCtrl',
            bindToController: true,
            controllerAs: 'TimelineCtrl',
            link: function ($scope, $element, $attrs, TimelineCtrl) {
                var self = this;

                this.dragShorten = false;
                this.dragOffset = 0;
                this.dragFreeSpaceStart = 0;
                this.dragFreeSpaceEnd = 1920;
                this.dragShortenOffset = 5;

                this.currentPosDisplay = $('.chunk-meta__name-input');
                this.currentPosDisplay.on("keypress keydown keyup", function(e) {
                    e.stopPropagation();
                });

                $scope.timelineService = TimelineService;
                $scope.contentService = ContentService;
                $scope.isCutActive = false;
                $scope.timelineService.dropArea = $element.find('#timelineDropArea');
                $scope.timelineService.positionPointer = $element.find('#position_pointer');
                $scope.timelineService.rangePointerA = $element.find('#range_pointer_a');
                $scope.timelineService.rangePointerB = $element.find('#range_pointer_b');

                // ====================================================================================================
                // zoomin functions
                // ====================================================================================================

                $scope.zoomIn = function () {
                    $scope.timelineService.zoomIn();
                };

                $scope.zoomOut = function () {
                    $scope.timelineService.zoomOut();
                };

                $scope.zoomReset = function () {
                    $scope.timelineService.zoomReset();
                };

                // ====================================================================================================
                // redo / undo
                // ====================================================================================================

                $scope.undo = function() {
                    $scope.timelineService.undoTimelineAction();
                    MvHelperService.updatePreviewPlayerParameters($scope.timelineService.timelineList, false);
                    MvHelperService.calculateVideoAudioOffsetPosition(document.getElementById('position_slider').value, $scope.contentService.contentList, $scope.timelineService.timelineList);
                    TimelineCtrl.unsetFocusAll();
                };

                $scope.redo = function () {
                    $scope.timelineService.redoTimelineAction();
                    MvHelperService.updatePreviewPlayerParameters($scope.timelineService.timelineList, false);
                    MvHelperService.calculateVideoAudioOffsetPosition(document.getElementById('position_slider').value, $scope.contentService.contentList, $scope.timelineService.timelineList);
                    TimelineCtrl.unsetFocusAll();
                };

                // handling click on chunk: set focus, cut chunk or deactivate cut mode
                $scope.chunkTap = function($event, key, listType) {
                    if(!$scope.isCutActive) {
                        TimelineCtrl.setFocus(key, listType);
                    }

                    if($scope.isCutActive && TimelineCtrl.focus.key === key && TimelineCtrl.focus.type === listType) {
                        $scope.timelineService.cutChunk($event, key, listType, $element.find('#timelineDropArea'));
                        $scope.isCutActive = false;
                    }

                    if($scope.isCutActive && TimelineCtrl.focus.key === null) {
                        $scope.isCutActive = false;
                    }
                };

                // ====================================================================================================
                // drag chunk
                // ====================================================================================================

                // init variables before dragging chunk:
                // when right element clicked, deactiivate shorten mode, set set focus in controller and init dragging limits
                $scope.panStart = function ($event, timelineObjectKey, listType) {
                    if(angular.element($event.target)[0].className === 'timeline-object__chunk timeline-object__chunk--' + listType + ' ng-scope') {
                        self.dragShorten = false;
                        TimelineCtrl.focus.key = timelineObjectKey;
                        TimelineCtrl.focus.type = listType;
                        self.initDragLimitValues($event, timelineObjectKey, listType);
                    }
                };

                // dragging chunk handler:
                // set chunk position and updated preview player
                $scope.hammerPanMove = function ($event, timelineObjectKey, listType) {
                    if(TimelineCtrl.focus.key === timelineObjectKey && !self.dragShorten && angular.element($event.target)[0].className === 'timeline-object__chunk timeline-object__chunk--' + listType + ' ng-scope') {
                        TimelineCtrl.deactivateShorten();
                        self.setTimelineObjectToPosition($event, timelineObjectKey, listType);
                        MvHelperService.updatePreviewPlayerParameters($scope.timelineService.timelineList, false);

                        MvHelperService.calculateVideoAudioOffsetPosition(document.getElementById('position_slider').value, $scope.contentService.contentList, $scope.timelineService.timelineList);
                    }
                };

                // post drag chunk functionalities
                // set dragging offset to init value, calculate timeline width, activate shorten and save timeline state
                $scope.panEnd = function ($event, timelineObjectKey) {
                    if(TimelineCtrl.focus.key === timelineObjectKey && !self.dragShorten) {
                        self.dragOffset = 0;
                        $scope.timelineService.calculateTimelineWidth();
                        TimelineCtrl.activateShorten();

                        $scope.timelineService.saveTimelineStep();
                    }
                };


                this.setTimelineObjectToPosition = function($event, timelineObjectKey, listType) {
                    var chunk = angular.element($event.target);
                    var chunkLengthInPixel = ($scope.timelineService.timelineList[listType][timelineObjectKey].end - $scope.timelineService.timelineList[listType][timelineObjectKey].start) *
                        $scope.timelineService.pixelPerSeconds;
                    var dragPosition = $event.center.x - self.dragOffset;

                    if(dragPosition <= self.dragFreeSpaceStart) {
                        dragPosition = self.dragFreeSpaceStart;
                    }

                    if (dragPosition >= (self.dragFreeSpaceEnd - chunkLengthInPixel)) {
                        dragPosition = self.dragFreeSpaceEnd - chunkLengthInPixel;
                    }

                    chunk[0].style['left'] = dragPosition + 'px';
                    self.calculateChunkTimeFromPixelPosition(dragPosition, timelineObjectKey, listType);
                };

                this.calculateChunkTimeFromPixelPosition = function (startPosition, timelineObjectKey, listType) {
                    var chunkLength = $scope.timelineService.timelineList[listType][timelineObjectKey].end - $scope.timelineService.timelineList[listType][timelineObjectKey].start;

                    $scope.timelineService.timelineList[listType][timelineObjectKey].start = self.quantizeDraggedTime(startPosition / $scope.timelineService.pixelPerSeconds);
                    $scope.timelineService.timelineList[listType][timelineObjectKey].end = self.quantizeDraggedTime($scope.timelineService.timelineList[listType][timelineObjectKey].start + chunkLength);
                };

                // inti drag limit variables (free space in timeline) for dragging chunk
                this.initDragLimitValues = function ($event, timelineObjectKey, listType) {
                    // console.log(angular.element($event.target));
                    self.initDragOffset($event.center.x, angular.element($event.target)[0].offsetLeft);

                    if(angular.isDefined($scope.timelineService.timelineList[listType][timelineObjectKey - 1])) {
                        self.dragFreeSpaceStart = $scope.timelineService.timelineList[listType][timelineObjectKey - 1].end * $scope.timelineService.pixelPerSeconds;
                    }
                    else {
                        self.dragFreeSpaceStart = 0;
                    }

                    if(angular.isDefined($scope.timelineService.timelineList[listType][timelineObjectKey + 1])) {
                        self.dragFreeSpaceEnd = $scope.timelineService.timelineList[listType][timelineObjectKey + 1].start * $scope.timelineService.pixelPerSeconds;
                    }
                    else {
                        self.dragFreeSpaceEnd = $scope.timelineService.timelineWidth;
                    }
                };

                // drag offset is current mouse position in chunk
                this.initDragOffset = function (mousePosition, offsetLeft) {
                    this.dragOffset = mousePosition - offsetLeft;
                };


                // ====================================================================================================
                // swap chunks
                // ====================================================================================================

                $scope.swapWithPreviousObject = function () {
                    var listType = self.getFocusTypeFromFocusKey();
                    if(listType !== null && TimelineCtrl.focus.key !== null && angular.isDefined($scope.timelineService.timelineList[listType][TimelineCtrl.focus.key - 1])) {
                        $scope.timelineService.swapChunkWithPreviousObject(TimelineCtrl.focus.key, listType);
                        MvHelperService.calculateVideoAudioOffsetPosition(document.getElementById('position_slider').value, $scope.contentService.contentList, $scope.timelineService.timelineList);
                        TimelineCtrl.focus.key--;
                    }
                };

                $scope.swapWithNextObject = function () {
                    var listType = self.getFocusTypeFromFocusKey();
                    if(listType !== null && TimelineCtrl.focus.key !== null && angular.isDefined($scope.timelineService.timelineList[listType][TimelineCtrl.focus.key + 1])) {
                        $scope.timelineService.swapChunkWithNextObject(TimelineCtrl.focus.key, listType);
                        MvHelperService.calculateVideoAudioOffsetPosition(document.getElementById('position_slider').value, $scope.contentService.contentList, $scope.timelineService.timelineList);
                        TimelineCtrl.focus.key++;
                    }
                };

                // ====================================================================================================
                // drag chunk shorten modifier
                // ====================================================================================================

                // init drag shorten variables
                $scope.dragShortenStart = function() {
                    self.dragShorten = true;
                    DragAndDropService.setDropableElement($element.find('#timelineDropArea'));
                };

                // save timeline state after shorten
                $scope.dragShortenEnd = function() {
                    self.dragShorten = false;
                    $scope.timelineService.saveTimelineStep();
                };

                // handling drag shorten for chunk modifier from chunk start
                $scope.dragStartShortenMove = function($event, timelineObjectKey, listType) {
                    if(self.dragShorten) {
                        self.dragStartShortenTimelineObject($event, timelineObjectKey, listType);
                    }
                };

                // handling drag shorten for chunk modifier from chunk end
                $scope.dragEndShortenMove = function($event, timelineObjectKey, listType) {
                    if(self.dragShorten) {
                        self.setEndDragShortenObject($event, timelineObjectKey, listType);
                    }
                };

                // calculate chunk start position and time values within allowed limitation while shortening
                this.dragStartShortenTimelineObject = function($event, timelineObjectKey, listType) {
                    var dragDistant = ((($event.center.x + DragAndDropService.dropableElement.scrollLeft) - self.dragShortenOffset));

                    var position = $scope.timelineService.roundTime(dragDistant / $scope.timelineService.pixelPerSeconds);
                    var limitStart = $scope.timelineService.roundTime($scope.timelineService.timelineList[listType][timelineObjectKey].start - $scope.timelineService.timelineList[listType][timelineObjectKey].offset);
                    var limitEnd = $scope.timelineService.roundTime($scope.timelineService.timelineList[listType][timelineObjectKey].end);
                    var chunkType = $scope.contentService.contentList[$scope.timelineService.timelineList[listType][timelineObjectKey].objectListId].type;
                    if(position < limitStart && chunkType !== 'image') {
                        position = $scope.timelineService.roundTime(limitStart);
                    }

                    if(angular.isDefined($scope.timelineService.timelineList[listType][timelineObjectKey - 1]) && position < $scope.timelineService.timelineList[listType][timelineObjectKey - 1].end) {
                        position = $scope.timelineService.timelineList[listType][timelineObjectKey - 1].end;
                    }

                    if(position > limitEnd - 0.1) {
                        position = $scope.timelineService.roundTime(limitEnd - 0.1);
                    }

                    $scope.timelineService.timelineList[listType][timelineObjectKey].start = $scope.timelineService.roundTime(position);
                    $scope.timelineService.timelineList[listType][timelineObjectKey].offset = $scope.timelineService.roundTime(position - limitStart);
                };

                // calculate chunk end position and time values within allowed limitation while shortening
                this.setEndDragShortenObject = function($event, timelineObjectKey, listType) {
                    var dragDistant = ((($event.center.x + DragAndDropService.dropableElement.scrollLeft) - self.dragShortenOffset));

                    var position = $scope.timelineService.roundTime(dragDistant / $scope.timelineService.pixelPerSeconds);
                    var limitStart = $scope.timelineService.roundTime($scope.timelineService.timelineList[listType][timelineObjectKey].start);
                    var limitEnd = $scope.timelineService.roundTime((limitStart - $scope.timelineService.timelineList[listType][timelineObjectKey].offset) + ContentService.contentList[$scope.timelineService.timelineList[listType][timelineObjectKey].objectListId].length);
                    var chunkType = $scope.contentService.contentList[$scope.timelineService.timelineList[listType][timelineObjectKey].objectListId].type;

                    if(position < limitStart + 0.1) {
                        position = $scope.timelineService.roundTime(limitStart + 0.1);
                    }

                    if(position > limitEnd  && chunkType !== 'image') {
                        position = $scope.timelineService.roundTime(limitEnd);
                    }

                    if(angular.isDefined($scope.timelineService.timelineList[listType][timelineObjectKey + 1]) && position > $scope.timelineService.timelineList[listType][timelineObjectKey + 1].start) {
                        position = $scope.timelineService.timelineList[listType][timelineObjectKey + 1].start;
                    }

                    $scope.timelineService.timelineList[listType][timelineObjectKey].end = $scope.timelineService.roundTime(position);
                };

                // ====================================================================================================
                // miscellaneous timeline functions
                // ====================================================================================================

                $scope.activateCuttingMode = function() {
                    $scope.isCutActive = !$scope.isCutActive;
                };

                $scope.muteChunk = function () {
                    if (TimelineCtrl.focus.key !== null) {
                        if (ContentService.contentList[$scope.timelineService.timelineList[TimelineCtrl.focus.type][TimelineCtrl.focus.key].objectListId].type !== 'image') {
                            $scope.timelineService.timelineList[TimelineCtrl.focus.type][TimelineCtrl.focus.key].mute = !$scope.timelineService.timelineList[TimelineCtrl.focus.type][TimelineCtrl.focus.key].mute;
                            $scope.timelineService.saveTimelineStep();
                        }
                    }
                };

                $scope.deleteChunk = function () {
                    if (TimelineCtrl.focus.key !== null) {
                        var focussedChunk = $scope.timelineService.timelineList[TimelineCtrl.focus.type][TimelineCtrl.focus.key];
                        var index = $scope.timelineService.timelineList[TimelineCtrl.focus.type].indexOf(focussedChunk);
                        if (index > -1) {
                            $scope.timelineService.timelineList[TimelineCtrl.focus.type].splice(index, 1);
                            MvHelperService.chunkDeleted(focussedChunk, ContentService.contentList, $scope.timelineService.timelineList);
                        }
                        TimelineCtrl.unsetFocusAll();
                        $scope.timelineService.calculateTimelineWidth();
                        $scope.timelineService.saveTimelineStep();
                    }
                };

                // returns type of focused chunks or null if not
                this.getFocusTypeFromFocusKey = function () {
                    return (TimelineCtrl.focus.key !== null) ? TimelineCtrl.focus.type : null;
                };

                // quantization of time values to 100ms
                this.quantizeDraggedTime = function (timevalue) {
                    return Math.round(timevalue * $scope.timelineService.timelineQuantization) / $scope.timelineService.timelineQuantization;
                };

                TimelineCtrl.initTimelineElement($element.find('#timelineDropArea'));

                // ====================================================================================================
                // short keys for controlling timeline
                // ====================================================================================================

                document.onkeyup = function(e) {
                    // console.log("KEY UP: ", e.which);
                    switch (e.which) {
                        case 109: // num -
                        case 189: // -
                            if (e.ctrlKey) {
                                $scope.zoomOut();
                                $scope.$apply();
                            }
                            break;
                        case 107: // num +
                        case 187: // +
                            if (e.ctrlKey) {
                                $scope.zoomIn();
                                $scope.$apply();
                            }
                            break;
                        case 48: // 0
                        case 96: // num 0
                            if (e.ctrlKey) {
                                $scope.zoomReset();
                                $scope.$apply();
                            }
                            break;
                        case 8: // backspace
                        case 46: // del
                            $scope.deleteChunk();
                            $scope.$apply();
                            break;
                        case 67: // C
                            $scope.activateCuttingMode();
                            $scope.$apply();
                            break;
                        case 77: // M
                            $scope.muteChunk();
                            $scope.$apply();
                            break;
                        case 89: // Y
                            if (e.ctrlKey) {
                                $scope.redo();
                                $scope.$apply();
                            }
                            break;
                        case 90: // Z
                            if (e.ctrlKey) {
                                if (e.shiftKey) {
                                    $scope.redo();
                                } else {
                                    $scope.undo();
                                }
                                $scope.$apply();
                            }
                            break;
                        case 37: // arrow left
                            if (e.ctrlKey) {
                                $scope.swapWithPreviousObject();
                                $scope.$apply();
                            } else if (e.altKey) {
                                if (TimelineCtrl.focus.key === null) {
                                    if ($scope.timelineService.timelineList['audio'].length > 0) {
                                        TimelineCtrl.setFocus($scope.timelineService.timelineList['audio'].length - 1, 'audio');
                                    }
                                    if ($scope.timelineService.timelineList['video'].length > 0) {
                                        TimelineCtrl.setFocus($scope.timelineService.timelineList['video'].length - 1, 'video');
                                    }
                                } else {
                                    TimelineCtrl.setFocus(Math.max(0, TimelineCtrl.focus.key - 1), TimelineCtrl.focus.type);
                                }
                                $scope.$apply();
                            }
                            break;
                        case 39: // arrow right
                            if (e.ctrlKey) {
                                $scope.swapWithNextObject();
                                $scope.$apply();
                            } else if (e.altKey) {
                                if (TimelineCtrl.focus.key === null) {
                                    if ($scope.timelineService.timelineList['audio'].length > 0) {
                                        TimelineCtrl.setFocus(0, 'audio');
                                    }
                                    if ($scope.timelineService.timelineList['video'].length > 0) {
                                        TimelineCtrl.setFocus(0, 'video');
                                    }
                                } else {
                                    TimelineCtrl.setFocus(Math.min(TimelineCtrl.focus.key + 1, $scope.timelineService.timelineList[TimelineCtrl.focus.type].length - 1), TimelineCtrl.focus.type);
                                }
                                $scope.$apply();
                            }
                            break;
                        case 40: // arrow down
                            if (e.altKey) {
                                if (TimelineCtrl.focus.key === null) {
                                    if ($scope.timelineService.timelineList['audio'].length > 0) {
                                        TimelineCtrl.setFocus(0, 'audio');
                                    }
                                    if ($scope.timelineService.timelineList['video'].length > 0) {
                                        TimelineCtrl.setFocus(0, 'video');
                                    }
                                } else {
                                    if ($scope.timelineService.timelineList['audio'].length > 0) {
                                        TimelineCtrl.setFocus(Math.min(Math.max(0 ,TimelineCtrl.focus.key), $scope.timelineService.timelineList['audio'].length - 1), 'audio');
                                    }
                                }
                                $scope.$apply();
                            }
                            break;
                        case 38: // arrow up
                            if (e.altKey) {
                                if (TimelineCtrl.focus.key === null) {
                                    if ($scope.timelineService.timelineList['video'].length > 0) {
                                        TimelineCtrl.setFocus(0, 'video');
                                    }
                                    if ($scope.timelineService.timelineList['audio'].length > 0) {
                                        TimelineCtrl.setFocus(0, 'audio');
                                    }
                                } else {
                                    if ($scope.timelineService.timelineList['video'].length > 0) {
                                        TimelineCtrl.setFocus(Math.min(Math.max(0 ,TimelineCtrl.focus.key), $scope.timelineService.timelineList['video'].length - 1), 'video');
                                    }
                                }
                                $scope.$apply();
                            }
                            break;
                        case 83: // S
                            if (e.ctrlKey) {
                                document.getElementById('save_button').click();
                            }
                            break;
                        case 79: // O
                            if (e.ctrlKey) {
                                document.getElementById('load_button').click();
                            }
                            break;
                        default:
                            break;
                    }
                };
            }
        };
    }]);
