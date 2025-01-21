from app import create_app, db
from app.models import Question

def seed_questions():
    pre_survey_questions = [
        {
            'text': 'I am comfortable using chatbots for everyday tasks.',
            'type': 'likert',
            'required': True,
            'order': 1,
            'survey_type': 'pre'
        },
        {
            'text': 'I believe chatbots can provide accurate and helpful information.',
            'type': 'likert',
            'required': True,
            'order': 2,
            'survey_type': 'pre'
        },
        {
            'text': 'I prefer chatbots over human customer service representatives.',
            'type': 'likert',
            'required': True,
            'order': 3,
            'survey_type': 'pre'
        },
        {
            'text': 'Please describe your previous experiences with chatbots.',
            'type': 'text',
            'required': False,
            'order': 4,
            'survey_type': 'pre'
        }
    ]

    post_survey_questions = [
        {
            'text': 'The chatbot understood my questions and provided relevant responses.',
            'type': 'likert',
            'required': True,
            'order': 1,
            'survey_type': 'post'
        },
        {
            'text': 'The chatbot responses were clear and easy to understand.',
            'type': 'likert',
            'required': True,
            'order': 2,
            'survey_type': 'post'
        },
        {
            'text': 'I would use this chatbot again for similar tasks.',
            'type': 'likert',
            'required': True,
            'order': 3,
            'survey_type': 'post'
        },
        {
            'text': 'What aspects of the chatbot interaction could be improved?',
            'type': 'text',
            'required': False,
            'order': 4,
            'survey_type': 'post'
        }
    ]

    # Clear existing questions
    Question.query.delete()

    # Add new questions
    for question_data in pre_survey_questions + post_survey_questions:
        question = Question(**question_data)
        db.session.add(question)

    db.session.commit()

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        seed_questions()
        print('Database seeded successfully!')
