const { sequelize } = require('../models');
const { seedExamples } = require('./exampleSeeds');

async function runSeeds() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        await sequelize.sync({ alter: true });
        console.log('✅ Models synced.');

        await seedExamples();

        console.log('🎉 All seeds completed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

runSeeds();
