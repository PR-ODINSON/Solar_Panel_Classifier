import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        });
        console.log('Connected to MongoDB Atlas');
        
        const user = await User.findOne({ email: 'prithvi@insolare.ac.in' });
        
        if (user) {
            console.log('\n=== User Found ===');
            console.log('Email:', user.email);
            console.log('Username:', user.username);
            console.log('Role:', user.role);
            console.log('isActive:', user.isActive);
            console.log('First Name:', user.firstName);
            console.log('Last Name:', user.lastName);
            console.log('Employee ID:', user.employeeId);
        } else {
            console.log('\n=== User NOT Found ===');
            console.log('No user with email: prithvi@insolare.ac.in');
        }
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUser();
