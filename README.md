# MyPath – Personal Learning Roadmap & Analytics Platform (Phases 1–5)

**MyPath** is a modern, developer-centric personal learning roadmap platform, Learning Management System, and Learning Analytics Dashboard inspired by [roadmap.sh](https://roadmap.sh) and Linear. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, React Flow (`@xyflow/react`), Recharts, and MongoDB Atlas (via Mongoose), it allows developers to architect, visualize, connect, track, and master technical curriculums.

---

## 🎨 Design System & Color Palette

MyPath features a premium dark developer interface built around four primary color tokens:

| Color                  | Hex Code  | Usage                                                                        |
| ---------------------- | --------- | ---------------------------------------------------------------------------- |
| **Primary Background** | `#191A19` | Main application canvas, page backgrounds                                    |
| **Secondary Green**    | `#1E5128` | Sidebar navigation, secondary surfaces, cards                                |
| **Accent Green**       | `#4E9F3D` | Primary action buttons, active states, connection lines, progress highlights |
| **Light Green**        | `#D8E9A8` | Key numerical stats, node badges, milestone accents, headers                 |

---

## 🚀 Key Modules Across Phases

### Phase 1: Full-Stack Roadmap Platform

- **MongoDB Atlas & Mongoose**: Full CRUD for learning roadmaps with typed schemas and validation.
- **Dashboard Hub (`/dashboard`)**:
  - Live statistics: Total Roadmaps, Completed Topics, Topics in Progress, Learning Hours.
  - Weekly learning activity visualization using Recharts.
  - Recent roadmaps grid with progress indicators.
- **Roadmap Management (`/roadmaps`)**: Search, filter by category/difficulty, sort by title/updatedAt/progress.
- **Curriculum Creation (`/roadmaps/create`)**: Multi-step roadmap creation with presets and icon picker.

---

### Phase 2: Interactive Roadmap Visual Engine

- **Full Screen Canvas (`/roadmaps/[id]/editor`)**: Edge-to-edge React Flow workspace (`@xyflow/react`) with dotted grid, custom handles, controls, and MiniMap.
- **Top Toolbar**: Inline title editing, live save status indicators (`Saved`, `Saving...`, `Unsaved changes`), undo/redo history, zoom/fit-view, auto-layout, and PNG/JSON export.
- **Draggable Node Library**: Topic, Subtopic, Milestone, Project, Resource, Assessment cards draggable onto canvas coordinates.
- **Graph Connection Engine**: Smooth step directional edges ($A \to B$ prerequisite flow) with BFS cycle detection.
- **Starter Templates**: Frontend, Backend, AI Engineer, Machine Learning, and Blank canvas.
- **Autosave & Viewport Persistence**: Real-time debounce synchronization to MongoDB.

---

### Phase 3: Learning Management System (LMS)

- **Granular Progress**: Every roadmap node supports 4 statuses (_Not Started_, _In Progress_, _Completed_, _On Hold_) and percentage milestones (_0%_, _25%_, _50%_, _75%_, _100%_).
- **Personal Notes System (`/notes` & `/notes/[id]`)**: Full Markdown editor with live Write/Preview tabs, debounced autosave, and topic linking.
- **Learning Resources Catalog (`/resources`)**: 8 resource types, ratings, favorite toggles, and roadmap topic linking.
- **Milestones & Deadlines Tracker (`/milestones` & `/calendar`)**: Priority badges, overdue alerts, and interactive monthly grid.
- **Daily Learning Goals (`/daily-goals`)**: Target study minutes, daily task checklist, and progress gauge.
- **Study Tracker & Focus Sessions (`/study-session`)**: Interactive live Pomodoro timer, reflection logs, manual offline logging, and study history.
- **6-Tab Node Inspector**: Comprehensive inspector integrated into the visual roadmap canvas.

---

### Phase 4: Learning Analytics Dashboard

#### 1. Executive Analytics Dashboard (`/analytics`)

- **Interactive Global Filters**:
  - Date Range Presets: Last 7 days, Last 30 days, Last 90 days, This year, All time, Custom start/end range.
  - Roadmap Selector: Filter analytics for all roadmaps or isolate an individual curriculum.
  - Period Toggle: Daily, Weekly, or Monthly aggregation buckets.
  - Instant Data Refresh and real-time state synchronization.

#### 2. Six Primary Overview KPI Cards

1. **Total Learning Hours**: Actual study hours with previous period comparison, % change indicator, and trend direction.
2. **Topics Completed**: Eligible learning topics mastered vs. total available, with completion percentage.
3. **Active Roadmaps**: Real-time breakdown of active, completed, and paused curriculums.
4. **Current Learning Streak**: Consecutive active learning days, all-time record streak, and dynamic badge achievement.
5. **Daily Average**: Average daily focus minutes (fairly computed across all calendar days, including zero-activity days) and weekly equivalent hours.
6. **Goal Completion Rate**: Daily and weekly goal achievement rates (completed vs. missed goals).

#### 3. Learning Hours Analytics

- **Weekly Learning Hours Chart**: Recharts bar chart showing hours invested Monday through Sunday with hover tooltips.
- **Monthly / Periodic Learning Trend**: Area chart showing study velocity across daily, weekly, or monthly periods.
- **Learning Distribution Donut Chart**: Proportional breakdown of hours by roadmap, featuring total hours displayed in the center.
- **Activity Heatmap**: GitHub-style activity matrix with 3-month, 6-month, and 12-month switcher, color intensity levels, and click-to-inspect day drawer.

#### 4. Roadmap Completion Analytics

- **Curriculum Mastery List**: Detailed roadmap cards with completed/in-progress/remaining topics, completion bars, and estimated vs. actual hours invested.
- **Highlights**: Top-performing roadmap, lowest-progress active roadmap, and recently updated roadmap.
- **Topic Status Distribution**: Donut chart tracking _Not Started_, _In Progress_, _Completed_, and _On Hold_ topics.
- **Topic Completion Velocity**: Line chart illustrating milestones mastered over time.

#### 5. Weekly Progress & Comparison

- **Weekly Summary**: Target study hours vs. actual hours, remaining time, topics finished, and session count.
- **Current vs. Previous Week Comparison**: Grouped bar chart comparing Monday through Sunday.
- **Data-Driven Insights**: Most productive weekday, least active day, most focused curriculum, and percentage change.

#### 6. 12-Month Contribution Calendar (`/analytics/activity`)

- **Annual Matrix**: Full 365-day grid tracking learning intensity with local timezone boundary safety.
- **Activity Filters**: All activity, study sessions only, or topic completions only.
- **Day Inspection Drawer**: Click any day square to inspect logged study sessions, reflections, topics studied, roadmaps worked on, daily tasks completed, and notes authored.

#### 7. Study Habit Analytics

- **Peak Alertness Windows**: Morning (`05:00 - 12:00`), Afternoon (`12:00 - 17:00`), and Evening (`17:00 - 05:00`) proportional distribution.
- **Behavioral Metrics**: Average session duration, longest focus block, and most productive weekday.

#### 8. Exporting & Reporting

- **Export as CSV**: Generates a spreadsheet containing dates, roadmaps, topics, duration, session count, and status.
- **Printable Executive Report**: Formatted PDF / print-friendly dashboard layout.

#### 2. Personal Notes System (`/notes` & `/notes/[id]`)

- **Full Markdown Editor**: Headers, lists, bold, italics, code blocks, blockquotes, and links with real-time Write/Preview toggle.
- **Debounced Autosave**: Drafts and edits automatically persist to MongoDB with live saving status indicators.
- **Curriculum Linking**: Notes can be linked directly to specific roadmaps and individual roadmap nodes.
- **Filtering & Search**: Filter notes by search keywords, roadmap, or tags.

#### 3. Learning Resources Catalog (`/resources`)

- **8 Resource Types**: YouTube videos, Documentation, Online courses, Books, Articles, GitHub repositories, PDFs, and Other.
- **Curated Metadata**: Title, URL validation, author/creator, description, tags, star ratings (1 to 5), and favorite flags.
- **State Transitions**: Toggle between _Pending_, _In Progress_, and _Completed_.
- **Topic Attachment**: Direct modal insertion from the roadmap editor inspector or global catalog.

#### 4. Milestones & Deadlines Tracker (`/milestones` & `/calendar`)

- **Milestones Hub (`/milestones`)**: Filter by status (_Upcoming_, _In Progress_, _Completed_, _Overdue_) and priority (_High_, _Medium_, _Low_).
- **Overdue Detection**: Automatically checks target dates against the current date and flags overdue items.
- **Monthly Interactive Calendar (`/calendar`)**: Month/Year navigation, day cells showing scheduled deadlines, overdue badges in red, and quick completion dialogs.

#### 5. Daily Learning Goals (`/daily-goals`)

- **Daily Target Hours**: Set and adjust daily target study minutes (30m, 60m, 90m, 120m, 180m).
- **Task Checklist**: Create daily tasks, attach roadmap contexts, check off tasks, and add time increments (+15m, +30m).
- **Progress Gauge**: Real-time progress bar and percentage of daily study target achieved.

#### 6. Study Tracker & Focus Sessions (`/study-session`)

- **Interactive Live Pomodoro Timer**: Play, pause, resume, and finish study sessions.
- **Session Durations**: Duration calculated from server timestamps to prevent data loss across browser reloads.
- **Reflection & Notes**: Post-session reflection modal to record key takeaways and active recall notes.
- **Manual Offline Logging**: Log offline reading sessions, physical books, or offline coding retroactively.
- **History Log**: Searchable and filterable history of all study sessions with duration, dates, and reflections.

#### 7. Integrated Roadmap Node Inspector

- Six-tab inspector panel when selecting any node in `/roadmaps/[id]/editor`:
  1. `[Overview]`: Metadata, difficulty, priority, estimated hours, prerequisites, duplication, deletion.
  2. `[Progress]`: Quick 0%, 25%, 50%, 75%, 100% buttons, status pills, and focus timer launcher.
  3. `[Notes]`: Inline note creation and topic-specific note list.
  4. `[Resources]`: Curated external links, star ratings, and one-click launch.
  5. `[Deadlines]`: Milestones and target completion dates for this node.
  6. `[History]`: Study sessions logged specifically for this topic.

#### 8. Enhanced Dashboard LMS Widgets

- **Today's Focus Goal Widget**: Daily target completion bar, remaining minutes, and direct link to daily checklist.
- **Learning Streak Counter**: Current and all-time longest consecutive study streaks.
- **Upcoming Deadlines**: Top 5 upcoming milestones with priority and overdue alerts.
- **Recent Notes & Study Sessions**: Direct access to recently written notes and logged study intervals.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Canvas Engine**: React Flow (`@xyflow/react` v12)
- **Database & ODM**: MongoDB Atlas / Mongoose
- **Image Generation**: `html-to-image`
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

---

## 📂 Project Directory Structure

```text
├── app/
│   ├── analytics/           # Analytics & learning trends
│   ├── api/                 # Next.js App Router API Routes
│   │   ├── dashboard/       # Stats, activity, and LMS overview
│   │   ├── goals/daily/     # Daily goals CRUD
│   │   ├── milestones/      # Milestones & deadlines CRUD
│   │   ├── notes/           # Personal notes CRUD
│   │   ├── progress/        # Topic progress tracking
│   │   ├── resources/       # Learning resources CRUD
│   │   ├── roadmaps/        # Roadmaps & React Flow graphs CRUD
│   │   └── sessions/        # Study sessions timer & log CRUD
│   ├── calendar/            # Deadlines calendar view
│   ├── daily-goals/         # Daily learning goals interface
│   ├── dashboard/           # Main executive dashboard
│   ├── milestones/          # Milestones list & management
│   ├── my-learning/         # LMS learning journey & streak view
│   ├── notes/               # Notes hub & Markdown editor
│   ├── resources/           # Learning resources catalog
│   ├── roadmaps/            # Roadmap catalog & React Flow editor
│   ├── settings/            # User settings & preferences
│   └── study-session/       # Live study timer & session history
├── components/
│   ├── dashboard/           # Dashboard widgets (LMS, stats, charts)
│   ├── layout/              # Sidebar, Navbar, MobileNav, AppShell
│   ├── lms/                 # MarkdownEditor, StudyTimer, ResourceCard, MilestoneCard
│   ├── roadmap-editor/      # React Flow canvas, inspector, library, custom nodes
│   └── ui/                  # Reusable Button, Badge, Modal, Input, ProgressBar
├── lib/
│   ├── api-response.ts      # Standardized JSON response helpers
│   ├── mongodb.ts           # Mongoose cached connection handler
│   ├── utils.ts             # Tailwind class merging & date formatters
│   └── validations/         # Zod schemas for all models
├── models/                  # Mongoose Schema definitions
│   ├── AIConversation.ts    # AI conversation sessions
│   ├── AIMessage.ts         # User & Assistant messages
│   ├── AIRecommendation.ts # Computed topic recommendations
│   ├── AIUsage.ts          # Token consumption & telemetry
│   ├── GeneratedRoadmap.ts  # Generated blueprint curricula
│   ├── Activity.ts
│   ├── DailyGoal.ts
│   ├── LearningNote.ts
│   ├── LearningProgress.ts
│   ├── LearningResource.ts
│   ├── Milestone.ts
│   ├── Roadmap.ts
│   ├── RoadmapEdge.ts
│   ├── RoadmapNode.ts
│   └── StudySession.ts
├── services/
│   ├── ai/                  # AI services & provider abstraction
│   │   ├── providers/       # OpenAI provider & interface
│   │   ├── context-builder.ts
│   │   ├── roadmap-generator.ts
│   │   ├── next-topic-recommender.ts
│   │   ├── resource-suggester.ts
│   │   ├── topic-breakdown.ts
│   │   ├── learning-plan-generator.ts
│   │   ├── topic-explainer.ts
│   │   └── quiz-generator.ts
│   ├── api.ts               # Client-side typed fetcher & mutator methods
│   ├── lmsService.ts        # Server-side LMS business logic
│   └── roadmapService.ts    # Server-side Roadmap & graph business logic
└── types/                   # Unified TypeScript definitions (Roadmap, LMS, Analytics, AI)
```

---

## 🤖 Phase 5: AI-Powered Personal Learning Assistant

MyPath integrates an intelligent AI copilot that bridges directly into your actual database records (completed topics, unblocked prerequisites, daily goals, study velocity, and upcoming milestones).

### Key AI Features:

1. **AI Mentor & Chat (`/ai-assistant`)**:
   - Multi-turn conversational interface with markdown formatting, syntax-highlighted code blocks with 1-click copy, and conversation history persistence in MongoDB.
   - Context-aware prompt injection: Reads your active roadmaps and completed topics automatically.
   - Mode switching: General Mentorship, Roadmap Strategy, Next Topic Advice, Resource Discovery, Topic Breakdown, and Study Plan.

2. **AI Roadmap Generator (`/ai-assistant/roadmap-generator`)**:
   - Intake form: Career goals, current experience level, daily study hours, target duration, learning style, and custom focus areas.
   - Generates structured multi-stage curricula with realistic hour estimates, prerequisite relationships, milestones, and capstone projects.
   - **Interactive Preview & 1-Click Visual Canvas Conversion**: Save and instantly open in the React Flow visual editor (`/roadmaps/[id]/editor`) with nodes and edges pre-wired!

3. **AI Next Topic Recommender (`/ai-assistant/next-topic`)**:
   - Analyzes your actual database nodes and edge dependencies to find unblocked topics whose prerequisites have been completed.
   - Categorizes by **Next Up**, **Quick Wins (<45 min)**, **Core Gateway**, and **Spaced Revision**.
   - Provides clear rationale for why each topic is recommended next.

4. **AI Resource Finder (`/ai-assistant/resource-finder`)**:
   - Discovers authoritative documentation, interactive tutorials, video guides, and production GitHub repositories.
   - Strictly verified domain registry (`developer.mozilla.org`, `react.dev`, `nextjs.org`, `docs.python.org`, `github.com`, etc.) to prevent hallucinated URLs.
   - **+ Add to My Resources**: 1-click addition directly to your personal LMS resource library.

5. **AI Topic Breakdown Assistant (`/ai-assistant/topic-breakdown`)**:
   - Deconstructs large topics into 25-45 minute practical subtasks with hands-on coding exercises, success criteria, and key terminology.
   - **+ Add to Today's Daily Goals**: Instantly converts subtasks into daily study goals.
   - **+ Save to Node**: Attaches subtopics directly to roadmap node metadata.

6. **AI Personalized Weekly Learning Plan (`/ai-assistant/learning-plan`)**:
   - Dynamically balances your weekly study commitment across active roadmaps.
   - Produces a 7-day schedule with mapped focus topics, estimated durations, action types (Deep Dive, Hands-on Exercise, Review, Mini-Project), and daily cognitive tips.

7. **React Flow Visual Canvas Integration (`/roadmaps/[id]/editor`)**:
   - **AI Copilot Toolbar Button**: Direct link from canvas to the AI Assistant hub.
   - **Node Inspector AI Copilot**: Open the floating `NodeAIModal` from any selected node to:
     - 💡 **Explain Topic**: Executive concepts, production code examples, analogies, and common pitfalls.
     - 🔨 **Break Down**: Generate modular subtasks and attach to daily study goals.
     - 📚 **Find Resources**: Discover verified learning materials.
     - 🎯 **Practice Quiz**: Interactive 4-question multiple-choice quiz with immediate correctness feedback and comprehensive explanations.

````

---

## ⚡ Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env.local` and add your MongoDB Atlas connection string:

```bash
cp .env.example .env.local
````

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mypath?retryWrites=true&w=majority
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI API Configuration (Optional: runs in Offline Heuristic Simulation mode if omitted)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
AI_MAX_TOKENS=2500
AI_TEMPERATURE=0.7
```

> **Note**: If `OPENAI_API_KEY` is not provided, MyPath automatically runs in **Offline Heuristic Simulation Mode**, generating curated, realistic roadmaps, topic recommendations, breakdowns, and quizzes out-of-the-box!

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to open MyPath.

### 4. Build for Production

```bash
npm run build
npm start
```
