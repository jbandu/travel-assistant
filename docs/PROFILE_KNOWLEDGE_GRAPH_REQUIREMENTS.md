# Profile & Family Knowledge Graph - Requirements Document

## Executive Summary

Build a comprehensive, beautiful profile management system that creates a personal knowledge graph for each user and their travel companions. This system will capture rich contextual data about travelers, their preferences, relationships, and travel history to provide maximum context to AI agents for highly personalized recommendations.

---

## 1. Vision & Goals

### Primary Vision
Transform travel planning from generic recommendations to deeply personalized experiences by understanding not just what users like, but who they are, who they travel with, and how their preferences evolve over time.

### Key Goals
1. **Rich Context Capture**: Collect comprehensive travel-related data about individuals and families
2. **Knowledge Graph**: Build interconnected data representing relationships, preferences, and experiences
3. **Continuous Engagement**: Encourage users to regularly update profiles with new insights
4. **AI Optimization**: Provide maximum relevant context to LLMs for better recommendations
5. **Beautiful UX**: Make profile management enjoyable, not a chore
6. **Privacy First**: Give users complete control over their data

---

## 2. Core Features

### 2.1 Personal Profile Management

#### Basic Information
- **Personal Details**
  - Full name (first, middle, last, preferred name)
  - Date of birth / Age
  - Gender identity (optional)
  - Occupation / Industry
  - Location (city, state, country)
  - Time zone
  - Languages spoken (proficiency levels)
  - Cultural background (optional)

#### Travel Preferences
- **Travel Style**
  - Budget level (budget/mid-range/luxury/ultra-luxury)
  - Pace preference (slow/moderate/fast/jam-packed)
  - Activity level (relaxed/moderate/active/extreme)
  - Planning style (spontaneous/flexible/detailed/rigid)
  - Accommodation preferences (hotels/hostels/Airbnb/resorts/boutique)
  - Transportation preferences (flights/trains/road trips/cruises)

- **Interests & Activities**
  - Primary interests (beach, culture, food, adventure, nightlife, nature, history, shopping, wellness, etc.)
  - Specific activities (hiking, diving, photography, wine tasting, museums, concerts, etc.)
  - Intensity levels for each interest (casual/enthusiast/expert)
  - New interests to explore

#### Dietary & Health
- **Food Preferences**
  - Dietary restrictions (vegetarian, vegan, gluten-free, kosher, halal, etc.)
  - Allergies
  - Favorite cuisines
  - Adventurous eating score (1-10)
  - Specific dislikes

- **Health & Accessibility**
  - Physical limitations or disabilities
  - Accessibility requirements
  - Medical considerations for travel
  - Medication schedules
  - Fitness level

#### Travel History
- **Past Trips**
  - Destinations visited (cities, countries, regions)
  - Trip dates and duration
  - Trip type (leisure/business/family/solo/group)
  - Ratings and highlights
  - Photo galleries
  - Lessons learned
  - Would-return score

- **Bucket List**
  - Dream destinations
  - Priority ranking
  - Desired timeframe
  - Travel companions
  - Estimated budget
  - Specific experiences wanted

#### Travel Logistics
- **Documents & Memberships**
  - Passport details (number, expiry, nationality)
  - Visa history
  - TSA PreCheck / Global Entry
  - Airline status programs
  - Hotel loyalty programs
  - Credit card travel benefits

- **Preferences**
  - Preferred airlines
  - Airline seat preferences (window/aisle/middle, front/back)
  - Cabin class preferences
  - Preferred airports
  - Preferred hotel chains
  - Rental car preferences

### 2.2 Family & Travel Companion Profiles

#### Relationship Management
- **Types of Companions**
  - Spouse/Partner
  - Children (with ages)
  - Parents
  - Extended family
  - Friends
  - Colleagues
  - Travel groups/clubs

- **Companion Profiles**
  - All personal profile fields (simplified for children)
  - Relationship to primary user
  - Frequency of travel together
  - Shared preferences
  - Unique needs or requirements
  - Decision-making influence (who decides where to go)

#### Family Dynamics
- **Travel Patterns**
  - Typical group compositions
  - Preferred destinations by group
  - Budget allocation across family
  - Activity preferences by person
  - Compromise strategies

- **Special Considerations**
  - Child-friendliness requirements
  - Multigenerational travel needs
  - Different paces/interests within group
  - Solo time preferences

### 2.3 Knowledge Graph Structure

