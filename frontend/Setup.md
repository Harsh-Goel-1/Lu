#!/bin/bash

# Quick setup script for Aptos Crowdfund Frontend
# Run from Lu/ directory

echo "🚀 Setting up Aptos Crowdfund Frontend..."

# Create frontend directory
echo "📁 Creating directory structure..."
cd Lu
mkdir -p frontend/app/campaign/\[address\]
mkdir -p frontend/components
mkdir -p frontend/lib
mkdir -p frontend/hooks

cd frontend

# Initialize npm
echo "📦 Initializing npm..."
npm init -y

# Create package.json with dependencies
echo "📝 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "aptos-crowdfund-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@aptos-labs/ts-sdk": "^1.28.0",
    "@aptos-labs/wallet-adapter-ant-design": "^3.0.5",
    "@aptos-labs/wallet-adapter-react": "^3.5.6",
    "@martianwallet/aptos-wallet-adapter": "^0.0.5",
    "aptos": "^1.21.0",
    "lucide-react": "^0.263.1",
    "next": "14.2.5",
    "petra-plugin-wallet-adapter": "^0.4.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.19",
    "eslint": "^8",
    "eslint-config-next": "14.2.5",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "typescript": "^5"
  }
}
EOF

# Install dependencies
echo "⬇️  Installing dependencies (this may take a few minutes)..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy all the TypeScript/TSX files from the artifacts to their respective directories"
echo "2. Deploy your Move contract: cd ../move && aptos move publish"
echo "3. Update lib/constants.ts with your deployed MODULE_ADDRESS"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "🎉 Happy coding!"