import express from 'express';
import { app } from './src/app.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

connectDB()
.then(() => {
app.listen(8080, () => {
console.log(`App is listening at 8080`);
});
})
.catch((error) => {
console.error('Database connection failed:', error);
});
