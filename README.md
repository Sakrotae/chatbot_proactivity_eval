# Chatbot Proactivity Evaluation Platform

A full-stack application for conducting user experience evaluations of chatbot interactions. The platform guides users through pre-interaction surveys, chatbot conversations, and post-interaction feedback to gather comprehensive data about chatbot proactivity and user satisfaction.

## Getting Started

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Initialize the database:
```bash
flask init-db
```

4. Start the Flask server:
```bash
flask run
```

## Tech Stack

- **Frontend**
  - React with TypeScript
  - Zustand for state management
  - TailwindCSS for styling
  - Vite for build tooling

- **Backend**
  - Flask
  - SQLAlchemy
  - Flask-CORS
  - SQLite database

## Development

- Run `npm run lint` to check for code style issues
- Run `npm run build` to create a production build
- Run `npm run preview` to preview the production build locally

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///chatbot_eval.db
```

## License

MIT
