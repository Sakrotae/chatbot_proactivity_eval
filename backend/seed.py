from app import create_app, db
from app.models import Question

def seed_questions():
    pre_survey_questions = [
    {
        "text": "I feel confident in my ability to use chatbots effectively.",
        "type": "likert",
        "required": True,
        "order": 1,
        "survey_type": "pre"
    },
    {
        "text": "I generally trust chatbots to handle my requests or questions.",
        "type": "likert",
        "required": True,
        "order": 2,
        "survey_type": "pre"
    },
    {
        "text": "I prefer to have full control over how a chatbot interacts with me.",
        "type": "likert",
        "required": True,
        "order": 3,
        "survey_type": "pre"
    },
    {
        "text": "I am comfortable learning to use new technologies.",
        "type": "likert",
        "required": True,
        "order": 4,
        "survey_type": "pre"
    },
    {
        "text": "I understand how large language models (like ChatGPT) work.",
        "type": "likert",
        "required": True,
        "order": 5,
        "survey_type": "pre"
    },
    {
        "text": "I consider myself to be outgoing and sociable.",
        "type": "likert",
        "required": True,
        "order": 6,
        "survey_type": "pre"
    },
    {
        "text": "I prefer to follow a structured plan rather than acting spontaneously.",
        "type": "likert",
        "required": True,
        "order": 7,
        "survey_type": "pre"
    },
    {
        "text": "I am open to trying new technologies even if they are unfamiliar.",
        "type": "likert",
        "required": True,
        "order": 8,
        "survey_type": "pre"
    },
    {
        "text": "What is your age?",
        "type": "text",
        "required": True,
        "order": 9,
        "survey_type": "pre"
    },
    {
        "text": "What is your gender?",
        "type": "text",
        "required": True,
        "order": 10,
        "survey_type": "pre"
    },
    {
        "text": "I am confident in my ability to communicate effectively in English.",
        "type": "likert",
        "required": True,
        "order": 11,
        "survey_type": "pre"
    }
]

    post_survey_questions = [  
    {  
        "text": "The chatbot's responses were reliable and trustworthy.",  
        "type": "likert",  
        "required": False,  
        "order": 1,  
        "survey_type": "post"
    },  
    {  
        "text": "The chatbot anticipated my needs before I explicitly stated them.",  
        "type": "likert",  
        "required": False,  
        "order": 2,  
        "survey_type": "post" 
    },  
    {  
        "text": "The chatbot struck a good balance between being proactive and respecting my autonomy.",  
        "type": "likert",  
        "required": False,  
        "order": 3,  
        "survey_type": "post"
    },  
    {  
        "text": "The chatbot's personality felt friendly and approachable.",  
        "type": "likert",  
        "required": False,  
        "order": 4,  
        "survey_type": "post" 
    },  
    {  
        "text": "The chatbot's tone and responses were professional and appropriate.",  
        "type": "likert",  
        "required": False,  
        "order": 5,  
        "survey_type": "post" 
    },  
    {  
        "text": "The chatbot's proactive suggestions were accurate and relevant.",  
        "type": "likert",  
        "required": False,  
        "order": 6,  
        "survey_type": "post"
    },  
    {  
        "text": "The chatbot's suggestions were useful in helping me complete tasks.",  
        "type": "likert",  
        "required": False,  
        "order": 7,  
        "survey_type": "post"
    },  
    {  
        "text": "The chatbot provided suggestions at appropriate times during our interaction.",  
        "type": "likert",  
        "required": False,  
        "order": 8,  
        "survey_type": "post" 
    },  
    {  
        "text": "I am satisfied with the overall performance of the chatbot.",  
        "type": "likert",  
        "required": False,  
        "order": 9,  
        "survey_type": "post"
    },  
    {  
        "text": "The chatbot understood the context of our conversation effectively.",  
        "type": "likert",  
        "required": False,  
        "order": 10,  
        "survey_type": "post"
    },  
    {  
        "text": "I felt my privacy was respected during the interaction.",  
        "type": "likert",  
        "required": False,  
        "order": 11,  
        "survey_type": "post"
    },  
    {  
        "text": "The chatbot allowed me to make decisions without pressure.",  
        "type": "likert",  
        "required": False,  
        "order": 12,  
        "survey_type": "post"
    },  
    {  
        "text": "I felt in control of the interaction with the chatbot.",  
        "type": "likert",  
        "required": False,  
        "order": 13,  
        "survey_type": "post"
    },  
    {  
        "text": "The chatbot explained its reasoning or decisions clearly.",  
        "type": "likert",  
        "required": False,  
        "order": 14,  
        "survey_type": "post"
    },  
    {  
        "text": "Please share any additional feedback about your experience.",  
        "type": "text",  
        "required": False,  
        "order": 15,  
        "survey_type": "post"
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
