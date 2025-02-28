/*
  Warnings:

  - You are about to drop the column `postion` on the `Cards` table. All the data in the column will be lost.
  - You are about to drop the column `postion` on the `Columns` table. All the data in the column will be lost.
  - Added the required column `position` to the `Cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Columns` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "columnId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cards_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Columns" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cards" ("columnId", "createdAt", "id", "title", "updatedAt") SELECT "columnId", "createdAt", "id", "title", "updatedAt" FROM "Cards";
DROP TABLE "Cards";
ALTER TABLE "new_Cards" RENAME TO "Cards";
CREATE TABLE "new_Columns" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Columns" ("createdAt", "id", "title", "updatedAt") SELECT "createdAt", "id", "title", "updatedAt" FROM "Columns";
DROP TABLE "Columns";
ALTER TABLE "new_Columns" RENAME TO "Columns";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
