from flask import jsonify, request
from app import db
from app.api import bp
from app.models import User, Evaluation, Question, Response, ChatMessage
from datetime import datetime
import uuid

@bp.route('/questions', methods=['GET'])
def get_questions():
    survey_type = request.args.get('type', 'pre')  # 'pre' or 'post'
    questions = Question.query.filter_by(
        active=True,
        survey_type=survey_type
    ).order_by(Question.order).all()
    
    return jsonify({
        'questions': [q.to_dict() for q in questions]
    })

@bp.route('/responses', methods=['POST'])
def submit_responses():
    data = request.json
    evaluation_id = data.get('evaluation_id')
    responses_data = data.get('responses', [])
    survey_type = data.get('type', 'pre')
    
    # Validate required questions
    required_questions = Question.query.filter_by(
        active=True,
        required=True,
        survey_type=survey_type
    ).all()
    required_ids = {q.id for q in required_questions}
    submitted_ids = {r['questionId'] for r in responses_data}
    
    missing_required = required_ids - submitted_ids
    if missing_required:
        return jsonify({
            'error': 'Missing required questions',
            'missing_questions': list(missing_required)
        }), 400
    
    # Store responses
    for response_data in responses_data:
        response = Response(
            question_id=response_data['questionId'],
            evaluation_id=evaluation_id,
            answer=str(response_data['answer'])
        )
        db.session.add(response)
    
    # Update evaluation if post-survey
    if survey_type == 'post':
        evaluation = Evaluation.query.get(evaluation_id)
        if evaluation:
            evaluation.end_time = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

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

@bp.route('/results/<int:evaluation_id>', methods=['GET'])
def get_results(evaluation_id):
    evaluation = Evaluation.query.get_or_404(evaluation_id)
    
    responses = Response.query.filter_by(evaluation_id=evaluation_id).all()
    
    results = {
        'start_time': evaluation.start_time.isoformat(),
        'end_time': evaluation.end_time.isoformat() if evaluation.end_time else None,
        'responses': [r.to_dict() for r in responses],
        'chat_messages': [{
            'id': msg.id,
            'sender': msg.sender,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat()
        } for msg in evaluation.chat_messages]
    }
    
    return jsonify(results)
