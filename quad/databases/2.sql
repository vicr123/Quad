-- Upgrade from database version 1 to 2

CREATE TABLE IF NOT EXISTS locales(id TEXT PRIMARY KEY, locale TEXT DEFAULT 'en');
INSERT INTO locales(id, locale) SELECT * FROM userlocales UNION SELECT * FROM guildlocales;

DROP TABLE userlocales;
DROP TABLE guildlocales;

DELETE FROM databaseVersion;
INSERT INTO databaseVersion(version) VALUES(2);