ALTER TABLE "Task" ADD COLUMN "followUpEmail" TEXT;

INSERT INTO "ListValue" (
  "id",
  "categoryId",
  "key",
  "labelEn",
  "labelHe",
  "sortOrder",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  'value_close_reason_meeting',
  "id",
  'meeting',
  'Meeting booked',
  'נקבעה פגישה',
  4,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "ListCategory"
WHERE "key" = 'close_reason'
ON CONFLICT ("categoryId", "key") DO NOTHING;
