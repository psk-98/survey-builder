#!/bin/bash

set -e

echo "⚠️  Resetting database migrations..."

uv run alembic downgrade base

echo "⬆️ Running migrations..."

uv run alembic upgrade head

echo "✅ Database rebuilt"
