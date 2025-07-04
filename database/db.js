import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const Connection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully');
    } catch (err) {
        console.log("Error while connecting database");
        console.log(err);
    }
};
