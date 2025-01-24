import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

// Replace this with your user model/database logic
const users = [
    { id: '1', email: 'test@test.it', password: '$2a$12$pqKEvGLGwPOOqfU3RMxB8.787GxvciB5weUod0kTlvSYRMw6ko2DC' } // Password is 'test'
]; // Temporary user store - replace with your database

export function initializePassport() {
    passport.use(new LocalStrategy({ usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = users.find(user => user.email === email);
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

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        const user = users.find(user => user.id === id);
        done(null, user);
    });
}
