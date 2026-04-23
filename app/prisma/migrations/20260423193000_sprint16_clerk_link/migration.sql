ALTER TABLE "User"
ADD COLUMN "clerkUserId" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");
