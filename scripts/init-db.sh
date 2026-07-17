#!/bin/bash

echo "[DB Init] Starting database initialization..."
echo ""

# Generate Prisma client
echo "[DB Init] Generating Prisma client..."
npx prisma generate
echo "[DB Init] ✓ Prisma client generated"
echo ""

# Push schema to database
echo "[DB Init] Pushing schema to database..."
npx prisma db push --skip-generate
echo "[DB Init] ✓ Schema pushed to database"
echo ""

# Create initial data if not exists
echo "[DB Init] Creating initial SiteStats data..."
npx tsx scripts/seed-db.ts
echo "[DB Init] ✓ Database initialization complete"
echo ""
