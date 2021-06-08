-- Upgrade from database version 3 to 4

CREATE TABLE IF NOT EXISTS guildAutobans(id TEXT, pattern TEXT, PRIMARY KEY (id, pattern));

DELETE FROM databaseVersion;
INSERT INTO databaseVersion(version) VALUES(4);
