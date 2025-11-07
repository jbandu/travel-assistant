# Database Architecture

## Overview

The Travel Assistant platform uses **Neon Serverless PostgreSQL** for scalable, cost-effective data storage with automatic scaling and branching capabilities.

## Connection Details

### Neon Database
- **Provider:** Neon (https://neon.tech)
- **Database Type:** PostgreSQL 15
- **Connection Mode:** Pooled connection via PgBouncer
- **SSL:** Required with channel binding
- **Region:** US East 1 (AWS)

### Connection String
```
postgresql://neondb_owner:npg_mXj1qakz8wdu@ep-muddy-pond-ader93vt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Security Note:** This connection string contains credentials. Ensure it is stored in `.env` and never committed to version control.

## Database Schema

### Core Tables

#### 1. users
Primary user account table for authentication and identity.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

#### 2. user_profiles
Extended user preferences and Customer 360 data.

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Travel Preferences
    preferred_cabin_class VARCHAR(20), -- economy, premium_economy, business, first
    preferred_airlines JSONB, -- ["UA", "DL", "AA"]
    preferred_hotel_chains JSONB, -- ["Marriott", "Hilton"]
    seat_preference VARCHAR(20), -- window, aisle, no_preference
    meal_preference VARCHAR(50), -- vegetarian, vegan, kosher, halal, no_preference

    -- Accessibility & Special Needs
    accessibility_requirements JSONB, -- wheelchair, hearing_impaired, etc.
    dietary_restrictions JSONB,

    -- Loyalty Programs
    loyalty_programs JSONB, -- {airline: {program, number}, hotel: {program, number}}

    -- Contact Preferences
    notification_preferences JSONB, -- {email: true, sms: false, push: true}
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Demographics (optional)
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(3), -- ISO 3166-1 alpha-3
    passport_number VARCHAR(50),
    passport_expiry DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

#### 3. trips
Trip planning and itinerary data.

```sql
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Trip Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    trip_type VARCHAR(50), -- leisure, business, family, adventure
    status VARCHAR(50) DEFAULT 'planning', -- planning, booked, traveling, completed, cancelled

    -- Dates and Destinations
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    origin_city VARCHAR(100),
    origin_country VARCHAR(3),
    destinations JSONB, -- [{city, country, arrival_date, departure_date}]

    -- Budget
    budget_amount DECIMAL(10, 2),
    budget_currency VARCHAR(3) DEFAULT 'USD',
    actual_spent DECIMAL(10, 2) DEFAULT 0,

    -- Travelers
    traveler_count INTEGER DEFAULT 1,
    traveler_details JSONB, -- [{name, age, relation}]

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
```

#### 4. bookings
Flight, hotel, and activity bookings.

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Booking Type
    booking_type VARCHAR(50) NOT NULL, -- flight, hotel, activity, car_rental
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed

    -- Booking References
    confirmation_code VARCHAR(100) UNIQUE,
    supplier_reference VARCHAR(100), -- PNR, hotel confirmation, etc.
    supplier_name VARCHAR(255),

    -- Booking Details (JSON for flexibility)
    booking_details JSONB NOT NULL,
    -- For flights: {origin, destination, departure_time, arrival_time, airline, flight_number, passengers, seats}
    -- For hotels: {hotel_name, check_in, check_out, room_type, guests, address}
    -- For activities: {activity_name, date, time, location, participants}

    -- Financial
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded, failed

    -- Cancellation
    cancellable BOOLEAN DEFAULT TRUE,
    cancellation_deadline TIMESTAMP WITH TIME ZONE,
    cancellation_fee DECIMAL(10, 2),

    -- Timestamps
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_confirmation_code ON bookings(confirmation_code);
CREATE INDEX idx_bookings_type ON bookings(booking_type);
```

#### 5. conversations
Chat history with AI agents for context preservation.

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,

    -- Conversation Context
    agent_type VARCHAR(50), -- trip_planning, search_booking, experience, support, customer360
    conversation_context JSONB, -- Stores conversation state for agent orchestration

    -- Messages
    messages JSONB NOT NULL, -- [{role: 'user'|'agent', content, timestamp, agent_name}]

    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, closed, escalated
    escalated_to_human BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,

    -- Metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_trip_id ON conversations(trip_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_agent_type ON conversations(agent_type);
```

#### 6. notifications
User notification queue for proactive alerts.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

    -- Notification Details
    notification_type VARCHAR(50) NOT NULL, -- flight_delay, gate_change, booking_confirmation, check_in_reminder
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical

    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500), -- Deep link or URL for action

    -- Delivery
    channels JSONB, -- {email: true, sms: true, push: true}
    delivery_status JSONB, -- {email: 'sent', sms: 'delivered', push: 'failed'}

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, read, dismissed
    read_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);
```

#### 7. user_events
Behavioral event tracking for Customer 360 intelligence.

```sql
CREATE TABLE user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,

    -- Event Details
    event_type VARCHAR(100) NOT NULL, -- search, view, click, book, cancel, review
    event_category VARCHAR(50), -- flight, hotel, activity, destination

    -- Event Data
    event_data JSONB, -- Flexible structure for different event types
    -- Examples:
    -- search: {origin, destination, dates, passengers, filters_applied}
    -- view: {item_type, item_id, item_name, duration_seconds}
    -- click: {element_id, element_type, position}
    -- book: {booking_id, amount, currency}

    -- Session Info
    session_id VARCHAR(100),
    device_type VARCHAR(50), -- desktop, mobile, tablet
    user_agent TEXT,
    ip_address INET,

    -- Timestamp
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_type ON user_events(event_type);
CREATE INDEX idx_user_events_category ON user_events(event_category);
CREATE INDEX idx_user_events_timestamp ON user_events(event_timestamp);
CREATE INDEX idx_user_events_session ON user_events(session_id);
```

#### 8. agent_feedback
User feedback on agent interactions for continuous improvement.

```sql
CREATE TABLE agent_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

    -- Feedback Details
    agent_type VARCHAR(50) NOT NULL,
    message_id VARCHAR(100), -- Reference to specific message in conversation

    -- Rating
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    helpful BOOLEAN,

    -- Comments
    feedback_text TEXT,
    feedback_category VARCHAR(50), -- accuracy, relevance, helpfulness, speed, clarity

    -- Sentiment
    sentiment_score DECIMAL(3, 2), -- -1 to 1 (from sentiment analysis)

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_feedback_user_id ON agent_feedback(user_id);
CREATE INDEX idx_agent_feedback_agent_type ON agent_feedback(agent_type);
CREATE INDEX idx_agent_feedback_rating ON agent_feedback(rating);
```

## Migration Strategy

### Migration Framework
Use **Alembic** (Python) or **node-pg-migrate** (Node.js) for version-controlled schema changes.

### Initial Migration
```bash
# Create initial migration
npm run migrate:create initial_schema

# Run migration
npm run migrate:up

# Check status
npm run migrate:status
```

### Migration Files Location
```
/migrations
  ├── 001_initial_schema.sql
  ├── 002_add_user_profiles.sql
  ├── 003_add_booking_indexes.sql
  └── ...
```

## Backup and Recovery

### Neon Features
- **Automatic Backups:** Daily full backups retained for 30 days
- **Point-in-Time Recovery:** Restore to any point within retention window
- **Branch Database:** Create instant database copies for testing

### Manual Backup
```bash
# Create backup
pg_dump "postgresql://neondb_owner:npg_mXj1qakz8wdu@ep-muddy-pond-ader93vt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" > backup_$(date +%Y%m%d).sql

# Restore from backup
psql "postgresql://neondb_owner:npg_mXj1qakz8wdu@ep-muddy-pond-ader93vt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" < backup_20250107.sql
```

## Performance Optimization

### Indexing Strategy
- Primary keys: UUID with B-tree index
- Foreign keys: B-tree indexes on all foreign key columns
- Frequently filtered columns: Status, dates, types
- JSONB fields: GIN indexes for specific query patterns

### Query Optimization
```sql
-- Example: Add GIN index for JSONB search
CREATE INDEX idx_booking_details_gin ON bookings USING GIN (booking_details);

-- Example: Partial index for active trips
CREATE INDEX idx_trips_active ON trips(user_id) WHERE status IN ('planning', 'booked', 'traveling');
```

### Connection Pooling
Neon provides built-in connection pooling via PgBouncer. Configuration:
- **Pool Mode:** Transaction (default)
- **Max Connections:** 100 (auto-scaled by Neon)
- **Timeout:** 30 seconds

## Security

### Access Control
- **Row-Level Security (RLS):** Enable for multi-tenant isolation
- **SSL/TLS:** Required for all connections
- **Encrypted at Rest:** AES-256 encryption by Neon

### Data Privacy
- **PII Encryption:** Consider application-level encryption for sensitive fields
- **GDPR Compliance:** Implement data export and deletion procedures
- **Audit Logging:** Track all schema changes and sensitive data access

### Example RLS Policy
```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_isolation_policy ON users
    USING (id = current_user_id());
```

## Monitoring

### Neon Metrics
- Query performance statistics
- Connection count and pooling efficiency
- Storage utilization
- Database size growth

### Custom Monitoring
```sql
-- Query slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Maintenance

### Regular Tasks
- **Vacuum:** Auto-vacuum enabled by default in Neon
- **Analyze:** Update statistics weekly for query planner
- **Index Maintenance:** Monitor and rebuild fragmented indexes
- **Schema Versioning:** Keep migration history up to date

### Scheduled Tasks
```bash
# Weekly analyze (can be added to cron job)
psql "postgresql://..." -c "ANALYZE;"

# Monthly index health check
psql "postgresql://..." -c "SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;"
```

---

**Database Version:** PostgreSQL 15
**Last Updated:** 2025-11-07
**Maintained By:** Jayaprakash Bandu
