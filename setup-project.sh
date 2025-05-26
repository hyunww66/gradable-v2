#!/bin/bash

echo "🧹 Cleaning up all conflicting lockfiles and node_modules..."
rm -rf node_modules bun.lockb pnpm-lock.yaml package-lock.json yarn.lock

echo "📦 Installing with Bun..."
bun install

echo "🔧 Removing problematic dependencies and replacing with proper ones..."
bun remove strip-ansi-cjs string-width-cjs wrap-ansi-cjs
bun add strip-ansi@^6.0.1 string-width@^4.2.3 wrap-ansi@^7.0.0

echo "📝 Ensuring package.json has the right scripts..."
# Create a temporary package.json with proper scripts
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = {
  ...pkg.scripts,
  'build': 'next build',
  'dev': 'next dev',
  'start': 'next start',
  'lint': 'next lint'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo "⚙️ Creating vercel.json for Vercel v0 build output..."
cat > vercel.json <<EOF
{
  "buildCommand": "bun install && bun run build",
  "installCommand": "bun install",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
EOF

echo "📋 Creating optimized tsconfig.json..."
cat > tsconfig.json <<EOF
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

echo "🚫 Creating comprehensive .gitignore..."
cat > .gitignore <<EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
bun-debug.log*
bun-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel

# Bun
bun.lockb

# Local storage and cache
.chats/
*.local
EOF

echo "🎨 Installing Radix UI components for Gradable app..."
bun add @radix-ui/react-accordion @radix-ui/react-avatar @radix-ui/react-collapsible @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-progress @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip

echo "✨ Installing animation and styling dependencies..."
bun add framer-motion class-variance-authority clsx tailwind-merge

echo "🎯 Installing icons and utilities..."
bun add lucide-react next-themes

echo "🛠️ Installing development dependencies..."
bun add -D @types/node @types/react @types/react-dom typescript tailwindcss postcss autoprefixer eslint eslint-config-next

echo "🔄 Final reinstall to update bun.lockb with all dependencies..."
bun install

echo "🏗️ Testing build process..."
bun run build

echo "✅ Setup complete! Your Gradable app is ready for development and deployment."
echo ""
echo "Next steps:"
echo "1. Run 'bun run dev' to start development server"
echo "2. Run 'bun run build' to test production build"
echo "3. Deploy to Vercel v0 when ready"
EOF
