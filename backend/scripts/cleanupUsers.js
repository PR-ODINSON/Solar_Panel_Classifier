import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const cleanupUsers = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        
        console.log('🗑️  Removing all users except admin...');
        
        // Delete all users except admin@insolare.ac.in
        const result = await User.deleteMany({ 
            email: { $ne: 'admin@insolare.ac.in' } 
        });
        
        console.log(`✅ Deleted ${result.deletedCount} users`);
        
        // Create prithvi maintenance user
        console.log('👤 Creating maintenance user: prithvi@insolare.ac.in...');
        
        const prithviUser = new User({
            username: 'prithvi',
            email: 'prithvi@insolare.ac.in',
            password: 'prithvi123',
            firstName: 'Prithvi',
            lastName: 'Raj',
            role: 'maintenance_staff',
            phone: '+919876543212',
            department: 'Maintenance',
            employeeId: 'MAINT001',
            isActive: true
        });
        
        await prithviUser.save();
        console.log('✅ Created maintenance user successfully!');
        
        // List all users
        console.log('\n📊 Current users in database:');
        const users = await User.find({}).select('email username role employeeId').lean();
        console.log('─'.repeat(80));
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Employee ID: ${user.employeeId}`);
            console.log('');
        });
        
        console.log('\n🎉 Database cleanup complete!');
        console.log('\n📝 Login Credentials:');
        console.log('Admin:');
        console.log('  Email: admin@insolare.ac.in');
        console.log('  Password: admin123');
        console.log('\nMaintenance Staff:');
        console.log('  Email: prithvi@insolare.ac.in');
        console.log('  Password: prithvi123');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        
        if (error.name === 'ValidationError') {
            console.log('\n📋 Validation errors:');
            Object.values(error.errors).forEach(err => {
                console.log(`- ${err.path}: ${err.message}`);
            });
        }
        
        process.exit(1);
    }
};

// Run the function
cleanupUsers();
