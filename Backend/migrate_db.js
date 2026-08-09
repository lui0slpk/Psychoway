import { execute } from "./src/config/database.js";

async function runMigration() {
  try {
    console.log("Applying DB schema changes to remove contact fields...");
    await execute(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS landline_number VARCHAR(20) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS training_program VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS ficha_number VARCHAR(50) DEFAULT NULL;

      ALTER TABLE users
      DROP COLUMN IF EXISTS contact1_name,
      DROP COLUMN IF EXISTS contact1_doc_type,
      DROP COLUMN IF EXISTS contact1_document,
      DROP COLUMN IF EXISTS contact1_phone,
      DROP COLUMN IF EXISTS contact2_name,
      DROP COLUMN IF EXISTS contact2_doc_type,
      DROP COLUMN IF EXISTS contact2_document,
      DROP COLUMN IF EXISTS contact2_phone,
      DROP COLUMN IF EXISTS contact_person_name,
      DROP COLUMN IF EXISTS contact_person_document,
      DROP COLUMN IF EXISTS contact_person_phone;
    `);
    console.log("Migration rollback/cleanup successful.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

runMigration();
