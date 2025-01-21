import requests
from typing import List, Dict, Any
from datetime import datetime
import json

class ChatService:
    OLLAMA_API_URL = "http://137.250.171.154:5050/api/chat"
    LLAMA_MODEL = "llama3.1"
    
    @staticmethod
    def format_messages(chat_history: List[Dict[str, str]], system_prompt: str) -> List[Dict[str, str]]:
        return [
            {"role": "system", "content": system_prompt},
            *chat_history
        ]
    
    @staticmethod
    def create_payload(messages: List[Dict[str, str]]) -> Dict[str, Any]:
        return {
            "model": ChatService.LLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "provider": "ollama",
            "temperature": 0.0,
            "max_new_tokens": 4096,
            "top_p": 0.95,
            "top_k": 50,
            "resp_format": "json",
        }
    
    @staticmethod
    async def process_chat(chat_history: List[Dict[str, str]], system_prompt: str) -> Dict[str, Any]:
        try:
            messages = ChatService.format_messages(chat_history, system_prompt)
            payload = ChatService.create_payload(messages)
            headers = {"Content-Type": "application/json"}
            
            response = requests.post(
                ChatService.OLLAMA_API_URL,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "content": data["message"]["content"],
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            return {
                "success": False,
                "error": f"Server error: {response.status_code}",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except requests.Timeout:
            return {
                "success": False,
                "error": "Request timed out",
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
