"""add randomization

Revision ID: add_randomization
Revises: initial_schema
Create Date: 2024-03-14 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = 'add_randomization'
down_revision = 'initial_schema'
branch_labels = None
depends_on = 'initial_schema'

def upgrade():
    
    # Add columns to evaluation table
    with op.batch_alter_table('evaluation') as batch_op:
        batch_op.add_column(sa.Column('language_model', sa.VARCHAR(69), nullable=False))
        batch_op.add_column(sa.Column('use_case', sa.VARCHAR(69), nullable=False))
        batch_op.add_column(sa.Column('prompt_type', sa.VARCHAR(69), nullable=False))

def downgrade():
    # Remove columns from evaluation table
    with op.batch_alter_table('evaluation') as batch_op:
        batch_op.drop_column('prompt_type')
        batch_op.drop_column('use_case')
        batch_op.drop_column('language_model')
    