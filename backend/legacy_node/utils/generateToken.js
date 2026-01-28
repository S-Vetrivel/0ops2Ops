const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (res, userId) => {
  // 1. Generate Token
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // 2. Cookie Options
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Security: JS cannot read this
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // CSRF protection
  };

  // 3. Set Cookie
  res.cookie("token", token, options);

  return token; // Return token in case you need it for debugging
};

module.exports = generateTokenAndSetCookie;
