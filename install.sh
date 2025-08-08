#!/bin/bash

# FM Financial Management Platform - Installation Script
# This script sets up the complete FM platform with all dependencies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  FM Financial Management Platform${NC}"
    echo -e "${PURPLE}  Installation Script${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
        
        if [ "$NODE_MAJOR" -ge 18 ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
            return 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        return 1
    fi
}

# Function to check npm version
check_npm_version() {
    if command_exists npm; then
        NPM_VERSION=$(npm -v)
        NPM_MAJOR=$(echo $NPM_VERSION | cut -d'.' -f1)
        
        if [ "$NPM_MAJOR" -ge 9 ]; then
            print_success "npm version $NPM_VERSION is compatible"
            return 0
        else
            print_error "npm version $NPM_VERSION is too old. Please install npm 9 or higher."
            return 1
        fi
    else
        print_error "npm is not installed. Please install npm 9 or higher."
        return 1
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p temp
    mkdir -p cache
    mkdir -p client/public/uploads
    
    print_success "Directories created successfully"
}

# Function to install server dependencies
install_server_dependencies() {
    print_status "Installing server dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Server dependencies installed successfully"
    else
        print_error "package.json not found in server directory"
        exit 1
    fi
}

# Function to install client dependencies
install_client_dependencies() {
    print_status "Installing client dependencies..."
    
    if [ -d "client" ] && [ -f "client/package.json" ]; then
        cd client
        npm install
        cd ..
        print_success "Client dependencies installed successfully"
    else
        print_error "Client directory or package.json not found"
        exit 1
    fi
}

# Function to set up environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "Environment file created from template. Please update .env with your actual configuration."
        else
            print_error "env.example not found"
            exit 1
        fi
    else
        print_warning "Environment file already exists. Skipping creation."
    fi
}

# Function to create Tailwind config
create_tailwind_config() {
    print_status "Creating Tailwind CSS configuration..."
    
    if [ -d "client" ]; then
        cd client
        
        # Create tailwind.config.js if it doesn't exist
        if [ ! -f "tailwind.config.js" ]; then
            cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
EOF
            print_success "Tailwind CSS configuration created"
        else
            print_warning "Tailwind config already exists. Skipping creation."
        fi
        
        cd ..
    fi
}

# Function to create PostCSS config
create_postcss_config() {
    print_status "Creating PostCSS configuration..."
    
    if [ -d "client" ]; then
        cd client
        
        # Create postcss.config.js if it doesn't exist
        if [ ! -f "postcss.config.js" ]; then
            cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
            print_success "PostCSS configuration created"
        else
            print_warning "PostCSS config already exists. Skipping creation."
        fi
        
        cd ..
    fi
}

