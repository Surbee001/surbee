#!/bin/bash
# Setup Modal secrets for Cipher ML retraining pipeline
#
# This script creates the required secrets in Modal for the retraining pipeline.
# You must have the Modal CLI installed and be logged in.
#
# Usage: ./scripts/setup-modal-secrets.sh

echo "🔐 Setting up Modal secrets for Cipher ML..."
echo ""

# Check if Modal CLI is available
if ! command -v modal &> /dev/null && ! python3 -m modal --help &> /dev/null; then
    echo "❌ Modal CLI not found. Install with: pip install modal"
    exit 1
fi

# Get Supabase credentials from user
echo "Enter your Supabase credentials:"
echo ""
read -p "SUPABASE_URL: " SUPABASE_URL
read -p "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
    exit 1
fi

# Create the secret
echo ""
echo "Creating Modal secret 'supabase-credentials'..."

python3 -m modal secret create supabase-credentials \
    SUPABASE_URL="$SUPABASE_URL" \
    SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Secret created successfully!"
    echo ""
    echo "Now you can deploy the retraining pipeline:"
    echo "  python3 -m modal deploy modal/cipher-retrain.py"
else
    echo ""
    echo "❌ Failed to create secret. You can also create it manually at:"
    echo "  https://modal.com/secrets"
fi
