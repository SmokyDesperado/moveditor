'use strict';

/**
 * @ngdoc function
 * @name moveditorApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the moveditorApp
 */
angular.module('moveditorApp')
    .controller('MainCtrl', [
    	function () {

            // ====================================================================================================
            // prevent browser zoom via ctrl +/- or mouse wheel
            // https://stackoverflow.com/questions/27116221/prevent-zoom-cross-browser
            // ====================================================================================================

            $(document).keydown(function(event) {

                // 107 Num Key  +, 109 Num Key  -, 173 Min Key hyphen/underscor, 61 Plus key  +/= key
                if (event.ctrlKey && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109' || event.which == '187' || event.which == '189' )) {
                    event.preventDefault();
                }

                // 37 arrow left
                if (event.altKey && event.which == '37') {
                    event.preventDefault();
                }
            });

            $(window).bind('mousewheel DOMMouseScroll', function (event) {
            	if (event.ctrlKey) {
            		event.preventDefault();
            	}
            });
    	}
    ]);
