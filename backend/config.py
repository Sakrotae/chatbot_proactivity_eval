from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    file_path_local_db = os.path.abspath(os.getcwd())+"\\instance\\chatbot_eval.db"
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_DATABASE_URI =  os.getenv('DATABASE_URL', 'sqlite:///'+file_path_local_db)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    @staticmethod
    def as_dict():
        return {
            'sqlalchemy.url': Config.SQLALCHEMY_DATABASE_URI,
            #'sqlalchemy.track_modifications': Config.SQLALCHEMY_TRACK_MODIFICATIONS,
            'secret_key': Config.SECRET_KEY
        }
