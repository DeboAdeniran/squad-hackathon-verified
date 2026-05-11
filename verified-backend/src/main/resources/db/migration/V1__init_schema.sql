CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE claim_type AS ENUM ('AUTO', 'HEALTH', 'PROPERTY');
CREATE TYPE claim_status AS ENUM ('SUBMITTED', 'PROCESSING', 'SCORED', 'PAID', 'UNDER_REVIEW', 'BLOCKED');
CREATE TYPE score_tier AS ENUM ('VERIFIED', 'REVIEW', 'FLAGGED');
CREATE TYPE squad_action AS ENUM ('RELEASE_PAYMENT', 'HOLD_ESCROW', 'BLOCK_PAYMENT');
CREATE TYPE file_type AS ENUM ('PHOTO', 'DOCUMENT');
CREATE TYPE tx_status AS ENUM ('SUCCESS', 'FAILED', 'PENDING');
CREATE TYPE review_decision AS ENUM ('APPROVE', 'REJECT');

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       full_name VARCHAR(255) NOT NULL,
                       role VARCHAR(50) NOT NULL DEFAULT 'ADJUDICATOR',
                       created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE claims (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        claimant_name VARCHAR(255) NOT NULL,
                        policy_number VARCHAR(100) NOT NULL UNIQUE,
                        claim_type VARCHAR(50) NOT NULL,
                        claimed_amount DECIMAL(15, 2) NOT NULL,
                        incident_date DATE NOT NULL,
                        description TEXT,
                        status VARCHAR(50) DEFAULT 'SUBMITTED',
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE claim_files (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             claim_id UUID NOT NULL REFERENCES claims(id),
                             file_type VARCHAR(50),
                             file_url TEXT NOT NULL,
                             uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trust_scores (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              claim_id UUID NOT NULL UNIQUE REFERENCES claims(id),
                              trust_score INTEGER NOT NULL,
                              tier VARCHAR(20),
                              squad_action VARCHAR(30),
                              confidence DECIMAL(3, 2),
                              photo_score INTEGER,
                              document_score INTEGER,
                              behavioral_score INTEGER,
                              identity_score INTEGER,
                              price_score INTEGER,
                              scored_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE score_flags (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             score_id UUID NOT NULL REFERENCES trust_scores(id),
                             module VARCHAR(50) NOT NULL,
                             signal VARCHAR(100) NOT NULL,
                             explanation TEXT NOT NULL
);

CREATE TABLE squad_transactions (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    claim_id UUID NOT NULL REFERENCES claims(id),
                                    action VARCHAR(30),
                                    squad_reference VARCHAR(255),
                                    amount DECIMAL(15, 2),
                                    status VARCHAR(50) DEFAULT 'PENDING',
                                    response_body TEXT,
                                    called_at TIMESTAMP DEFAULT NOW()
);