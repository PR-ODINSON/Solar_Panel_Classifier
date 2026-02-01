import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createPrithviUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        });
        console.log('Connected to MongoDB Atlas\n');
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        // Check if Prithvi already exists
        const existingUser = await usersCollection.findOne({ email: 'prithvi@insolare.ac.in' });
        
        if (existingUser) {
            console.log('⚠️  Prithvi user already exists. Updating...\n');
            
            const result = await usersCollection.updateOne(
                { email: 'prithvi@insolare.ac.in' },
                {
                    $set: {
                        role: 'maintenance_staff',
                        isActive: true,
                        employeeId: 'EMP001',
                        firstName: 'Prithvi',
                        lastName: 'Raj',
                        department: 'Maintenance',
                        updatedAt: new Date()
                    }
                }
            );
            
            console.log('✅ User updated successfully!');
            console.log(`Modified count: ${result.modifiedCount}`);
            
            const updatedUser = await usersCollection.findOne({ email: 'prithvi@insolare.ac.in' });
            console.log('\nUpdated user details:');
            console.log({
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                employeeId: updatedUser.employeeId,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                isActive: updatedUser.isActive
            });
        } else {
            console.log('Creating new Prithvi user...\n');
            
            // Hash password
            const hashedPassword = await bcrypt.hash('prithvi123', 12);
            
            const newUser = {
                username: 'prithvi',
                email: 'prithvi@insolare.ac.in',
                password: hashedPassword,
                firstName: 'Prithvi',
                lastName: 'Raj',
                role: 'maintenance_staff',
                employeeId: 'EMP001',
                department: 'Maintenance',
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
            
            console.log('✅ User created successfully!');
            console.log(`Inserted ID: ${result.insertedId}`);
            console.log('\nNew user details:');
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
        
        // Verify user can be fetched
        console.log('\n=== Verification ===');
        const maintenanceStaff = await usersCollection.find({
            role: 'maintenance_staff',
            isActive: true
        }).toArray();
        
        console.log(`\nTotal active maintenance staff: ${maintenanceStaff.length}`);
        maintenanceStaff.forEach(staff => {
            console.log(`  - ${staff.firstName} ${staff.lastName} (${staff.email}) - ${staff.employeeId}`);
        });
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createPrithviUser();
