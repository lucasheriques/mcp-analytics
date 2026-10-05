CREATE TABLE IF NOT EXISTS views (
    day TEXT NOT NULL,
    kind TEXT NOT NULL,
    host TEXT NOT NULL DEFAULT '',
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (day, kind, host)
);
