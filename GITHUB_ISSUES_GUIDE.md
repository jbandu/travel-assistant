# GitHub Issues and Project Board Setup Guide

## Overview

This guide provides step-by-step instructions for setting up GitHub Issues and Project boards based on the comprehensive requirements in `REQUIREMENTS.md`.

## Quick Start: Automated Issue Creation

### Using GitHub CLI

Install GitHub CLI if not already installed:
```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
sudo apt install gh
```

Authenticate:
```bash
gh auth login
```

### Bulk Issue Creation Script

Create a script file `create_issues.sh`:

```bash
#!/bin/bash

REPO="jbandu/travel-assistant"

# Create Epic labels
gh label create "epic" --description "Epic-level feature" --color "8B5CF6" --repo $REPO
gh label create "user-story" --description "User story" --color "3B82F6" --repo $REPO
gh label create "task" --description "Development task" --color "10B981" --repo $REPO
gh label create "enhancement" --description "Enhancement or new feature" --color "F59E0B" --repo $REPO
gh label create "bug" --description "Bug or issue" --color "EF4444" --repo $REPO

# Create Sprint milestones
gh milestone create "Sprint 0: Project Initiation" --due-date "2025-11-21" --repo $REPO
gh milestone create "Sprint 1: Core Data Models" --due-date "2025-12-05" --repo $REPO
gh milestone create "Sprint 2: Trip Planning Agent" --due-date "2025-12-19" --repo $REPO
gh milestone create "Sprint 3: Flight Search Agent" --due-date "2026-01-02" --repo $REPO
gh milestone create "Sprint 4: Booking & Payment" --due-date "2026-01-16" --repo $REPO
gh milestone create "Sprint 5: Hotel Search" --due-date "2026-01-30" --repo $REPO
gh milestone create "Sprint 6: Customer 360" --due-date "2026-02-13" --repo $REPO
gh milestone create "Sprint 7: Experience Agent" --due-date "2026-02-27" --repo $REPO
gh milestone create "Sprint 8: Support Agent" --due-date "2026-03-13" --repo $REPO
gh milestone create "Sprint 9: Agent Orchestration" --due-date "2026-03-27" --repo $REPO
gh milestone create "Sprint 10: UX Polish" --due-date "2026-04-10" --repo $REPO
gh milestone create "Sprint 11: Disruption Management" --due-date "2026-04-24" --repo $REPO
gh milestone create "Sprint 12: Beta Launch" --due-date "2026-05-08" --repo $REPO

echo "Labels and milestones created successfully!"
```

Run the script:
```bash
chmod +x create_issues.sh
./create_issues.sh
```

## Manual Issue Creation

### Epic 1: Trip Planning and Destination Intelligence

```bash
gh issue create \
  --repo jbandu/travel-assistant \
  --title "EPIC: Trip Planning and Destination Intelligence" \
  --label "epic" \
  --body "## Business Value
Enable travelers to discover and plan personalized trips through conversational AI, reducing planning friction and increasing booking conversion rates.

## User Stories
- [ ] Destination Discovery
- [ ] Intelligent Itinerary Generation
- [ ] Multi-Destination Routing
- [ ] Budget Modeling and Forecasting

## Success Metrics
- User engagement: > 10 minutes per planning session
- Itinerary completion rate: > 60%
- Conversion to booking: > 15%

## Dependencies
- LLM integration (OpenAI/Anthropic)
- Destination knowledge base
- User profile data model

## Target Completion
Sprint 2"
```

### User Story 1.1: Destination Discovery

