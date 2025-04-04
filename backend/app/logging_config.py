import logging
import os
import sys
import uuid
import traceback
from datetime import datetime
from flask import request, g
from pythonjsonlogger import jsonlogger

# Configure log levels based on environment
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO').upper()
ENVIRONMENT = os.environ.get('FLASK_ENV', 'development')

# Custom JSON formatter with additional fields
class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        
        # Add timestamp
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['environment'] = ENVIRONMENT
        
        # Add request info if available
        if request:
            try:
                log_record['remote_addr'] = request.remote_addr
                log_record['method'] = request.method
                log_record['path'] = request.path
            except:
                # Request context might not be available
                pass

def get_logger(name):
    """Get a configured logger instance"""
    logger = logging.getLogger(name)
    
    # Only configure handlers if they don't exist
    if not logger.handlers:
        # Set log level
        logger.setLevel(getattr(logging, LOG_LEVEL))
        
        # Create console handler
        handler = logging.StreamHandler(sys.stdout)
        
        # Create formatter
        formatter = CustomJsonFormatter('%(timestamp)s %(level)s %(name)s %(message)s')
        handler.setFormatter(formatter)
        
        # Add handler to logger
        logger.addHandler(handler)
    
    return logger

# Exception logger with stack trace
def log_exception(logger, exc, context=None):
    """Log an exception with full stack trace and context"""
    exc_info = sys.exc_info()
    stack_trace = ''.join(traceback.format_exception(*exc_info))
    
    log_data = {
        'exception_type': exc.__class__.__name__,
        'exception_message': str(exc),
        'stack_trace': stack_trace
    }
    
    # Add additional context if provided
    if context:
        log_data.update(context)
    
    logger.error('Exception occurred', extra=log_data)

# Generate a unique correlation ID
def generate_correlation_id():
    return str(uuid.uuid4())
