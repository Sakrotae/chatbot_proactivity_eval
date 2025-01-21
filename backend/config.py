from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///chatbot_eval.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    @staticmethod
    def as_dict():
        return {
            'sqlalchemy.url': Config.SQLALCHEMY_DATABASE_URI,
            #'sqlalchemy.track_modifications': Config.SQLALCHEMY_TRACK_MODIFICATIONS,
            'secret_key': Config.SECRET_KEY
        }
