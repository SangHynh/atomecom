import 'dotenv/config';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { BrandModel } from '../../infra/models/mongoose-brand.model.js';
import appConfig from '../../../../shared/configs/app.config.js';

const SEED_COUNT = 40;

async function seed() {
  try {
    const uri = process.env.DB_URI || appConfig?.db?.uri;
    if (!uri) {
      throw new Error('DB_URI is not defined in environment variables');
    }

    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected successfully.');

    // Clear existing brands if needed (optional, uncomment if you want a clean start)
    // console.log('Cleaning existing brands...');
    // await BrandModel.deleteMany({});

    console.log(`Generating ${SEED_COUNT} random brands...`);
    const brands = Array.from({ length: SEED_COUNT }).map(() => {
      const name = faker.company.name();
      return {
        name: name,
        slug: name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        logo: faker.image.url({ width: 200, height: 200 }),
        description: faker.company.catchPhrase(),
        version: 1,
      };
    });

    console.log('Inserting into database...');
    await BrandModel.insertMany(brands);

    console.log('Seed completed successfully! 🌱');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  }
}

seed();