```bash
gh issue create \
  --repo jbandu/travel-assistant \
  --title "User Story: Destination Discovery" \
  --label "user-story" \
  --milestone "Sprint 2: Trip Planning Agent" \
  --body "## User Story
**As a** traveler
**I want to** explore destination possibilities through conversational discovery based on my interests, budget, and travel style
**So that** I can discover new places that match my preferences without hours of manual research

## Acceptance Criteria
- [ ] User can input travel preferences (budget, interests, travel dates, party size)
- [ ] Agent generates 3-5 destination recommendations with justification
- [ ] Recommendations account for seasonal factors (weather, peak/off-peak pricing, local events)
- [ ] User can ask follow-up questions to refine recommendations
- [ ] System stores preference data for future personalization

## Technical Notes
- Use OpenAI GPT-4 or Anthropic Claude for recommendation generation
- Implement prompt engineering framework for consistent outputs
- Create destination attributes database (climate, attractions, budget ranges)
- Store user preferences in user_profiles table

## Design Assets
- Wireframes: [Link to Figma/design tool]
- Conversational flow diagram: [Link]

## Definition of Done
- [ ] Code complete and peer reviewed
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests with LLM provider passing
- [ ] User acceptance testing completed
- [ ] Documentation updated (API docs, user guide)
- [ ] Product Owner acceptance

**Story Points:** 8
**Epic:** #[epic-issue-number]"
```

### Task Example: LLM Integration

```bash
gh issue create \
  --repo jbandu/travel-assistant \
  --title "Task: Implement LLM Integration Layer" \
  --label "task" \
  --milestone "Sprint 2: Trip Planning Agent" \
  --body "## Description
Create abstraction layer for LLM API integration supporting both OpenAI and Anthropic providers.

## Steps
1. Create LLM client factory with provider selection (OpenAI/Anthropic)
2. Implement API request/response handling with retry logic
3. Add prompt template management system
4. Implement response parsing and validation
5. Add error handling and fallback mechanisms
6. Create unit tests for each provider

## Acceptance Criteria
- [ ] Support both OpenAI GPT-4 and Anthropic Claude
- [ ] Configurable via environment variables
- [ ] Response time < 3 seconds for 95th percentile
- [ ] Graceful error handling with user-friendly messages
- [ ] Unit test coverage > 85%

## Technical Specifications
- Use axios or fetch for HTTP requests
- Implement exponential backoff for rate limiting
- Add request/response logging for debugging
- Create TypeScript interfaces for type safety

**Estimated Effort:** 8 hours
**Assigned To:** @[username]
**Parent Story:** #[story-issue-number]"
```

## GitHub Project Board Setup

### Creating Project Board

1. Navigate to your repository
2. Click "Projects" tab
3. Click "New project"
4. Select "Board" view
5. Name it "Travel Assistant - MVP Development"

### Board Columns

Create the following columns:
1. **Backlog** - Prioritized items not yet in sprint
2. **Sprint Ready** - Items ready for current sprint
3. **In Progress** - Active development
4. **In Review** - Code review and QA
5. **Done** - Completed and deployed

### Automation Rules

Set up automation:
- Move to "In Progress" when issue assigned
- Move to "In Review" when PR created
- Move to "Done" when PR merged

### Using GitHub CLI for Projects

```bash
# List projects
gh project list --owner jbandu

# Create project
gh project create --owner jbandu --title "Travel Assistant - MVP"

# Add issue to project
gh project item-add [PROJECT_NUMBER] --owner jbandu --url https://github.com/jbandu/travel-assistant/issues/[ISSUE_NUMBER]
```

## Python Script for Bulk Issue Creation

Create `scripts/create_github_issues.py`:

