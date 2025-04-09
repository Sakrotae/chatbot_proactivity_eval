import random
from app.models import LanguageModel, UseCase, PromptType

class RandomizationService:
    @staticmethod
    def get_random_language_model():
        """Get a random language model"""
        models = list(LanguageModel)
        return random.choice(models)
    
    @staticmethod
    def get_random_use_case():
        """Get a random use case (domain)"""
        use_cases = list(UseCase)
        return random.choice(use_cases)
    
    @staticmethod
    def get_random_prompt_type():
        """Get a random prompt type (standard or proactive)"""
        prompt_types = list(PromptType)
        return random.choice(prompt_types)
    
    
    @staticmethod
    def get_domain_sequence():
        """Get a randomized sequence of domains to evaluate"""
        domains = list(UseCase)
        random.shuffle(domains)
        return domains
