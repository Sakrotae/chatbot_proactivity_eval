# Chatbot Proactivity Evaluation Platform

A full-stack application for conducting user experience evaluations of chatbot interactions. The platform guides users through pre-interaction surveys, chatbot conversations, and post-interaction feedback to gather comprehensive data about chatbot proactivity and user satisfaction.

## Getting Started

### Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/Sakrotae/chatbot_proactivity_eval
cd chatbot_proactivity_eval
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
# Database
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_USER=postgres
POSTGRES_DB=chatbot_eval

# Application
SECRET_KEY=your_secret_key_here
FLASK_ENV=production
```

4. Start the application:
```bash
docker-compose up -d
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

## Handling Backend Data Structure Changes

If you make changes to the data structure in `backend/app/models.py`, follow these steps to apply the changes to the database:

1. Navigate to the `backend` directory:
```bash
cd backend
```

2. Create a migration file:
```bash
flask db migrate -m "Describe your changes here"
```

3. Apply the migration to update the database:
```bash
flask db upgrade
```

## License

MIT
