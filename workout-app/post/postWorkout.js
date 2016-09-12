angular.module('post-workout', [])

.controller('PostWorkoutController', function ($scope, Workouts, PostWorkouts) {
  angular.extend($scope, Workouts, PostWorkouts)

  $scope.displayedWeek = moment().week();
  $scope.weekOffset = 0;

  $scope.weekStart =  moment().startOf('isoWeek').add($scope.weekOffset, 'days').format("MMM Do");
  $scope.weekEnd = moment().endOf('isoWeek').add($scope.weekOffset, 'days').format("MMM Do");


  // this array holds the local copy of all the workouts
  $scope.workoutsDatabase = [];

  // this function keeps the local database in sync with persistent data
  $scope.loadDatabase = function () {
    Workouts.getAllWorkouts()
    .then(function (data) {
      $scope.workoutsDatabase = data;
    });
  }

  // this stores a local copy of all usernames, and obtains id that corresponds with logged in user (to filter workouts)
  $scope.currentId = 0;
  $scope.usernamesDatabase = [];
  $scope.getAllUsernames = function () {
    Workouts.getUser()
    .then(function (data) {
      $scope.usernamesDatabase = data;
    })
    .then(function () {
      for (var i = 0; i < $scope.usernamesDatabase.length; i++) {
        if ($scope.usernamesDatabase[i].username === $scope.windowUsername) {
        $scope.currentId = $scope.usernamesDatabase[i].id
        }
      }
    })
  }

  // will need to call these to start
  $scope.loadDatabase();
  $scope.getAllUsernames();

  $scope.createWorkout = function (id, category, type, day, comment, duration, calories) {
    var year = moment().year();

    if (type !== undefined) {
      var newWorkout = {
        datetime: new Date().toISOString,
        duration: duration,
        category: category,
        type: type,
        comment: comment,
        calories: calories,
        year: year,
        week: this.displayedWeek,
        day: day,
        hidden: false,
        UserId: id
      }
      Workouts.addWorkout(newWorkout)
      .then(function () {
       $scope.loadDatabase();
      });
      $scope.getAllUsernames();
    }
  }

  $scope.deleteThisWorkout = function (id) {
    Workouts.deleteWorkout(id)
    .then(function () {
      $scope.loadDatabase();
    })

  }
})

.factory('PostWorkouts', function ($window, $location) {

  var workoutCategories = {
    cardio: ['running', 'walking', 'jogging'],
    weightlifting: ['arms', 'legs', 'full body'],
    stretching: [],
    other: ['jazzercise', 'vigorous reading', 'professional debating', 'walking the dog', 'playing with children']
  }

  // *** go back into database and update these fields
  var workoutFields = ['duration', 'calories', 'comment']

  var addNewElement = {
    Monday: { hidden: false },
    Tuesday: { hidden: false },
    Wednesday: { hidden: false },
    Thursday: { hidden: false },
    Friday: { hidden: false },
    Saturday: { hidden: false },
    Sunday: { hidden: false }
  }

  var daysOfTheWeek = {
    'Monday' : 0,
    'Tuesday' : 1,
    'Wednesday' : 2,
    'Thursday' : 3,
    'Friday' : 4,
    'Saturday' : 5,
    'Sunday' : 6
  }

  var toggle = function (item) {
    item.hidden = !item.hidden
  }

  var changeDisplayedWeek = function (direction) {
    if (direction === "prev") {
      this.displayedWeek--;
      this.weekOffset -= 7;
    } else if (direction === "next") {
      if (this.displayedWeek < moment().week()) {
        this.displayedWeek++;
        this.weekOffset += 7;
      }
    }
    this.weekStart =  moment().startOf('isoWeek').add(this.weekOffset, 'days').format("MMM Do");
    this.weekEnd = moment().endOf('isoWeek').add(this.weekOffset, 'days').format("MMM Do");
  }

  var windowUsername = $window.localStorage.getItem('username')

  return {
    workoutCategories: workoutCategories,
    workoutFields: workoutFields,
    addNewElement: addNewElement,
    daysOfTheWeek: daysOfTheWeek,
    toggle: toggle,
    changeDisplayedWeek: changeDisplayedWeek,
    windowUsername: windowUsername
  }
})
