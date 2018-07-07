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

                $scope.timelineService = TimelineService;

                var self = this;
                this.dragShorten = false;
                this.dragOffset = 0;
                this.dragFreeSpaceStart = 0;
                this.dragFreeSpaceEnd = 1920;
                this.minimalDragShortenLimitValues = 0;
                this.maximalDragShortenLimitValues = 0;
                this.dragShortenOffset = 5;

                $scope.click = function (param) {
                    console.log('clicked with param:', param);
                };

                $scope.muteChunk = function () {
                    if (TimelineCtrl.focus != null) {
                        if (ContentService.getContentList()[$scope.timelineService.timelineList[TimelineCtrl.focus].objectListId].type != "image") {
                            $scope.timelineService.timelineList[TimelineCtrl.focus].mute = !$scope.timelineService.timelineList[TimelineCtrl.focus].mute;
                        }
                    }
                };

                $scope.tap = function($event) {
                    TimelineCtrl.tap($event);
                };

                $scope.panStart = function ($event, timelineObjectKey) {
                    if(TimelineCtrl.focus === timelineObjectKey && !self.dragShorten) {
                        self.initDragLimitValues($event, timelineObjectKey);
                    }
                };

                $scope.hammerPanMove = function ($event, timelineObjectKey) {
                    if(TimelineCtrl.focus === timelineObjectKey && !self.dragShorten) {
                        var timelineObjectLength = ($scope.timelineService.timelineList[timelineObjectKey].end - $scope.timelineService.timelineList[timelineObjectKey].start) *
                            $scope.timelineService.pixelPerSeconds;
                        if ($event.center.x - self.dragOffset >= self.dragFreeSpaceStart &&
                            ($event.center.x - self.dragOffset + timelineObjectLength) <= self.dragFreeSpaceEnd) {
                            self.dragTimelineObject($event, timelineObjectKey);
                            MvHelperService.updatePreviewPlayerParameters($scope.timelineService.timelineList, $scope.timelineService.timelineList);
                        }
                    }
                };

                $scope.panEnd = function ($event, timelineObjectKey) {
                    if(TimelineCtrl.focus === timelineObjectKey && !self.dragShorten) {
                        self.dragOffset = 0;
                        $scope.timelineService.calculateTimelineWidth();
                    }
                };

                this.dragTimelineObject = function($event, timelineObjectKey) {
                    var chunk = angular.element($event.target);
                    chunk[0].style['left'] = ($event.center.x - self.dragOffset) + 'px';

                    var chunkLength = $scope.timelineService.timelineList[timelineObjectKey].end - $scope.timelineService.timelineList[timelineObjectKey].start;
                    $scope.timelineService.timelineList[timelineObjectKey].start = self.quantizeDraggedTime(
                        ($event.center.x - self.dragOffset) / $scope.timelineService.pixelPerSeconds);
                    $scope.timelineService.timelineList[timelineObjectKey].end = self.quantizeDraggedTime(
                        $scope.timelineService.timelineList[timelineObjectKey].start + chunkLength);
                };

                this.initDragLimitValues = function ($event, timelineObjectKey) {
                    self.dragOffset = $event.center.x - angular.element($event.target)[0].offsetLeft;

                    if(angular.isDefined($scope.timelineService.timelineList[timelineObjectKey - 1])) {
                        self.dragFreeSpaceStart = $scope.timelineService.timelineList[timelineObjectKey - 1].end * $scope.timelineService.pixelPerSeconds;
                    }
                    else {
                        self.dragFreeSpaceStart = 0;
                    }

                    if(angular.isDefined($scope.timelineService.timelineList[timelineObjectKey + 1])) {
                        self.dragFreeSpaceEnd = $scope.timelineService.timelineList[timelineObjectKey + 1].start * $scope.timelineService.pixelPerSeconds;
                    }
                    else {
                        self.dragFreeSpaceEnd = $scope.timelineService.timelineWidth;
                    }
                };

                this.quantizeDraggedTime = function (timevalue) {
                    return Math.round(timevalue * $scope.timelineService.timelineQuantization) / $scope.timelineService.timelineQuantization;
                };

                this.dragTimelineWidthGrow = function() {

                };

                this.dragTimelineScroll = function() {

                };

                $scope.dragStartShortenStart = function($event, timelineObjectKey) {
                    self.dragShorten = true;
                    DragAndDropService.setDropableElement($element.find('#timelineDropArea'));
                    self.initDragShortenLimit($event, timelineObjectKey);
                    // console.log('drag start shorten start');
                };

                $scope.dragStartShortenMove = function($event, timelineObjectKey) {
                    self.dragStartShortenTimelineObject($event, timelineObjectKey);
                    // console.log('drag start shorten move');
                };

                $scope.dragStartShortenEnd = function($event, timelineObjectKey) {
                    self.dragShorten = false;
                    // console.log('drag start shorten end');
                };

                $scope.dragEndShortenStart = function($event, timelineObjectKey) {
                    self.dragShorten = true;
                    DragAndDropService.setDropableElement($element.find('#timelineDropArea'));
                    self.initDragShortenLimit($event, timelineObjectKey);
                    // console.log('drag end shorten start');
                };

                $scope.dragEndShortenMove = function($event, timelineObjectKey) {
                    self.dragEndShortenTimelineObject($event, timelineObjectKey);
                    // console.log('drag end shorten move');
                };

                $scope.dragEndShortenEnd = function($event, timelineObjectKey) {
                    self.dragShorten = false;
                    // console.log('drag end shorten end');
                };

                this.dragStartShortenTimelineObject = function($event, timelineObjectKey) {
                    var chunk = angular.element($event.target);
                    var dragDistant = ((($event.center.x + DragAndDropService.dropableElement.scrollLeft) - self.minimalDragShortenLimitValues) - self.dragShortenOffset);

                    self.setStartDragShortenManipulatorPosition(chunk[0], dragDistant);
                };

                this.setStartDragShortenManipulatorPosition = function(target, dragPosition) {
                    var position = dragPosition;

                    if(dragPosition <= 0 - self.dragShortenOffset) {
                        position = 0  - self.dragShortenOffset;
                    }

                    if(dragPosition >= ((self.maximalDragShortenLimitValues - self.dragShortenOffset) - (self.minimalDragShortenLimitValues))) {
                        position = (self.maximalDragShortenLimitValues - self.dragShortenOffset) - (self.minimalDragShortenLimitValues);
                    }

                    target.style['left'] = position + 'px';
                };

                this.dragEndShortenTimelineObject = function($event, timelineObjectKey) {
                    var chunk = angular.element($event.target);
                    var dragDistant = ((($event.center.x + DragAndDropService.dropableElement.scrollLeft) - self.maximalDragShortenLimitValues) + self.dragShortenOffset);

                    self.setEndDragShortenManipulatorPosition(chunk[0], dragDistant);
                };

                this.setEndDragShortenManipulatorPosition = function(target, dragPosition) {
                    var position = dragPosition;

                    if(dragPosition >= 0 + self.dragShortenOffset) {
                        position = 0 + self.dragShortenOffset;
                    }

                    if(dragPosition <= -1* ((self.maximalDragShortenLimitValues - self.dragShortenOffset) - self.minimalDragShortenLimitValues)) {
                        position = -((self.maximalDragShortenLimitValues - self.dragShortenOffset) - self.minimalDragShortenLimitValues);
                    }

                    target.style['right'] = -1 * position + 'px';
                };

                this.initDragShortenLimit = function($event, timelineObjectKey) {
                    var timelinePixelPerSeconds = $scope.timelineService.pixelPerSeconds;
                    self.minimalDragShortenLimitValues = $scope.timelineService.timelineList[timelineObjectKey].start * timelinePixelPerSeconds;
                    self.maximalDragShortenLimitValues = $scope.timelineService.timelineList[timelineObjectKey].end * timelinePixelPerSeconds;
                };

                TimelineCtrl.initTimelineElement($element.find('#timelineDropArea'));
            }
        };
    }]);
