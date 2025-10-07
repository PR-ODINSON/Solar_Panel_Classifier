import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Panel from '../models/Panel.js';
import Inspection from '../models/Inspection.js';
import Defect from '../models/Defect.js';
import MaintenanceTask from '../models/MaintenanceTask.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Connect to database
        await connectDB();
        
        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🧹 Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Panel.deleteMany({}),
            Inspection.deleteMany({}),
            Defect.deleteMany({}),
            MaintenanceTask.deleteMany({})
        ]);
        
        // Create admin user
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
        console.log('✅ Admin user created:', adminUser.username);
        
        // Create maintenance staff users
        console.log('👥 Creating maintenance staff...');
        const maintenanceUsers = [
            {
                username: 'maintenance',
                email: 'maintenance@solarpanel.com',
                password: 'maintenance123',
                firstName: 'John',
                lastName: 'Technician',
                role: 'maintenance_staff',
                phone: '+919876543211',
                department: 'Field Operations',
                employeeId: 'EMP002'
            },
            {
                username: 'sarah.wilson',
                email: 'sarah.wilson@solarpanel.com',
                password: 'password123',
                firstName: 'Sarah',
                lastName: 'Wilson',
                role: 'maintenance_staff',
                phone: '+919876543212',
                department: 'Field Operations',
                employeeId: 'EMP003'
            },
            {
                username: 'mike.johnson',
                email: 'mike.johnson@solarpanel.com',
                password: 'password123',
                firstName: 'Mike',
                lastName: 'Johnson',
                role: 'maintenance_staff',
                phone: '+919876543213',
                department: 'Field Operations',
                employeeId: 'EMP004'
            }
        ];
        
        const createdMaintenanceUsers = [];
        for (const userData of maintenanceUsers) {
            const user = new User(userData);
            await user.save();
            createdMaintenanceUsers.push(user);
            console.log('✅ Maintenance user created:', user.username);
        }
        
        // Create solar panels
        console.log('☀️ Creating solar panels...');
        const panels = [
            {
                panelId: 'SP001',
                serialNumber: 'SN123456789',
                manufacturer: 'SolarTech Industries',
                model: 'ST-400W-MONO',
                wattage: 400,
                voltage: 24,
                current: 16.67,
                efficiency: 21.5,
                location: {
                    coordinates: {
                        latitude: 37.7749,
                        longitude: -122.4194
                    },
                    address: '123 Solar Farm Road, San Francisco, CA',
                    site: 'Site A',
                    zone: 'Zone 1',
                    row: 'Row 1',
                    position: 'Position 1'
                },
                installationDate: new Date('2023-01-15'),
                warrantyExpiry: new Date('2033-01-15'),
                status: 'active',
                healthScore: 95,
                assignedTechnician: createdMaintenanceUsers[0]._id
            },
            {
                panelId: 'SP002',
                serialNumber: 'SN123456790',
                manufacturer: 'SolarTech Industries',
                model: 'ST-400W-MONO',
                wattage: 400,
                voltage: 24,
                current: 16.67,
                efficiency: 21.5,
                location: {
                    coordinates: {
                        latitude: 37.7750,
                        longitude: -122.4195
                    },
                    address: '123 Solar Farm Road, San Francisco, CA',
                    site: 'Site A',
                    zone: 'Zone 1',
                    row: 'Row 1',
                    position: 'Position 2'
                },
                installationDate: new Date('2023-01-15'),
                warrantyExpiry: new Date('2033-01-15'),
                status: 'active',
                healthScore: 88,
                assignedTechnician: createdMaintenanceUsers[1]._id
            },
            {
                panelId: 'SP003',
                serialNumber: 'SN123456791',
                manufacturer: 'GreenPower Systems',
                model: 'GP-450W-POLY',
                wattage: 450,
                voltage: 24,
                current: 18.75,
                efficiency: 20.2,
                location: {
                    coordinates: {
                        latitude: 37.7751,
                        longitude: -122.4196
                    },
                    address: '123 Solar Farm Road, San Francisco, CA',
                    site: 'Site B',
                    zone: 'Zone 2',
                    row: 'Row 1',
                    position: 'Position 1'
                },
                installationDate: new Date('2023-02-20'),
                warrantyExpiry: new Date('2033-02-20'),
                status: 'maintenance',
                healthScore: 72,
                assignedTechnician: createdMaintenanceUsers[2]._id
            }
        ];
        
        const createdPanels = [];
        for (const panelData of panels) {
            const panel = new Panel(panelData);
            await panel.save();
            createdPanels.push(panel);
            console.log('✅ Panel created:', panel.panelId);
        }
        
        // Create inspections
        console.log('🔍 Creating inspections...');
        const inspections = [
            {
                inspectionId: 'INS000001',
                panel: createdPanels[0]._id,
                inspector: createdMaintenanceUsers[0]._id,
                inspectionDate: new Date('2024-09-15'),
                inspectionType: 'routine',
                status: 'completed',
                priority: 'medium',
                visualInspection: {
                    overallCondition: 'good',
                    cleanliness: 'clean',
                    physicalDamage: {
                        cracks: { present: false },
                        chips: { present: false },
                        delamination: { present: false },
                        corrosion: { present: false },
                        discoloration: { present: false }
                    },
                    connections: {
                        condition: 'good',
                        tightness: 'tight',
                        corrosion: false
                    },
                    mounting: {
                        condition: 'excellent',
                        stability: 'stable'
                    }
                },
                overallRating: 'good',
                healthScore: 95,
                nextInspectionDate: new Date('2025-03-15'),
                completedAt: new Date('2024-09-15')
            },
            {
                inspectionId: 'INS000002',
                panel: createdPanels[1]._id,
                inspector: createdMaintenanceUsers[1]._id,
                inspectionDate: new Date('2024-09-20'),
                inspectionType: 'routine',
                status: 'completed',
                priority: 'medium',
                visualInspection: {
                    overallCondition: 'fair',
                    cleanliness: 'slightly_dirty',
                    physicalDamage: {
                        cracks: { present: true, severity: 'minor', location: 'Corner cell', count: 1 },
                        chips: { present: false },
                        delamination: { present: false },
                        corrosion: { present: false },
                        discoloration: { present: false }
                    },
                    connections: {
                        condition: 'good',
                        tightness: 'tight',
                        corrosion: false
                    },
                    mounting: {
                        condition: 'good',
                        stability: 'stable'
                    }
                },
                findings: [{
                    category: 'visual',
                    description: 'Minor crack detected in corner cell',
                    severity: 'medium',
                    recommendation: 'Monitor crack progression, consider repair if it expands'
                }],
                overallRating: 'fair',
                healthScore: 88,
                nextInspectionDate: new Date('2025-01-20'),
                completedAt: new Date('2024-09-20')
            }
        ];
        
        const createdInspections = [];
        for (const inspectionData of inspections) {
            const inspection = new Inspection(inspectionData);
            await inspection.save();
            createdInspections.push(inspection);
            console.log('✅ Inspection created:', inspection.inspectionId);
        }
        
        // Create defects
        console.log('⚠️ Creating defects...');
        const defects = [
            {
                defectId: 'DEF000001',
                panel: createdPanels[1]._id,
                inspection: createdInspections[1]._id,
                reportedBy: createdMaintenanceUsers[1]._id,
                assignedTo: createdMaintenanceUsers[2]._id,
                detectedDate: new Date('2024-09-20'),
                defectType: 'crack',
                severity: 'medium',
                status: 'open',
                priority: 'medium',
                location: {
                    description: 'Corner cell of the panel',
                    coordinates: { x: 10, y: 15, width: 5, height: 2 }
                },
                description: 'Minor crack detected in the corner photovoltaic cell during routine inspection',
                symptoms: ['Slight reduction in power output', 'Visible hairline crack'],
                impact: {
                    powerLoss: 5,
                    efficiencyReduction: 3,
                    estimatedCost: 150,
                    safetyRisk: 'low'
                },
                detectionMethod: 'visual_inspection'
            },
            {
                defectId: 'DEF000002',
                panel: createdPanels[2]._id,
                reportedBy: createdMaintenanceUsers[2]._id,
                assignedTo: createdMaintenanceUsers[0]._id,
                detectedDate: new Date('2024-09-25'),
                defectType: 'soiling',
                severity: 'low',
                status: 'resolved',
                priority: 'low',
                location: {
                    description: 'Entire panel surface',
                    coordinates: { x: 0, y: 0, width: 100, height: 100 }
                },
                description: 'Heavy dust and debris accumulation on panel surface',
                symptoms: ['Reduced power output', 'Visible dirt layer'],
                impact: {
                    powerLoss: 15,
                    efficiencyReduction: 12,
                    estimatedCost: 50,
                    safetyRisk: 'none'
                },
                detectionMethod: 'visual_inspection',
                resolution: {
                    method: 'cleaning',
                    description: 'Panel surface cleaned with deionized water and soft brush',
                    cost: 45,
                    timeSpent: 30,
                    resolvedDate: new Date('2024-09-26'),
                    resolvedBy: createdMaintenanceUsers[0]._id
                }
            }
        ];
        
        const createdDefects = [];
        for (const defectData of defects) {
            const defect = new Defect(defectData);
            await defect.save();
            createdDefects.push(defect);
            console.log('✅ Defect created:', defect.defectId);
        }
        
        // Create maintenance tasks
        console.log('🔧 Creating maintenance tasks...');
        const maintenanceTasks = [
            {
                taskId: 'MT000001',
                title: 'Quarterly Panel Cleaning - Site A',
                description: 'Perform routine cleaning of all panels in Site A, Zone 1',
                type: 'preventive',
                category: 'cleaning',
                priority: 'medium',
                status: 'assigned',
                panels: [createdPanels[0]._id, createdPanels[1]._id],
                createdBy: adminUser._id,
                assignedTo: createdMaintenanceUsers[0]._id,
                scheduledDate: new Date('2024-10-15'),
                dueDate: new Date('2024-10-20'),
                estimatedDuration: 120,
                location: {
                    site: 'Site A',
                    zone: 'Zone 1',
                    specificLocation: 'Rows 1-5'
                },
                requiredSkills: ['cleaning', 'safety'],
                requiredTools: [
                    { name: 'Soft brush', quantity: 2 },
                    { name: 'Deionized water tank', quantity: 1 },
                    { name: 'Safety harness', quantity: 1 }
                ]
            },
            {
                taskId: 'MT000002',
                title: 'Crack Repair - Panel SP002',
                description: 'Repair minor crack in corner cell of panel SP002',
                type: 'corrective',
                category: 'repair',
                priority: 'high',
                status: 'pending',
                panel: createdPanels[1]._id,
                relatedDefect: createdDefects[0]._id,
                createdBy: createdMaintenanceUsers[1]._id,
                assignedTo: createdMaintenanceUsers[2]._id,
                scheduledDate: new Date('2024-10-10'),
                dueDate: new Date('2024-10-12'),
                estimatedDuration: 180,
                location: {
                    site: 'Site A',
                    zone: 'Zone 1',
                    specificLocation: 'Row 1, Position 2'
                },
                requiredSkills: ['electrical', 'repair'],
                requiredParts: [
                    { name: 'Cell replacement kit', quantity: 1, estimatedCost: 75 },
                    { name: 'Sealant', quantity: 1, estimatedCost: 25 }
                ]
            }
        ];
        
        for (const taskData of maintenanceTasks) {
            const task = new MaintenanceTask(taskData);
            await task.save();
            console.log('✅ Maintenance task created:', task.taskId);
        }
        
        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`👤 Users: ${await User.countDocuments()}`);
        console.log(`☀️ Panels: ${await Panel.countDocuments()}`);
        console.log(`🔍 Inspections: ${await Inspection.countDocuments()}`);
        console.log(`⚠️ Defects: ${await Defect.countDocuments()}`);
        console.log(`🔧 Maintenance Tasks: ${await MaintenanceTask.countDocuments()}`);
        
        console.log('\n🔑 Login Credentials:');
        console.log('Admin: username="admin", password="admin123"');
        console.log('Maintenance: username="maintenance", password="maintenance123"');
        console.log('Additional users: sarah.wilson, mike.johnson (password="password123")');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeding function
seedDatabase();
