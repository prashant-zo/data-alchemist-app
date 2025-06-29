# Data Alchemist App

## What is Data Alchemist?

**Data Alchemist** is a modern, AI-powered web app that helps you clean, validate, and configure resource allocation data. Built with Next.js, it lets you upload messy spreadsheets, fix errors, define business rules, and export ready-to-use files—all in a user-friendly interface.

This project was built as a product-thinking assignment for Digitalyz, but is open for anyone who wants to bring order to spreadsheet chaos!

---
https://github.com/user-attachments/assets/d0f3a645-1e0c-4b5f-8e4e-067931ab86a6
---
## How it Works

1. **Upload Data:**
   - Upload your clients, workers, and tasks data as CSV or XLSX files.
   - The app parses and displays your data in editable tables.

2. **Validate & Edit:**
   - Automatic validation runs on upload and on every edit.
   - Errors are highlighted at the cell level, with a summary panel for quick fixes.

3. **AI-Powered Search:**
   - Use natural language to search/filter your data (e.g., `Duration > 4 in tasks`).
   - The app uses Google Gemini to turn your query into filters.

4. **Business Rules & Prioritization:**
   - Add rules (co-run, load limits, etc.) via an intuitive UI.
   - Set prioritization weights with sliders.

5. **Export Clean Data:**
   - Download cleaned CSVs and a rules.json file, ready for downstream tools.

---

## Assignment Highlights

- **AI Natural Language Search:**
  - Try queries like `Show all tasks with Duration > 3` or `Find clients with PriorityLevel = 5`.
- **Cell-Level Error Highlighting:**
  - Errors are shown directly in the data grid for easy correction.
- **Business Rule Builder:**
  - Add co-run, slot restriction, and load-limit rules with just a few clicks.
- **Export:**
  - Click "Export All Files" to get:
    - `clients_cleaned.csv`, `workers_cleaned.csv`, `tasks_cleaned.csv`
    - `rules.json` (all rules + prioritization)
- **No setup required:**
  - Works out of the box with Docker or locally with pnpm/npm.

---

## Sample Data

Sample files are provided in the [`/samples`](./samples) folder:
- `clients.csv`
- `workers.csv`
- `tasks.csv`

You can use these to quickly test the app, or upload your own data.

---

## Features

- 📁 **File Upload**: Support for CSV and XLSX files
- ✅ **Data Validation**: Real-time validation with error highlighting
- 🔍 **Natural Language Search**: AI-powered search functionality
- ⚙️ **Rule Input**: Business rule configuration
- 📊 **Prioritization**: Advanced prioritization algorithms
- 📤 **Export**: Multiple export formats
- 🐳 **Dockerized**: Ready for container deployment

## 🔍 AI-Powered Natural Language Search

Data Alchemist features an AI-powered search bar that lets you filter your data using plain English queries. The system uses Google Gemini to convert your query into structured filters and instantly applies them to your data grid.

**How to use:**
- Type a query like `Duration > 4 in tasks` or `Clients with PriorityLevel = 5` in the search bar above any data table.
- The app will highlight and filter the relevant rows based on your query.
- Works for clients, workers, and tasks tables.

**Examples:**
- `Show all tasks with Duration > 3`
- `Find clients with PriorityLevel = 5`
- `Workers with skill = analysis`

If the AI cannot understand your query, you'll see a helpful message and can try a simpler phrase.

---

## Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd data-alchemist-app

# Build and run with Docker Compose
docker-compose up --build

# The app will be available at http://localhost:3000
```

### Option 2: Using Docker directly

```bash
# Build the Docker image
docker build -t data-alchemist-app .

# Run the container
docker run -p 3000:3000 data-alchemist-app

# The app will be available at http://localhost:3000
```


## Local Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Next.js app
3. Deploy with default settings

### Docker Deployment

```bash
# Build for production
docker build -t data-alchemist-app .

# Run in production
docker run -d -p 3000:3000 --name data-alchemist data-alchemist-app
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/upload` - File upload endpoint
- `POST /api/ai-filter` - AI-powered search endpoint

## Environment Variables

No environment variables are required for basic functionality. The app works out of the box.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
