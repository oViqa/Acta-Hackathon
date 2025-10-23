const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://viqa:9yuQD7+whdr.jAJ@cluster1.pkozzjn.mongodb.net/puddingmeetup?retryWrites=true&w=majority&appName=Cluster1&ssl=true&tlsAllowInvalidCertificates=false&tlsAllowInvalidHostnames=false';
  
  console.log('Testing MongoDB connection...');
  console.log('URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in output
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test a simple operation
    const db = client.db('puddingmeetup');
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('🔌 Connection closed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();

