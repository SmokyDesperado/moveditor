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
        'ngTouch',
        'hmTouchEvents',
        'noUiSlider'
    ])
    .config(['$locationProvider', function ($locationProvider) {
        $locationProvider.hashPrefix('');
    }])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/controllers/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/about', {
                templateUrl: 'views/controllers/about.html',
                controller: 'AboutCtrl',
                controllerAs: 'about'
            })
            .when('/contact', {
                templateUrl: 'views/controllers/contact.html',
                controller: 'ContactCtrl',
                controllerAs: 'contact'
            })
            .otherwise({
                redirectTo: '/'
            });

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
        // $locationProvider.html5Mode({ enabled: true,  requireBase: false});
    });