#### Entities
- **People** (User, Family Members, Friends)
- **Destinations** (Countries, Cities, Regions, Landmarks)
- **Experiences** (Activities, Restaurants, Hotels, Events)
- **Preferences** (Interests, Styles, Requirements)
- **Trips** (Past, Current, Planned, Wishlist)
- **Providers** (Airlines, Hotels, Tour Operators)

#### Relationships
- `TRAVELS_WITH`: Person → Person (frequency, preference_score)
- `VISITED`: Person → Destination (date, rating, would_return)
- `WANTS_TO_VISIT`: Person → Destination (priority, timeframe)
- `INTERESTED_IN`: Person → Interest (intensity, experience_level)
- `EXPERIENCED`: Person → Experience (date, rating, notes)
- `PREFERS`: Person → Provider (reason, loyalty_level)
- `SIMILAR_TO`: Destination → Destination (similarity_score)
- `RECOMMENDED_FOR`: Destination → Interest (relevance_score)

#### Attributes
- **Temporal**: Timestamps, durations, seasons, years
- **Quantitative**: Ratings, scores, budgets, distances
- **Qualitative**: Notes, memories, learnings, emotions
- **Relational**: Influence levels, compatibility scores

### 2.4 Progressive Data Collection

#### Onboarding Flow
1. **Welcome & Value Proposition** (1 screen)
   - Explain benefits of rich profile
   - Show example personalized recommendations

2. **Quick Start** (2-3 minutes)
   - Essential info only: name, location, budget level
   - 3-5 top interests
   - 1-2 dream destinations

3. **Profile Completion** (Gradual)
   - Gamified progress bar
   - Complete sections to unlock features
   - Smart defaults from behavior

#### Engagement Strategies
- **Post-Trip Surveys**
  - Automatic prompts after trip end dates
  - Rate experiences
  - Add photos and memories
  - Capture new learnings

- **Periodic Check-ins**
  - Quarterly preference updates
  - "Has anything changed?" prompts
  - New interests discovery

- **Smart Prompts**
  - Context-aware questions during browsing
  - "Add to bucket list?" when viewing destinations
  - "Dietary restrictions?" when viewing restaurants

- **Gamification**
  - Profile completion percentage
  - Travel badges and achievements
  - Streak tracking for updates
  - Community comparisons (opt-in)

### 2.5 AI Integration & Context Optimization

#### Context Assembly
For each AI query, assemble relevant context:
```
User Context:
- Core preferences (interests, budget, style)
- Recent activity (browsing, searches)
- Current trip planning stage
- Companion profiles (if applicable)
- Relevant past trips
- Bucket list items
- Constraints (dietary, accessibility)

Enrichment:
- Similar user patterns
- Seasonal considerations
- Current trends
- Availability data
```

#### Smart Prompting
- Dynamic system prompts based on user knowledge graph
- Relationship-aware recommendations
- Memory of past interactions
- Learning from feedback

#### Personalization Examples
- "Since you loved Tokyo's food scene and have 'foodie' as a top interest..."
- "Traveling with your 5-year-old daughter, here are kid-friendly activities..."
- "Based on your hiking experience level (expert) and preference for challenging trails..."
- "You mentioned wanting to visit Iceland in your bucket list. Best time for Northern Lights is..."

---

## 3. User Interface & Experience

### 3.1 Profile Dashboard

#### Layout
```
┌─────────────────────────────────────────────┐
│  Profile Header                              │
│  ├── Avatar                                  │
│  ├── Name & Quick Stats                     │
│  └── Completion Progress (85%)              │
├─────────────────────────────────────────────┤
│  Quick Actions                               │
│  [Update Interests] [Add Trip] [Invite]     │
├─────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ My Profile       │  │ Travel Family    │ │
│  │ [Sections...]    │  │ [Members...]     │ │
│  └──────────────────┘  └──────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Travel History   │  │ Bucket List      │ │
│  │ [Trips...]       │  │ [Wishlist...]    │ │
│  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
```

#### Key Sections
1. **About Me** - Personal details and travel style
2. **My Interests** - Visual interest picker with intensity sliders
3. **Travel History** - Timeline view of past trips
4. **Bucket List** - Pinterest-style destination wishlist
5. **My Travel Crew** - Family and companion profiles
6. **Preferences** - Dietary, accessibility, logistics
7. **Memberships** - Loyalty programs and travel docs

### 3.2 Interest Picker

**Visual Tag Cloud Interface**
- Popular interests as large, colorful cards
- Drag to reorder by priority
- Click to adjust intensity (1-5 stars)
- Add custom interests
- Suggest related interests

