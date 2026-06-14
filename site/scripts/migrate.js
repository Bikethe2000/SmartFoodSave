// Migration Script: data.json to Firestore
// Location: site/scripts/migrate.js
// Usage: node --experimental-modules migrate.js

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin
let db = null;

async function initializeFirebase() {
  try {
    // Try to load from service account file
    const serviceAccountPath = path.join(process.cwd(), '../server/serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✓ Firebase initialized from serviceAccountKey.json');
    } else {
      // Try environment variables
      if (!process.env.FIREBASE_PROJECT_ID) {
        throw new Error('Firebase credentials not found. Please provide serviceAccountKey.json or set environment variables.');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('✓ Firebase initialized from environment variables');
    }
    
    db = admin.firestore();
    return true;
  } catch (error) {
    console.error('✗ Failed to initialize Firebase:', error.message);
    return false;
  }
}

async function loadOldData() {
  try {
    const dataPath = path.join(process.cwd(), '../server/data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log('✓ Loaded old data from data.json');
    return data;
  } catch (error) {
    console.error('✗ Failed to load old data:', error.message);
    return null;
  }
}

async function migrateData(oldData, userId) {
  let successCount = 0;
  let failureCount = 0;

  if (!oldData) {
    console.log('No data to migrate');
    return;
  }

  console.log('\n📊 Starting migration...\n');

  // Migrate predictions
  if (oldData.predictions && Array.isArray(oldData.predictions)) {
    console.log(`Migrating ${oldData.predictions.length} predictions...`);
    for (const pred of oldData.predictions) {
      try {
        await db.collection('predictions').add({
          userId,
          date: pred.date,
          menuItems: pred.menuItems || [],
          predictedWasteKg: pred.predictedWasteKg || 0,
          riskLevel: pred.riskLevel || 'Medium',
          confidence: pred.confidence || 0.5,
          explanation: pred.explanation || '',
          createdAt: new Date()
        });
        successCount++;
      } catch (error) {
        console.error(`  Failed to migrate prediction ${pred.id}:`, error.message);
        failureCount++;
      }
    }
    console.log(`  ✓ Migrated ${successCount} predictions\n`);
  }

  // Migrate recommendations
  if (oldData.recommendations && Array.isArray(oldData.recommendations)) {
    console.log(`Migrating ${oldData.recommendations.length} recommendations...`);
    for (const rec of oldData.recommendations) {
      try {
        await db.collection('recommendations').add({
          userId,
          title: rec.title || '',
          description: rec.description || '',
          suggestedChange: rec.suggestedChange || '',
          impactKg: rec.impactKg || 0,
          confidence: rec.confidence || 0.5,
          status: rec.status || 'pending',
          createdAt: new Date()
        });
        successCount++;
      } catch (error) {
        console.error(`  Failed to migrate recommendation ${rec.id}:`, error.message);
        failureCount++;
      }
    }
    console.log(`  ✓ Migrated ${successCount} recommendations\n`);
  }

  // Migrate daily logs
  if (oldData.dailyLogs && Array.isArray(oldData.dailyLogs)) {
    console.log(`Migrating ${oldData.dailyLogs.length} daily logs...`);
    for (const log of oldData.dailyLogs) {
      try {
        await db.collection('dailyLogs').add({
          userId,
          date: log.date,
          menuItems: log.menuItems || [],
          prepared: log.prepared || 0,
          served: log.served || 0,
          leftovers: log.leftovers || 0,
          createdAt: new Date()
        });
        successCount++;
      } catch (error) {
        console.error(`  Failed to migrate log ${log.id}:`, error.message);
        failureCount++;
      }
    }
    console.log(`  ✓ Migrated ${successCount} daily logs\n`);
  }

  console.log(`\n✨ Migration complete!`);
  console.log(`  Total successful: ${successCount}`);
  console.log(`  Total failed: ${failureCount}`);
}

async function main() {
  console.log('🚀 Firebase Data Migration Tool\n');

  // Initialize Firebase
  const initialized = await initializeFirebase();
  if (!initialized) {
    process.exit(1);
  }

  // Load old data
  const oldData = await loadOldData();
  if (!oldData) {
    console.log('No data.json file found. Nothing to migrate.');
    process.exit(0);
  }

  // Get userId for migration (you can modify this)
  const userId = process.argv[2] || 'admin-user-' + Date.now();
  console.log(`Migrating data for userId: ${userId}\n`);

  // Perform migration
  await migrateData(oldData, userId);

  // Cleanup
  await admin.app().delete();
  console.log('\n✓ Done! Connection closed.');
}

// Run migration
main().catch((error) => {
  console.error('✗ Migration failed:', error);
  process.exit(1);
});
