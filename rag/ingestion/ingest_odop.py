import os
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

PROJECT_ROOT = os.path.dirname(BASE_DIR)

DATA_PATH = os.path.join(
    PROJECT_ROOT,
    "ml",
    "datasets",
    "processed",
    "odop_handicrafts.csv"
)

VECTORSTORE_PATH = os.path.join(
    PROJECT_ROOT,
    "rag",
    "vectorstore"
)


# ============================================================
# LOAD DATA
# ============================================================

print("\n========================================")
print("HASTKATHA RAG INGESTION")
print("========================================")

print("\nLoading ODOP dataset...")

df = pd.read_csv(DATA_PATH)

print(
    "Dataset shape:",
    df.shape
)


# ============================================================
# CLEAN DATA
# ============================================================

df = df.fillna("")


# ============================================================
# EMBEDDING MODEL
# ============================================================

print("\nLoading embedding model...")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print(
    "Embedding model loaded."
)


# ============================================================
# CREATE CHROMA CLIENT
# ============================================================

print("\nCreating vector database...")

client = chromadb.PersistentClient(
    path=VECTORSTORE_PATH
)


# ============================================================
# COLLECTION
# ============================================================

collection = client.get_or_create_collection(
    name="hastkatha_crafts"
)


# ============================================================
# PREPARE DOCUMENTS
# ============================================================

documents = []
metadatas = []
ids = []


for index, row in df.iterrows():

    document = f"""
Craft Name: {row['Product']}

State: {row['State']}

District: {row['District']}

Category: {row['Category']}

Sector: {row['Sector']}

Description:
{row['Description']}

GI Status: {row['GI Status']}

Ministry / Department:
{row['Ministry/ Department']}
""".strip()


    metadata = {
        "state": str(row["State"]),
        "district": str(row["District"]),
        "category": str(row["Category"]),
        "sector": str(row["Sector"]),
        "gi_status": str(row["GI Status"])
    }


    documents.append(
        document
    )

    metadatas.append(
        metadata
    )

    ids.append(
        f"odop_{index}"
    )


# ============================================================
# GENERATE EMBEDDINGS
# ============================================================

print(
    f"\nGenerating embeddings for {len(documents)} documents..."
)

embeddings = embedding_model.encode(
    documents,
    show_progress_bar=True
)


# ============================================================
# STORE IN CHROMA
# ============================================================

print("\nStoring documents in vector database...")

collection.upsert(
    ids=ids,
    documents=documents,
    metadatas=metadatas,
    embeddings=embeddings.tolist()
)


# ============================================================
# VERIFY
# ============================================================

count = collection.count()

print("\n========================================")
print("RAG INGESTION COMPLETE")
print("========================================")

print(
    "Documents stored:",
    count
)

print(
    "Collection:",
    "hastkatha_crafts"
)

print(
    "Vector store:",
    VECTORSTORE_PATH
)

print(
    "Embedding dimension:",
    len(embeddings[0])
)


# ============================================================
# SAMPLE
# ============================================================

print("\nSample document:\n")

print(
    documents[0]
)