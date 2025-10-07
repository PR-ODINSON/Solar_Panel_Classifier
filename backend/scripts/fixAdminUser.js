import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const fixAdminUser = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        
        // Check if admin user already exists
        let adminUser = await User.findOne({ email: 'admin@insolare.ac.in' });
        
        if (adminUser) {
            console.log('✅ Admin user already exists:', adminUser.email);
            process.exit(0);
        }
        
        // Check if there's already a user with EMP001
        const existingEmp001 = await User.findOne({ employeeId: 'EMP001' });
        
        if (existingEmp001) {
            console.log('⚠️  Found existing user with EMP001:', existingEmp001.email);
            console.log('🔄 Updating employee ID to EMP002 for existing user...');
            
            // Update existing user to EMP002
            existingEmp001.employeeId = 'EMP002';
            await existingEmp001.save();
            console.log('✅ Updated existing user employee ID to EMP002');
        }
        
        console.log('👤 Creating admin user with EMP001...');
        adminUser = new User({
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
        
        // Test the login
        console.log('\n🧪 Testing login...');
        const testUser = await User.findOne({ email: 'admin@insolare.ac.in' });
        if (testUser) {
            const isPasswordValid = await testUser.comparePassword('admin123');
            if (isPasswordValid) {
                console.log('✅ Login test successful!');
            } else {
                console.log('❌ Login test failed - password mismatch');
            }
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error fixing admin user:', error.message);
        
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
fixAdminUser();
