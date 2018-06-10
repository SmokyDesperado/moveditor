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

                $scope.addContentMaterial = function () {
                    var inputURLField = document.getElementById("url__input__field");
                    if(inputURLField.value != "") {
                        contentCtrl.addContentMaterial(inputURLField.value);
                        
                        // reset input field
                        inputURLField.value = "";
                    }
                };

                $scope.loadContentMaterial = function () {
                    contentCtrl.loadContentMaterial();
                };

            }
        };
    }]);
