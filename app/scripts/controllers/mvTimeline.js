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

            this.timelineList = '';
            // this.timelineWidth = TimelineService.getTimelineWidth();

            this.initTimelineElement = function ($element) {
                DragAndDropService.setDropableElement($element);
                this.timelineList = TimelineService.getTimelineList();
                console.log(this.timelineList);
            };

            this.tap = function ($event) {
                // TimelineService.setTimelineWidth(1000);
                console.log('timeline', TimelineService.timelineList);
            };
        }
    ]);