Example Categories:
```
🏖️  BEACH & WATER        🏔️  MOUNTAINS & NATURE
🍷 FOOD & WINE           🏛️  CULTURE & HISTORY
🎭 ARTS & ENTERTAINMENT   ⚽ SPORTS & ADVENTURE
🛍️  SHOPPING & FASHION   💆 WELLNESS & SPA
🎉 NIGHTLIFE & SOCIAL    📸 PHOTOGRAPHY
🎓 LEARNING & WORKSHOPS  🧘 SPIRITUALITY
```

### 3.3 Family Profile Manager

**Card-Based Interface**
- Primary card for user
- Companion cards (add unlimited)
- Quick-add templates (Spouse, Child, Parent, Friend)
- Shared vs. individual preferences highlighted
- Family trip history view

**Child Profile Template**
- Age (auto-calculates from DOB)
- Grade level
- Activity restrictions
- Interests (age-appropriate)
- Food preferences
- Special needs

### 3.4 Travel History Timeline

**Interactive Timeline**
- Chronological trip cards
- Map view of destinations
- Photo thumbnails
- Ratings and highlights
- Export to PDF/shareable link

**Trip Details**
- Destination(s)
- Dates and duration
- Companions
- Budget (actual vs. planned)
- Accommodation
- Highlights (best experiences)
- Photos and videos
- Would you return? (Y/N, conditional)
- Lessons learned
- Recommendations for others

### 3.5 Bucket List Board

**Pinterest-Style Grid**
- Beautiful destination photos
- Priority tags (Must-Do, Someday, Dream)
- Timeframe tags (This Year, 5 Years, Retirement)
- Budget estimates
- Travel companions
- Drag to reorder
- Add notes and inspiration
- Track progress (researching/planning/booked/completed)

---

## 4. Database Schema

### 4.1 Core Tables

