'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('DragAndDropService', [
        'MvHelperService',
        'TimelineService',
        function (MvHelperService, TimelineService) {

            var self = this;

            this.dropableElement = null;
            this.timeline = null;

            this.init = function () {
                // console.log('drag and drop service');
            };

            this.panMoveStarted = function (id) {

            };

            this.panMove = function ($event) {

            };

            this.panMoveEnd = function ($event, contentObjectKey) {
                var list = TimelineService.getTimelineObjectList();
                if(self.hitTest($event.center)) {
                    TimelineService.setScrollLeft(this.timeline[0].scrollLeft);
                    TimelineService.setMouseHoverPosX($event.center.x);
                    TimelineService.addTimelineObjectToList(contentObjectKey);
                }

                // console.log('timelineList:', TimelineService.timelineList);
            };

            this.setDropableElement = function (element) {
                this.timeline = element;
                var timelineAttributes = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    scrollLeft: 0
                };

                timelineAttributes.x = element[0].offsetLeft + element[0].offsetParent.offsetLeft;
                timelineAttributes.y = element[0].offsetTop + element[0].offsetParent.offsetTop;
                timelineAttributes.width = element[0].offsetWidth;
                timelineAttributes.height = element[0].offsetHeight;
                timelineAttributes.scrollLeft = element[0].scrollLeft;

                this.dropableElement = timelineAttributes;
                console.log(this.dropableElement);
            };

            this.hitTest = function (draggableElement) {
                if(
                    draggableElement.x > this.dropableElement.x &&
                    draggableElement.x < (this.dropableElement.x + this.dropableElement.width) &&
                    draggableElement.y > this.dropableElement.y &&
                    draggableElement.y < (this.dropableElement.y + this.dropableElement.height)) {

                    return true;
                }

                return false;
            };

            this.init();
        }]);
