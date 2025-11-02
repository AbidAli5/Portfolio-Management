-- Foreign Key: Investments -> Users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_Investments_Users'
    ) THEN
        ALTER TABLE Investments
        ADD CONSTRAINT FK_Investments_Users
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION;
    END IF;
END $$;

-- Foreign Key: Transactions -> Investments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_Transactions_Investments'
    ) THEN
        ALTER TABLE Transactions
        ADD CONSTRAINT FK_Transactions_Investments
        FOREIGN KEY (InvestmentId) REFERENCES Investments(Id) ON DELETE CASCADE;
    END IF;
END $$;

-- Foreign Key: RefreshTokens -> Users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_RefreshTokens_Users'
    ) THEN
        ALTER TABLE RefreshTokens
        ADD CONSTRAINT FK_RefreshTokens_Users
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE;
    END IF;
END $$;

-- Foreign Key: ActivityLogs -> Users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_ActivityLogs_Users'
    ) THEN
        ALTER TABLE ActivityLogs
        ADD CONSTRAINT FK_ActivityLogs_Users
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL;
    END IF;
END $$;

-- Foreign Key: PasswordResetTokens -> Users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_PasswordResetTokens_Users'
    ) THEN
        ALTER TABLE PasswordResetTokens
        ADD CONSTRAINT FK_PasswordResetTokens_Users
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE;
    END IF;
END $$;
