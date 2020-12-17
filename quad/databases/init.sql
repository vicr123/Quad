-- Database version 2

CREATE TABLE IF NOT EXISTS guildPrefix(id TEXT PRIMARY KEY, prefix TEXT);
CREATE TABLE IF NOT EXISTS guildPins(id TEXT PRIMARY KEY, enabled BOOLEAN, emoji TEXT, timeout INTEGER);
CREATE TABLE IF NOT EXISTS guildLogs(id TEXT PRIMARY KEY, alerts TEXT, logs TEXT);

CREATE TABLE IF NOT EXISTS locales(id TEXT PRIMARY KEY, locale TEXT DEFAULT 'en');

CREATE TABLE IF NOT EXISTS pinIdIncrementCounter(id TEXT PRIMARY KEY, current BIGINT DEFAULT 0);

CREATE OR REPLACE FUNCTION pinIdIncrement(id TEXT) RETURNS BIGINT AS $$
    INSERT INTO pinIdIncrementCounter(id, current)
        VALUES(id, 0)
        ON CONFLICT ON CONSTRAINT pinIdIncrementCounter_pkey
            DO NOTHING;
    
    UPDATE pinIdIncrementCounter AS t
        SET current=((SELECT current FROM pinIdIncrementCounter WHERE id=$1) + 1)
        WHERE t.id=$1
        RETURNING t.current;
$$ LANGUAGE sql;

CREATE TABLE IF NOT EXISTS catIdIncrementCounter(id TEXT PRIMARY KEY, current BIGINT DEFAULT 0);

CREATE OR REPLACE FUNCTION catIdIncrement(id TEXT) RETURNS BIGINT AS $$
    INSERT INTO catIdIncrementCounter(id, current)
        VALUES(id, 0)
        ON CONFLICT ON CONSTRAINT catIdIncrementCounter_pkey
            DO NOTHING;
    
    UPDATE catIdIncrementCounter AS t
        SET current=((SELECT current FROM catIdIncrementCounter WHERE id=$1) + 1)
        WHERE t.id=$1
        RETURNING t.current;
$$ LANGUAGE sql;

CREATE TABLE IF NOT EXISTS userPins(pinId BIGINT, id TEXT, channel TEXT, message TEXT, PRIMARY KEY (id, pinId));
CREATE TABLE IF NOT EXISTS userCategories(catId BIGINT, id TEXT, name TEXT, PRIMARY KEY (id, catId));
CREATE TABLE IF NOT EXISTS userPinsCategories(id TEXT, pinId BIGINT, catId BIGINT, PRIMARY KEY(id, pinId, catId),
                                              FOREIGN KEY (id, pinId) REFERENCES userPins(id, pinId),
                                              FOREIGN KEY (id, catId) REFERENCES userCategories(id, catId));

CREATE TABLE IF NOT EXISTS userGeography(id TEXT PRIMARY KEY, coords POINT);

CREATE TABLE IF NOT EXISTS databaseVersion(version INTEGER PRIMARY KEY);
DELETE FROM databaseVersion;
INSERT INTO databaseVersion(version) VALUES(3);