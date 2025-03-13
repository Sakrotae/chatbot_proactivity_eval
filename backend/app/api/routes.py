from flask import jsonify, request
import asyncio
from app import db
from app.api import bp
from app.models import LanguageModel, User, Evaluation, Question, Response, ChatMessage, PromptType, UseCase, ChatSession
from app.services.chat_service import ChatService
from app.services.randomization import RandomizationService
from datetime import datetime
import uuid

from app.services.system_prompts import get_prompt_goal

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
    chat_session_id = data.get('chat_session_id')
    eval_id = data.get('eval_id')
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
            chat_session_id=chat_session_id,
            eval_id=eval_id,
            answer=str(response_data['answer'])
        )
        db.session.add(response)
    
    # Update chat session if post-survey
    if survey_type == 'post':
        chat_session = ChatSession.query.get(chat_session_id)
        if chat_session:
            chat_session.end_time = datetime.utcnow()
            chat_session.completed = True
    
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
    """Start a new evaluation with a language model"""
    session_id = request.json.get('session_id')
    user = User.query.filter_by(session_id=session_id).first_or_404()
    
    # Get random language model
    language_model = RandomizationService.get_random_language_model()
    
    evaluation = Evaluation(
        user_id=user.id,
        language_model=language_model.value,
        start_time=datetime.utcnow()
    )
    db.session.add(evaluation)
    db.session.commit()
    
    return jsonify({
        'evaluation_id': evaluation.id,
        'config': {
            'language_model': language_model.value
        }
    })

@bp.route('/chat/session', methods=['POST'])
def start_chat_session():
    """Start a new chat session for a specific use case"""
    evaluation_id = request.json.get('evaluation_id')
    use_case = request.json.get('use_case')
    
    # Validate use case if provided, otherwise get random
    if use_case and use_case in [uc.value for uc in UseCase]:
        use_case = UseCase(use_case)
    else:
        use_case = RandomizationService.get_random_use_case()
    
    # Get random prompt type
    prompt_type = RandomizationService.get_random_prompt_type()
    
    # Get user goal for this use case
    user_goal = get_prompt_goal(use_case)
    
    # Create new chat session
    chat_session = ChatSession(
        evaluation_id=evaluation_id,
        use_case=use_case.value,
        prompt_type=prompt_type.value,
        start_time=datetime.utcnow()
    )
    db.session.add(chat_session)
    db.session.commit()
    
    return jsonify({
        'chat_session_id': chat_session.id,
        'config': {
            'use_case': use_case.value,
            'prompt_type': prompt_type.value,
            'user_goal': user_goal
        }
    })

@bp.route('/chat/message', methods=['POST'])
def process_chat_message():
    """Process chat messages using the chat session's configuration"""
    try:
        data = request.json
        chat_session_id = data.get('chatSessionId')
        message_content = data.get('message')
        chat_history = data.get('history', [])
        
        if not message_content:
            return jsonify({'error': 'Message content is required'}), 400
        
        # Get chat session and evaluation configuration
        chat_session = ChatSession.query.get_or_404(chat_session_id)
        evaluation = Evaluation.query.get_or_404(chat_session.evaluation_id)
        
        # Store user message
        user_message = ChatMessage(
            chat_session_id=chat_session_id,
            sender='user',
            content=message_content
        )
        db.session.add(user_message)
        db.session.commit()
        
        # Initialize chat service with configuration
        chat_service = ChatService(
            language_model=LanguageModel(evaluation.language_model),
            use_case=UseCase(chat_session.use_case),
            prompt_type=PromptType(chat_session.prompt_type)
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
                chat_session_id=chat_session_id,
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

@bp.route('/chat/next-topic', methods=['GET'])
def get_next_topic():
    """Get the next available topic for an evaluation"""
    evaluation_id = request.args.get('evaluation_id')
    
    # Get all use cases
    all_use_cases = [uc.value for uc in UseCase]
    
    # Get completed use cases for this evaluation
    completed_sessions = ChatSession.query.filter_by(
        evaluation_id=evaluation_id,
        completed=True
    ).all()
    completed_use_cases = [session.use_case for session in completed_sessions]
    
    # Find remaining use cases
    remaining_use_cases = [uc for uc in all_use_cases if uc not in completed_use_cases]
    
    if not remaining_use_cases:
        # All topics completed
        return jsonify({
            'completed': True,
            'message': 'All topics have been completed'
        })
    
    return jsonify({
        'completed': False,
        'next_use_case': remaining_use_cases[0]
    })

@bp.route('/results/<int:evaluation_id>', methods=['GET'])
def get_results(evaluation_id):
    """Get evaluation results including all chat sessions"""
    evaluation = Evaluation.query.get_or_404(evaluation_id)
    
    # Get all chat sessions for this evaluation
    chat_sessions = ChatSession.query.filter_by(evaluation_id=evaluation_id).all()
    
    sessions_data = []
    for session in chat_sessions:
        # Get responses for this chat session
        responses = Response.query.filter_by(chat_session_id=session.id).all()
        
        # Get chat messages for this session
        messages = ChatMessage.query.filter_by(chat_session_id=session.id).all()
        
        sessions_data.append({
            'id': session.id,
            'use_case': session.use_case,
            'prompt_type': session.prompt_type,
            'start_time': session.start_time.isoformat(),
            'end_time': session.end_time.isoformat() if session.end_time else None,
            'completed': session.completed,
            'responses': [r.to_dict() for r in responses],
            'chat_messages': [{
                'id': msg.id,
                'sender': msg.sender,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat()
            } for msg in messages]
        })
    
    results = {
        'evaluation_id': evaluation.id,
        'language_model': evaluation.language_model,
        'start_time': evaluation.start_time.isoformat(),
        'end_time': evaluation.end_time.isoformat() if evaluation.end_time else None,
        'chat_sessions': sessions_data
    }
    
    return jsonify(results)
