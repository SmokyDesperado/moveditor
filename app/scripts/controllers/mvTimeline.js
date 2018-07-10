'use strict';

/**
 * @ngdoc function
 * @name moveditorApp.controller:MvContentCtrl
 * @description
 * # MvContentCtrl
 * Controller of the moveditorApp
 */
angular.module('moveditorApp')
    .controller('MvTimelineCtrl', [
        'TimelineService',
        'ContentService',
        'DragAndDropService',
        function (TimelineService, ContentService, DragAndDropService) {
            var self = this;

            this.focus = null;
            this.shorten = false;

            this.timelineList = '';
            // this.timelineWidth = TimelineService.getTimelineWidth();

            this.initTimelineElement = function ($element) {
                DragAndDropService.setDropableElement($element);
                this.timelineList = TimelineService.getTimelineList();
                console.log(this.timelineList);
            };

            this.tap = function ($event) {
                console.log('timeline', TimelineService.timelineList);
            };

            this.reorder = function () {
                console.log('reorder clicked');
            };

            this.shorten = function () {
                console.log('reorder shorten');
            };

            this.cut = function () {
                console.log('reorder cut');
            };

            this.setFocus = function (timelineObjectKey) {
                if(this.focus === timelineObjectKey) {
                    self.unsetFocusAll();
                    self.deactivateShorten();
                }
                else {
                    this.focus = timelineObjectKey;
                    self.activateShorten();
                }
            };

            this.activateShorten = function () {
                this.shorten = true;
            };

            this.deactivateShorten = function () {
                this.shorten = false;
            };

            this.unsetFocusAll = function () {
                this.focus = null;
            };
        }
    ]);
