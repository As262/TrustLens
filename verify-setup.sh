#!/bin/bash
# TrustLens Setup Verification Script
# Checks if all dependencies and configurations are ready

echo "🔍 TrustLens Setup Verification"
echo "================================"
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "  ✅ Node.js installed: $NODE_VERSION"
else
    echo "  ❌ Node.js not found. Install from nodejs.org"
    exit 1
fi

# Check npm
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "  ✅ npm installed: $NPM_VERSION"
else
    echo "  ❌ npm not found"
    exit 1
fi

# Check MongoDB
echo "✓ Checking MongoDB..."
if command -v mongod &> /dev/null; then
    echo "  ✅ MongoDB installed"
else
    echo "  ⚠️  MongoDB not found locally (using MongoDB Atlas is also fine)"
fi

# Check .env file
echo "✓ Checking .env configuration..."
if [ -f .env ]; then
    echo "  ✅ .env file exists"
else
    echo "  ⚠️  .env file not found"
    echo "  📝 Copy .env.example to .env and configure MongoDB URI"
fi

# Check key directories
echo "✓ Checking directory structure..."
for dir in "client" "server" "client/src" "server/models"
do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir/"
    else
        echo "  ❌ $dir/ missing"
    fi
done

# Check node_modules
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ Root dependencies installed"
else
    echo "  ❌ Run: npm install"
fi

if [ -d "server/node_modules" ]; then
    echo "  ✅ Server dependencies installed"
else
    echo "  ⚠️  Run: npm install --workspace=server"
fi

if [ -d "client/node_modules" ]; then
    echo "  ✅ Client dependencies installed"
else
    echo "  ⚠️  Run: npm install --workspace=client"
fi

echo ""
echo "================================"
echo "✅ Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Configure MongoDB in .env"
echo "2. Run: npm install (if needed)"
echo "3. Run: npm run seed --workspace=server"
echo "4. Terminal 1: npm run dev --workspace=server"
echo "5. Terminal 2: npm run dev --workspace=client"
echo ""
