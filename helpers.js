// returns an object with the user's details if email matches
const getUserByEmail = function(database, email) {
  for (let user in database) {
    const userObj = database[user];
    if (userObj.email === email) {
      return userObj;
    }
  }
  return false;
};

module.exports = { getUserByEmail };