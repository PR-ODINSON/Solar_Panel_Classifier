import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const clearAllData = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        
        console.log('🗑️  Clearing all collections except users...\n');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        let totalDeleted = 0;
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            
            // Skip users collection
            if (collectionName === 'users') {
                console.log(`⏭️  Skipping: ${collectionName}`);
                continue;
            }
            
            try {
                const collection = db.collection(collectionName);
                const result = await collection.deleteMany({});
                console.log(`✅ Cleared ${collectionName}: ${result.deletedCount} documents deleted`);
                totalDeleted += result.deletedCount;
            } catch (error) {
                console.log(`⚠️  Error clearing ${collectionName}: ${error.message}`);
            }
        }
        
        console.log('\n' + '─'.repeat(80));
        console.log(`🎉 Cleanup complete! Total documents deleted: ${totalDeleted}`);
        console.log('✅ Users collection preserved');
        
        // Show remaining users
        const usersCollection = db.collection('users');
        const userCount = await usersCollection.countDocuments();
        console.log(`\n👥 Users in database: ${userCount}`);
        
        const users = await usersCollection.find({}, { projection: { email: 1, role: 1 } }).toArray();
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (${user.role})`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during data cleanup:', error.message);
        process.exit(1);
    }
};

// Run the function
clearAllData();
