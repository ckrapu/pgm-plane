#!/bin/bash

# Create deployment package
echo "Creating deployment package..."
rm -f function.zip
zip -r function.zip . -x "*.sh" "*.git*" "node_modules/@anthropic-ai/sdk/node_modules/*"

# Deploy to Lambda
echo "Deploying to Lambda..."
aws lambda create-function \
  --function-name generate-pymc \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role "arn:aws:iam::780705957578:role/lambda-anthropic-role" \
  --environment "Variables={ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}}" \
  --timeout 30 \
  --memory-size 256 \
  || aws lambda update-function-code \
     --function-name generate-pymc \
     --zip-file fileb://function.zip

# Add API Gateway trigger
echo "Adding API Gateway trigger..."
aws lambda add-permission \
  --function-name generate-pymc \
  --statement-id apigateway \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:780705957578:*/*/POST/generate-pymc"

echo "Deployment complete!"
