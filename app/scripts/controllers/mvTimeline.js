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

            this.initTimelineElement = function ($element) {
                DragAndDropService.setDropableElement($element);
                this.timelineList = TimelineService.getTimelinList();
                console.log(this.timelineList);
            };

            this.tap = function ($event) {
                console.log('timeline', TimelineService.timelineList);
            };
        }
    ]);
