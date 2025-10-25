#!/bin/bash

echo "🚀 Setting up Adaptive Learning Platform..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install
cd ../server && npm install
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""

# Create .env file if it doesn't exist
if [ ! -f server/.env ]; then
    echo "📝 Creating .env file..."
    cp server/.env.example server/.env
    echo "⚠️  Please edit server/.env and add your MongoDB URI and other credentials"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running (mongod)"
echo "2. Edit server/.env with your configuration"
echo "3. Run 'npm run dev' to start the application"
echo "4. Visit http://localhost:5173"
echo ""
echo "For more details, check README.md or QUICKSTART.md"
