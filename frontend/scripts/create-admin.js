#!/usr/bin/env node

const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'puddingmeetup';

async function createAdminUser() {
  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI environment variable is required');
    console.log('Please set MONGODB_URI in your .env.local file');
    process.exit(1);
  }

  let client;
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(MONGODB_DB);
    const usersCollection = db.collection('users');

    // Admin user details
    const adminEmail = 'notviqa@gmail.com';
    const adminName = 'viqa';
    const adminPassword = 'SecureAdminPass123!'; // You can change this
    const role = 'admin';

    console.log('👤 Creating admin user...');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Role: ${role}`);

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Updating existing admin user...');
      
      // Hash the password
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      // Update existing admin user
      await usersCollection.updateOne(
        { email: adminEmail },
        {
          $set: {
            name: adminName,
            passwordHash: passwordHash,
            role: role,
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Admin user updated successfully!');
    } else {
      // Hash the password
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      // Create new admin user
      const result = await usersCollection.insertOne({
        name: adminName,
        email: adminEmail,
        passwordHash: passwordHash,
        role: role,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Admin user created successfully!');
      console.log(`   User ID: ${result.insertedId}`);
    }

    // Display login credentials
    console.log('\n📋 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🔐 Save these credentials securely!');
    console.log('   You can now login to the admin dashboard with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
createAdminUser().catch(console.error);
