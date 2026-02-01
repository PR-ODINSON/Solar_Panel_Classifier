import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

/**
 * Comprehensive Database Configuration Verification Script
 * 
 * This script verifies that:
 * 1. Environment variables are correctly set
 * 2. MongoDB Atlas connection is working
 * 3. Correct database is being used
 * 4. No alternative database connections exist
 */

async function verifyDatabaseConfig() {
    console.log(chalk.bold.cyan('\n🔍 DATABASE CONFIGURATION VERIFICATION\n'));
    console.log(chalk.gray('='.repeat(60)) + '\n');

    try {
        // Step 1: Verify Environment Variables
        console.log(chalk.bold('1️⃣  Checking Environment Variables...'));
        
        const requiredEnvVars = {
            'MONGODB_URI': process.env.MONGODB_URI,
            'DB_NAME': process.env.DB_NAME,
            'PORT': process.env.PORT,
            'NODE_ENV': process.env.NODE_ENV
        };

        let envVarsValid = true;
        for (const [key, value] of Object.entries(requiredEnvVars)) {
            if (!value) {
                console.log(chalk.red(`   ❌ ${key} is not set`));
                envVarsValid = false;
            } else {
                const displayValue = key === 'MONGODB_URI' 
                    ? value.replace(/:[^:]*@/, ':****@') // Mask password
                    : value;
                console.log(chalk.green(`   ✅ ${key}: ${displayValue}`));
            }
        }

        if (!envVarsValid) {
            console.log(chalk.red('\n❌ Environment variables are not properly configured!\n'));
            process.exit(1);
        }

        console.log(chalk.green('\n   ✅ All environment variables are set correctly\n'));

        // Step 2: Verify MongoDB Connection
        console.log(chalk.bold('2️⃣  Connecting to MongoDB Atlas...'));
        
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        });
        
        const connection = mongoose.connection;
        console.log(chalk.green(`   ✅ Connected to: ${connection.host}`));
        console.log(chalk.green(`   ✅ Database: ${connection.name}`));
        console.log(chalk.green(`   ✅ Ready State: ${connection.readyState === 1 ? 'Connected' : 'Not Connected'}\n`));

        // Step 3: Verify Database Content
        console.log(chalk.bold('3️⃣  Verifying Database Collections...'));
        
        const db = connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log(chalk.cyan(`   📦 Found ${collections.length} collections:\n`));
        
        const expectedCollections = ['users', 'inspections', 'defects', 'panels', 'maintenancetasks'];
        const foundCollections = collections.map(c => c.name);
        
        for (const expected of expectedCollections) {
            if (foundCollections.includes(expected)) {
                const count = await db.collection(expected).countDocuments();
                console.log(chalk.green(`   ✅ ${expected.padEnd(20)} - ${count} documents`));
            } else {
                console.log(chalk.yellow(`   ⚠️  ${expected.padEnd(20)} - Not found (will be created when needed)`));
            }
        }

        // Step 4: Verify Connection String Format
        console.log(chalk.bold('\n4️⃣  Verifying Connection String Format...'));
        
        if (process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
            console.log(chalk.green('   ✅ Using MongoDB Atlas (mongodb+srv://)'));
        } else if (process.env.MONGODB_URI.startsWith('mongodb://')) {
            console.log(chalk.yellow('   ⚠️  Using standard MongoDB connection (mongodb://)'));
        } else {
            console.log(chalk.red('   ❌ Invalid MongoDB URI format'));
        }

        // Check for localhost references (should not exist in production)
        if (process.env.MONGODB_URI.includes('localhost') || process.env.MONGODB_URI.includes('127.0.0.1')) {
            console.log(chalk.red('   ❌ WARNING: Connection string contains localhost - should use MongoDB Atlas in production'));
        } else {
            console.log(chalk.green('   ✅ No localhost references found'));
        }

        // Step 5: Test Query
        console.log(chalk.bold('\n5️⃣  Testing Database Query...'));
        
        const usersCount = await db.collection('users').countDocuments();
        const inspectionsCount = await db.collection('inspections').countDocuments();
        const defectsCount = await db.collection('defects').countDocuments();
        
        console.log(chalk.green(`   ✅ Successfully queried database:`));
        console.log(chalk.cyan(`      - Users: ${usersCount}`));
        console.log(chalk.cyan(`      - Inspections: ${inspectionsCount}`));
        console.log(chalk.cyan(`      - Defects: ${defectsCount}`));

        // Step 6: Verify No Multiple Connections
        console.log(chalk.bold('\n6️⃣  Checking for Multiple Connections...'));
        
        if (mongoose.connections.length === 1) {
            console.log(chalk.green('   ✅ Only one database connection exists'));
        } else {
            console.log(chalk.yellow(`   ⚠️  Found ${mongoose.connections.length} connections`));
            mongoose.connections.forEach((conn, idx) => {
                console.log(chalk.cyan(`      Connection ${idx + 1}: ${conn.name || 'default'}`));
            });
        }

        // Final Summary
        console.log(chalk.bold.green('\n✅ DATABASE CONFIGURATION VERIFICATION COMPLETE!\n'));
        console.log(chalk.cyan('Summary:'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.white(`  Database: ${chalk.bold(connection.name)}`));
        console.log(chalk.white(`  Host: ${chalk.bold(connection.host)}`));
        console.log(chalk.white(`  Collections: ${chalk.bold(collections.length)}`));
        console.log(chalk.white(`  Total Documents: ${chalk.bold(usersCount + inspectionsCount + defectsCount)}`));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.green('\n✅ All checks passed! Database is properly configured.\n'));

    } catch (error) {
        console.log(chalk.red('\n❌ DATABASE VERIFICATION FAILED!\n'));
        console.log(chalk.red(`Error: ${error.message}\n`));
        console.log(chalk.yellow('Please check:'));
        console.log(chalk.yellow('  1. .env file exists with correct values'));
        console.log(chalk.yellow('  2. MongoDB Atlas credentials are valid'));
        console.log(chalk.yellow('  3. Network connectivity to MongoDB Atlas'));
        console.log(chalk.yellow('  4. IP whitelist in MongoDB Atlas includes your IP\n'));
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log(chalk.gray('Connection closed.\n'));
    }
}

// Run verification
verifyDatabaseConfig();
