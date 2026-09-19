# HASTKATHA Frontend

Premium Next.js App Router frontend for the HASTKATHA craft ecosystem.

## Features
- Premium editorial landing page
- Animated craft cards and hero
- RAG Craft Knowledge AI page
- ML Price Intelligence page
- FastAPI integration via `NEXT_PUBLIC_API_URL`
- Wikimedia Commons visual references with attribution notes

## Run
```bash
cp .env.local.example .env.local
npm install
npm run dev
```
Open http://localhost:3000

FastAPI should be running at http://127.0.0.1:8000.

## API contracts used
- POST `/api/rag/ask` body `{ question, top_k }`
- POST `/api/ml/price-estimate` body `{ product_name, material, product_type, mrp }`
