#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
python -c "
import sys
import psycopg2
import os
import time

while True:
    try:
        psycopg2.connect(
            dbname=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host='db'
        )
        break
    except psycopg2.OperationalError:
        print('Database not ready. Waiting...')
        time.sleep(1)
"

# Apply database migrations
echo "Applying database migrations..."
flask db upgrade

# Start the application
echo "Starting application..."
exec "$@"
