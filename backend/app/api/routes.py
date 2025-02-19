from flask import jsonify, request
import asyncio
from app import db
from app.api import bp
from app.models import LanguageModel, User, Evaluation, Question, Response, ChatMessage, PromptType, UseCase
from app.services.chat_service import ChatService
from app.services.randomization import RandomizationService
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
    """Create a new session with randomized configuration"""
    session_id = str(uuid.uuid4())
    user = User(session_id=session_id)
    db.session.add(user)
    db.session.commit()
    return jsonify({'session_id': session_id})

@bp.route('/evaluation', methods=['POST'])
def start_evaluation():
    """Start a new evaluation with randomized configuration"""
    session_id = request.json.get('session_id')
    user = User.query.filter_by(session_id=session_id).first_or_404()
    
    # Get random configuration
    language_model, use_case, prompt_type = RandomizationService.get_random_configuration()
    
    evaluation = Evaluation(
        user_id=user.id,
        language_model=language_model.value,
        use_case=use_case.value,
        prompt_type=prompt_type.value,
        start_time=datetime.utcnow()
    )
    db.session.add(evaluation)
    db.session.commit()
    
    return jsonify({
        'evaluation_id': evaluation.id,
        'config': {
            'language_model': language_model.value,
            'use_case': use_case.value,
            'prompt_type': prompt_type.value
        }
    })

@bp.route('/chat/message', methods=['POST'])
def process_chat_message():
    """Process chat messages using the evaluation's configuration"""
    try:
        data = request.json
        evaluation_id = data.get('evaluationId')
        message_content = data.get('message')
        chat_history = data.get('history', [])
        
        if not message_content:
            return jsonify({'error': 'Message content is required'}), 400
        
        # Get evaluation configuration
        evaluation = Evaluation.query.get_or_404(evaluation_id)
        
        # Store user message
        user_message = ChatMessage(
            evaluation_id=evaluation_id,
            sender='user',
            content=message_content
        )
        db.session.add(user_message)
        db.session.commit()
        
        # Initialize chat service with evaluation configuration
        chat_service = ChatService(
            language_model=  LanguageModel(evaluation.language_model),
            use_case=UseCase(evaluation.use_case),
            prompt_type=PromptType(evaluation.prompt_type)
        )
        
        # Add user message to chat history
        chat_history.append({
            'role': 'user',
            'content': message_content
        })
        
        # Process with configured service
        result = asyncio.run(chat_service.process_chat(chat_history))
        
        if result['success']:
            # Store bot response
            bot_message = ChatMessage(
                evaluation_id=evaluation_id,
                sender='bot',
                content=result['content']
            )
            db.session.add(bot_message)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': {
                    'id': bot_message.id,
                    'content': bot_message.content,
                    'timestamp': bot_message.timestamp.isoformat()
                }
            })
        
        return jsonify({
            'success': False,
            'error': result['error']
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@bp.route('/results/<int:evaluation_id>', methods=['GET'])
def get_results(evaluation_id):
    """Get evaluation results including configuration"""
    evaluation = Evaluation.query.get_or_404(evaluation_id)
    
    results = {
        'configuration': {
            'language_model': evaluation.language_model.value,
            'use_case': evaluation.use_case.value,
            'prompt_type': evaluation.prompt_type.value
        },
        'start_time': evaluation.start_time.isoformat(),
        'end_time': evaluation.end_time.isoformat() if evaluation.end_time else None,
        'responses': [r.to_dict() for r in evaluation.responses],
        'chat_messages': [{
            'id': msg.id,
            'sender': msg.sender,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat()
        } for msg in evaluation.chat_messages]
    }
    
    return jsonify(results)
