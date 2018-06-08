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

            this.init = function () {
                // console.log('drag and drop service');
            };

            this.panMoveStarted = function (id) {

            };

            this.panMove = function () {
                // console.log('pan move');
            };

            this.panMoveEnd = function ($event, contentObjectKey) {
                var list = TimelineService.getTimelineObjectList();
                if(self.hitTest($event.center)) {
                    TimelineService.addTimelineObjectToList(contentObjectKey);
                }

                // console.log('timelineList:', TimelineService.timelineList);
            };

            this.setDropableElement = function (elemment) {

                var timelineAttributes = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                };

                timelineAttributes.x = elemment[0].offsetLeft + elemment[0].offsetParent.offsetLeft;
                timelineAttributes.y = elemment[0].offsetTop + elemment[0].offsetParent.offsetTop;
                timelineAttributes.width = elemment[0].offsetWidth;
                timelineAttributes.height = elemment[0].offsetHeight;

                this.dropableElement = timelineAttributes;
                // console.log(this.dropableElement);
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