# Function to create database seed script
create_seed_script() {
    print_status "Creating database seed script..."
    
    if [ ! -d "server/database" ]; then
        mkdir -p server/database
    fi
    
    if [ ! -f "server/database/seed.js" ]; then
        cat > server/database/seed.js << 'EOF'
const mongoose = require('mongoose');
const User = require('../models/User');
const FinancialTransaction = require('../models/FinancialTransaction');
const AIIntervention = require('../models/AIIntervention');
const logger = require('../utils/logger');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to database for seeding');

    // Clear existing data
    await User.deleteMany({});
    await FinancialTransaction.deleteMany({});
    await AIIntervention.deleteMany({});
    logger.info('Cleared existing data');

    // Create sample user
    const sampleUser = new User({
      email: 'demo@fm-platform.com',
      password: 'Demo123!@#',
      firstName: 'Demo',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      phone: '+1234567890',
      isEmailVerified: true,
      financialProfile: {
        income: {
          annual: 75000,
          monthly: 6250,
          currency: 'USD'
        },
        expenses: {
          monthly: 4500,
          categories: [
            { name: 'Housing', amount: 2000, percentage: 44.4 },
            { name: 'Transportation', amount: 500, percentage: 11.1 },
            { name: 'Food', amount: 600, percentage: 13.3 },
            { name: 'Utilities', amount: 300, percentage: 6.7 },
            { name: 'Entertainment', amount: 400, percentage: 8.9 },
            { name: 'Other', amount: 700, percentage: 15.6 }
          ]
        },
        savings: {
          current: 15000,
          target: 50000,
          rate: 15
        },
        debt: {
          total: 25000,
          types: [
            { name: 'Student Loan', amount: 20000, interestRate: 4.5, monthlyPayment: 200 },
            { name: 'Credit Card', amount: 5000, interestRate: 18.9, monthlyPayment: 150 }
          ]
        },
        investments: {
          total: 25000,
          portfolio: [
            { type: '401k', amount: 20000, percentage: 80 },
            { type: 'Roth IRA', amount: 5000, percentage: 20 }
          ]
        },
        riskTolerance: 'moderate',
        financialGoals: [
          {
            name: 'Emergency Fund',
            targetAmount: 25000,
            targetDate: new Date('2024-12-31'),
            priority: 'high',
            progress: 60
          },
          {
            name: 'Down Payment',
            targetAmount: 50000,
            targetDate: new Date('2026-06-30'),
            priority: 'medium',
            progress: 30
          }
        ]
      },
      aiPreferences: {
        interventionLevel: 'moderate',
        notificationFrequency: 'immediate',
        categories: [
          { name: 'spending_alert', enabled: true, threshold: 100 },
          { name: 'budget_warning', enabled: true, threshold: 80 },
          { name: 'savings_opportunity', enabled: true, threshold: 50 }
        ],
        learningEnabled: true
      }
    });

    await sampleUser.save();
    logger.info('Created sample user');

    // Create sample transactions
    const sampleTransactions = [
      {
        userId: sampleUser._id,
        type: 'expense',
        category: 'food',
        amount: 45.67,
        description: 'Grocery shopping at Whole Foods',
        merchant: { name: 'Whole Foods Market' },
        date: new Date()
      },
      {
        userId: sampleUser._id,
        type: 'expense',
        category: 'transportation',
        amount: 35.00,
        description: 'Gas station fill-up',
        merchant: { name: 'Shell Gas Station' },
        date: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        userId: sampleUser._id,
        type: 'income',
        category: 'salary',
        amount: 3125.00,
        description: 'Bi-weekly salary payment',
        merchant: { name: 'Company Inc.' },
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    await FinancialTransaction.insertMany(sampleTransactions);
    logger.info('Created sample transactions');

    // Create sample AI intervention
    const sampleIntervention = new AIIntervention({
      userId: sampleUser._id,
      type: 'spending_alert',
      trigger: 'transaction',
      context: {
        amount: 45.67,
        category: 'food',
        merchant: 'Whole Foods Market',
        timestamp: new Date()
      },
      analysis: {
        confidence: 0.85,
        riskLevel: 'medium',
        urgency: 'medium',
        impact: 'moderate',
        reasoning: 'This grocery purchase is 15% higher than your average spending in this category'
      },
      recommendation: {
        title: 'Spending Alert',
        description: 'Your grocery spending is higher than usual. Consider reviewing your shopping list.',
        action: 'suggest',
        suggestedActions: [
          {
            type: 'review_purchase',
            description: 'Review if all items were necessary',
            impact: 'Better spending decisions',
            effort: 'low'
          }
        ]
      },
      delivery: {
        channel: 'in_app',
        priority: 6,
        timing: { sentAt: new Date() }
      }
    });

    await sampleIntervention.save();
    logger.info('Created sample AI intervention');

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
EOF
        print_success "Database seed script created"
    else
        print_warning "Database seed script already exists. Skipping creation."
    fi
}

# Function to create migration script
create_migration_script() {
    print_status "Creating database migration script..."
    
    if [ ! -d "server/database" ]; then
        mkdir -p server/database
    fi
    
    if [ ! -f "server/database/migrate.js" ]; then
        cat > server/database/migrate.js << 'EOF'
const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();

const runMigrations = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to database for migrations');

    // Create indexes
    logger.info('Creating database indexes...');
    
    // User indexes
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ 'financialProfile.riskTolerance': 1 });
    await mongoose.connection.db.collection('users').createIndex({ 'aiPreferences.interventionLevel': 1 });
    await mongoose.connection.db.collection('users').createIndex({ createdAt: -1 });
    await mongoose.connection.db.collection('users').createIndex({ lastLogin: -1 });

    // FinancialTransaction indexes
    await mongoose.connection.db.collection('financialtransactions').createIndex({ userId: 1, date: -1 });
    await mongoose.connection.db.collection('financialtransactions').createIndex({ userId: 1, type: 1, date: -1 });
    await mongoose.connection.db.collection('financialtransactions').createIndex({ userId: 1, category: 1 });
    await mongoose.connection.db.collection('financialtransactions').createIndex({ userId: 1, amount: -1 });
    await mongoose.connection.db.collection('financialtransactions').createIndex({ 'externalData.plaidTransactionId': 1 });
    await mongoose.connection.db.collection('financialtransactions').createIndex({ 'aiAnalysis.riskLevel': 1 });
    await mongoose.connection.db.collection('financialtransactions').createIndex({ 'recurring.isRecurring': 1, 'recurring.nextDueDate': 1 });

    // AIIntervention indexes
    await mongoose.connection.db.collection('aiinterventions').createIndex({ userId: 1, 'metadata.createdAt': -1 });
    await mongoose.connection.db.collection('aiinterventions').createIndex({ userId: 1, type: 1 });
    await mongoose.connection.db.collection('aiinterventions').createIndex({ userId: 1, 'userResponse.status': 1 });
    await mongoose.connection.db.collection('aiinterventions').createIndex({ 'analysis.confidence': -1 });
    await mongoose.connection.db.collection('aiinterventions').createIndex({ 'delivery.priority': -1 });
    await mongoose.connection.db.collection('aiinterventions').createIndex({ 'learning.effectiveness': -1 });
    await mongoose.connection.db.collection('aiinterventions').createIndex({ trigger: 1, 'metadata.createdAt': -1 });

    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database migrations failed:', error);
    process.exit(1);
  }
};

