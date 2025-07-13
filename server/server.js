import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
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
server.use(bodyParser.json());
server.use(express.urlencoded({ extended: true }));

const startServer = async () => {
    try {
        // Connect to the database
        await dbConnecter();
        console.log('Database connected successfully');

        

        // Routes
        server.use(bookRoutes);
        server.use(userRoutes);

        // Start the server
        server.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Error starting the server:', err.message);
        process.exit(1); 
    }
};

startServer();








