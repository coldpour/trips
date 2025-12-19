# FunTrips Application - UI Documentation

## Overview
FunTrips is a trip planning and comparison application that helps users evaluate vacation options by calculating a "score" based on fun factor vs. cost. The app allows users to organize trips into lists, share them with others, and make data-driven decisions about their travel plans.

---

## Pages & Routes

### 1. **Landing Page / Login** (`/`)
**When:** User is not authenticated

#### UI Elements:
- **Hero Section**: "FunTrips" heading
- **Login Form**:
  - Email input field (autofocused)
  - Password input field
  - "Log in" button
  - Error messages display area
- **Registration Link**: "Are you new here?" with "Create account" link
- **Footer Links**:
  - GitHub link (opens in new tab)
  - Email feedback link

#### User Actions:
- Enter email and password to log in
- Click "Create account" to navigate to registration
- Access feedback channels via GitHub or email

#### Value to User:
- Quick access to their trip planning data
- Simple authentication flow
- Clear path to account creation
- Community feedback channels visible upfront

---

### 2. **Registration Page** (`/register`)
**When:** User wants to create a new account

#### UI Elements:
- **Registration Form**:
  - Email input field (autofocused)
  - Password input field
  - "Create account" button
  - Error display area
- **Login Link**: "Pick up where you left off" with "Login" link

#### User Actions:
- Enter email and password to create account
- Navigate back to login if already have account

#### Value to User:
- Easy onboarding process
- Immediate access after registration

---

### 3. **Trips List Page** (`/`) 
**When:** User is authenticated

#### UI Elements:

**Left Sidebar:**
- **"All Trips" item**: Shows total trip count
- **"TRIP LISTS" section**:
  - List of user-created trip lists with trip counts
  - "+ New List" button
  - Per-list hover actions (appears on mouse over):
    - Share button (📤 or 🔗 if already shared)
    - Lock button (🔒 - only if shared, to revoke access)
    - Rename button (✏️)
    - Delete button (🗑️)
  - Inline editing for list name creation/editing

**Main Content Area:**
- **Header**:
  - User email display
  - "Sign Out" button
  - Feedback links (GitHub, email)
- **Controls Bar**:
  - "Plan" button (navigates to create new trip)
  - Filter input field (search by trip name)
  - Sort dropdown (Score, Name, Cost)
- **Trip Cards Grid**: List of trip summary cards

**Trip Summary Card (per trip):**
- Trip name
- Score (calculated value)
- Fun rating (0-10)
- Number of nights
- Total cost (formatted currency)
- Action buttons on right:
  - Move to list dropdown (select which list)
  - Duplicate button
  - Delete button

#### User Actions:
- **Navigation**: Click any trip card to view/edit details
- **Filtering**: Search trips by name
- **Sorting**: Sort by score (default), name, or cost
- **List Management**:
  - Select "All Trips" or specific list to filter view
  - Create new trip list
  - Rename existing lists
  - Delete lists (trips move to "All Trips")
  - Share lists (generates shareable link, copies to clipboard)
  - Revoke share access
- **Trip Management**:
  - Move trips between lists via dropdown
  - Duplicate trips
  - Delete trips
- **Create New**: Click "Plan" to start planning new trip

#### Value to User:
- **Overview**: See all trips at a glance with key metrics
- **Organization**: Group related trips into lists (e.g., "Summer 2024", "Europe Options")
- **Comparison**: Quickly compare trips using score/cost sorting
- **Collaboration**: Share trip lists with family/friends for group planning
- **Efficiency**: Duplicate similar trips to save data entry time
- **Flexibility**: Easy filtering and sorting to find specific trips

---

### 4. **Create Trip Page** (`/new`)
**When:** User clicks "Plan" button

#### UI Elements:

**Form Sections:**

**Basic Information:**
- Trip name input (text)
- Arrive date picker
- Depart date picker
- Nights input (auto-calculated from dates, or manually entered)

**Travelers:**
- Adults count input
- Children count input
- **Calculated display**: "People: X"

**Travel Costs:**
- **Search Integration**: "Search Flights" link (opens Google Flights with pre-filled search)
- Flight cost per seat input
- Taxi or rental car total input
- **Calculated display**: "Travel: $X,XXX"

**Lodging:**
- **Search Integrations**:
  - "Search Airbnb" link (opens Airbnb with pre-filled search)
  - "Search Hotels" link (opens Hotels.com with pre-filled search)
- Lodging per person per night input
- Lodging per night input
- Lodging total input
- Lodging URL input (optional)
- Clickable link to open lodging URL
- **Calculated display**: "Lodging: $X,XXX"

**Activities & Other:**
- Entertainment total input
- Ski pass per day input (multiplied by nights × travelers)
- Childcare total input

