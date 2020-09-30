const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const rand = Math.floor(Math.random() * 9) + 'aBc' + Math.floor(Math.random() * 9) + 'zT';
  return rand;
}

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; // username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
// // temp
// const templateVars = {
//   username: req.cookies["username"],
//   // ... any other vars
// };
// res.render("urls_index", templateVars);
// //

app.get('/urls/new', (req, res) => {
  // const templateVars = { username: req.cookies["username"] };
  res.render('urls_new'); //, templateVars);
});

app.post('/urls', (req, res) => {
  // own code
  const shortURL = generateRandomString();
  const longURL = req.body.longURL; // req.body is similar to req.params but is what we get in the form filled by client 
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/' + shortURL);
});
// own code
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});
// own code
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
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  res.render('urls_register');
});

app.get("/u/:shortURL", (req, res) => {
  // own code
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  const longURL = templateVars.longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    // username: req.cookies["username"]
   };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// console.log(generateRandomString());
/* from _header.ejs
<!-- <div>          
<% if(username) { %> 
<span> <%= user %> </span>
<form class="form-inline" action="/logout" method="POST"> 
  <div class="form-group mb-2">
    <input class="form-control" type="text" name="username" placeholder="Logged In As: <%= name %>" style="width: 300px; margin: 1em">
    <button type="submit" class="btn btn-primary">Logout</button> 
  </div>  
</form>
<% } else { %> 

<% } %> 
</div>  -->
*/