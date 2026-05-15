ALTER TABLE claims
    ADD COLUMN account_number VARCHAR(10) NOT NULL DEFAULT '',
    ADD COLUMN bank_code      VARCHAR(10) NOT NULL DEFAULT '',
    ADD COLUMN account_name   VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE claims
    ADD COLUMN total_previous_claims INT NOT NULL DEFAULT 0,
    ADD COLUMN months_on_policy      INT NOT NULL DEFAULT 1;