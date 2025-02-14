import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

export function initializePassport() {
    passport.use(new LocalStrategy({ usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, { message: 'No user found with that email' });
                }
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user, { message: 'Logged in successfully' });
                }
                return done(null, false, { message: 'Password incorrect' });
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        try {
            // Only store essential user data in session
            done(null, {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                isActive: user.isActive
            });
        } catch (err) {
            done(err);
        }
    });

    passport.deserializeUser(async (sessionUser, done) => {
        try {
            const user = await User.findById(sessionUser.id).select('-password');
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
}
