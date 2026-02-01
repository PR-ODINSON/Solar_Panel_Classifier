import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fetchAllData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        });
        console.log('Connected to MongoDB Atlas\n');
        
        const db = mongoose.connection.db;
        
        // Get all collections
        const collections = await db.listCollections().toArray();
        
        console.log('=== DATABASE COLLECTIONS ===\n');
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`\n📁 Collection: ${collectionName}`);
            console.log('─'.repeat(80));
            
            const collection = db.collection(collectionName);
            const count = await collection.countDocuments();
            console.log(`Total Documents: ${count}`);
            
            if (count > 0) {
                // Get sample document to show schema
                const sampleDoc = await collection.findOne();
                console.log('\nSample Document Schema:');
                console.log(JSON.stringify(sampleDoc, null, 2));
                
                // Get all documents for important collections
                if (['users', 'defects', 'inspections', 'maintenancetasks', 'panels'].includes(collectionName)) {
                    const allDocs = await collection.find().limit(10).toArray();
                    console.log(`\nFirst 10 Documents:`);
                    allDocs.forEach((doc, idx) => {
                        console.log(`\n--- Document ${idx + 1} ---`);
                        if (collectionName === 'users') {
                            console.log({
                                _id: doc._id,
                                username: doc.username,
                                email: doc.email,
                                role: doc.role,
                                employeeId: doc.employeeId,
                                firstName: doc.firstName,
                                lastName: doc.lastName,
                                isActive: doc.isActive
                            });
                        } else if (collectionName === 'defects') {
                            console.log({
                                _id: doc._id,
                                defectId: doc.defectId,
                                defectType: doc.defectType,
                                severity: doc.severity,
                                status: doc.status,
                                assignedTo: doc.assignedTo,
                                inspection: doc.inspection
                            });
                        } else if (collectionName === 'inspections') {
                            console.log({
                                _id: doc._id,
                                inspectionId: doc.inspectionId,
                                inspectionType: doc.inspectionType,
                                status: doc.status,
                                priority: doc.priority,
                                healthScore: doc.healthScore
                            });
                        } else if (collectionName === 'maintenancetasks') {
                            console.log({
                                _id: doc._id,
                                taskId: doc.taskId,
                                title: doc.title,
                                status: doc.status,
                                priority: doc.priority,
                                assignedTo: doc.assignedTo,
                                defect: doc.defect
                            });
                        } else if (collectionName === 'panels') {
                            console.log({
                                _id: doc._id,
                                panelId: doc.panelId,
                                location: doc.location,
                                status: doc.status,
                                installationDate: doc.installationDate
                            });
                        } else {
                            console.log(doc);
                        }
                    });
                }
            }
            console.log('\n');
        }
        
        // Check for schema consistency issues
        console.log('\n=== SCHEMA CONSISTENCY CHECKS ===\n');
        
        // Check users collection
        const usersCollection = db.collection('users');
        const usersCount = await usersCollection.countDocuments();
        const usersWithoutEmployeeId = await usersCollection.countDocuments({ employeeId: { $exists: false } });
        const usersWithEmployeeId = await usersCollection.countDocuments({ employeeId: { $exists: true } });
        
        console.log('Users:');
        console.log(`  Total: ${usersCount}`);
        console.log(`  With employeeId: ${usersWithEmployeeId}`);
        console.log(`  Without employeeId: ${usersWithoutEmployeeId}`);
        
        // Sample employeeId formats
        const sampleUsers = await usersCollection.find({ employeeId: { $exists: true } }).limit(5).toArray();
        console.log('  Sample employeeId formats:');
        sampleUsers.forEach(u => {
            console.log(`    - ${u.employeeId} (${u.username})`);
        });
        
        // Check defects collection
        const defectsCollection = db.collection('defects');
        const defectsCount = await defectsCollection.countDocuments();
        const defectsWithId = await defectsCollection.countDocuments({ defectId: { $exists: true } });
        
        console.log('\nDefects:');
        console.log(`  Total: ${defectsCount}`);
        console.log(`  With defectId: ${defectsWithId}`);
        
        // Check inspections collection
        const inspectionsCollection = db.collection('inspections');
        const inspectionsCount = await inspectionsCollection.countDocuments();
        const inspectionsWithId = await inspectionsCollection.countDocuments({ inspectionId: { $exists: true } });
        
        console.log('\nInspections:');
        console.log(`  Total: ${inspectionsCount}`);
        console.log(`  With inspectionId: ${inspectionsWithId}`);
        
        // Check maintenance tasks collection
        const tasksCollection = db.collection('maintenancetasks');
        const tasksCount = await tasksCollection.countDocuments();
        const tasksWithId = await tasksCollection.countDocuments({ taskId: { $exists: true } });
        
        console.log('\nMaintenance Tasks:');
        console.log(`  Total: ${tasksCount}`);
        console.log(`  With taskId: ${tasksWithId}`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fetchAllData();
