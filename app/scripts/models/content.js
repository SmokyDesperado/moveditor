'use strict';

/**
 * @ngdoc overview
 * @name moveditorApp
 * @description
 * # moveditorApp
 *
 * Main module of the application.
 */
angular.module('moveditorApp')
    .factory('Content', [
        function () {
            function Content(name, type, length, url) {

                this.name = name;
                this.type = type;
                this.length = length;
                this.url = url;
                this.mpd = "";
                this.active = 0;

            }

            // =========================================================================================================
            // getter
            // =========================================================================================================

            Content.prototype.getName = function () {
                return this.name;
            };

            Content.prototype.getType = function () {
                return this.type;
            };

            Content.prototype.getLength = function () {
                return this.length;
            };

            Content.prototype.getUrl = function () {
                return this.url;
            };

            Content.prototype.getMpd = function () {
                return this.mpd;
            };

            Content.prototype.getActive = function () {
                return this.active;
            };

            // =========================================================================================================
            // setter
            // =========================================================================================================

            Content.prototype.setName = function (name) {
                this.name = name;
            };

            Content.prototype.setType = function (type) {
                this.type = type;
            };

            Content.prototype.setLength = function (length) {
                this.length = length;
            };

            Content.prototype.setUrl = function (url) {
                this.url = url;
            };

            Content.prototype.setMpd = function (url) {
                this.mpd = mpd;
            };

            Content.prototype.setActive = function (active) {
                this.active = active;
            };

            // =========================================================================================================
            // functions
            // =========================================================================================================

            Content.create = function (name, type, length, url) {
                return new Content(
                    name,
                    type,
                    length,
                    url
                );
            };

            Content.prototype.incrementActive = function () {
                this.active++;
            };

            Content.prototype.decrementActive = function () {
                this.active--;
            };

            return Content;
        }
    ]);