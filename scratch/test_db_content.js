import sequelize from '../backend/src/config/db.js';
import { Project } from '../backend/src/models/index.js';

const checkDb = async () => {
  try {
    await sequelize.authenticate();
    const projects = await Project.findAll();
    console.log('Seeded projects in DB:');
    projects.forEach(p => {
      console.log(`ID: ${p.id} | Title: ${p.title} | Category: ${p.category} | Image: ${p.image}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error querying DB:', error);
    process.exit(1);
  }
};

checkDb();
