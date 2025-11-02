-- Indexes for Users Table
CREATE INDEX IF NOT EXISTS IX_Users_Email ON Users(Email);
CREATE INDEX IF NOT EXISTS IX_Users_DeletedAt ON Users(DeletedAt);
CREATE INDEX IF NOT EXISTS IX_Users_Role ON Users(Role);

-- Indexes for Investments Table
CREATE INDEX IF NOT EXISTS IX_Investments_UserId ON Investments(UserId);
CREATE INDEX IF NOT EXISTS IX_Investments_DeletedAt ON Investments(DeletedAt);
CREATE INDEX IF NOT EXISTS IX_Investments_Type ON Investments(Type);
CREATE INDEX IF NOT EXISTS IX_Investments_Status ON Investments(Status);
CREATE INDEX IF NOT EXISTS IX_Investments_PurchaseDate ON Investments(PurchaseDate);

-- Indexes for Transactions Table
CREATE INDEX IF NOT EXISTS IX_Transactions_InvestmentId ON Transactions(InvestmentId);
CREATE INDEX IF NOT EXISTS IX_Transactions_Date ON Transactions(Date);
CREATE INDEX IF NOT EXISTS IX_Transactions_Type ON Transactions(Type);
CREATE INDEX IF NOT EXISTS IX_Transactions_Status ON Transactions(Status);

-- Indexes for RefreshTokens Table
CREATE INDEX IF NOT EXISTS IX_RefreshTokens_UserId ON RefreshTokens(UserId);
CREATE INDEX IF NOT EXISTS IX_RefreshTokens_Token ON RefreshTokens(Token);
CREATE INDEX IF NOT EXISTS IX_RefreshTokens_ExpiresAt ON RefreshTokens(ExpiresAt);

-- Indexes for ActivityLogs Table
CREATE INDEX IF NOT EXISTS IX_ActivityLogs_UserId ON ActivityLogs(UserId);
CREATE INDEX IF NOT EXISTS IX_ActivityLogs_CreatedAt ON ActivityLogs(CreatedAt);
CREATE INDEX IF NOT EXISTS IX_ActivityLogs_EntityType ON ActivityLogs(EntityType);

-- Indexes for PasswordResetTokens Table
CREATE INDEX IF NOT EXISTS IX_PasswordResetTokens_UserId ON PasswordResetTokens(UserId);
CREATE INDEX IF NOT EXISTS IX_PasswordResetTokens_Token ON PasswordResetTokens(Token);
CREATE INDEX IF NOT EXISTS IX_PasswordResetTokens_ExpiresAt ON PasswordResetTokens(ExpiresAt);
