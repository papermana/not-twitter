module.exports = (password) => {
  return (
    password.length > 8 &&
    !/^[a-zA-Z]+$/.test(password)
  );
};
