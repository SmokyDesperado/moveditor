'use strict';

/**
 * @ngdoc directive
 * @name moveditorApp.directive:navigator
 * @description
 * # navigator
 */
angular.module('moveditorApp')
    .directive('mvContent', [
        'AWSService',
        function (AWSService) {
        return {
            templateUrl: '/views/directives/mv_content.html',
            replace: true,
            restrict: 'AE',
            controller: 'MvContentCtrl',
            bindToController: true,
            controllerAs: 'ContentCtrl',
            link: function ($scope, $element, $attrs, contentCtrl) {

                // ====================================================================================================
                // one drive -> https://1drv.ms/v/s!AsLQUku5IU5olQAMkS7fVnCtyJx8
                //              eingeben und beim ersten redirect load abbrechen.
                //              link danach 'redirect' durch 'download' ersetzen
                // dropbox link -> 'www' durch 'dl'
                // ====================================================================================================

                var index = 1;
                var tmpList = [
                    "http://corrupt-system.de/assets/media/bigbugbunny/bbb_trailer.m4v",
                    "http://corrupt-system.de/assets/media/sintel/sintel-trailer.m4v",
                    "https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0",
                    "https://onedrive.live.com/download?resid=684E21B94B52D0C2!2688&authkey=!AAyRLt9WcK3InHw&ithint=video%2cmp4",
                    "https://drive.google.com/uc?export=download&id=0B4BsAbG4atWHQzVfLUU3UnhhZTA",
                    "https://www.bensound.com/bensound-music/bensound-betterdays.mp3",
                    "https://jpgames.de/wp-content/uploads/2014/12/One-Piece-Pirate-Warriors-3_2014_12-19-14_004-620x250.jpg?x37583",
                    "https://jpgames.de/wp-content/uploads/2018/05/CI_NSwitch_HyruleWarriorsDefinitiveEdition_Link-Triforce_image950w.bmp-620x250.jpg?x37583"
                ];

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
                    contentCtrl.loadContentMaterial($scope);
                };

                $scope.saveContentMaterial = function () {
                    contentCtrl.saveContentMaterial();
                };

                $scope.sendStitching = function () {
                    contentCtrl.sendStitching();
                };
            }
        };
    }]);
