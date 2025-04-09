import requests
from typing import List, Dict, Any
from datetime import datetime
import json
from app.models import LanguageModel, UseCase, PromptType
from app.services.system_prompts import get_system_prompt
from app.logging_config import get_logger, log_exception

logger = get_logger(__name__)

class ChatService:
    API_ENDPOINTS = {
        LanguageModel.LLAMA: "http://137.250.171.154:11434/api/chat",
        #LanguageModel.GPT4O: "http://137.250.171.154:5050/api/chat", # wait for openai key
        LanguageModel.R1: "http://137.250.171.154:11434/api/chat"
    }
    
    def __init__(self, language_model: LanguageModel, use_case: UseCase, prompt_type: PromptType):
        self.language_model = language_model
        self.use_case = use_case
        self.prompt_type = prompt_type
        self.api_url = self.API_ENDPOINTS[language_model]
    
    def format_messages(self, chat_history: List[Dict[str, str]]) -> List[Dict[str, str]]:
        system_prompt = get_system_prompt(self.use_case, self.prompt_type)
        return [
            {"role": "system", "content": system_prompt},
            *chat_history
        ]
    
    def create_payload(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        base_config = {
            "messages": messages,
            "stream": False,
            "resp_format": "json",
            "options": {
                "temperature": 0.5, 
                "max_new_tokens": 4096,
                "top_p": 0.95,
                "top_k": 50, 
            }
        }
        
        # Add model-specific configurations
        if self.language_model == LanguageModel.LLAMA:
            base_config.update({
                "model": "llama3.1",
                "provider": "ollama"
            })
        elif self.language_model == LanguageModel.R1:
            base_config.update({
                "model": "deepseek-r1:8b",
                "provider": "ollama"
            })
        else:
            base_config.update({
                "model": "llama3.1",
                "provider": "ollama"
            })

            
        return base_config
    
    async def process_chat(self, chat_history: List[Dict[str, str]]) -> Dict[str, Any]:
        try:
            messages = self.format_messages(chat_history)
            payload = self.create_payload(messages)
            headers = {"Content-Type": "application/json"}
            
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=100
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data["message"]["content"]
                reasoning = None
                
                # Extract reasoning content if present
                if "<think>" in content and "</think>" in content:
                    parts = content.split("</think>", 1)
                    reasoning_with_tag = parts[0]
                    reasoning = reasoning_with_tag.split("<think>", 1)[1].strip()
                    content = parts[1].strip()
                
                return {
                    "success": True,
                    "content": content,
                    "reasoning": reasoning,
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            return {
                "success": False,
                "error": f"Server error: {response.status_code}",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except requests.Timeout as e:
            log_exception(logger, e, {'chat_history': chat_history})
            return {
                "success": False,
                "error": "Request timed out",
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            log_exception(logger, e, {'chat_history': chat_history})
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
