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
        'ContentService',
        function (MvHelperService, TimelineService, ContentService) {

            var self = this;

            this.dropableElement = null;
            this.timeline = null;
            this.dropableTrash = null;

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

                if(self.hitTrash($event.center)) {
                    ContentService.confirmRemoveContentObjectFromList(contentObjectKey);
                }

                // console.log('timelineList:', TimelineService.timelineList);
            };

            this.setDropableTrash = function (element) {
                this.dropableTrash = element;
                var trashAttributes = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    scrollLeft: 0
                };

                trashAttributes.x = element[0].offsetLeft + element[0].offsetParent.offsetLeft;
                trashAttributes.y = element[0].offsetTop + element[0].offsetParent.offsetTop;
                trashAttributes.width = element[0].offsetWidth;
                trashAttributes.height = element[0].offsetHeight;
                trashAttributes.scrollLeft = element[0].scrollLeft;

                this.dropableTrash = trashAttributes;
                // console.log(this.dropableTrash);
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

            this.hitTrash = function (draggableElement) {
                if(
                    draggableElement.x > this.dropableTrash.x &&
                    draggableElement.x < (this.dropableTrash.x + this.dropableTrash.width) &&
                    draggableElement.y > this.dropableTrash.y &&
                    draggableElement.y < (this.dropableTrash.y + this.dropableTrash.height)) {

                    return true;
                }

                return false;
            };

            this.init();
        }]);
