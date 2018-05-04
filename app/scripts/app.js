'use strict';

/**
 * @ngdoc overview
 * @name moveditorApp
 * @description
 * # moveditorApp
 *
 * Main module of the application.
 */
angular
    .module('moveditorApp', [
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch'
    ])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.hashPrefix('');
    }])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                controllerAs: 'about'
            })
            .otherwise({
                redirectTo: '/'
            });

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    });
