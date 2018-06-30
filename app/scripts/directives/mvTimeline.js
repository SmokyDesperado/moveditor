'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvTimeline', ['TimelineService', function (TimelineService) {
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
                        self.dragClone = $scope.timelineService.timelineList[timelineObjectKey];
                        console.log('target: ', $scope.timelineService.timelineList[timelineObjectKey]);
                    }

                    // self.dragClone = angular.copy($event.target);
                    // angular.element(self.dragClone).addClass('drag--clone');
                    // $event.element[0].parentElement.parentElement.parentElement.prepend(self.dragClone);
                    // self.dragClone.style['position'] = 'absolute';
                    //
                    // DragAndDropService.panMoveStarted($scope.contentObjectKey);
                };

                $scope.hammerPanMove = function ($event) {
                    if(self.dragClone) {
                        console.log('target: ', $event.center);
                    }

                    // var x = $event.center.x - $event.target.offsetWidth / 2,
                    //     y = $event.center.y - $event.target.offsetHeight;
                    //
                    // self.dragClone.style['left'] = x + 'px';
                    // self.dragClone.style['top'] = y + 'px';
                    //
                    // DragAndDropService.panMove($event);
                };

                $scope.panEnd = function ($event) {
                    if(self.dragClone) {
                        console.log('pam end', $event.center);
                        self.dragClone = null;
                    }
                    // angular.element(self.dragClone).remove();
                    // self.dragClone = null;
                    //
                    // DragAndDropService.panMoveEnd($event, $scope.contentObjectKey);
                };

                TimelineCtrl.initTimelineElement($element.find('#timelineDropArea'));
            }
        };
    }]);
