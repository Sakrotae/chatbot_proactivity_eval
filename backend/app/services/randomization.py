import random
from app.models import LanguageModel, UseCase, PromptType
from typing import Tuple

class RandomizationService:
    @staticmethod
    def get_random_configuration() -> Tuple[LanguageModel, UseCase, PromptType]:
        """
        Randomly select a language model, use case, and prompt type.
        Returns a tuple of (LanguageModel, UseCase, PromptType)
        """
        language_model = random.choice(list(LanguageModel))
        use_case = random.choice(list(UseCase))
        prompt_type = random.choice(list(PromptType))
        
        return language_model, use_case, prompt_type
