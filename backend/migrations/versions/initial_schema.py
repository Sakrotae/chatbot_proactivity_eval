"""initial schema

Revision ID: initial_schema
Revises: 
Create Date: 2024-03-14 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = 'initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create Question table
    op.create_table(
        'question',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('text', sa.String(500), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('required', sa.Boolean(), default=True),
        sa.Column('order', sa.Integer(), nullable=False),
        sa.Column('survey_type', sa.String(50), nullable=False),
        sa.Column('active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create User table
    op.create_table(
        'user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_id')
    )
    
    # Create Evaluation table
    op.create_table(
        'evaluation',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'])
    )
    
    # Create Response table
    op.create_table(
        'response',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('evaluation_id', sa.Integer(), nullable=False),
        sa.Column('answer', sa.String(500), nullable=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['question_id'], ['question.id']),
        sa.ForeignKeyConstraint(['evaluation_id'], ['evaluation.id'])
    )
    
    # Create ChatMessage table
    op.create_table(
        'chat_message',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('evaluation_id', sa.Integer(), nullable=False),
        sa.Column('sender', sa.String(10), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['evaluation_id'], ['evaluation.id'])
    )

def downgrade():
    op.drop_table('chat_message')
    op.drop_table('response')
    op.drop_table('evaluation')
    op.drop_table('user')
    op.drop_table('question')
