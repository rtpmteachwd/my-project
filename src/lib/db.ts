import { PrismaClient } from '@prisma/client'

// Global Prisma client to avoid multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

// In production, don't store the client in globalThis
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db