**Trip Evaluation:**
- **Calculated display**: "Cost: $X,XXX"
- Fun rating input (0-10 scale, constrained)
- **Calculated display**: "Score: XXX"
- **Score Comparison Visualization**: Visual number line showing current trip's score relative to all other trips

**Actions:**
- "Back" link (top)
- "Save" button (bottom, disabled while saving)

#### User Actions:
- Enter trip details across multiple categories
- Choose between date ranges OR number of nights
- Use integrated search links to research flights, Airbnb, and hotels
- Input costs in various formats (per person/per night, totals)
- Rate anticipated fun level
- Save trip to database

#### Value to User:
- **Structured Input**: Guided form ensures all cost factors are considered
- **Flexible Data Entry**: Multiple ways to enter lodging costs (total, per night, per person per night)
- **Search Integration**: Direct links to travel search engines with pre-filled parameters saves time
- **Real-time Calculations**: See total costs and score update as you type
- **Comparison Context**: Score visualization shows how this trip compares to past/other trips
- **Decision Making**: Score formula (fun × 10000 / cost) helps quantify value
- **Reference Links**: Save lodging URLs for later booking

---

### 5. **Trip Detail/Edit Page** (`/:tid`)
**When:** User clicks on a trip card

#### UI Elements:
Identical to Create Trip page, but with:
- Pre-filled form fields with existing trip data
- "Back" link at top and bottom
- All same inputs and calculations
- Score comparison visualization

#### User Actions:
- Edit any trip details
- Use search links to re-research options
- Update fun rating based on actual experience
- Save changes
- Navigate back to trips list

#### Value to User:
- **Trip Refinement**: Update trips as plans solidify or prices change
- **Post-Trip Updates**: Record actual fun level after trip completion
- **Historical Record**: Maintain accurate trip database for future reference
- **Iterative Planning**: Adjust and re-evaluate options before committing

---

### 6. **Shared Trip List View** (`/shared/:shareToken`)
**When:** Non-owner accesses shared trip list link

#### UI Elements:
- **Read-only Banner**: "📋 You're viewing a shared trip list (read-only)"
- **Header**: Trip list name and trip count
- **Controls**:
  - Filter input (search by name)
  - Sort dropdown (Score, Name, Cost)
- **Trip Cards**: Clickable cards showing:
  - Trip name
  - Score
  - Fun rating
  - Nights
  - Cost

#### User Actions:
- Browse shared trips
- Filter and sort trips
- Click trip card to view details
- No editing or deletion capabilities

#### Value to User:
- **Collaboration**: View trips someone has shared with you
- **Group Planning**: Family/friends can see and discuss trip options
- **No Account Needed**: Recipients don't need to create account
- **Same Analysis Tools**: Can still filter/sort to compare options

---

### 7. **Shared Trip Detail View** (`/shared/:shareToken/:tripId`)
**When:** User clicks trip in shared list

#### UI Elements:
- **Read-only Banner**: Same as shared list view
- **Trip Details Form**: All fields visible but disabled (greyed out)
  - All same sections as editable trip view
  - All calculations displayed
  - Score comparison visualization included
  - Lodging URL clickable if present
- **"Back" button**: Returns to shared trip list

#### User Actions:
- View all trip details in read-only mode
- See all cost breakdowns and calculations
- View score comparison
- Click lodging URL to view property
- Cannot edit or save changes

#### Value to User:
- **Transparency**: See complete trip breakdown
- **Informed Discussion**: All cost factors visible for group decision-making
- **Reference Material**: Access lodging links and details
- **No Data Loss Risk**: Read-only prevents accidental changes

---

## Key UI Components

### Score Comparison Visualization
**Appears on:** Create Trip, Edit Trip, Shared Trip Detail

#### Visual Design:
- Horizontal number line with grey background
- Lowest score trip labeled on left
- Highest score trip labeled on right
- Current trip marked with colored dot on the line
- Current trip score displayed above dot
- Position calculated proportionally between min/max

#### Value to User:
- **Visual Context**: Immediately see if trip is good/bad value
- **Relative Comparison**: Understand where trip ranks among all options
- **Quick Decision Making**: Visual is faster than comparing raw numbers

---

### Trip List Management
**Appears on:** Trips List Page (left sidebar)

#### Features:
- Collapsible organization system
- Trip count badges
- Hover-based action buttons
- Inline editing for rename
- Share link generation and copy
- Share link revocation

#### Value to User:
- **Organization**: Group related trips (by season, destination, year)
- **Sharing**: Send specific lists to relevant people
- **Privacy Control**: Revoke access when needed
- **Clean Interface**: Actions hidden until needed (hover)

---

### Search Integration Links
**Appears on:** Create Trip, Edit Trip pages

