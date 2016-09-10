const controller = require('./controllers');
const router = require('express').Router();
// Utils
const utils = require('./utils.js');

// Connect controller methods to their corresponding routes
router.get('/workouts', utils.checkUser, controller.workouts.all);

router.get('/workouts/:id', utils.checkUser, controller.workouts.user);

router.delete('/workouts/:id', utils.checkUser, controller.workouts.delete);

router.post('/workouts', utils.checkUser, controller.workouts.add);

router.get('/users', utils.checkUser, controller.users.get);

router.post('/signin', controller.users.signin);

router.post('/signup', controller.users.signup);


module.exports = router;

