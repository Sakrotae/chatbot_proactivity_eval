"""add question types

Revision ID: add_question_types
Revises: add_randomization
Create Date: 2024-03-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = 'add_question_types'
down_revision = 'add_randomization'
branch_labels = None
depends_on = None

def upgrade():
    
    # Add new columns to question table
    with op.batch_alter_table('question') as batch_op:
        batch_op.add_column(sa.Column('min_value', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('max_value', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('step', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('options', sa.String(1000), nullable=True))
        
def downgrade():
    with op.batch_alter_table('question') as batch_op:
        # Convert type column back to string
        
        batch_op.drop_column('options')
        batch_op.drop_column('step')
        batch_op.drop_column('max_value')
        batch_op.drop_column('min_value')
    
    # Drop the enum type
    op.execute("DROP TYPE question_type")
