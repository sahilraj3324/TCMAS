const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Sahil@2580',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'medical_management',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

async function runMigration() {
    let pool;
    try {
        console.log('🔗 Connecting to database...');
        pool = await sql.connect(config);
        console.log('✅ Connected to database\n');

        // Read migration file
        const migrationPath = path.join(__dirname, '..', 'migrations', '003_update_all_tables.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📄 Running migration from: 003_update_all_tables.sql\n');
        console.log('━'.repeat(60));

        // Split by GO statements and execute each batch
        const batches = migrationSQL
            .split(/\nGO\s*\n/gi)
            .filter(batch => batch.trim().length > 0);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i].trim();
            if (batch) {
                try {
                    // Execute batch
                    await pool.request().batch(batch);
                } catch (err) {
                    // Some errors are expected (like trying to drop non-existent tables)
                    if (!err.message.includes('does not exist') && 
                        !err.message.includes('Cannot drop')) {
                        console.error(`⚠️  Error in batch ${i + 1}:`, err.message);
                    }
                }
            }
        }

        console.log('━'.repeat(60));
        console.log('\n✅ Migration completed!\n');

        // Verify tables
        await verifyTables(pool);

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

async function verifyTables(pool) {
    console.log('🔍 Verifying tables...\n');

    const expectedTables = [
        'users',
        'patientdetails',
        'doctordetails',
        'appointments',
        'prescriptions',
        'medicalrecords',
        'notifications',
        'receptionist'
    ];

    try {
        // Check if tables exist
        const result = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);

        const existingTables = result.recordset.map(row => row.TABLE_NAME.toLowerCase());
        
        console.log('📊 Database Tables Status:');
        console.log('━'.repeat(60));

        let allTablesExist = true;
        for (const table of expectedTables) {
            const exists = existingTables.includes(table.toLowerCase());
            const status = exists ? '✅' : '❌';
            console.log(`${status} ${table.padEnd(20)} ${exists ? 'EXISTS' : 'MISSING'}`);
            if (!exists) allTablesExist = false;
        }

        console.log('━'.repeat(60));

        if (allTablesExist) {
            console.log('\n✅ All required tables exist!\n');
        } else {
            console.log('\n⚠️  Some tables are missing!\n');
        }

        // Get column counts for each table
        console.log('📋 Table Schemas:');
        console.log('━'.repeat(60));

        for (const table of expectedTables) {
            if (existingTables.includes(table.toLowerCase())) {
                try {
                    const columnResult = await pool.request().query(`
                        SELECT COUNT(*) as column_count
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_NAME = '${table}'
                    `);

                    const rowResult = await pool.request().query(`
                        SELECT COUNT(*) as row_count FROM ${table}
                    `);

                    const columnCount = columnResult.recordset[0].column_count;
                    const rowCount = rowResult.recordset[0].row_count;

                    console.log(`   ${table.padEnd(20)} │ ${columnCount} columns │ ${rowCount} rows`);
                } catch (err) {
                    console.log(`   ${table.padEnd(20)} │ Error: ${err.message}`);
                }
            }
        }

        console.log('━'.repeat(60));

        // Check indexes
        console.log('\n📊 Checking Indexes:');
        console.log('━'.repeat(60));

        const indexResult = await pool.request().query(`
            SELECT 
                t.name AS table_name,
                i.name AS index_name,
                i.type_desc AS index_type
            FROM sys.indexes i
            INNER JOIN sys.tables t ON i.object_id = t.object_id
            WHERE i.name IS NOT NULL
            AND t.name IN (${expectedTables.map(t => `'${t}'`).join(',')})
            ORDER BY t.name, i.name
        `);

        let currentTable = '';
        indexResult.recordset.forEach(row => {
            if (row.table_name !== currentTable) {
                if (currentTable) console.log('');
                currentTable = row.table_name;
                console.log(`   ${row.table_name}:`);
            }
            console.log(`      ├─ ${row.index_name} (${row.index_type})`);
        });

        console.log('━'.repeat(60));

        // Check foreign keys
        console.log('\n🔗 Checking Foreign Keys:');
        console.log('━'.repeat(60));

        const fkResult = await pool.request().query(`
            SELECT 
                OBJECT_NAME(f.parent_object_id) AS table_name,
                f.name AS foreign_key_name,
                OBJECT_NAME(f.referenced_object_id) AS referenced_table
            FROM sys.foreign_keys f
            INNER JOIN sys.tables t ON f.parent_object_id = t.object_id
            WHERE t.name IN (${expectedTables.map(t => `'${t}'`).join(',')})
            ORDER BY table_name
        `);

        currentTable = '';
        fkResult.recordset.forEach(row => {
            if (row.table_name !== currentTable) {
                if (currentTable) console.log('');
                currentTable = row.table_name;
                console.log(`   ${row.table_name}:`);
            }
            console.log(`      ├─ ${row.foreign_key_name} → ${row.referenced_table}`);
        });

        console.log('━'.repeat(60));
        console.log('\n✅ Verification complete!\n');

    } catch (err) {
        console.error('❌ Verification failed:', err.message);
    }
}

// Run migration
console.log('🚀 Starting Database Migration\n');
runMigration().then(() => {
    console.log('🎉 Migration process completed successfully!');
    process.exit(0);
}).catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});

