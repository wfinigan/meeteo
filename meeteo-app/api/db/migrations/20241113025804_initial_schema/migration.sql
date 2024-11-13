-- CreateTable
CREATE TABLE "Query" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "conditions" TEXT NOT NULL,
    "clothing" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);
