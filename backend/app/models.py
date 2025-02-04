from app import db
from datetime import datetime
from enum import Enum

class QuestionType(Enum):
    LIKERT = 'likert'
    TEXT = 'text'
    MULTIPLE_CHOICE = 'multiple_choice'
    BOOLEAN = 'boolean'

class ChatSubjectType(Enum):
    HEALTH_CARE_WELL_BEING = 'health_care_well_being'
    EDUCATION = 'education'
    ACTIVITY_SUPPORT = 'activity_support'
    AMBIENT_INTELLIGENCE = 'ambient_intelligence'

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    required = db.Column(db.Boolean, default=True)
    order = db.Column(db.Integer, nullable=False)
    survey_type = db.Column(db.String(50), nullable=False)  # 'pre' or 'post'
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    responses = db.relationship('Response', backref='question', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'type': self.type,
            'required': self.required,
            'order': self.order,
            'survey_type': self.survey_type
        }

class Response(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    evaluation_id = db.Column(db.Integer, db.ForeignKey('evaluation.id'), nullable=False)
    answer = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'question_id': self.question_id,
            'evaluation_id': self.evaluation_id,
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
    responses = db.relationship('Response', backref='evaluation', lazy=True)
    chat_messages = db.relationship('ChatMessage', backref='evaluation', lazy=True)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    evaluation_id = db.Column(db.Integer, db.ForeignKey('evaluation.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
