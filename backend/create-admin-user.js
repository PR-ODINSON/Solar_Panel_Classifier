import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        });
        console.log('Connected to MongoDB Atlas\n');
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        // Check if admin already exists
        const existingUser = await usersCollection.findOne({ email: 'admin@insolare.ac.in' });
        
        if (existingUser) {
            console.log('⚠️  Admin user already exists. Updating password and role...\n');
            
            // Hash new password
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            const result = await usersCollection.updateOne(
                { email: 'admin@insolare.ac.in' },
                {
                    $set: {
                        password: hashedPassword,
                        role: 'admin',
                        isActive: true,
                        updatedAt: new Date()
                    }
                }
            );
            
            console.log('✅ Admin user updated successfully!');
            console.log(`Modified count: ${result.modifiedCount}`);
            
            const updatedUser = await usersCollection.findOne({ email: 'admin@insolare.ac.in' });
            console.log('\nUpdated admin details:');
            console.log({
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                isActive: updatedUser.isActive
            });
        } else {
            console.log('Creating new admin user...\n');
            
            // Hash password
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            const newUser = {
                username: 'admin',
                email: 'admin@insolare.ac.in',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                employeeId: 'ADMIN001',
                department: 'Administration',
                phone: null,
                isActive: true,
                lastLogin: null,
                profilePicture: null,
                preferences: {
                    theme: 'light',
                    notifications: {
                        email: true,
                        push: true
                    },
                    language: 'en'
                },
                refreshTokens: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const result = await usersCollection.insertOne(newUser);
            
            console.log('✅ Admin user created successfully!');
            console.log(`Inserted ID: ${result.insertedId}`);
            console.log('\nNew admin details:');
            console.log({
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                employeeId: newUser.employeeId,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                isActive: newUser.isActive
            });
        }
        
        // Verify user can be authenticated
        const adminUser = await usersCollection.findOne({ email: 'admin@insolare.ac.in' });
        if (adminUser) {
            const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
            console.log('\n🔐 Password verification:', isPasswordValid ? '✅ SUCCESS' : '❌ FAILED');
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('Login credentials:');
        console.log('Email: admin@insolare.ac.in');
        console.log('Password: admin123');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

createAdminUser();
