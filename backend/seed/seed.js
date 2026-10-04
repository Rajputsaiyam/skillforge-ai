/**
 * Seed script: run with `npm run seed` (from backend/) after starting local MongoDB.
 * Seeds: skill taxonomy, mock jobs, and a demo admin + demo user account.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Skill = require('../models/Skill');
const Job = require('../models/Job');
const User = require('../models/User');
const { skillsTaxonomy, roleRequirements } = require('../data/skillsTaxonomy');
const mockJobs = require('../data/mockJobs');

const buildRequiredForRoles = (skillName) => {
  const roles = [];
  Object.entries(roleRequirements).forEach(([role, reqs]) => {
    const match = reqs.find((r) => r.skill === skillName);
    if (match) roles.push({ role, requiredLevel: match.requiredLevel, priority: match.priority });
  });
  return roles;
};

const run = async () => {
  await connectDB();

  console.log('Seeding skills...');
  await Skill.deleteMany({});
  const skillDocs = skillsTaxonomy.map((s) => ({ ...s, requiredForRoles: buildRequiredForRoles(s.name) }));
  await Skill.insertMany(skillDocs);
  console.log(`  -> ${skillDocs.length} skills inserted`);

  console.log('Seeding mock jobs...');
  await Job.deleteMany({ source: 'mock' });
  await Job.insertMany(mockJobs);
  console.log(`  -> ${mockJobs.length} mock jobs inserted`);

  console.log('Seeding demo accounts...');
  const adminExists = await User.findOne({ email: 'admin@skillgraph.ai' });
  if (!adminExists) {
    await User.create({
      fullName: 'Platform Admin',
      email: 'admin@skillgraph.ai',
      password: 'Admin@12345',
      role: 'admin',
    });
    console.log('  -> Admin created: admin@skillgraph.ai / Admin@12345');
  }

  const demoExists = await User.findOne({ email: 'demo@skillgraph.ai' });
  if (!demoExists) {
    await User.create({
      fullName: 'Aditi Sharma',
      email: 'demo@skillgraph.ai',
      password: 'Demo@12345',
      role: 'user',
      targetRole: 'Full Stack Developer',
      location: 'Delhi, India',
    });
    console.log('  -> Demo user created: demo@skillgraph.ai / Demo@12345');
  }

  console.log('Seeding complete.');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
