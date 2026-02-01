import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixPrithviUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        });
        console.log('Connected to MongoDB Atlas');
        
        // Find and update Prithvi user
        const result = await User.findOneAndUpdate(
            { email: 'prithvi@insolare.ac.in' },
            { 
                $set: { 
                    role: 'maintenance_staff',
                    isActive: true
                }
            },
            { new: true }
        );
        
        if (result) {
            console.log('\n=== User Updated Successfully ===');
            console.log('Email:', result.email);
            console.log('Username:', result.username);
            console.log('Role:', result.role);
            console.log('isActive:', result.isActive);
            console.log('First Name:', result.firstName);
            console.log('Last Name:', result.lastName);
        } else {
            console.log('\n=== User NOT Found ===');
            console.log('No user with email: prithvi@insolare.ac.in');
            console.log('\nPlease check if the user exists in the database.');
        }
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixPrithviUser();
