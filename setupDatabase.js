import { Client, Databases } from 'appwrite';

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') 
  .setProject('67bc33460027a4b1ecac'); 

const database = new Databases(client);

const DATABASE_ID = 'your_database_id'; // Replace with your actual database ID

async function createCompanyCollection() {
  try {
    // Step 1: Create Collection
    const collection = await database.createCollection(DATABASE_ID, 'companies', 'Companies');

    // Step 2: Add Fields
    await database.createStringAttribute(DATABASE_ID, collection.$id, 'companyName', 255, true);
    await database.createStringAttribute(DATABASE_ID, collection.$id, 'industry', 255, true);
    await database.createIntegerAttribute(DATABASE_ID, collection.$id, 'size', true);
    await database.createStringAttribute(DATABASE_ID, collection.$id, 'website', 255, false);
    await database.createStringAttribute(DATABASE_ID, collection.$id, 'description', 1000, false);
    await database.createStringAttribute(DATABASE_ID, collection.$id, 'contactPerson', 255, true);
    await database.createStringAttribute(DATABASE_ID, collection.$id, 'location', 255, true);
    await database.createStringAttribute(DATABASE_ID, collection.$id, 'socialLinks', 1000, false);

    console.log('✅ Companies collection created successfully!');
  } catch (error) {
    console.error('❌ Error creating companies collection:', error);
  }
}

createCompanyCollection();
