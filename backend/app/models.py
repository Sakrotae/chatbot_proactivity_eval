from app import db
from datetime import datetime
from enum import Enum
import json

class QuestionType(Enum):
    LIKERT = 'likert'
    TEXT = 'text'
    NUMERIC = 'numeric'
    DROPDOWN = 'dropdown'

class LanguageModel(Enum):
    LLAMA = 'llama'
    #GPT4O = 'gpt4o'
    R1 = 'r1'

class UseCase(Enum):
    HEALTH_CARE = 'health_care'
    EDUCATION = 'education'
    ACTIVITY_SUPPORT = 'activity_support'
    DEBATING = 'debating'

class PromptType(Enum):
    STANDARD = 'standard'
    PROACTIVE = 'proactive'

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    required = db.Column(db.Boolean, default=True)
    order = db.Column(db.Integer, nullable=False)
    survey_type = db.Column(db.String(50), nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # New fields for numeric type
    min_value = db.Column(db.Float)
    max_value = db.Column(db.Float)
    step = db.Column(db.Float, default=1)
    
    # New field for dropdown options
    _options = db.Column('options', db.String(1000))  # Store as JSON string
    
    responses = db.relationship('Response', backref='question', lazy=True)

    @property
    def options(self):
        if self._options:
            return json.loads(self._options)
        return []

    @options.setter
    def options(self, value):
        if value:
            self._options = json.dumps(value)
        else:
            self._options = None

    def to_dict(self):
        data = {
            'id': self.id,
            'text': self.text,
            'type': self.type,
            'required': self.required,
            'order': self.order,
            'survey_type': self.survey_type
        }
        
        if self.type == QuestionType.NUMERIC.value:
            data.update({
                'min_value': self.min_value,
                'max_value': self.max_value,
                'step': self.step
            })
        elif self.type == QuestionType.DROPDOWN.value:
            data['options'] = self.options
            
        return data

class Response(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    # chat_session_id only if is post-survey, eval_id is independent of chats
    chat_session_id = db.Column(db.Integer, db.ForeignKey('chat_session.id'), nullable=True)
    eval_id = db.Column(db.Integer, db.ForeignKey('evaluation.id'), nullable=False)
    answer = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'question_id': self.question_id,
            'chat_session_id': self.chat_session_id,
            'answer': self.answer,
            'created_at': self.created_at.isoformat()
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(36), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    evaluations = db.relationship('Evaluation', backref='user', lazy=True)

class Evaluation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    # Add relationship to chat sessions
    chat_sessions = db.relationship('ChatSession', backref='evaluation', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'chat_sessions': [session.to_dict() for session in self.chat_sessions]
        }

# New model for chat sessions
class ChatSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    evaluation_id = db.Column(db.Integer, db.ForeignKey('evaluation.id'), nullable=False)
    use_case = db.Column(db.String(36), nullable=False)
    language_model = db.Column(db.String(36), nullable=False)
    prompt_type = db.Column(db.String(36), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    completed = db.Column(db.Boolean, default=False)
    # Add relationships
    chat_messages = db.relationship('ChatMessage', backref='chat_session', lazy=True)
    responses = db.relationship('Response', backref='chat_session', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'evaluation_id': self.evaluation_id,
            'language_model': LanguageModel(self.language_model),
            'use_case': UseCase(self.use_case),
            'prompt_type': PromptType(self.prompt_type),
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'completed': self.completed
        }

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_session_id = db.Column(db.Integer, db.ForeignKey('chat_session.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
