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
// const emailLookup = (database, email) => {
//   for (let user in database) {
//     if (email === database[user]['email']) {
//       return true;
//     } else {
//       return false;
//     }
//   }
// };
const getUserByEmail = (database, email) => {
  for (let user in database) {
    const userObj = database[user];
    if (userObj.email === email) {
      return userObj;
    }
  }
  return false;
};
console.log(getUserByEmail(users, 'user3@example.com'));