#### UserProfile (Enhanced)
```prisma
model UserProfile {
  id                 String   @id @default(uuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id])

  // Existing preferences JSONB
  preferences        Json     @default("{}")

  // NEW: Structured profile data
  personalInfo       PersonalInfo?
  travelStyle        TravelStyle?
  dietary            DietaryProfile?
  accessibility      AccessibilityInfo?
  travelDocuments    TravelDocuments?

  // Relationships
  companions         TravelCompanion[]
  trips              TripMemory[]
  bucketList         BucketListItem[]
  experiences        Experience[]

  // Engagement tracking
  profileCompletion  Int      @default(0)
  lastUpdated        DateTime @updatedAt
  updateStreak       Int      @default(0)
  lastStreakDate     DateTime?

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

#### PersonalInfo
```prisma
model PersonalInfo {
  id                String   @id @default(uuid())
  profileId         String   @unique
  profile           UserProfile @relation(fields: [profileId], references: [id])

  firstName         String
  middleName        String?
  lastName          String
  preferredName     String?
  dateOfBirth       DateTime?
  gender            String?
  occupation        String?
  industry          String?

  // Location
  city              String?
  state             String?
  country           String
  timezone          String

  // Languages
  languages         Json     // [{ language: "English", proficiency: "native" }]
  culturalBackground String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### TravelStyle
```prisma
model TravelStyle {
  id                String   @id @default(uuid())
  profileId         String   @unique
  profile           UserProfile @relation(fields: [profileId], references: [id])

  budgetLevel       String   // budget/mid-range/luxury/ultra-luxury
  pacePreference    String   // slow/moderate/fast/jam-packed
  activityLevel     String   // relaxed/moderate/active/extreme
  planningStyle     String   // spontaneous/flexible/detailed/rigid

  accommodationPrefs Json    // ["hotel", "airbnb", "resort"]
  transportationPrefs Json   // ["flight", "train", "road-trip"]

  // Interests with intensity
  interests         Json     // [{ interest: "beach", intensity: 5, level: "enthusiast" }]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### TravelCompanion
```prisma
model TravelCompanion {
  id                String   @id @default(uuid())
  profileId         String
  profile           UserProfile @relation(fields: [profileId], references: [id])

  // If they're also a user
  linkedUserId      String?
  linkedUser        User?    @relation(fields: [linkedUserId], references: [id])

  // Basic info (if not a user)
  firstName         String
  lastName          String
  relationship      String   // spouse/child/parent/friend/colleague
  dateOfBirth       DateTime?

  // Travel together stats
  travelFrequency   String   // regular/occasional/rare
  decisionInfluence Int      // 1-10, how much they influence decisions

  // Their preferences (subset of main profile)
  preferences       Json
  dietary           Json?
  accessibility     Json?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([profileId])
}
```

#### TripMemory
```prisma
model TripMemory {
  id                String   @id @default(uuid())
  profileId         String
  profile           UserProfile @relation(fields: [profileId], references: [id])

  // Trip details
  destinations      Json     // [{ city: "Paris", country: "France", arrival: "2024-01-01" }]
  startDate         DateTime
  endDate           DateTime
  tripType          String   // leisure/business/family/solo/group

  // Companions
  companions        Json     // [{ id: "...", name: "..." }]

  // Experience data
  rating            Int      // 1-5
  highlights        String[] // ["Eiffel Tower", "Louvre"]
  wouldReturn       String   // yes/no/conditional
  lessonsLearned    String[]

  // Financial
  budgetPlanned     Decimal?
  budgetActual      Decimal?
  currency          String   @default("USD")

  // Media
  photos            Json?    // [{ url: "...", caption: "..." }]
  notes             String?

  // Metadata
  isPublic          Boolean  @default(false)
  shareableSlug     String?  @unique

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([profileId])
  @@index([startDate])
}
```

#### BucketListItem
```prisma
model BucketListItem {
  id                String   @id @default(uuid())
  profileId         String
  profile           UserProfile @relation(fields: [profileId], references: [id])

  destination       String
  country           String
  region            String?

  // Priority
  priority          String   // must-do/someday/dream
  timeframe         String?  // this-year/5-years/10-years/retirement

  // Planning
  status            String   @default("wishlist") // wishlist/researching/planning/booked/completed
  estimatedBudget   Decimal?
  currency          String   @default("USD")

  // Details
  companions        Json?    // Who they want to go with
  experiences       String[] // Specific things they want to do
  notes             String?
  inspiration       Json?    // Photos, articles, recommendations

  // Metadata
  position          Int      // For ordering
  dateAdded         DateTime @default(now())
  targetDate        DateTime?
  completedDate     DateTime?
  linkedTripId      String?  // If completed, link to trip

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([profileId])
  @@index([priority])
}
```

#### Experience
```prisma
model Experience {
  id                String   @id @default(uuid())
  profileId         String
  profile           UserProfile @relation(fields: [profileId], references: [id])

  experienceType    String   // activity/restaurant/hotel/event/tour
  name              String
  destination       String

  // Experience details
  date              DateTime
  rating            Int      // 1-5
  review            String?
  photos            Json?

  // Context
  tripId            String?  // Link to trip if applicable
  companions        Json?
  priceLevel        String?  // budget/moderate/expensive

  // Knowledge graph
  tags              String[] // ["romantic", "instagram-worthy", "local-favorite"]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([profileId])
  @@index([experienceType])
}
```

### 4.2 Knowledge Graph Schema

#### Graph Nodes
```typescript
type Node = {
  id: string;
  type: 'person' | 'destination' | 'interest' | 'experience' | 'provider';
  label: string;
  properties: Record<string, any>;
}
```

#### Graph Edges
```typescript
type Edge = {
  id: string;
  source: string;  // node id
  target: string;  // node id
  type: 'TRAVELS_WITH' | 'VISITED' | 'WANTS_TO_VISIT' | 'INTERESTED_IN' | 'EXPERIENCED' | 'PREFERS' | 'SIMILAR_TO';
  properties: {
    weight?: number;     // Relationship strength (0-1)
    frequency?: number;  // How often
    recency?: Date;     // Most recent occurrence
    metadata?: Record<string, any>;
  }
}
```

---

## 5. Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [x] Enhanced UserProfile schema
- [ ] Database migrations
- [ ] Seed scripts with realistic data
- [ ] Basic profile API endpoints
- [ ] Profile dashboard layout

### Phase 2: Core Features (Week 3-4)
- [ ] Personal info form
- [ ] Interest picker UI
- [ ] Travel style questionnaire
- [ ] Dietary & accessibility forms
- [ ] Profile completion tracking

### Phase 3: Family Profiles (Week 5-6)
- [ ] TravelCompanion model
- [ ] Companion CRUD operations
- [ ] Family profile cards
- [ ] Relationship management
- [ ] Shared preference detection

### Phase 4: Travel History (Week 7-8)
- [ ] TripMemory model
- [ ] Trip creation and editing
- [ ] Timeline visualization
- [ ] Photo gallery integration
- [ ] Trip export/sharing

### Phase 5: Bucket List (Week 9-10)
- [ ] BucketListItem model
- [ ] Pinterest-style grid
- [ ] Destination inspiration
- [ ] Priority management
- [ ] Progress tracking

### Phase 6: Knowledge Graph (Week 11-12)
- [ ] Graph data structure
- [ ] Relationship extraction
- [ ] Context assembly service
- [ ] AI prompt enhancement
- [ ] Similarity algorithms

### Phase 7: Engagement (Week 13-14)
- [ ] Post-trip survey flow
- [ ] Periodic check-in prompts
- [ ] Gamification system
- [ ] Streak tracking
- [ ] Achievement badges

### Phase 8: Polish & Launch (Week 15-16)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] User testing
- [ ] Documentation
- [ ] Launch!

---

## 6. Seed Data Scripts

### 6.1 Realistic User Profiles

Create diverse personas:
```typescript
const personas = [
  {
    name: "Sarah Chen",
    age: 34,
    occupation: "Product Designer",
    travelStyle: "mid-range",
    interests: ["culture", "food", "photography"],
    family: ["spouse", "2 children (ages 5, 8)"],
    history: ["Japan (2023)", "France (2022)", "Mexico (2021)"],
    bucketList: ["New Zealand", "Iceland", "Peru"]
  },
  {
    name: "Marcus Johnson",
    age: 28,
    occupation: "Software Engineer",
    travelStyle: "budget",
    interests: ["adventure", "hiking", "nightlife"],
    family: ["solo traveler"],
    history: ["Thailand (2023)", "Portugal (2022)", "Costa Rica (2021)"],
    bucketList: ["Patagonia", "Nepal", "Norway"]
  },
  // ... 8 more diverse personas
];
```

### 6.2 Trip Memories

Generate realistic trip data with:
- Seasonal patterns
- Logical destination chains
- Rating distributions
- Photo galleries (using Unsplash)
- Detailed highlights and learnings

### 6.3 Knowledge Graph Data

Build sample graph with:
- Person-to-person relationships
- Destination similarities
- Interest correlations
- Experience recommendations
- Provider preferences

---

## 7. Success Metrics

### Engagement
- Profile completion rate > 80%
- Average profile updates per month > 2
- Post-trip survey completion > 60%
- Bucket list additions per user > 5

### AI Performance
- Recommendation relevance score > 4.0/5.0
- Context utilization rate (% of profile data used in queries)
- User satisfaction with personalized results

### User Growth
- Profile feature adoption rate
- Family profile creation rate
- Referral rate from satisfied users

---

## 8. Privacy & Security

### Data Control
- Granular privacy settings
- Export all data (JSON, PDF)
- Delete account completely
- Share/hide specific sections

### Security
- Encrypted sensitive data (passport numbers, DOB)
- Audit log for all profile changes
- GDPR/CCPA compliance
- Data retention policies

### Sharing
- Public profile option (like Nomad List)
- Shareable trip links
- Anonymous comparison mode
- Family data access controls

---

## 9. Future Enhancements

### Advanced Features
- **Social Graph**: Connect with other travelers
- **Collaborative Planning**: Family voting on destinations
- **AI Chat Memory**: Remember conversations across sessions
- **Recommendation Engine**: Suggest profiles to update based on behavior
- **Travel Journal**: Auto-populated from bookings and check-ins
- **Integration**: Import from Google Maps, Instagram, Booking.com
- **Voice Input**: "I loved the street food in Bangkok" → auto-add to profile
- **Smart Defaults**: Learn from similar users to pre-fill fields

### Intelligence
- **Preference Evolution**: Track how interests change over time
- **Seasonal Preferences**: Different bucket list by season
- **Companion Compatibility**: Match scores for group trips
- **Budget Prediction**: Estimate costs based on past spending
- **Optimal Timing**: When to visit based on preferences + weather + crowds + prices

---

## 10. Technical Considerations

### Performance
- Lazy load profile sections
- Cache compiled context for frequent queries
- Optimize graph traversal algorithms
- CDN for user photos

### Scalability
- Partition graph data by user
- Efficient JSONB indexing
- Background job for heavy graph operations
- Redis cache for hot data

### Testing
- Unit tests for all profile operations
- Integration tests for graph queries
- E2E tests for profile flows
- Performance benchmarks

---

## Conclusion

This Profile & Family Knowledge Graph system will transform the Travel Assistant from a generic trip planner into a deeply personal AI companion that understands each user's unique travel DNA. By building rich context and making profile management delightful, we'll create a virtuous cycle where more engagement leads to better recommendations, which leads to more satisfied users, which leads to more engagement.

The key to success is making data entry feel like **storytelling about your travel adventures** rather than filling out forms. Every piece of information should unlock tangible value immediately.

---

**Document Version**: 1.0
**Last Updated**: 2025-01-07
**Status**: Ready for Implementation
**Next Step**: Review and approve → Build Phase 1
