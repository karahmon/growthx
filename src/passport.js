import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/user.model.js';
import Admin from './models/admin.model.js';

// Google OAuth for Users
passport.use('google-user', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback", // Callback URL for users
}, async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;

    try {
        let user = await User.findOne({ oauthId: id, oauthProvider: 'google' });

        if (!user) {
            // Create new user if one doesn't exist
            user = await User.create({
                username: displayName,
                email: emails[0].value,
                oauthProvider: 'google',
                oauthId: id,
            });
        }

        done(null, user);
    } catch (error) {
        done(error, false);
    }
}));

// Google OAuth for Admins
passport.use('google-admin', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/admin/google/callback", // Callback URL for admins
}, async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;

    try {
        let admin = await Admin.findOne({ oauthId: id, oauthProvider: 'google' });

        if (!admin) {
            // Create new admin if one doesn't exist
            admin = await Admin.create({
                username: displayName,
                email: emails[0].value,
                oauthProvider: 'google',
                oauthId: id,
            });
        }

        done(null, admin);
    } catch (error) {
        done(error, false);
    }
}));

// Serialize user/admin into the session
passport.serializeUser((entity, done) => {
    done(null, { id: entity.id, role: entity.role || 'user' }); // Add role for differentiation
});

// Deserialize user/admin based on role
passport.deserializeUser(async (data, done) => {
    const { id, role } = data;

    try {
        let entity;
        if (role === 'admin') {
            entity = await Admin.findById(id);
        } else {
            entity = await User.findById(id);
        }
        done(null, entity);
    } catch (error) {
        done(error, false);
    }
});

export default passport;
