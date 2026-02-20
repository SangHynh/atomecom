import 'dotenv/config';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { UserModel } from '../../infra/mongoose-user.model.js';
import { USER_ROLE, USER_STATUS } from '@atomecom/shared';
import appConfig from '../../../../shared/configs/app.config.js';

const SEED_COUNT = 10;

async function seed() {
  try {
    const uri = process.env.DB_URI || appConfig?.db?.uri;
    if (!uri) {
      throw new Error('DB_URI is not defined in environment variables');
    }

    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected successfully.');

    console.log(`Generating ${SEED_COUNT} random users...`);
    const users = Array.from({ length: SEED_COUNT }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number({ style: 'national' }),
      password: 'Password123!', // Standard test password
      role: USER_ROLE.USER,
      status: USER_STATUS.ACTIVE,
      isVerified: faker.datatype.boolean(0.8),
      avatar: faker.image.avatar(),
      lastLoginAt: faker.date.recent(),
    }));

    console.log('Inserting into database...');
    await UserModel.insertMany(users);

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
