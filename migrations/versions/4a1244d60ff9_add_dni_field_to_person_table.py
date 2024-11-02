"""Add dni field to person table

Revision ID: 4a1244d60ff9
Revises: 
Create Date: 2024-11-02 13:39:05.868081

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4a1244d60ff9'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Agregar el campo 'dni' a la tabla 'person'
    op.add_column('person', sa.Column('dni', sa.String(length=32), nullable=True))


def downgrade():
    # Eliminar el campo 'dni' en caso de downgrade
    op.drop_column('person', 'dni')
