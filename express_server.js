// Server Setup -------------------------------
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

// Middleware ---------------------------------
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['asdf', 'lkjhg']
}));

// Data ---------------------------------------
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

// Helper functions ----------------------------
const generateRandomString = function() {
  return Math.random().toString(16).slice(2, 7);
};

// returns an object containing user's details (id, email, password) if email matches:
const { getUserByEmail } = require('./helpers');

// returns an object containing all URLs for a given userID:
const urlsForUser = function(database, id) {
  const filteredUrls = {};
  for (let shortURL in database) {
    const longUrlUserObj = database[shortURL];
    if (longUrlUserObj.userID === id) {
      filteredUrls[shortURL] = longUrlUserObj;
    }
  }
  return filteredUrls;
};

// returns true or false if user is logged in:
const assertUserId = function(database, id) {
  let assert = false;
  for (let shortURLKey in database) {
    if (database[shortURLKey].userID === id) {
      assert = true;
    }
  }
  return assert;
};

// Routes --------------------------------------
app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  const userObject = urlsForUser(urlDatabase, req.session.user_id);
  const templateVars = { urls: userObject, user: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_login', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  const longURL = templateVars.longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id };
  res.redirect('/urls/' + shortURL);
});

app.post('/register', (req, res) => {
  const newUserId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    res.status(400).json({message: 'Please enter email and password'});
  }
  for (let user in users) {
    if (email === users[user].email) {
      res.status(400).json({message: 'Email already exists'});
    }
  }
  users[newUserId] = { id: newUserId, email: email, password: hashedPassword };
  req.session.user_id = newUserId;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userDetails = getUserByEmail(users, email);
  if (userDetails === false) {
    res.status(403).json({message: 'Email not found. Please register'});
  }
  if (email === userDetails.email && bcrypt.compareSync(password, userDetails.password)) {
    req.session.user_id = userDetails.id;
    res.redirect('/urls');
  } else {
    res.status(403).json({message: 'Incorrect username or password'});
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (assertUserId(urlDatabase, req.session.user_id)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).json({message: 'You are not authorized to delete this URL'});// curl -X POST -i localhost:8080/urls/:shortURL/delete will trigger this message
  }
});

app.post('/urls/:shortURL/edit', (req, res) => {
  if (assertUserId(urlDatabase, req.session.user_id)) {
    const longURL = req.body.longURL;
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).json({message: 'You are not authorized to edit this URL'});// curl -X POST -i localhost:8080/urls/:shortURL/edit will trigger this message
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});