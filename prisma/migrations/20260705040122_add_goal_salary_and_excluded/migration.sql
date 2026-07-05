-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN     "excluded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "monthlyGoalHours" INTEGER,
ADD COLUMN     "monthlySalary" DECIMAL(12,2);
