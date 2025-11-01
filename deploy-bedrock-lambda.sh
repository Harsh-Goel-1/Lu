#!/bin/bash

echo "📦 Creating Lambda deployment package..."

# Create temp directory
mkdir -p lambda-deploy
cp lambda-bedrock-suggest.js lambda-deploy/index.js
cp lambda-package.json lambda-deploy/package.json

# Install dependencies
cd lambda-deploy
npm install --production
zip -r ../bedrock-lambda.zip .
cd ..
rm -rf lambda-deploy

echo "✅ Package created: bedrock-lambda.zip"
echo ""
echo "🚀 Next steps:"
echo "1. Go to AWS Lambda Console"
echo "2. Create function → Author from scratch"
echo "3. Runtime: Node.js 20.x"
echo "4. Upload bedrock-lambda.zip"
echo "5. Add environment variable: AWS_REGION=us-east-1"
echo "6. Attach execution role with Bedrock permissions"
echo "7. Create API Gateway HTTP API trigger"
echo "8. Copy API endpoint URL"
