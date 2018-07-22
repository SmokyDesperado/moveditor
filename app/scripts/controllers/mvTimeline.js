'use strict';

angular.module('moveditorApp')
    .controller('MvTimelineCtrl', [
        'TimelineService',
        'ContentService',
        'DragAndDropService',
        function (TimelineService, ContentService, DragAndDropService) {
            var self = this;

            this.focus = {
                'type': null,
                'key': null
            };
            this.shorten = false;
            this.timelineList = '';

            this.initTimelineElement = function ($element) {
                DragAndDropService.setDropableElement($element);
                this.timelineList = TimelineService.getTimelineList();
            };

            this.setFocus = function (timelineObjectKey, type) {
                if(this.focus['type'] === type && this.focus['key'] === timelineObjectKey) {
                    self.unsetFocusAll();
                    self.deactivateShorten();
                }
                else {
                    this.focus = {
                        'type': type,
                        'key': timelineObjectKey
                    };
                    self.activateShorten();
                }
            };

            this.unsetFocusAll = function () {
                this.focus = {
                    'type': null,
                    'key': null
                };
            };

            this.activateShorten = function () {
                this.shorten = true;
            };

            this.deactivateShorten = function () {
                this.shorten = false;
            };
        }
    ]);