```python
#!/usr/bin/env python3
import os
import json
from github import Github

# Initialize GitHub client
g = Github(os.getenv('GITHUB_TOKEN'))
repo = g.get_repo('jbandu/travel-assistant')

# Epic definitions
epics = [
    {
        'title': 'EPIC: Trip Planning and Destination Intelligence',
        'labels': ['epic'],
        'body': '''## Business Value
Enable travelers to discover and plan personalized trips through conversational AI.

## User Stories
- Destination Discovery
- Intelligent Itinerary Generation
- Multi-Destination Routing
- Budget Modeling and Forecasting

## Success Metrics
- User engagement: > 10 minutes per session
- Conversion to booking: > 15%
'''
    },
    {
        'title': 'EPIC: Intelligent Search & Booking',
        'labels': ['epic'],
        'body': '''## Business Value
Streamline search-to-booking funnel with preference-aware recommendations.

## User Stories
- Preference-Based Flight Search
- Multi-Source Flight Aggregation
- Integrated Seat Selection
- Contextual Hotel Matching
- Streamlined Payment Processing

## Success Metrics
- Search response time: < 2 seconds
- Booking conversion rate: > 8%
'''
    },
    # Add more epics...
]

# User stories for Epic 1
user_stories_epic1 = [
    {
        'title': 'User Story: Destination Discovery',
        'labels': ['user-story'],
        'milestone': 'Sprint 2: Trip Planning Agent',
        'body': '''**As a** traveler
**I want to** explore destination possibilities
**So that** I can discover new places matching my preferences

## Acceptance Criteria
- [ ] User can input travel preferences
- [ ] Agent generates 3-5 recommendations
- [ ] Seasonal factors considered
- [ ] Follow-up questions supported
- [ ] Preferences stored for personalization

**Story Points:** 8
'''
    },
    # Add more user stories...
]

# Create epics
for epic_data in epics:
    issue = repo.create_issue(
        title=epic_data['title'],
        body=epic_data['body'],
        labels=epic_data['labels']
    )
    print(f"Created epic: {issue.html_url}")

# Create user stories
for story_data in user_stories_epic1:
    milestone = repo.get_milestone(number=2)  # Sprint 2
    issue = repo.create_issue(
        title=story_data['title'],
        body=story_data['body'],
        labels=story_data['labels'],
        milestone=milestone
    )
    print(f"Created user story: {issue.html_url}")

print("\nAll issues created successfully!")
```

Run the script:
```bash
export GITHUB_TOKEN="your_personal_access_token"
python scripts/create_github_issues.py
```

## Labels Reference

| Label | Color | Description |
|-------|-------|-------------|
| epic | #8B5CF6 (purple) | Epic-level feature group |
| user-story | #3B82F6 (blue) | User story with acceptance criteria |
| task | #10B981 (green) | Development task |
| enhancement | #F59E0B (yellow) | New feature or enhancement |
| bug | #EF4444 (red) | Bug or defect |
| documentation | #6B7280 (gray) | Documentation update |
| technical-debt | #F97316 (orange) | Technical debt or refactoring |
| blocked | #DC2626 (dark red) | Blocked by dependency |
| high-priority | #BE123C (crimson) | High priority item |
| good-first-issue | #7C3AED (violet) | Good for newcomers |

## Issue Templates

### Creating Issue Templates

Create `.github/ISSUE_TEMPLATE/` directory with the following files:

#### 1. User Story Template (`.github/ISSUE_TEMPLATE/user_story.md`)

```markdown
---
name: User Story
about: Create a user story with acceptance criteria
title: 'User Story: [Title]'
labels: user-story
assignees: ''
---

## User Story

**As a** [user persona]
**I want to** [action]
**So that** [benefit/value]

## Acceptance Criteria

- [ ] AC 1: [Description]
- [ ] AC 2: [Description]
- [ ] AC 3: [Description]

## Technical Notes

[Any technical implementation details, API dependencies, data model changes]

## Design Assets

[Links to mockups, wireframes, design specs]

## Definition of Done

- [ ] Code complete and peer reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Product Owner acceptance

**Story Points:** [1, 2, 3, 5, 8, 13]
**Sprint:** [Sprint number]
**Epic:** #[epic-issue-number]
```

#### 2. Bug Report Template (`.github/ISSUE_TEMPLATE/bug_report.md`)

