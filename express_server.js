// Server Setup -------------------------------
const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Middleware ---------------------------------
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Data ---------------------------------------
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" } // 'aJ48lW'
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const generateRandomString = function() {
  return Math.random().toString(16).slice(2, 7);
};

const getUserByEmail = (database, email) => {
  for (let user in database) {
    const userObj = database[user];
    if (userObj.email === email) {
      return userObj;
    }
  }
  return false;
};
// returns object with user details:
const urlsForUser = function (database, id) {
  const filteredUrls = {};
  for (let shortURL in database) {
    const longUrlUserObj = database[shortURL];
    if (longUrlUserObj.userID === id) {
      filteredUrls[shortURL] = longUrlUserObj;
    }
  }
  return filteredUrls;
};
// returns true or false if user is logged in
const assertUserId = function (database, id) {
  let assert = false;
  for (let shortURLKey in database) {
    if (database[shortURLKey].userID === id) {
      assert = true;
    }
  }  
  return assert;
};

// Routes --------------------------------------
// Views
app.get('/urls', (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  };
  const userObject = urlsForUser(urlDatabase, req.cookies['user_id']);
  const templateVars = { urls: userObject, user: users[req.cookies['user_id']] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] }
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] }
  res.render('urls_login', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  const longURL = templateVars.longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  } 
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies['user_id']]
  };
  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL; // req.body is similar to req.params but is what we get in the form filled by client 
  urlDatabase[shortURL] = { longURL: longURL, userID: req.cookies['user_id'] }; // adds new key:value pair to database 
  // console.log(urlDatabase);
  res.redirect('/urls/' + shortURL);
  // or res.redirect('/urls/'); //to go back to index/home page
});

app.post('/register', (req, res) => {
  const newUserId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '' ) {
    res.status(400).json({message: 'Please enter email and password'});
  }
  for (let user in users) {
    if (email === users[user].email) {
      res.status(400).json({message: 'Email already exists'}); 
    }
  };  
  users[newUserId] = { id: newUserId, email: email, password: password };
  res.cookie('user_id', newUserId); 
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userDetails = getUserByEmail(users, email);
  if (userDetails === false) {
    res.status(403).json({message: 'Email not found. Please register'});
  }
  if (email === userDetails.email && password === userDetails.password) {
    res.cookie('user_id', userDetails.id);   
    res.redirect('/urls');  
  } else {
    res.status(403).json({message: 'Incorrect username or password'});
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (assertUserId(urlDatabase, req.cookies['user_id'])) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls'); 
  } else {
    res.status(403).json({message: 'You are not authorized to delete this URL'});
  }
});

app.post('/urls/:shortURL/edit', (req, res) => {
  if (assertUserId(urlDatabase, req.cookies['user_id'])) {
    const longURL = req.body.longURL;
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).json({message: 'You are not authorized to edit this URL'});
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});