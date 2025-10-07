import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const checkUsers = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        
        console.log('👥 Checking existing users...\n');
        
        const users = await User.find({}).select('username email role employeeId isActive').lean();
        
        if (users.length === 0) {
            console.log('📭 No users found in database');
        } else {
            console.log(`📊 Found ${users.length} users:`);
            console.log('─'.repeat(80));
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email}`);
                console.log(`   Username: ${user.username}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Employee ID: ${user.employeeId}`);
                console.log(`   Active: ${user.isActive}`);
                console.log('');
            });
        }
        
        // Check specifically for admin user
        const adminUser = await User.findOne({ email: 'admin@insolare.ac.in' });
        if (adminUser) {
            console.log('✅ Admin user found with correct email!');
            console.log('📧 Email:', adminUser.email);
            console.log('🔑 Role:', adminUser.role);
            console.log('✨ Active:', adminUser.isActive);
        } else {
            console.log('❌ Admin user with email admin@insolare.ac.in NOT found');
            
            // Check if there's an admin user with different email
            const anyAdmin = await User.findOne({ role: 'admin' });
            if (anyAdmin) {
                console.log('⚠️  Found admin user with different email:', anyAdmin.email);
            }
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error checking users:', error.message);
        process.exit(1);
    }
};

// Run the function
checkUsers();
