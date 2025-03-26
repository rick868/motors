const { db } = require("../server/db");

async function addPhoneColumn() {
  await db.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(255);"); // Add phone column to users table
  console.log("Phone column added to users table.");
}

addPhoneColumn().catch(err => console.error(err));
