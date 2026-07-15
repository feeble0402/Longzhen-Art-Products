import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !displayName || !password || password.length < 12) {
    throw new Error(
      '請設定 ADMIN_EMAIL、ADMIN_DISPLAY_NAME 與至少 12 字元的 ADMIN_PASSWORD',
    );
  }

  const prisma = new PrismaService();
  await prisma.$connect();
  try {
    const admin = await prisma.admin.create({
      data: {
        email,
        displayName,
        passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
        passwordChangedAt: new Date(),
      },
      select: { id: true, email: true, displayName: true, active: true },
    });
    process.stdout.write(`管理員已建立：${admin.email}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(error instanceof Error ? `${error.message}\n` : '建立失敗\n');
  process.exitCode = 1;
});
