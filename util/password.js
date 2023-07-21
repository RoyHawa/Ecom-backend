const bcrypt = require("bcrypt");

passwordHash = async (password, saltRounds) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (err) {
    console.error(err);
    return null;
  }
};

comparePasswords = async (password, hash) => {
  try {
    const matchFound = await bcrypt.compare(password, hash);
    console.log(matchFound);
    return matchFound;
  } catch (err) {
    console.error(err);
    return false;
  }
};

module.exports = {
  passwordHash,
  comparePasswords,
};
