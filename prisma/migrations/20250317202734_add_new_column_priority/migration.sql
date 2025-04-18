-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "columnId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'low',
    "position" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cards_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Columns" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cards" ("columnId", "createdAt", "id", "position", "priority", "title", "updatedAt") SELECT "columnId", "createdAt", "id", "position", "priority", "title", "updatedAt" FROM "Cards";
DROP TABLE "Cards";
ALTER TABLE "new_Cards" RENAME TO "Cards";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
