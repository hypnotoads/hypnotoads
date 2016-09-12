const express = require('express');

// Middleware
const morgan = require('morgan');
const parser = require('body-parser');

// Router
const router = require('./routes.js');

const app = express();

module.exports.app = app;

const port = process.env.PORT || 3000;

// Set what we are listening on.
app.set('port', port);

// Logging and parsing
app.use(morgan('dev'));
app.use(parser.json());

// Set up our routes
app.use('/', router); // Formerly '/classes'
// Serve the client files
app.use(express.static(`${__dirname}/../workout-app`));


// If we are being run directly, run the server.
if (!module.parent) {
  app.listen(app.get('port'));
  console.log('Listening on', app.get('port'));
}
