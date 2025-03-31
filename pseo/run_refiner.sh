#!/bin/bash

# Set Azure OpenAI environment variables
# Replace these with your actual Azure OpenAI credentials
export AZURE_OPENAI_API_KEY="your-azure-openai-api-key"
export AZURE_OPENAI_ENDPOINT="your-azure-openai-endpoint"

# Run the Python script
echo "Running prompt refiner script..."
python3 refine_prompts.py

echo "Done!" 