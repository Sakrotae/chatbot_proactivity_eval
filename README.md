# Chatbot Proactivity Evaluation Platform

A full-stack application for conducting user experience evaluations of chatbot interactions. The platform guides users through pre-interaction surveys, chatbot conversations, and post-interaction feedback to gather comprehensive data about chatbot proactivity and user satisfaction.

## Project Overview

This platform is designed for researchers and developers studying human-chatbot interactions, specifically focusing on the impact of chatbot proactivity on user experience. It provides a structured environment to:

1. Collect pre-interaction user expectations and attitudes
2. Facilitate controlled chatbot interactions across different domains
3. Gather post-interaction feedback on user satisfaction and perceived chatbot performance
4. Compare different chatbot behaviors (standard vs. proactive) across various use cases

The system randomizes chatbot configurations to enable unbiased evaluation of different interaction styles and models.

## Code Structure

### Directory Structure

```
/
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── Chat/             # Chat interface components
│   │   ├── Landing/          # Landing page components
│   │   ├── Results/          # Results display components
│   │   ├── Survey/           # Survey components
│   │   └── common/           # Shared UI components
│   ├── services/             # API service functions
│   ├── store/                # State management (Zustand)
│   └── types/                # TypeScript type definitions
├── backend/                  # Flask backend
│   ├── app/                  # Main application code
│   │   ├── api/              # API routes and controllers
│   │   └── services/         # Business logic services
│   ├── migrations/           # Database migrations
│   └── scripts/              # Utility scripts
└── docker-compose.yml        # Docker configuration
```

### Key Components

#### Frontend

- **EvaluationStore** (`src/store/evaluationStore.ts`): Central state management using Zustand, handling the entire evaluation flow and API interactions
- **ChatInterface** (`src/components/Chat/ChatInterface.tsx`): Main chat UI with message display and input
- **DynamicSurvey** (`src/components/Survey/DynamicSurvey.tsx`): Configurable survey component for both pre and post evaluations
- **API Services** (`src/services/api.ts`): Functions for communicating with the backend API

#### Backend

- **Models** (`backend/app/models.py`): Database models for users, evaluations, chat sessions, and survey responses
- **ChatService** (`backend/app/services/chat_service.py`): Handles interactions with LLM providers
- **SystemPrompts** (`backend/app/services/system_prompts.py`): Manages different prompt templates based on use case and model
- **Routes** (`backend/app/api/routes.py`): API endpoints for the frontend to interact with

### Architecture

The application follows a client-server architecture with:

1. **React Frontend**: Handles UI rendering and user interactions
2. **Flask Backend**: Provides API endpoints and business logic
3. **PostgreSQL Database**: Stores evaluation data, chat histories, and survey responses
4. **External LLM Services**: Processes chat messages through API calls

The frontend uses a unidirectional data flow pattern with Zustand for state management, while the backend implements a service-oriented architecture to separate concerns.

## Installation

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
NODE_ENV=production
API_BASE=http://backend:5000/api
```

4. Start the application:
```bash
docker-compose up -d
```

5. If the database is new, connect to the backend container and run the following command to add the survey questions to the database:
```bash
docker exec -it <backend_container_name> python seed.py
```
Replace `<backend_container_name>` with the name of your backend container (e.g., `chatbot_proactivity_eval_backend_1`).

### Local Development Setup

1. Clone the repository and navigate to the project directory

2. Install frontend dependencies:
```bash
npm install
```

3. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Create a `.env` file in the project root with the following:
```env
# Development settings
NODE_ENV=development
VITE_USE_LOCAL_API=true
SECRET_KEY=dev-secret-key
```

5. Initialize the database:
```bash
cd backend
flask db upgrade
python seed.py
```

6. Start the backend server:
```bash
flask run
```

7. In a new terminal, start the frontend development server:
```bash
npm run dev
```

## Usage

### Running an Evaluation

1. Access the application at `http://localhost` (Docker) or `http://localhost:5173` (local development)
2. Click "Start Evaluation" on the landing page
3. Complete the pre-interaction survey
4. Interact with the chatbot to accomplish the displayed goal
5. Complete the post-interaction survey
6. Repeat for additional topics if available
7. View the evaluation results summary


## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Database password | - |
| `POSTGRES_USER` | Database username | postgres |
| `POSTGRES_DB` | Database name | chatbot_eval |
| `SECRET_KEY` | Flask secret key | - |
| `FLASK_ENV` | Flask environment | development |
| `NODE_ENV` | Node environment | development |
| `API_BASE` | API base URL | http://backend:5000/api |
| `VITE_USE_LOCAL_API` | Use local API for development | true |

### LLM Configuration

The system is configured to work with the following LLM providers:
- Llama 3.1 via Ollama
- Deepseek R1 via Ollama

To modify or add LLM providers, edit the `API_ENDPOINTS` in `backend/app/services/chat_service.py`.

## Database Management

### Handling Backend Data Structure Changes

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
