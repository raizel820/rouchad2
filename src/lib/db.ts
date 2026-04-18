import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: ['query'],
  })
}

// Always create a fresh client in development to pick up schema changes
// In production, use the singleton pattern for connection pooling
export const db =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prisma ??= createPrismaClient())
    : createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