```markdown
---
name: Bug Report
about: Report a bug or issue
title: 'Bug: [Title]'
labels: bug
assignees: ''
---

## Bug Description

[Clear description of the bug]

## Severity

[Critical / High / Medium / Low]

## Environment

- Environment: [Production / Staging / Development]
- Browser: [Chrome 120, Safari 17, etc.]
- Device: [Desktop, Mobile, Tablet]
- OS: [Windows 11, macOS 14, iOS 17, etc.]

## Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Screenshots/Logs

[Attach relevant screenshots or log excerpts]

## Additional Context

[Any additional information]

**Priority:** [P0 / P1 / P2 / P3]
```

#### 3. Task Template (`.github/ISSUE_TEMPLATE/task.md`)

```markdown
---
name: Task
about: Create a development task
title: 'Task: [Title]'
labels: task
assignees: ''
---

## Description

[Detailed description of the task]

## Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Technical Notes

[Implementation details, dependencies, considerations]

**Estimated Effort:** [Hours/Days]
**Assigned To:** @[username]
**Parent Story:** #[story-issue-number]
```

## Sprint Planning Workflow

### Sprint Planning Meeting

1. **Review Backlog** (30 minutes)
   - Product Owner presents prioritized backlog
   - Team asks clarification questions
   - Estimate story points using planning poker

2. **Sprint Goal Setting** (15 minutes)
   - Define sprint goal (e.g., "Deliver functional Trip Planning Agent")
   - Align on success criteria

3. **Capacity Planning** (15 minutes)
   - Calculate team velocity from previous sprints
   - Account for holidays, PTO, meetings
   - Commit to sprint backlog

4. **Task Breakdown** (30 minutes)
   - Break user stories into tasks
   - Assign initial task owners
   - Identify blockers and dependencies

### Daily Standup Format

**Each team member answers:**
1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers or impediments?

**Update GitHub Project Board:**
- Move cards to reflect current status
- Add comments for important updates
- Tag team members for collaboration

### Sprint Review

**Agenda:**
1. Demo completed user stories (20 minutes)
2. Product Owner acceptance (10 minutes)
3. Stakeholder feedback (15 minutes)
4. Backlog refinement for next sprint (15 minutes)

### Sprint Retrospective

**Format (30 minutes):**
1. What went well?
2. What could be improved?
3. Action items for next sprint

**Document in GitHub:**
- Create issue with label "retrospective"
- Tag action items with responsible owners

## Best Practices

### Writing Good Issues

✅ **Good Example:**
```
Title: User Story: Preference-Based Flight Search

Body:
As a traveler, I want to search for flights with intelligent ranking
based on my preferences, so that I see the most relevant options first.

Acceptance Criteria:
- [ ] User can set preference weights (price, duration, airline)
- [ ] Results ranked by weighted scoring algorithm
- [ ] Preference weights adjustable in real-time
- [ ] System learns from booking history

Story Points: 5
Sprint: Sprint 3
```

❌ **Bad Example:**
```
Title: Flights

Body:
Make flight search work
```

### Issue Hygiene

1. **Keep Issues Updated**
   - Add progress comments
   - Update status labels
   - Link related PRs

2. **Close Completed Issues**
   - Use "Fixes #123" in PR description
   - Add closure comment with resolution summary

3. **Link Related Issues**
   - Use "Related to #456"
   - Use "Blocked by #789"

4. **Use Checklists**
   - Break down acceptance criteria
   - Track sub-tasks within issue

## Troubleshooting

### GitHub CLI Not Working

```bash
# Check authentication
gh auth status

# Re-authenticate
gh auth refresh

# Check permissions
gh api user
```

### PyGithub Script Issues

```bash
# Install dependencies
pip install PyGithub

# Check token permissions
# Token needs 'repo' scope

# Test connection
python -c "from github import Github; g = Github('YOUR_TOKEN'); print(g.get_user().login)"
```

---

**Ready to create your issues!** 🚀

For questions or assistance, open an issue in the repository.
