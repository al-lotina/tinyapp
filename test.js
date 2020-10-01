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
const emailLookup = (database, email) => {
  for (let user in database) {
    if (email === database[user]['email']) {
      return true;
    } else {
      return false;
    }
  }
};
console.log(emailLookup(users, 'user2@example.com'));
