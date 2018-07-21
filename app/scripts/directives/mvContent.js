'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvContent', [
        'SQSService',
        'ContentService',
        'DragAndDropService',
        function (SQSService, ContentService, DragAndDropService) {
        return {
            templateUrl: '/views/directives/mv_content.html',
            replace: true,
            restrict: 'AE',
            controller: 'MvContentCtrl',
            bindToController: true,
            controllerAs: 'ContentCtrl',
            link: function ($scope, $element, $attrs, contentCtrl) {

                $scope.contentService = ContentService;
                $scope.progress = SQSService.progress;
                DragAndDropService.setDropableTrash($element.find('#content-trash'));

                var index = 1;
                var tmpList = [
                    "http://corrupt-system.de/assets/media/bigbugbunny/bbb_trailer.m4v",
                    "http://corrupt-system.de/assets/media/sintel/sintel-trailer.m4v",
                    "https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0",
                    "https://onedrive.live.com/download?resid=684E21B94B52D0C2!2688&authkey=!AAyRLt9WcK3InHw&ithint=video%2cmp4",
                    "https://drive.google.com/uc?export=download&id=0B4BsAbG4atWHQzVfLUU3UnhhZTA",
                    "https://www.bensound.com/bensound-music/bensound-betterdays.mp3",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/2000px-International_Pok%C3%A9mon_logo.svg.png",
                    "https://78.media.tumblr.com/383c72d0cb94863d94c3df3c8477c8f0/tumblr_mlb54sjsCI1qm5kn7o1_500.jpg"
                ];

                this.currentPosDisplay = $('#url__input__field');
                this.currentPosDisplay.on("keypress keydown keyup", function(e) {
                    e.stopPropagation();
                });

                $scope.addContentMaterial = function () {
                    var inputURLField = document.getElementById("url__input__field");
                    if(inputURLField.value != "") {
                        contentCtrl.addContentMaterial(inputURLField.value);
                        inputURLField.value = "";
                        
                        // test urls
                        inputURLField.value = tmpList[index];
                        index++;
                        if (index >= tmpList.length) { index = 0;}
                    }
                };

                $scope.loadContentMaterial = function () {
                    $element.find('.load-file__input')[0].click();
                };

                $scope.saveContentMaterial = function () {
                    contentCtrl.saveContentMaterial();
                };

                $scope.sendStitching = function () {
                    contentCtrl.sendStitching();
                };

                $scope.abortStitching = function () {
                    contentCtrl.abortStitching();
                };

                $scope.receive = function () {
                    contentCtrl.receive();
                };

                $scope.purgeQueuesAndRestartServer = function () {
                    var purgeRequestQueue = window.open('https://sqs.eu-west-1.amazonaws.com/362232955499/transcode_requests.fifo?Action=PurgeQueue', "purgeRequestQueue", "width=400, height=200, left=495px, top=250px");
                    setTimeout(function(){ purgeRequestQueue.close() }, 1000);

                    var purgeResultQueue = window.open('https://sqs.eu-west-1.amazonaws.com/362232955499/transcode_results.fifo?Action=PurgeQueue', "purgeResultQueue", "width=400, height=200, left=905px, top=250px");
                    setTimeout(function(){ purgeResultQueue.close() }, 1000);

                    setTimeout(function () {
                        var restartServer = window.open('http://ec2-18-195-215-80.eu-central-1.compute.amazonaws.com:8888/', "restartServer", "width=400, height=200, left=700px, top=525px");
                        setTimeout(function(){ restartServer.close() }, 1000);
                    }, 500);
                };

                $scope.contentTap = function () {
                    console.log('contentList', $scope.contentList);
                };

                $scope.makeProgress = function () {
                    SQSService.makeProgress();
                };
            }
        };
    }]);
