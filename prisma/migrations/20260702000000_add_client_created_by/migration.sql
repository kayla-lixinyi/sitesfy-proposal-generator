-- Client 表添加 createdById 字段（关联到创建者 User）
-- 若列已存在则跳过，避免重复执行报错
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "createdById" TEXT;

-- 补全现有行的 createdById（取第一个 User 的 id 作为默认值）
UPDATE "Client" SET "createdById" = (SELECT "id" FROM "User" LIMIT 1) WHERE "createdById" IS NULL;

-- 添加 NOT NULL 约束
ALTER TABLE "Client" ALTER COLUMN "createdById" SET NOT NULL;

-- 添加外键约束（若已存在则忽略）
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Client_createdById_fkey'
  ) THEN
    ALTER TABLE "Client" ADD CONSTRAINT "Client_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
