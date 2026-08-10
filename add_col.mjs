import { query } from './src/lib/db.js';

async function addSubcategory() {
  try {
    console.log('Adding subcategory column...');
    await query('ALTER TABLE posts ADD COLUMN subcategory VARCHAR(255) DEFAULT NULL');
    console.log('Column added successfully.');
  } catch (err) {
    if (err.message.includes('Duplicate column')) {
      console.log('Column already exists.');
    } else {
      console.error('Error adding column:', err);
    }
  }
  process.exit(0);
}

addSubcategory();
