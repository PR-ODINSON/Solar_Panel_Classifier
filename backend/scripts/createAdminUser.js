import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin@insolare.ac.in' });
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists:', existingAdmin.email);
            console.log('👤 Username:', existingAdmin.username);
            console.log('🔑 Role:', existingAdmin.role);
            console.log('✨ Active:', existingAdmin.isActive);
            process.exit(0);
        }
        
        console.log('👤 Creating admin user...');
        const adminUser = new User({
            username: 'admin',
            email: 'admin@insolare.ac.in',
            password: 'admin123',
            firstName: 'System',
            lastName: 'Administrator',
            role: 'admin',
            phone: '+919876543210',
            department: 'IT Administration',
            employeeId: 'EMP001',
            isActive: true
        });
        
        await adminUser.save();
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', adminUser.email);
        console.log('👤 Username:', adminUser.username);
        console.log('🔑 Role:', adminUser.role);
        console.log('🆔 Employee ID:', adminUser.employeeId);
        
        console.log('\n🎉 You can now login with:');
        console.log('Email: admin@insolare.ac.in');
        console.log('Password: admin123');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        
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
createAdminUser();
