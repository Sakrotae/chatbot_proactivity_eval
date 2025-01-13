from flask import jsonify, request
from app import db
from app.api import bp
from app.models import User, Evaluation, PreSurvey, PostSurvey, ChatMessage
from datetime import datetime
import uuid

@bp.route('/session', methods=['POST'])
def create_session():
    session_id = str(uuid.uuid4())
    user = User(session_id=session_id)
    db.session.add(user)
    db.session.commit()
    return jsonify({'session_id': session_id})

@bp.route('/evaluation', methods=['POST'])
def start_evaluation():
    session_id = request.json.get('session_id')
    user = User.query.filter_by(session_id=session_id).first_or_404()
    
    evaluation = Evaluation(
        user_id=user.id,
        start_time=datetime.utcnow()
    )
    db.session.add(evaluation)
    db.session.commit()
    
    return jsonify({'evaluation_id': evaluation.id})

@bp.route('/pre-survey', methods=['POST'])
def submit_pre_survey():
    data = request.json
    evaluation_id = data.get('evaluation_id')
    
    pre_survey = PreSurvey(
        evaluation_id=evaluation_id,
        comfort_level=data['comfort_level'],
        accuracy_belief=data['accuracy_belief'],
        preference_over_human=data['preference_over_human']
    )
    db.session.add(pre_survey)
    db.session.commit()
    
    return jsonify({'status': 'success'})

@bp.route('/chat', methods=['POST'])
def send_message():
    data = request.json
    evaluation_id = data.get('evaluation_id')
    
    message = ChatMessage(
        evaluation_id=evaluation_id,
        sender=data['sender'],
        content=data['content']
    )
    db.session.add(message)
    db.session.commit()
    
    # Here you would integrate with your chatbot logic
    # For now, return a simple response
    if data['sender'] == 'user':
        bot_response = ChatMessage(
            evaluation_id=evaluation_id,
            sender='bot',
            content='Thank you for your message. How can I help you?'
        )
        db.session.add(bot_response)
        db.session.commit()
        
        return jsonify({
            'bot_response': {
                'id': bot_response.id,
                'content': bot_response.content,
                'timestamp': bot_response.timestamp.isoformat()
            }
        })
    
    return jsonify({'status': 'success'})

@bp.route('/post-survey', methods=['POST'])
def submit_post_survey():
    data = request.json
    evaluation_id = data.get('evaluation_id')
    
    post_survey = PostSurvey(
        evaluation_id=evaluation_id,
        understanding=data['understanding'],
        clarity=data['clarity'],
        future_use=data['future_use']
    )
    db.session.add(post_survey)
    
    # Complete the evaluation
    evaluation = Evaluation.query.get_or_404(evaluation_id)
    evaluation.end_time = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'status': 'success'})

@bp.route('/results/<int:evaluation_id>', methods=['GET'])
def get_results(evaluation_id):
    evaluation = Evaluation.query.get_or_404(evaluation_id)
    
    results = {
        'start_time': evaluation.start_time.isoformat(),
        'end_time': evaluation.end_time.isoformat() if evaluation.end_time else None,
        'pre_survey': {
            'comfort_level': evaluation.pre_survey.comfort_level,
            'accuracy_belief': evaluation.pre_survey.accuracy_belief,
            'preference_over_human': evaluation.pre_survey.preference_over_human
        } if evaluation.pre_survey else None,
        'post_survey': {
            'understanding': evaluation.post_survey.understanding,
            'clarity': evaluation.post_survey.clarity,
            'future_use': evaluation.post_survey.future_use
        } if evaluation.post_survey else None,
        'chat_messages': [{
            'id': msg.id,
            'sender': msg.sender,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat()
        } for msg in evaluation.chat_messages]
    }
    
    return jsonify(results)
