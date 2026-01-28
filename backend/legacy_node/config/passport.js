const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("--------------- GOOGLE AUTH START ---------------");

          // Helper to get the photo URL safely
          const googlePhoto =
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null;

          // 1. Check existing user by Google ID
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            console.log("User found by Google ID:", user.email);
            return done(null, user);
          }

          // 2. Check existing user by Email (Account Linking)
          if (profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              console.log("User found by Email. Linking account...");

              // Link Google ID
              user.googleId = profile.id;

              // OPTIONAL: If user has no profile picture yet, use the Google one
              if (!user.profilePicture && googlePhoto) {
                user.profilePicture = googlePhoto;
              }

              await user.save();
              return done(null, user);
            }
          }

          // 3. Prepare New User Object
          const newUserObj = {
            googleId: profile.id,
            email:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : "no-email-" + profile.id,

            fullname:
              profile.displayName || profile.name?.givenName || "Google User",

            username:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value.split("@")[0]
                : "user" + Date.now(),

            password: "google-auth-" + Date.now(),

            // --- NEW: SAVE PROFILE PICTURE ---
            profilePicture: googlePhoto,
          };

          console.log(
            "ATTEMPTING TO CREATE USER WITH PHOTO:",
            newUserObj.profilePicture
          );

          const newUser = await User.create(newUserObj);
          console.log("USER CREATED SUCCESSFULLY:", newUser._id);

          return done(null, newUser);
        } catch (err) {
          console.error("CRITICAL DB ERROR:", err);
          return done(err, null);
        }
      }
    )
  );
};
