import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function updateAdmissionTerms() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const database = client.db('plp_database');
    const admissions = database.collection('admissions');

    // First, let's see what documents we have
    console.log('\nExisting documents:');
    const allDocs = await admissions.find({}).toArray();
    console.log(JSON.stringify(allDocs, null, 2));

    // Find all documents where term is a string
    const cursor = admissions.find({
      term: { $type: 'string' }
    });

    let updateCount = 0;
    for await (const doc of cursor) {
      // Extract number from string (e.g., "제25" -> 25)
      const termNumber = parseInt(doc.term.replace(/[^0-9]/g, ''));
      
      if (!isNaN(termNumber)) {
        const result = await admissions.updateOne(
          { _id: doc._id },
          { $set: { term: termNumber } }
        );
        
        if (result.modifiedCount > 0) {
          updateCount++;
          console.log(`Updated term for document ${doc._id}: ${doc.term} -> ${termNumber}`);
        }
      }
    }

    console.log(`\nMigration completed. Updated ${updateCount} documents.`);

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

// Run the migration
updateAdmissionTerms(); 