#### Conditional Display:
- **Flights**: Shown when name, arrive, depart, and adults are filled
- **Airbnb**: Shown when name, nights, and people count are filled
- **Hotels**: Shown when name, arrive, depart, and adults are filled

#### Functionality:
- Opens in new tab
- Pre-fills search parameters from trip data
- Uses trip name as destination

#### Value to User:
- **Time Savings**: Don't re-enter information on travel sites
- **Workflow Integration**: Seamlessly research while planning
- **Accuracy**: Pre-filled data reduces search errors

---

## Data Model Summary

### Trip Object
Contains:
- **Identity**: name, dates (arrive/depart), nights
- **Travelers**: adults, children counts
- **Travel Costs**: flight per seat, taxi/rental car
- **Lodging**: Multiple input options (total, per night, per person/night), URL
- **Activities**: entertainment, ski passes, childcare
- **Evaluation**: fun rating (0-10)
- **Organization**: trip_list_id (which list it belongs to)

### Calculated Values:
- **Total Travelers**: adults + children
- **Total Nights**: From dates OR manual input
- **Travel Total**: (flight × travelers) + taxi
- **Lodging Total**: Uses first non-zero: total, (per night × nights), (per person/night × travelers × nights)
- **Other Expenses**: (ski pass × nights × travelers) + childcare + entertainment
- **Total Cost**: Travel + Lodging + Other
- **Score**: (fun × 10000) / total cost

---

## Key User Workflows

### 1. Planning a Trip
1. Log in
2. Click "Plan"
3. Enter trip name and dates
4. Enter traveler counts
5. Click "Search Flights" to research airfare
6. Enter flight costs
7. Click "Search Airbnb" or "Search Hotels"
8. Enter lodging costs and save URL
9. Enter activity costs
10. Rate expected fun level
11. Review score comparison
12. Save trip

### 2. Comparing Multiple Trips
1. Create/enter multiple trip options
2. Return to trips list
3. Sort by "Score" (default) to see best value
4. Sort by "Cost" to see cheapest options
5. Sort by "Name" for alphabetical view
6. Click individual trips to review details
7. Use score comparison to understand relative value

### 3. Organizing Trips
1. Click "+ New List" in sidebar
2. Name the list (e.g., "Summer 2025")
3. Use dropdown on trip cards to move trips into list
4. Click list name to filter view to just that list
5. Create multiple lists for different planning scenarios

### 4. Sharing with Others
1. Create a trip list
2. Add relevant trips to the list
3. Hover over list name
4. Click share button (📤)
5. Link auto-copies to clipboard
6. Share link via message/email
7. Recipients view read-only version without account

### 5. Duplicating Similar Trips
1. From trips list, click "duplicate" on existing trip
2. New trip created with "(copy)" suffix
3. Edit the copy to adjust details
4. Compare scores to choose best option
5. Delete less desirable option

---

## Design Patterns & UX Decisions

### Progressive Disclosure
- Trip list actions appear on hover (reduces clutter)
- Search links only appear when enough data entered (guides workflow)
- Score comparison only shows when multiple trips exist

### Flexible Input
- Multiple lodging cost entry methods (total, per night, per person)
- Choose dates OR nights (whichever is easier)
- All numeric fields optional (can be added later)

### Real-time Feedback
- Calculations update as user types
- Score updates immediately
- People count and totals always visible

### Integration Over Recreation
- Direct links to travel sites vs. building search UI
- Leverage existing tools users already trust
- Pre-fill parameters to save time

### Read-only Sharing
- No account required for recipients
- Original owner maintains control
- Can revoke access anytime
- Clear visual indicators of read-only state

---

## Value Proposition Summary

**For Individual Users:**
- Quantify and compare vacation value objectively
- Track all cost factors in one place
- Access integrated travel search tools
- Maintain historical trip database

**For Groups/Families:**
- Share trip options for group decision-making
- Transparent cost breakdowns build consensus
- Everyone sees same comparison data
- No account needed for all participants

**For Decision Making:**
- Score formula provides objective comparison
- Visual score comparison enables quick assessment
- Sort and filter help narrow options
- Duplicate trips to explore variations

**For Organization:**
- Trip lists group related options
- Easy to move trips between lists
- Filter views to focus on relevant trips
- Archive past trips for future reference

---

## Technical Notes for Redesign

### Current Tech Stack:
- React with TypeScript
- React Router for navigation
- TanStack Query for data fetching
- Supabase for backend/auth
- Form-based data entry

### Key Considerations:
- Mobile responsiveness not heavily emphasized in current design
- Forms are quite long (could benefit from progressive disclosure)
- Score calculation is central to value proposition
- Sharing feature is powerful but may be underutilized
- Search integrations are subtle (could be more prominent)
