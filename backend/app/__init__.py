from flask import Flask, request, g
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
import time
from app.logging_config import get_logger, generate_correlation_id

# Initialize logger
logger = get_logger(__name__)

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Register blueprints
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Request logging middleware
    @app.before_request
    def before_request():
        # Generate and store correlation ID
        g.correlation_id = request.headers.get('X-Correlation-ID') or generate_correlation_id()
        g.request_id = generate_correlation_id()
        g.start_time = time.time()
        
        # Log incoming request
        logger.info(
            f"Request started: {request.method} {request.path}",
            extra={
                'method': request.method,
                'path': request.path,
                'remote_addr': request.remote_addr,
                'query_params': dict(request.args),
            }
        )
    
    @app.after_request
    def after_request(response):
        # Calculate request duration
        duration = time.time() - g.get('start_time', time.time())
        
        # Log response
        logger.info(
            f"Request completed: {request.method} {request.path}",
            extra={
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration_ms': round(duration * 1000, 2)
            }
        )
        
        # Add correlation ID to response headers
        response.headers['X-Correlation-ID'] = g.get('correlation_id')
        response.headers['X-Request-ID'] = g.get('request_id')
        
        return response
    
    # Error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        from app.logging_config import log_exception
        
        # Log the exception
        log_exception(logger, e, {
            'request_id': g.get('request_id'),
            'correlation_id': g.get('correlation_id'),
            'method': request.method,
            'path': request.path
        })
        
        # Return appropriate error response
        return {"error": str(e)}, 500
    
    # Add health check endpoint
    @app.route('/api/health')
    def health_check():
        logger.info("Health check performed")
        return {"status": "healthy"}, 200
    
    logger.info("Application initialized", extra={"environment": app.config.get("FLASK_ENV", "development")})
    
    return app
