// Adjust the relative path based on where your .ts file is located
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});
export const prisma = new PrismaClient({ adapter });
//# sourceMappingURL=db.js.map