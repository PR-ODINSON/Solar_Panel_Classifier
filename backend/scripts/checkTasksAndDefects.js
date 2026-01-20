import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import MaintenanceTask from '../models/MaintenanceTask.js';
import Defect from '../models/Defect.js';
import User from '../models/User.js';

dotenv.config();

const checkData = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        
        console.log('\n📋 Database Contents:\n');
        
        const tasks = await MaintenanceTask.find({}).select('_id taskId title assignedTo').populate('assignedTo', 'email');
        const defects = await Defect.find({}).select('_id defectId defectType assignedTo').populate('assignedTo', 'email');
        
        console.log(`✅ Maintenance Tasks: ${tasks.length}`);
        if (tasks.length > 0) {
            tasks.forEach(t => console.log(`  - ${t.taskId}: ${t.title} (ID: ${t._id}, Assigned: ${t.assignedTo?.email || 'None'})`));
        }
        
        console.log(`\n🔧 Defects: ${defects.length}`);
        if (defects.length > 0) {
            defects.forEach(d => console.log(`  - ${d.defectId}: ${d.defectType} (ID: ${d._id}, Assigned: ${d.assignedTo?.email || 'None'})`));
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkData();