runMigrations();
EOF
        print_success "Database migration script created"
    else
        print_warning "Database migration script already exists. Skipping creation."
    fi
}

# Function to create startup script
create_startup_script() {
    print_status "Creating startup script..."
    
    if [ ! -f "start.sh" ]; then
        cat > start.sh << 'EOF'
#!/bin/bash

# FM Financial Management Platform - Startup Script

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "Environment file (.env) not found. Please create one from env.example"
    exit 1
fi

# Start the application
print_status "Starting FM Financial Management Platform..."

# Start both server and client in development mode
npm run dev

print_success "FM Platform started successfully!"
print_status "Server running on: http://localhost:5000"
print_status "Client running on: http://localhost:3000"
print_status "Health check: http://localhost:5000/health"
EOF
        chmod +x start.sh
        print_success "Startup script created"
    else
        print_warning "Startup script already exists. Skipping creation."
    fi
}

# Function to create Docker configuration
create_docker_config() {
    print_status "Creating Docker configuration..."
    
    if [ ! -f "Dockerfile" ]; then
        cat > Dockerfile << 'EOF'
# Multi-stage build for FM Platform
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd client && npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fmuser

# Copy built application
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/build ./client/build
COPY --from=builder /app/package*.json ./

# Create necessary directories
RUN mkdir -p logs uploads temp cache
RUN chown -R fmuser:nodejs /app

USER fmuser

EXPOSE 5000

ENV PORT=5000

CMD ["npm", "start"]
EOF
        print_success "Dockerfile created"
    else
        print_warning "Dockerfile already exists. Skipping creation."
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  fm-platform:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/fm_platform
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=fm_platform
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
EOF
        print_success "Docker Compose configuration created"
    else
        print_warning "Docker Compose configuration already exists. Skipping creation."
    fi
}

# Function to display final instructions
display_final_instructions() {
    echo ""
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  Installation Complete!${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo ""
    echo "1. ${CYAN}Configure Environment:${NC}"
    echo "   - Edit .env file with your configuration"
    echo "   - Add your API keys (OpenAI, Stripe, Plaid, etc.)"
    echo ""
    echo "2. ${CYAN}Set up Database:${NC}"
    echo "   - Configure MongoDB connection in .env"
    echo "   - Run: npm run db:migrate"
    echo "   - Run: npm run db:seed (for sample data)"
    echo ""
    echo "3. ${CYAN}Start the Application:${NC}"
    echo "   - Development: npm run dev"
    echo "   - Production: npm start"
    echo "   - Or use: ./start.sh"
    echo ""
    echo "4. ${CYAN}Access the Application:${NC}"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5000"
    echo "   - Health Check: http://localhost:5000/health"
    echo ""
    echo -e "${YELLOW}Default Demo Account:${NC}"
    echo "   Email: demo@fm-platform.com"
    echo "   Password: Demo123!@#"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "   - README.md for detailed setup instructions"
    echo "   - API documentation available at /api/docs (when running)"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
    echo ""
}

# Main installation function
main() {
    print_header
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! check_node_version; then
        print_error "Node.js version check failed"
        exit 1
    fi
    
    if ! check_npm_version; then
        print_error "npm version check failed"
        exit 1
    fi
    
    # Create directories
    create_directories
    
    # Install dependencies
    install_server_dependencies
    install_client_dependencies
    
    # Set up configuration files
    setup_environment
    create_tailwind_config
    create_postcss_config
    create_seed_script
    create_migration_script
    create_startup_script
    create_docker_config
    
    # Display final instructions
    display_final_instructions
}

# Run main function
main "$@" 