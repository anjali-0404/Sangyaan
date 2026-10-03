"""initial schema

Revision ID: 0001
Revises:
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

Json = sa.JSON().with_variant(JSONB(), "postgresql")


def upgrade() -> None:
    pg = op.get_bind().dialect.name == "postgresql"
    if pg:
        op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.create_table(
        "sebi_intermediary",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("reg_no", sa.Text, nullable=False, unique=True),
        sa.Column("category", sa.Text, nullable=False),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("name_norm", sa.Text, nullable=False),
        sa.Column("status", sa.Text),
        sa.Column("valid_till", sa.Date),
        sa.Column("city", sa.Text),
        sa.Column("snapshot_date", sa.Date, nullable=False),
    )
    if pg:
        op.execute("CREATE INDEX ix_sebi_name_trgm ON sebi_intermediary USING gin (name_norm gin_trgm_ops)")

    op.create_table(
        "known_entity",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.Text, nullable=False, unique=True),
        sa.Column("domains", Json),
        sa.Column("upi_handles", Json),
        sa.Column("sebi_reg_no", sa.Text),
    )
    op.create_index("ix_known_entity_sebi_reg_no", "known_entity", ["sebi_reg_no"])

    op.create_table(
        "scan",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("input_type", sa.String(10)),
        sa.Column("client", sa.String(10)),
        sa.Column("score", sa.Integer),
        sa.Column("band", sa.String(10)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("text_hash", sa.String(64)),
        sa.Column("lang", sa.String(5)),
        sa.Column("result_json", Json),
    )
    op.create_index("ix_scan_text_hash", "scan", ["text_hash"])

    op.create_table(
        "scan_evidence",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("scan_id", sa.String(36), sa.ForeignKey("scan.id", ondelete="CASCADE")),
        sa.Column("code", sa.String(48)),
        sa.Column("severity", sa.String(8)),
        sa.Column("weight", sa.Integer),
        sa.Column("detail", sa.Text),
        sa.Column("source", sa.Text),
        sa.Column("status", sa.String(12)),
    )
    op.create_index("ix_scan_evidence_scan_id", "scan_evidence", ["scan_id"])

    op.create_table(
        "entity",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("kind", sa.String(12)),
        sa.Column("value_norm", sa.Text),
        sa.Column("first_seen", sa.DateTime(timezone=True)),
        sa.Column("last_seen", sa.DateTime(timezone=True)),
        sa.Column("seen_count", sa.Integer),
        sa.UniqueConstraint("kind", "value_norm"),
    )
    op.create_table(
        "entity_link",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("entity_a", sa.Integer, sa.ForeignKey("entity.id", ondelete="CASCADE")),
        sa.Column("entity_b", sa.Integer, sa.ForeignKey("entity.id", ondelete="CASCADE")),
        sa.Column("scan_id", sa.String(36), sa.ForeignKey("scan.id", ondelete="CASCADE")),
    )
    op.create_index("ix_entity_link_a", "entity_link", ["entity_a"])
    op.create_index("ix_entity_link_b", "entity_link", ["entity_b"])

    op.create_table(
        "report",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("scan_id", sa.String(36), sa.ForeignKey("scan.id", ondelete="CASCADE")),
        sa.Column("verdict", sa.String(10)),
        sa.Column("note", sa.Text),
        sa.Column("raw_text", sa.Text),
        sa.Column("raw_expires_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_report_scan_id", "report", ["scan_id"])


def downgrade() -> None:
    for t in ("report", "entity_link", "entity", "scan_evidence", "scan", "known_entity", "sebi_intermediary"):
        op.drop_table(t)
