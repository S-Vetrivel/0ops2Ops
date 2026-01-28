const User = require("../models/userModel");

async function findOrCreateGoogleUser(profile) {
  // 1. Check by Google ID
  let user = await User.findOne({ googleId: profile.sub }); // Note: Google calls ID 'sub' in JWTs
  if (user) return user;

  // 2. Check by Email
  if (profile.email) {
    user = await User.findOne({ email: profile.email });
    if (user) {
      user.googleId = profile.sub;
      if (!user.profilePicture && profile.picture)
        user.profilePicture = profile.picture;
      await user.save();
      return user;
    }
  }

  // 3. Create New
  return await User.create({
    googleId: profile.sub,
    email: profile.email,
    fullname: profile.name,
    username: profile.email.split("@")[0],
    profilePicture: profile.picture,
    password: "google-onetap-" + Date.now(),
  });
}

module.exports = { findOrCreateGoogleUser };
