-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unipile_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "timestamp" DATETIME,
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "last_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unipile_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "sender_id" TEXT,
    "text" TEXT,
    "type" TEXT,
    "timestamp" DATETIME,
    "is_from_me" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat" ("unipile_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_unipile_id_key" ON "Chat"("unipile_id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_unipile_id_key" ON "Message"("unipile_id");
