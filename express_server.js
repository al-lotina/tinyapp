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
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

function generateRandomString() {
  const rand = Math.floor(Math.random() * 9) + 'aBc' + Math.floor(Math.random() * 9) + 'zT';
  return rand;
};

// Routes --------------------------------------
// Views
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  const longURL = templateVars.longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']]
  };
  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL; // req.body is similar to req.params but is what we get in the form filled by client 
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/' + shortURL);
  // or res.redirect('/urls/'); to go back to index/home page
});

// const emailLookup = (database, email) => {
//   for (let user in database) {
//     if (email === users[user].email) {
//       return true;
//     }
//   }
// }

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
  // console.log(users);
  res.cookie('user_id', newUserId); 
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
