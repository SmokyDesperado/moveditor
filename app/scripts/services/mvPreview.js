'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('mvPreviewService', function () {

        this.play = function () {
            console.log('play()');
        }

        this.stop = function () {
            console.log('stop()');
        }

        this.setLoop = function (loop) {
            console.log('loop(loop)');
        }

        this.setPositionA = function (position) {
            console.log('setPositionA(position)');
        }

        this.setPositionB = function (position) {
            console.log('setPositionB(position)');
        }

        this.setVolume = function (vol) {
            console.log('setVolume(vol)');
        }

        this.setMute = function (mute) {
            console.log('setMute(mute)');
        }

        this.goToStart = function () {
            console.log('goToStart()');
        }

        this.jumpToPosition = function (position) {
            console.log('jumpToPosition(position)');
        }

        this.createActiveVideoEvents = function () {
            console.log('createActiveVideoEvents()');
        }

        this.changeActiveVideo = function (URLIndex) {
            console.log('changeActiveVideo(URLIndex)');
        }

    });
