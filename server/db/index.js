const Sequelize = require('sequelize');
let db;

if (process.env.DATABASE_URL) {
  db = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialectOptions: {
      ssl: true,
    },
  });
} else {
  db = new Sequelize('hypnotoad', 'fred', 'fred', {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  });
}

// we define the models we need using js--we don't need a schema file!
const User = db.define('User', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  // pre-save, password hash
});

const Workout = db.define('Workout', {
  datetime: Sequelize.DATE,
  duration: Sequelize.INTEGER,
  category: Sequelize.STRING,
  comment: Sequelize.STRING,
  calories: Sequelize.INTEGER,
  year: Sequelize.INTEGER,
  week: Sequelize.INTEGER,
  day: Sequelize.INTEGER,
});

// puts a UserId column on each Message instance
// also gives us the `.setUser` method available
// after creating a new instance of Message
Workout.belongsTo(User);

// enables bi-directional associations between Users and Messages
User.hasMany(Workout);


User.sync(/*{force: true}*/);
Workout.sync(/*{force: true}*/);
// creates these tables in MySQL if they don't already exist. Pass in {force: true}
// to drop any existing user and message tables and make new ones.

exports.User = User;
exports.Workout = Workout;
