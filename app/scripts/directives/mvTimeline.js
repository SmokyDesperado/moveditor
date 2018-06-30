'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvTimeline', ['TimelineService', '$document', function (TimelineService, $document) {
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
                this.dragClone = null;

                $scope.click = function (param) {
                    console.log('clicked with param:', param);
                };

                $scope.tap = function($event) {
                    TimelineCtrl.tap($event);
                };

                $scope.panStart = function (timelineObjectKey) {
                    if(TimelineCtrl.focus === timelineObjectKey) {
                        self.createDragCloneElement();
                        // console.log('target: ', $scope.timelineService.timelineList[timelineObjectKey]);
                    }
                };

                $scope.hammerPanMove = function ($event) {
                    if(self.dragClone) {
                        // console.log('target: ', $event.center, self.dragClone);

                        var x = $event.center.x - angular.element(self.dragClone)[0].offsetWidth / 2,
                            y = $event.center.y - angular.element(self.dragClone)[0].offsetHeight / 2;

                        self.dragClone.style['left'] = x + 'px';
                        self.dragClone.style['top'] = y + 'px';
                        self.dragClone.style['z-index'] = 999999;
                    }
                };

                $scope.panEnd = function ($event) {
                    if(self.dragClone) {
                        // console.log('pam end', $event.center);
                        angular.element(self.dragClone).remove();
                        self.dragClone = null;
                    }
                };

                this.createDragCloneElement = function() {
                    var dragCloneElement = angular.element(
                        '<div class="timeline-chunk--clone"></div>'
                    );
                    var body = $document.find('body').eq(0);

                    body.prepend(dragCloneElement);
                    self.dragClone = dragCloneElement[0];
                };

                TimelineCtrl.initTimelineElement($element.find('#timelineDropArea'));
            }
        };
    }]);
