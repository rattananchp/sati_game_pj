-- AlterTable
ALTER TABLE "game_score" ADD COLUMN     "play_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "time_taken" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "chat_scenario" (
    "cs_id" SERIAL NOT NULL,
    "scenario_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "categoryTitle" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "lossType" TEXT DEFAULT 'money',
    "content" JSONB NOT NULL,

    CONSTRAINT "chat_scenario_pkey" PRIMARY KEY ("cs_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_scenario_scenario_id_key" ON "chat_scenario"("scenario_id");
