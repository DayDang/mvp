-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unipile_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT,
    "provider" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Account_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("created_at", "id", "name", "provider", "unipile_id", "updated_at", "workspace_id") SELECT "created_at", "id", "name", "provider", "unipile_id", "updated_at", "workspace_id" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_unipile_id_key" ON "Account"("unipile_id");
CREATE TABLE "new_Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unipile_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "timestamp" DATETIME,
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "last_message" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Chat_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("unipile_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Chat" ("account_id", "created_at", "id", "last_message", "name", "timestamp", "type", "unipile_id", "unread_count", "updated_at") SELECT "account_id", "created_at", "id", "last_message", "name", "timestamp", "type", "unipile_id", "unread_count", "updated_at" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
CREATE UNIQUE INDEX "Chat_unipile_id_key" ON "Chat"("unipile_id");
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unipile_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "sender_id" TEXT,
    "text" TEXT,
    "type" TEXT,
    "timestamp" DATETIME,
    "is_from_me" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat" ("unipile_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("account_id", "attachments", "chat_id", "created_at", "id", "is_from_me", "sender_id", "text", "timestamp", "type", "unipile_id", "updated_at") SELECT "account_id", "attachments", "chat_id", "created_at", "id", "is_from_me", "sender_id", "text", "timestamp", "type", "unipile_id", "updated_at" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE UNIQUE INDEX "Message_unipile_id_key" ON "Message"("unipile_id");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("created_at", "email", "id", "name", "updated_at") SELECT "created_at", "email", "id", "name", "updated_at" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Workspace" ("created_at", "id", "name", "updated_at") SELECT "created_at", "id", "name", "updated_at" FROM "Workspace";
DROP TABLE "Workspace";
ALTER TABLE "new_Workspace" RENAME TO "Workspace";
CREATE TABLE "new_WorkspaceMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "WorkspaceMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkspaceMember_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorkspaceMember" ("created_at", "id", "role", "updated_at", "user_id", "workspace_id") SELECT "created_at", "id", "role", "updated_at", "user_id", "workspace_id" FROM "WorkspaceMember";
DROP TABLE "WorkspaceMember";
ALTER TABLE "new_WorkspaceMember" RENAME TO "WorkspaceMember";
CREATE UNIQUE INDEX "WorkspaceMember_user_id_workspace_id_key" ON "WorkspaceMember"("user_id", "workspace_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
