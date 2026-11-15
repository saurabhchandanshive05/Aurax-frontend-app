// Test MongoDB Database Connection for influencer_copy
const mongoose = require("mongoose");

const MONGODB_URI =
  "mongodb+srv://<USER>:<PASSWORD>@<CLUSTER_HOST>/<DB_NAME>";

async function testDatabaseConnection() {
  console.log("🔍 Testing MongoDB Connection to influencer_copy database...");
  console.log("🎯 Target:", MONGODB_URI.replace(/:[^@]*@/, ":****@"));

  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: "majority",
    });

    console.log("✅ Successfully connected to influencer_copy database!");

    // Test database operations
    console.log("\n📊 Testing database operations...");

    // List collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`📂 Collections found: ${collections.length}`);
    collections.forEach((col) => {
      console.log(`  - ${col.name}`);
    });

    // Create a simple test schema
    const TestSchema = new mongoose.Schema({
      name: String,
      type: { type: String, default: "test" },
      createdAt: { type: Date, default: Date.now },
    });

    const TestModel = mongoose.model("Test", TestSchema);

    // Insert test document
    const testDoc = new TestModel({
      name: "Copy Environment Test",
      type: "api_connectivity_test",
    });

    const saved = await testDoc.save();
    console.log(`✅ Test document created with ID: ${saved._id}`);

    // Read test document
    const found = await TestModel.findById(saved._id);
    console.log(`✅ Test document retrieved: ${found.name}`);

    // Count documents in test collection
    const count = await TestModel.countDocuments();
    console.log(`📊 Total test documents: ${count}`);

    // Clean up test document
    await TestModel.findByIdAndDelete(saved._id);
    console.log("🧹 Test document cleaned up");

    console.log("\n🎯 Database Connection Test: SUCCESS");
    console.log("🛡️ All operations performed on influencer_copy database only");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    if (error.name === "MongooseServerSelectionError") {
      console.error("💡 Possible solutions:");
      console.error("  - Check if IP address is whitelisted in MongoDB Atlas");
      console.error("  - Verify database credentials");
      console.error("  - Check network connectivity");
    }
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Database connection closed");
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
