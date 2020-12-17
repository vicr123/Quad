-- Upgrade from database version 2 to 3

CREATE TABLE IF NOT EXISTS userGeography(id TEXT PRIMARY KEY, coords POINT);

DELETE FROM databaseVersion;
INSERT INTO databaseVersion(version) VALUES(3);