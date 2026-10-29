# HASTKATHA 🇮🇳
### Discover. Empower. Preserve.

**An AI-powered digital ecosystem for Indian traditional crafts, designed to connect skilled artisans with modern marketplaces while preserving India's rich cultural heritage.**

HASTKATHA combines artificial intelligence, machine learning, computer vision, and retrieval-augmented generation (RAG) to make traditional handicrafts more discoverable, empower artisans with digital tools, and help preserve India's diverse craft traditions.

<p align="center">

  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />

</p>

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [AI, ML and RAG](#-ai-ml-and-rag)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 The Problem

India has an extraordinary heritage of traditional handicrafts, handloom products, and region-specific art forms. However, many artisans face challenges that prevent their skills from reaching wider markets.

- **Limited digital access:** Skilled artisans may not have the technical knowledge required to create online product listings.
- **Market accessibility:** Connecting directly with potential customers beyond local markets can be difficult.
- **Product discovery:** Buyers often struggle to discover authentic crafts and understand their cultural significance.
- **Pricing uncertainty:** Independent artisans may lack reliable market comparisons when deciding selling prices.
- **Cultural preservation:** Traditional techniques, materials, and craft stories need better digital documentation and visibility.

A conventional e-commerce website alone does not solve these problems. Artisans need tools that reduce the effort required to participate in the digital economy.

## 💡 Our Solution

HASTKATHA is designed as an AI-enabled craft ecosystem with three primary user roles.

| Module | Purpose |
|---|---|
| 🛍️ Buyer | Discover traditional crafts, explore products, learn their stories, and shop. |
| 🧵 Artisan / Seller | Upload product images, generate listing drafts with AI, manage inventory, and reach customers. |
| 🛡️ Admin | Manage platform data, moderate listings, oversee users, and monitor marketplace activity. |

Our central idea is simple:

**An artisan should be able to start with a photograph of their craft instead of having to write a complete product listing from scratch.**

HASTKATHA aims to turn that photograph into a useful, editable product listing while keeping the artisan in control of the final details.

## ✨ Key Features

### 1. AI-Powered Product Listing

Help artisans digitize their products with minimal effort.

- Upload a product photograph.
- Analyze visual characteristics using an AI vision model.
- Generate a product name and description.
- Identify likely materials, product type, and associated craft.
- Extract visible text when available.
- Generate descriptive tags and visual features.
- Review and edit the generated listing before publishing.

AI-generated details are suggestions, not guaranteed facts. Geographic origin, authenticity, and GI registration should not be assumed from an image alone.

### 2. Indian Craft Discovery

Explore traditional crafts and their associated information.

- Browse craft records.
- Search and filter available crafts.
- Explore craft details, materials, techniques, and regional information where available.
- Discover marketplace products associated with crafts.
- Learn about India's traditional craft heritage.

### 3. Artisan Marketplace

A marketplace experience designed to connect artisans and buyers.

- Product listings with images and descriptions.
- Product pricing and stock information.
- Product detail pages.
- Artisan-managed inventory.
- Public product discovery.

Shopping cart, checkout, order tracking, and online payment are planned extensions of the marketplace.

### 4. AI-Powered Craft Assistant

Use a Retrieval-Augmented Generation (RAG) pipeline to answer questions about Indian crafts using a curated craft dataset.

The intended workflow combines semantic retrieval with language generation so answers can be grounded in relevant retrieved information rather than relying exclusively on a language model's internal knowledge.

### 5. ML-Based Price Estimation

Support better pricing decisions with a machine learning pipeline trained on collected product-market data.

- Product-name text features.
- Material and product-type features.
- MRP-based model inputs.
- Price predictions and evaluation metrics.
- Comparable-product information where available.

Price predictions should be treated as estimates, not guaranteed selling prices. Reliable market comparisons depend on data quality, product similarity, and current listings.

### 6. Authentication and Role-Based Experiences

The backend includes JWT-based authentication and role information for different platform users.

The platform is being developed to support separate experiences for buyers, artisans, and administrators.

---

## 🔄 How It Works

### AI listing workflow

```mermaid
flowchart TD
    A[Artisan uploads product image] --> B[Image upload]
    B --> C[AI vision analysis]
    C --> D[Generate listing draft]
    D --> E[Name, description, material and tags]
    E --> F[Artisan reviews and edits]
    F --> G[Select matching craft]
    G --> H[Enter selling price and stock]
    H --> I[Publish product]
    I --> J[Save product in PostgreSQL]
    J --> K[Attach product image]
    K --> L[Display in marketplace]
```

### AI craft assistant workflow

```mermaid
flowchart TD
    A[User asks a question] --> B[Convert question into embedding]
    B --> C[Retrieve relevant craft documents]
    C --> D[Build context]
    D --> E[LLM generates an answer]
    E --> F[Return answer with available sources]
```

### Marketplace workflow

```mermaid
flowchart LR
    A[Discover crafts] --> B[Browse products]
    B --> C[View product details]
    C --> D[Add to cart]
    D --> E[Checkout]
    E --> F[Payment verification]
    F --> G[Order confirmation]
```

*The marketplace diagram represents the intended shopping workflow; checkout and payment require their own implementation and verification.*

---

## 🏗️ System Architecture

HASTKATHA follows a modular architecture that separates the user interface, backend APIs, data storage, and AI/ML components.

```mermaid
flowchart TB
    U[Buyer / Artisan / Admin]

    subgraph Frontend
        F[Next.js + React + TypeScript]
    end

    subgraph Backend
        API[FastAPI REST APIs]
        AUTH[JWT Authentication]
        SVC[Marketplace Services]
    end

    subgraph Data
        DB[(PostgreSQL)]
        IMG[Product Image Storage]
        DATA[Craft and Product Datasets]
    end

    subgraph Intelligence
        VISION[Vision AI Listing Generation]
        RAG[RAG Retrieval Pipeline]
        PRICE[ML Price Estimation]
    end

    U --> F
    F --> API
    API --> AUTH
    API --> SVC
    SVC --> DB
    SVC --> IMG
    API --> VISION
    API --> RAG
    API --> PRICE
    RAG --> DATA
    PRICE --> DATA
```

### Architectural principles

- **Separation of concerns:** Frontend, API, persistence, and intelligence components have distinct responsibilities.
- **Reusable APIs:** Frontend modules communicate with the backend through centralized API methods.
- **Structured persistence:** Relational entities represent users, artisans, crafts, products, images, orders, and reviews.
- **Human-in-the-loop AI:** Artisans can review and edit AI-generated listing information before publication.
- **Extensibility:** The architecture can be extended with vector search, scalable image storage, caching, and payment integrations.

---

## 🧰 Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| UI and icons | Lucide React |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT, password hashing |
| AI vision | Groq API with a vision-capable model |
| RAG | Sentence Transformers, ChromaDB, Groq LLM |
| Machine Learning | scikit-learn, XGBoost, TF-IDF, One-Hot Encoding |
| Data processing | Pandas, NumPy |
| API testing | Swagger UI, HTTP requests |
| Version control | Git and GitHub |

Additional technologies such as Redis, object storage, Docker, CI/CD, and experiment tracking can be introduced as the platform evolves.

---

## 📂 Project Structure

```text
HASTKATHA/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── dependencies.py
│   │   ├── database.py
│   │   ├── config.py
│   │   └── main.py
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── crafts/
│   │   ├── products/
│   │   ├── seller/
│   │   ├── login/
│   │   ├── ai-assistant/
│   │   └── price-estimator/
│   ├── components/
│   ├── lib/
│   │   └── api.ts
│   ├── public/
│   └── .env.local
│
├── ml/
│   ├── models/
│   └── ...
│
├── rag/
│   └── ...
│
└── README.md
```

*The structure is representative. File and directory names may vary as development progresses.*

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

Install the following:

- Python 3.10 or a compatible version supported by your dependencies.
- Node.js and npm.
- PostgreSQL.
- Git.
- A Groq API key for AI features.

### 1. Clone the repository

```bash
git clone https://github.com/Naincy33/HASTKATHA.git
cd HASTKATHA
```

### 2. Set up the backend

```bash
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

If your dependency file does not include these packages, install the required dependencies:

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary
pip install pydantic-settings python-dotenv
pip install python-multipart groq
pip install "passlib[bcrypt]" python-jose
```

### 3. Create the PostgreSQL database

Open PostgreSQL and create a database:

```sql
CREATE DATABASE hastkatha;
```

Configure the database connection in your backend environment file.

### 4. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/hastkatha

GROQ_API_KEY=YOUR_GROQ_API_KEY

JWT_SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Replace the placeholders with your own local configuration. Never commit API keys, database passwords, or JWT secrets to GitHub.

### 5. Start the backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API should be available at:

- API base URL: `http://127.0.0.1:8000`
- Interactive API documentation: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

### 6. Set up the frontend

Open another terminal:

```bash
cd HASTKATHA/frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Open:

`http://localhost:3000`

Keep the backend and frontend running in separate terminals.

### 7. Explore the application

Depending on the routes available in your current checkout, explore:

| Route | Purpose |
|---|---|
| `/` | Main landing page |
| `/crafts` | Browse traditional crafts |
| `/products` | Browse marketplace products |
| `/login` | Sign in |
| `/seller` | Artisan dashboard |
| `/new-product` | Create an AI-assisted listing |
| `/ai-assistant` | Ask questions about crafts |
| `/price-estimator` | Explore product price estimates |

---

## 🔐 Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | Access AI model APIs |
| `JWT_SECRET_KEY` | Sign authentication tokens |
| `JWT_ALGORITHM` | JWT signing algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime |
| `NEXT_PUBLIC_API_URL` | Backend URL used by the frontend |

Keep secret values exclusively in local environment files or your deployment platform's secret manager.

If you later add Google authentication or Razorpay payments, configure their credentials separately and keep private credentials on the backend.

---

## 📡 API Documentation

FastAPI provides interactive documentation through Swagger UI.

Once the backend is running, open:

**[HASTKATHA API — Swagger UI](http://127.0.0.1:8000/docs)**

The backend includes API modules for authentication, artisans, crafts, products, product images, orders, reviews, and AI-related functionality.

Typical product operations include:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/crafts/` | Retrieve crafts |
| `GET` | `/crafts/{craft_id}` | Retrieve a craft |
| `GET` | `/products/` | Browse products |
| `GET` | `/products/{product_id}` | Retrieve a product |
| `POST` | `/products/` | Create a product |
| `GET` | `/products/my` | Retrieve the authenticated artisan's products |
| `POST` | `/product-image/` | Attach an image to a product |
| `POST` | `/api/ai/generate-listing` | Generate an AI listing draft |

Exact endpoint availability and request requirements depend on the backend version. Protected operations require valid authentication where configured.

---

## 🧠 AI, ML and RAG

### AI-assisted listing generation

The listing workflow uses a vision-capable model to analyze uploaded product photographs and produce structured JSON containing fields such as:

- Product name
- Product description
- Material
- Product type
- Likely craft association
- Visible text
- Descriptive tags
- Visual features
- Confidence estimate

The resulting data is intended to reduce listing effort, not replace the artisan's judgment.

### Retrieval-Augmented Generation

The RAG component uses a curated One District One Product (ODOP) dataset to retrieve relevant craft information.

The pipeline includes:

1. Data cleaning and normalization.
2. Text preparation and document creation.
3. Embedding generation using Sentence Transformers.
4. Vector retrieval through ChromaDB.
5. Context-aware answer generation using a language model.

The quality of answers depends on source coverage, retrieval relevance, and the accuracy of the underlying data.

### Machine learning for price estimation

The pricing pipeline uses product attributes and text features to estimate selling prices.

The implemented experimentation includes:

- TF-IDF text features.
- One-Hot Encoding for categorical attributes.
- XGBoost regression.
- Train/test evaluation.
- Cross-validation.
- MAE, RMSE, and \(R^2\) metrics.

Real product listings are important for making the estimates useful. A prediction is not equivalent to a verified market price, and model performance should be re-evaluated on unseen, representative data before production use.



## 🤝 Contributing

Contributions and ideas are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes and test them.
4. Commit with a descriptive message.
5. Open a pull request describing the problem solved and the changes made.

For major changes, open an issue first so the implementation can be discussed.

---

## 🔒 Security and Responsible AI

- Never commit secrets or production credentials.
- Validate user input and uploaded files.
- Restrict seller operations to authorized users.
- Verify payment signatures on the backend before marking orders as paid.
- Avoid presenting AI-inferred craft origins, authenticity, or GI status as verified facts.
- Use real market evidence for pricing comparisons and clearly disclose estimates.
- Review data licensing and attribution requirements before redistributing datasets.

---

## 🌱 Vision

HASTKATHA is built around three ideas:

**Discover** — Make India's traditional crafts easier to find and understand.

**Empower** — Give artisans accessible digital tools to participate in modern commerce.

**Preserve** — Help document and celebrate the stories, skills, and cultural heritage behind every craft.

Technology should not erase the human story behind handmade products. It should help that story travel further.

---

<p align="center">

  **HASTKATHA — Where heritage meets intelligence. 🇮🇳**

  *Built to empower artisans, connect communities, and preserve India's craft legacy.*

</p>

---

## Phase 2 — Customer Experience

Phase 2 introduces a customer journey across registration, sign-in, product discovery, cart, checkout and order history.

### Customer routes

| Route | Purpose |
|---|---|
| \`/register\` | Create a customer account with email and password |
| \`/login\` | Sign in using email/password; Google Identity Services is available after OAuth configuration |
| \`/products\` | Browse artisan products and available product photos |
| \`/products/[id]\` | Read product details and add it to the cart |
| \`/cart\` | Edit quantities, remove items and view the subtotal |
| \`/checkout\` | Enter delivery details and place a Cash on Delivery order |
| \`/orders\` | View the signed-in customer's order history and status |

The cart is stored in the current browser's local storage. Orders are stored in PostgreSQL and the backend validates product availability and inventory when placing an order.

### Database migration

The checkout flow adds delivery and payment-method fields to the existing \`orders\` table. Start the backend at least once so the table exists, then run the migration against the same PostgreSQL database configured in \`backend/.env\`:

\`\`\`bash
cd backend
set -a; source .env; set +a\npsql "$DATABASE_URL" -f migrations/phase2_customer_checkout.sql
\`\`\`

Do not skip this migration on an existing database. \`Base.metadata.create_all()\` creates missing tables but does not add columns to a table that already exists.

### Google sign-in setup

1. In Google Cloud Console, configure OAuth consent and create a **Web application** OAuth client.
2. Add your frontend origin (for local development, \`http://localhost:3000\`) to **Authorized JavaScript origins**.
3. Add the same client ID to both environment files:

Frontend \`frontend/.env.local\`:

\`\`\`env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
\`\`\`

Backend \`backend/.env\`:

\`\`\`env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
\`\`\`

4. Install backend dependencies with \`pip install -r requirements.txt\`, restart both servers and test sign-in using a Google account.

The backend verifies the Google ID token using Google's library; the frontend client ID is public configuration, not a secret. Keep \`JWT_SECRET_KEY\`, database credentials and any other server secrets private.

### Current checkout limitations

- Cash on Delivery is the only order method accepted by the backend.
- Online payment collection and payment-provider verification are not implemented; selecting online payment does not charge a customer.
- Shipping charges are not calculated. The displayed amount is the product subtotal.
- Orders are recorded and stock is reduced when an order is placed. Add a production delivery/cancellation workflow before using this with real customers.
