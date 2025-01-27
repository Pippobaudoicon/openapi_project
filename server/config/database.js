import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';

// Use module-level caching instead of global
const connectionState = {
    conn: null,
    promise: null
};

const options = {
    maxPoolSize: process.env.NODE_ENV === 'development' ? 10 : 50,
    minPoolSize: process.env.NODE_ENV === 'development' ? 1 : 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    heartbeatFrequencyMS: 300000,
    maxIdleTimeMS: 600000,
};

const connectDB = async () => {
    try {
        // Check if we already have a connection
        if (mongoose.connection.readyState === 1) {
            console.log('Using existing connection');
            return mongoose;
        }

        // If we have a promise in progress, wait for it
        if (connectionState.promise) {
            console.log('Waiting for existing connection promise');
            await connectionState.promise;
            return mongoose;
        }

        // Create new connection
        console.log('Creating new connection');
        connectionState.promise = mongoose.connect(process.env.MONGODB_URI, options);
        
        await connectionState.promise;
        connectionState.conn = mongoose;
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            connectionState.conn = null;
            connectionState.promise = null;
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB error:', err);
            connectionState.conn = null;
            connectionState.promise = null;
        });

        console.log('MongoDB connected successfully');
        return mongoose;

    } catch (error) {
        console.error('Connection error:', error);
        connectionState.conn = null;
        connectionState.promise = null;
        throw error;
    }
};

const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60, // 1 day
    touchAfter: 24 * 3600 // Only update session every 24 hours unless data changes
});

export default connectDB;
export { sessionStore };