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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" } // 'aJ48lW'
};

const assertUserId = function (database, id) {
  let assert = false;
  for (let shortURLKey in database) {
    if (database[shortURLKey].userID === id) {
      assert = true;
    }
  }  
  return assert;
};

console.log(assertUserId(urlDatabase, 'user2RandomID'));