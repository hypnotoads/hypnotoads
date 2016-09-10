//TODO: CHECK ACTUAL NAMES FOR CONTROLLERS AND TEMPLATES

angular.module('workout-app', [
  // 'auth',
   'profile',
   'post-workout',
  'workout-app.services',
  'ngRoute',
  // 'feed'
])
  .config(function($routeProvider, $httpProvider) {
    $routeProvider
      .when('/signin', {
        templateUrl: 'auth/signin/signin.html',
        controller: 'AuthController',
        authenticate: false
      })
      .when('/signup', {
        templateUrl: 'auth/signup/signup.html',
        controller: 'AuthController',
        authenticate: false
      })
      // .when('signout', {
      // })
      .when('/profile', {
        templateUrl: 'profile/profile.html',
        controller: 'ProfileController',
        authenticate: true
      })
      .when('/postWorkout', {
        templateUrl: 'post/postWorkout.html',
        controller: 'PostWorkoutController',
        authenticate: true
      })
      .when('/feed', {
        templateUrl: 'feed/feed.html',
        controller: 'PostWorkoutController',
        authenticate: true
      })
      .otherwise({
        redirectTo:'/feed'
      })

      $httpProvider.interceptors.push('AttachTokens');

  })
  .factory('Auth', function ($http, $location, $window) {
    var isAuth = function () {
      return !!$window.localStorage.getItem('hypnotoad');
    };
    return {
      isAuth: isAuth
    };
  })
  .factory('AttachTokens', function ($window) {
    var attach = {
      request: function (object) {
        var jwt = $window.localStorage.getItem('hypnotoad');
        if (jwt) {
          object.headers['x-access-token'] = jwt;
        }
        object.headers['Allow-Control-Allow-Origin'] = '*';
        return object;
      }
    };
    return attach;
  })
  .controller('AuthController', function ($scope, $window, $location, Auth, $http) {
    $scope.checkUser = function (username, password) {
      return $http({
        method: 'POST',
        url: '/signin',
        data: { username: username, password: password }
      })
      .then(function (res) {
        // console.log('Debug output', res.data.token);
        $window.localStorage.setItem('hypnotoad', res.data.token);
        $window.localStorage.setItem('username', username);
        $location.path('/profile');
      })
      .catch(function (err) {
        console.log(err);
      });
    };
    $scope.addUser = function (username, password) {
      return $http({
        method: 'POST',
        url: '/signup',
        data: { username: username, password: password }
      })
      .then(function (res) {
        $window.localStorage.setItem('hypnotoad', res.data.token);
        $window.localStorage.setItem('username', username);
        $location.path('/profile');
      })
      .catch(function (err) {
        console.log(err);
      });
    };
    $scope.signout = function () {
      $window.localStorage.removeItem('hypnotoad');
      $window.localStorage.removeItem('username');
      $location.path('/signin');
    };
  })
  .run(function ($rootScope, $location, Auth) {
    $rootScope.$on('$routeChangeStart', function (evt, next, current) {
      if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
        $location.path('/signin');
      }
    });
  });