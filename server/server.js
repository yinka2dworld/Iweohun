import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dbConnecter from './utils/db.js';

// Initialize dotenv
dotenv.config();

// Initialize Express server
const server = express();
const port = process.env.PORT || 3000;


server.use( cors({ origin: '*' }) );
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Simple health check used to verify the client can reach the API.
server.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

const startServer = async () => {
    try {
        // Connect to the database
        await dbConnecter();
        console.log('Database connected successfully');

        

        // Routes
        server.use(bookRoutes);
        server.use(userRoutes);

        // Start the server. Node listens on all interfaces by default (IPv4 + IPv6),
        // so both localhost and phones on the LAN can reach it.
        server.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
            console.log(`Reachable on your LAN at http://<your-ip>:${port}`);
        });
    } catch (err) {
        console.error('Error starting the server:', err.message);
        process.exit(1); 
    }
};

startServer();








