import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const testLogin = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        
        console.log('🧪 Testing login process...');
        
        // Find user by email
        const user = await User.findOne({ email: 'admin@insolare.ac.in' });
        
        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }
        
        console.log('✅ User found:', user.email);
        console.log('👤 Username:', user.username);
        console.log('🔑 Role:', user.role);
        console.log('✨ Active:', user.isActive);
        
        // Test password
        const isPasswordValid = await user.comparePassword('admin123');
        console.log('🔐 Password valid:', isPasswordValid);
        
        if (isPasswordValid) {
            console.log('✅ Login test successful!');
            console.log('\n🎯 Frontend should work with:');
            console.log('Email: admin@insolare.ac.in');
            console.log('Password: admin123');
        } else {
            console.log('❌ Password validation failed');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error testing login:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// Run the function
testLogin();
