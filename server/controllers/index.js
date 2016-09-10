const db = require('../db');
const jwt = require('jwt-simple');

module.exports = {
  workouts: {
    // get all workouts from db?
    user(req, res) {
      // should filter for users
      const id = req.url.replace('/workouts/', '');

      db.Workout.findAll({ where: { UserId: id } })
        .then(workouts => res.json(workouts))
        .catch(error => console.error(error));
    },

    all(req, res) {
      db.Workout.findAll()
        .then(workouts => res.json(workouts))
        .catch(error => console.error(error));
    },

    add(req, res) {
      // should just be create
      db.User.find({ where: { username: req.user.username } })
        // findOrCreate returns multiple resutls in an array
        // use spread to assign the array to function arguments
        .then(user => {
          db.Workout.create({
            UserId: user.id,
            duration: req.body.duration,
            datetime: req.body.datetime,
            category: req.body.category,
            comment: req.body.comment,
            calories: req.body.calories,
            year: req.body.year,
            week: req.body.week,
            day: req.body.day,
          })
          .then((/* workout */) => res.sendStatus(201))
          .catch(error => console.error(error));
        });
    },

    delete(req, res) {
      const id = req.url.replace('/workouts/', '');

      db.Workout.destroy({ where: { id } })
        .then(workout => res.json(workout))
        .catch(error => console.error(error));
    },
  },

  users: {
    get(req, res) {
      db.User.findAll()
        .then(users => res.json(users));
    },

    signin(req, res, next) {
      const username = req.body.username;
      const password = req.body.password;

      db.User.find({ where: { username } })
        .then(user => {
          if (!user) {
            next(new Error('username not found'));
          } else {
            if (user.password === password) { // hashing later
              res.json({ token: jwt.encode(user, 'mE2bNdyu2p') });
            } else {
              next(new Error('password does not match'));
            }
          }
        })
        .catch(error => next(error));
    },

    signup(req, res, next) {
      // rework this logic to find, then create
      const username = req.body.username;
      const password = req.body.password;

      db.User.find({ where: { username } })
        .then(user => {
          if (user) {
            return next(new Error('User already exists!'));
          }
          // make a new user if not one
          return db.User.create({
            username,
            password,
          });
        })
        .then(user => res.json({ token: jwt.encode(user, 'mE2bNdyu2p') }))
        .catch(error => next(error));
    },
  },
};
