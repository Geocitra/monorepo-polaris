#!/bin/bash
PGPASSWORD=polaris_secret_2026 psql -h localhost -U polaris_admin -d polaris_db << 'EOF'
SET app.current_tenant_id = 'a28b7732-8960-4dff-a3c9-be70c15492b6';
SELECT id, status, original_media_url, formatted_media_url FROM social_publishing_jobs WHERE status = 'PUBLISHED' ORDER BY created_at DESC LIMIT 1;
EOF
