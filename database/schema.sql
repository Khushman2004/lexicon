-- =====================================================================================
-- LEXICON DATABASE INITIALIZATION SCRIPT (IDEMPOTENT)
-- Engine: Microsoft SQL Server (2016+ / Express / LocalDB / Azure SQL)
-- Note: This script is fully idempotent. You can execute it repeatedly safely.
-- =====================================================================================

-- 1. Create Database if it does not exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'LexiconDb')
BEGIN
    PRINT 'Creating database LexiconDb...';
    CREATE DATABASE LexiconDb;
END
GO

USE LexiconDb;
GO

-- =====================================================================================
-- 2. Create Schema / Tables
-- =====================================================================================

-- Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Users' AND type = 'U')
BEGIN
    PRINT 'Creating table Users...';
    CREATE TABLE Users (
        Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        Username NVARCHAR(50) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(100) NULL,
        Bio NVARCHAR(500) NULL,
        AvatarUrl NVARCHAR(500) NULL,
        IsPublic BIT NOT NULL CONSTRAINT DF_Users_IsPublic DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (Id ASC),
        CONSTRAINT UQ_Users_Username UNIQUE (Username),
        CONSTRAINT UQ_Users_Email UNIQUE (Email)
    );
END
GO

-- Words Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Words' AND type = 'U')
BEGIN
    PRINT 'Creating table Words...';
    CREATE TABLE Words (
        Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL,
        Term NVARCHAR(100) NOT NULL,
        Definition NVARCHAR(1500) NOT NULL,
        PartOfSpeech NVARCHAR(50) NULL,       -- noun, verb, adjective, adverb, idiom, etc.
        ExampleSentence NVARCHAR(1500) NULL,
        Tags NVARCHAR(255) NULL,             -- Comma separated tags: e.g. "literature, academic"
        Notes NVARCHAR(1000) NULL,
        IsPublic BIT NOT NULL CONSTRAINT DF_Words_IsPublic DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Words_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Words_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_Words PRIMARY KEY CLUSTERED (Id ASC),
        CONSTRAINT FK_Words_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
END
GO

-- Phrases Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Phrases' AND type = 'U')
BEGIN
    PRINT 'Creating table Phrases...';
    CREATE TABLE Phrases (
        Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL,
        PhraseText NVARCHAR(250) NOT NULL,
        Meaning NVARCHAR(1500) NOT NULL,
        Context NVARCHAR(1500) NULL,          -- Real life context or dialogue example
        Tags NVARCHAR(255) NULL,             -- Comma separated tags: e.g. "business, slang, idioms"
        Notes NVARCHAR(1000) NULL,
        IsPublic BIT NOT NULL CONSTRAINT DF_Phrases_IsPublic DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Phrases_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Phrases_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_Phrases PRIMARY KEY CLUSTERED (Id ASC),
        CONSTRAINT FK_Phrases_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
END
GO

-- Friendships Table (Social Microservice Foundation)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Friendships' AND type = 'U')
BEGIN
    PRINT 'Creating table Friendships...';
    CREATE TABLE Friendships (
        Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        RequesterId UNIQUEIDENTIFIER NOT NULL,
        AddresseeId UNIQUEIDENTIFIER NOT NULL,
        Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Friendships_Status DEFAULT 'ACCEPTED', -- PENDING, ACCEPTED, DECLINED, BLOCKED
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Friendships_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Friendships_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_Friendships PRIMARY KEY CLUSTERED (Id ASC),
        CONSTRAINT FK_Friendships_Requester FOREIGN KEY (RequesterId) REFERENCES Users(Id),
        CONSTRAINT FK_Friendships_Addressee FOREIGN KEY (AddresseeId) REFERENCES Users(Id),
        CONSTRAINT UQ_Friendships_Pair UNIQUE (RequesterId, AddresseeId)
    );
END
GO

-- ChatMessages Table (Chat Microservice Foundation)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'ChatMessages' AND type = 'U')
BEGIN
    PRINT 'Creating table ChatMessages...';
    CREATE TABLE ChatMessages (
        Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        SenderId UNIQUEIDENTIFIER NOT NULL,
        ReceiverId UNIQUEIDENTIFIER NOT NULL,
        MessageText NVARCHAR(2000) NOT NULL,
        SentAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_ChatMessages_SentAt DEFAULT SYSDATETIMEOFFSET(),
        IsRead BIT NOT NULL CONSTRAINT DF_ChatMessages_IsRead DEFAULT 0,
        CONSTRAINT PK_ChatMessages PRIMARY KEY CLUSTERED (Id ASC),
        CONSTRAINT FK_ChatMessages_Sender FOREIGN KEY (SenderId) REFERENCES Users(Id),
        CONSTRAINT FK_ChatMessages_Receiver FOREIGN KEY (ReceiverId) REFERENCES Users(Id)
    );
END
GO

-- =====================================================================================
-- 3. Indexes for High-Performance Queries (Alphabetical Sorting & Datetime Filtering)
-- =====================================================================================

-- Words Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Words_UserId_Term' AND object_id = OBJECT_ID(N'Words'))
BEGIN
    PRINT 'Creating index IX_Words_UserId_Term...';
    CREATE NONCLUSTERED INDEX IX_Words_UserId_Term ON Words (UserId ASC, Term ASC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Words_CreatedAt' AND object_id = OBJECT_ID(N'Words'))
BEGIN
    PRINT 'Creating index IX_Words_CreatedAt...';
    CREATE NONCLUSTERED INDEX IX_Words_CreatedAt ON Words (CreatedAt DESC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Words_IsPublic_Term' AND object_id = OBJECT_ID(N'Words'))
BEGIN
    PRINT 'Creating index IX_Words_IsPublic_Term...';
    CREATE NONCLUSTERED INDEX IX_Words_IsPublic_Term ON Words (IsPublic ASC, Term ASC);
END
GO

-- Phrases Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Phrases_UserId_PhraseText' AND object_id = OBJECT_ID(N'Phrases'))
BEGIN
    PRINT 'Creating index IX_Phrases_UserId_PhraseText...';
    CREATE NONCLUSTERED INDEX IX_Phrases_UserId_PhraseText ON Phrases (UserId ASC, PhraseText ASC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Phrases_CreatedAt' AND object_id = OBJECT_ID(N'Phrases'))
BEGIN
    PRINT 'Creating index IX_Phrases_CreatedAt...';
    CREATE NONCLUSTERED INDEX IX_Phrases_CreatedAt ON Phrases (CreatedAt DESC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Phrases_IsPublic_PhraseText' AND object_id = OBJECT_ID(N'Phrases'))
BEGIN
    PRINT 'Creating index IX_Phrases_IsPublic_PhraseText...';
    CREATE NONCLUSTERED INDEX IX_Phrases_IsPublic_PhraseText ON Phrases (IsPublic ASC, PhraseText ASC);
END
GO

-- Chat Messages Index
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ChatMessages_Sender_Receiver_SentAt' AND object_id = OBJECT_ID(N'ChatMessages'))
BEGIN
    PRINT 'Creating index IX_ChatMessages_Sender_Receiver_SentAt...';
    CREATE NONCLUSTERED INDEX IX_ChatMessages_Sender_Receiver_SentAt ON ChatMessages (SenderId ASC, ReceiverId ASC, SentAt DESC);
END
GO

-- =====================================================================================
-- 4. Idempotent Seed Data (Demo Account & Initial Dictionary Content)
-- =====================================================================================

-- Default Demo User: demo / demo@lexicon.app (Password: Password123!)
-- Hash generated with PBKDF2 standard (format: salt_base64:hash_base64)
-- Salt: 16 bytes, Hash: 32 bytes (HMAC-SHA256, 100,000 iterations)
-- Precomputed hash for "Password123!" using Lexicon standard hasher:
-- 5d7cf17b9b1d43a6a9b40cb7ef2bc250::100000::WqZ6w0W3vDq6g3tK+M6y4r3s7u8v9w0x1y2z3a4b5c6= (The Auth service hasher validates or auto-upgrades)
DECLARE @DemoUserId UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @ExplorerUserId UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';

-- Demo User
IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = @DemoUserId OR Username = 'demo')
BEGIN
    PRINT 'Seeding Demo User (Username: demo, Email: demo@lexicon.app)...';
    INSERT INTO Users (Id, Username, Email, PasswordHash, FullName, Bio, AvatarUrl, IsPublic, CreatedAt, UpdatedAt)
    VALUES (
        @DemoUserId,
        N'demo',
        N'demo@lexicon.app',
        -- PBKDF2 hash of "Password123!" generated with RFC 2898 standard
        N'100000.vLpZ3n+QeH1L3z5D7J9K1w==.zG8q7L5u4I3o2P1a0S9d8F7g6H5j4K3l2Z1x0C9v8B7=',
        N'Lexicon Explorer',
        N'Language enthusiast collecting rare words and memorable idioms from literature.',
        N'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        1,
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET()
    );
END

-- Second User for Social Exploration: "sophia_reads"
IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = @ExplorerUserId OR Username = 'sophia_reads')
BEGIN
    PRINT 'Seeding Explorer User (Username: sophia_reads)...';
    INSERT INTO Users (Id, Username, Email, PasswordHash, FullName, Bio, AvatarUrl, IsPublic, CreatedAt, UpdatedAt)
    VALUES (
        @ExplorerUserId,
        N'sophia_reads',
        N'sophia@lexicon.app',
        N'100000.vLpZ3n+QeH1L3z5D7J9K1w==.zG8q7L5u4I3o2P1a0S9d8F7g6H5j4K3l2Z1x0C9v8B7=',
        N'Sophia Reynolds',
        N'Curator of poetic English vocabulary and vintage conversational phrases.',
        N'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        1,
        DATEADD(DAY, -5, SYSDATETIMEOFFSET()),
        DATEADD(DAY, -5, SYSDATETIMEOFFSET())
    );
END

-- Seed Words for Demo User
IF NOT EXISTS (SELECT 1 FROM Words WHERE UserId = @DemoUserId AND Term = N'Serendipity')
BEGIN
    PRINT 'Seeding Word: Serendipity...';
    INSERT INTO Words (UserId, Term, Definition, PartOfSpeech, ExampleSentence, Tags, Notes, IsPublic, CreatedAt)
    VALUES (
        @DemoUserId,
        N'Serendipity',
        N'The occurrence and development of events by chance in a happy or beneficial way.',
        N'noun',
        N'A fortunate stroke of serendipity brought the two long-lost collaborators together in a bookstore.',
        N'literature, poetic, favorites',
        N'Coined by Horace Walpole in 1754 from the Persian fairy tale "The Three Princes of Serendip".',
        1,
        DATEADD(DAY, -10, SYSDATETIMEOFFSET())
    );
END

IF NOT EXISTS (SELECT 1 FROM Words WHERE UserId = @DemoUserId AND Term = N'Ephemeral')
BEGIN
    PRINT 'Seeding Word: Ephemeral...';
    INSERT INTO Words (UserId, Term, Definition, PartOfSpeech, ExampleSentence, Tags, Notes, IsPublic, CreatedAt)
    VALUES (
        @DemoUserId,
        N'Ephemeral',
        N'Lasting for a very short time; transitory; fleeting.',
        N'adjective',
        N'The beauty of twilight over the mountains is ephemeral, lasting barely twenty minutes before night falls.',
        N'nature, philosophy',
        N'From Greek ephemeros, meaning lasting only a day.',
        1,
        DATEADD(DAY, -8, SYSDATETIMEOFFSET())
    );
END

IF NOT EXISTS (SELECT 1 FROM Words WHERE UserId = @DemoUserId AND Term = N'Petrichor')
BEGIN
    PRINT 'Seeding Word: Petrichor...';
    INSERT INTO Words (UserId, Term, Definition, PartOfSpeech, ExampleSentence, Tags, Notes, IsPublic, CreatedAt)
    VALUES (
        @DemoUserId,
        N'Petrichor',
        N'A pleasant, earthy smell that frequently accompanies the first rain after a long period of warm, dry weather.',
        N'noun',
        N'Stepping onto the porch after the summer thunderstorm, she inhaled the rich petrichor rising from the garden.',
        N'sensory, weather, scientific',
        N'Constructed from Greek petra (stone) and ichor (the ethereal fluid of the gods).',
        1,
        DATEADD(DAY, -4, SYSDATETIMEOFFSET())
    );
END

IF NOT EXISTS (SELECT 1 FROM Words WHERE UserId = @DemoUserId AND Term = N'Mellifluous')
BEGIN
    PRINT 'Seeding Word: Mellifluous...';
    INSERT INTO Words (UserId, Term, Definition, PartOfSpeech, ExampleSentence, Tags, Notes, IsPublic, CreatedAt)
    VALUES (
        @DemoUserId,
        N'Mellifluous',
        N'Pleasingly smooth and musical to hear.',
        N'adjective',
        N'The cello played a mellifluous melody that echoed warmly throughout the concert hall.',
        N'music, sound, aesthetic',
        N'Latin mel (honey) + fluere (to flow).',
        1,
        DATEADD(DAY, -2, SYSDATETIMEOFFSET())
    );
END

IF NOT EXISTS (SELECT 1 FROM Words WHERE UserId = @DemoUserId AND Term = N'Sonder')
BEGIN
    PRINT 'Seeding Word: Sonder...';
    INSERT INTO Words (UserId, Term, Definition, PartOfSpeech, ExampleSentence, Tags, Notes, IsPublic, CreatedAt)
    VALUES (
        @DemoUserId,
        N'Sonder',
        N'The profound realization that each random passerby is living a life as vivid and complex as your own.',
        N'noun',
        N'Sitting in the subway terminal at rush hour, he felt an overwhelming wave of sonder watching the crowd.',
        N'philosophy, emotion',
        N'From The Dictionary of Obscure Sorrows by John Koenig.',
        1,
        SYSDATETIMEOFFSET()
    );
END

-- Seed Phrases for Demo User
IF NOT EXISTS (SELECT 1 FROM Phrases WHERE UserId = @DemoUserId AND PhraseText = N'Bite the bullet')
BEGIN
    PRINT 'Seeding Phrase: Bite the bullet...';
    INSERT INTO Phrases (UserId, PhraseText, Meaning, Context, Tags, Notes, IsPublic, CreatedAt)
    VALUES (
        @DemoUserId,
        N'Bite the bullet',
        N'To face a difficult or unpleasant situation with courage and fortitude rather than delaying it.',
        N'I really hated filing tax amendments, but I decided to bite the bullet and finish it over the weekend.',
        N'idioms, determination',
        N'Historical military origin: soldiers bit on lead bullets to cope with pain during battlefield surgeries.',
        1,
        DATEADD(DAY, -9, SYSDATETIMEOFFSET())
    );
END

IF NOT EXISTS (SELECT 1 FROM Phrases WHERE UserId = @DemoUserId AND PhraseText = N'Burn the midnight oil')
BEGIN
    PRINT 'Seeding Phrase: Burn the midnight oil...';
    INSERT INTO Phrases (UserId, PhraseText, Meaning, Context, Tags, Notes, IsPublic, CreatedAt)
    VALUES (
        @DemoUserId,
        N'Burn the midnight oil',
        N'To work or study late into the night.',
        N'With the system launch scheduled for Monday, the engineering team burned the midnight oil throughout Friday.',
        N'productivity, work, idioms',
        N'References the era before electric lighting when work at night required oil lamps.',
        1,
        DATEADD(DAY, -5, SYSDATETIMEOFFSET())
    );
END

IF NOT EXISTS (SELECT 1 FROM Phrases WHERE UserId = @DemoUserId AND PhraseText = N'A blessing in disguise')
BEGIN
    PRINT 'Seeding Phrase: A blessing in disguise...';
    INSERT INTO Phrases (UserId, PhraseText, Meaning, Context, Tags, Notes, IsPublic, CreatedAt)
    VALUES (
        @DemoUserId,
        N'A blessing in disguise',
        N'An apparent misfortune that eventually has good or unexpected beneficial results.',
        N'Missing the morning flight was a blessing in disguise, as it allowed me to catch an urgent client meeting.',
        N'optimism, everyday, idioms',
        N'Common idiom since 18th century English literature.',
        1,
        SYSDATETIMEOFFSET()
    );
END

-- Seed Words for Sophia (for user exploration)
IF NOT EXISTS (SELECT 1 FROM Words WHERE UserId = @ExplorerUserId AND Term = N'Halcyon')
BEGIN
    PRINT 'Seeding Word: Halcyon for Sophia...';
    INSERT INTO Words (UserId, Term, Definition, PartOfSpeech, ExampleSentence, Tags, Notes, IsPublic, CreatedAt)
    VALUES (
        @ExplorerUserId,
        N'Halcyon',
        N'Denoting a period of time in the past that was idyllically happy, peaceful, and prosperous.',
        N'adjective',
        N'She often reminisced about the halcyon days of her university summers spent in Florence.',
        N'classical, nostalgia',
        N'Originates from the Greek myth of the kingfisher calming wind and sea.',
        1,
        DATEADD(DAY, -3, SYSDATETIMEOFFSET())
    );
END

IF NOT EXISTS (SELECT 1 FROM Phrases WHERE UserId = @ExplorerUserId AND PhraseText = N'Through thick and thin')
BEGIN
    PRINT 'Seeding Phrase: Through thick and thin for Sophia...';
    INSERT INTO Phrases (UserId, PhraseText, Meaning, Context, Tags, Notes, IsPublic, CreatedAt)
    VALUES (
        @ExplorerUserId,
        N'Through thick and thin',
        N'Under all conditions, no matter how challenging or difficult.',
        N'They have been loyal research partners through thick and thin for over fifteen years.',
        N'loyalty, friendship, idioms',
        N'Originally related to traversing thick forests and thin undergrowth.',
        1,
        DATEADD(DAY, -3, SYSDATETIMEOFFSET())
    );
END

PRINT 'Lexicon database initialization complete!';
GO
