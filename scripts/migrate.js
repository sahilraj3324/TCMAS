const { getConnection, closeConnection } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting database migration...\n');
  
  try {
    const pool = await getConnection();
    
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '../migrations/001_create_tables.sql');
    const sqlScript = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by GO statements (MS SQL batch separator)
    const batches = sqlScript.split(/^\s*GO\s*$/im).filter(batch => batch.trim());
    
    console.log(`📝 Found ${batches.length} SQL batches to execute\n`);
    
    // Execute each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch) {
        try {
          await pool.request().query(batch);
          console.log(`✅ Batch ${i + 1}/${batches.length} executed`);
        } catch (error) {
          console.error(`❌ Error in batch ${i + 1}:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('\n🎉 Migration completed successfully!\n');
    
    // Verify tables were created
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_CATALOG = DB_NAME()
        AND TABLE_NAME IN ('users', 'patientdetails', 'doctordetails', 'appointments', 'prescriptions', 'medicalrecords', 'notifications')
      ORDER BY TABLE_NAME
    `);
    
    console.log('📊 Created tables:');
    result.recordset.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.TABLE_NAME}`);
    });
    console.log('\n');
    
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    await closeConnection();
    process.exit(1);
  }
}

runMigration();

