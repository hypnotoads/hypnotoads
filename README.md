[![Stories in Ready](https://badge.waffle.io/hypnotoads/hypnotoads.png?label=ready&title=Ready)](https://waffle.io/hypnotoads/hypnotoads)
# Hypnotoads
Hypnotoads is a social workout tracker intended to let users to share their progress, learn from others, and find support in a safe, health-oriented environment. 
## Contributing
Feel free to fork hypnotoads and work on it. If you're going to make a pull request, make it early (before you've completed too much work) and start a conversation with us. We'd love to hear about what you're planning, tell you how we feel about it and work with you if it excites us. 
## Style
Please follow the style guide (STYLE-GUIDE.md) when writing code that will be submitted in a pull request.

# Application Structure #
The application uses Node.js, jwt-simple, Express.js, Sequelize.js, Postgres, Angular.js, Bootstrap, D3.js, Moment.js.
## Server
Node server uses Express.js and Sequelize.js with Postgres for the database. Uses ES6 syntax.  
app.js - initialization for server  
Routes.js - all server-side routing (Express)  
Utils.js - checkUser function that decodes & attaches user to request (jwt)
### Config
Empty, unused directory. Should be removed.
### Controllers
controllers/index.js - contains all of the methods used by routes.js to:  
1. Create users  
2. Log in users  
3. Add workouts  
4. Retrieve all workouts  
5. Retrieve a user’s workouts  
6. Delete a workout
### DB
db/index.js - tables, relationships, and db initialization for PostgreSQL db via Sequelize

## Client (workout-app): 

### app.js
Uses ngRouter to provide client-side routing. Contains controller and factories related to authentication (adding users, checking users, tokens, sessions, etc).

### index.html
Provides template for all application views, which contains navigation bar and dependency script tags.

### Auth
Includes /signin/signin.html and /signup/signup.html. Corresponding controllers and factories can be accessed in app.js.

### Feed
/feed/feed.html displays the workout schedule for each user. This view uses the controller in post/postWorkout.js.

### Post
/post/postWorkout.html allows the user to add workouts to their schedule. /post/postWorkout.js contains the corresponding controller and factory. It references $http functions that are stored in /services/services.js. 

### Profile
/profile/profile.html provides the workouts of the logged in user, displayed in both a list and a graph visualization. The corresponding functions are found in profile/profile.js. It references $http functions that are stored in /services/services.js.

### Services
This Angular factory contains the $http functions that interact with the server endpoints, allowing the client-side code to have access to and post to the database. 

### Style
/styles/styles.css contains the CSS styling for the application. It uses a combination of pure CSS and Bootstrap. 

### Testdata
/testdata/new.json contains placeholder data that can be used to run the profile.html page.

# Team 
Esther Oh  
https://github.com/ohesoh  
Anna Zhao   
https://github.com/annatangzhao  
Jeff Bernstein  
https://github.com/jeff-bernstein  
Jonathan Hawley-Peters  
https://github.com/jonathanhawleypeters  

# ISC License (ISC)
Copyright (c) 2016, Hypnotoads <E-mail address>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.


