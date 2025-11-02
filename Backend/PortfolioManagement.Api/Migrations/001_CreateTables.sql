-- Create Users Table
CREATE TABLE IF NOT EXISTS Users (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('admin', 'user')),
    IsActive BOOLEAN NOT NULL DEFAULT true,
    EmailVerified BOOLEAN NOT NULL DEFAULT false,
    CreatedAt TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    UpdatedAt TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    DeletedAt TIMESTAMP NULL
);

-- Create Investments Table
CREATE TABLE IF NOT EXISTS Investments (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    CurrentValue DECIMAL(18,2) NOT NULL,
    PurchaseDate DATE NOT NULL,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('active', 'sold', 'closed', 'pending')),
    Description VARCHAR(1000) NULL,
    Symbol VARCHAR(50) NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    UpdatedAt TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    DeletedAt TIMESTAMP NULL
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS Transactions (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    InvestmentId UUID NOT NULL,
    Type VARCHAR(20) NOT NULL CHECK (Type IN ('buy', 'sell', 'dividend', 'interest', 'fee', 'transfer')),
    Quantity DECIMAL(18,4) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Fees DECIMAL(18,2) NULL,
    Date DATE NOT NULL,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('pending', 'completed', 'cancelled', 'failed')),
    Notes VARCHAR(1000) NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    UpdatedAt TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- Create RefreshTokens Table
CREATE TABLE IF NOT EXISTS RefreshTokens (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL,
    Token VARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- Create ActivityLogs Table
CREATE TABLE IF NOT EXISTS ActivityLogs (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NULL,
    Action VARCHAR(100) NOT NULL,
    EntityType VARCHAR(50) NOT NULL,
    EntityId VARCHAR(100) NOT NULL,
    Details TEXT NULL,
    IpAddress VARCHAR(50) NULL,
    UserAgent VARCHAR(500) NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- Create PasswordResetTokens Table
CREATE TABLE IF NOT EXISTS PasswordResetTokens (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL,
    Token VARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt TIMESTAMP NOT NULL,
    Used BOOLEAN NOT NULL DEFAULT false,
    CreatedAt TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);
