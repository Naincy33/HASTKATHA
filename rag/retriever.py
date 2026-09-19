import os
import chromadb
from sentence_transformers import SentenceTransformer


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

VECTORSTORE_PATH = os.path.join(
    PROJECT_ROOT,
    "rag",
    "vectorstore"
)


# ============================================================
# LOAD EMBEDDING MODEL
# ============================================================

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# ============================================================
# LOAD VECTOR DATABASE
# ============================================================

client = chromadb.PersistentClient(
    path=VECTORSTORE_PATH
)

collection = client.get_collection(
    name="hastkatha_crafts"
)


# ============================================================
# RETRIEVER
# ============================================================

def retrieve_crafts(
    query: str,
    top_k: int = 5
):

    query_embedding = embedding_model.encode(
        [query]
    )[0]


    results = collection.query(
        query_embeddings=[
            query_embedding.tolist()
        ],
        n_results=top_k
    )


    documents = results.get(
        "documents",
        [[]]
    )[0]

    metadatas = results.get(
        "metadatas",
        [[]]
    )[0]

    distances = results.get(
        "distances",
        [[]]
    )[0]


    retrieved = []


    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances
    ):

        retrieved.append(
            {
                "document": document,
                "metadata": metadata,
                "distance": distance
            }
        )


    return retrieved


# ============================================================
# LOCAL TEST
# ============================================================

if __name__ == "__main__":

    query = (
        "Tell me about traditional handicrafts "
        "from Uttar Pradesh"
    )

    results = retrieve_crafts(
        query,
        top_k=5
    )


    print(
        "\n========================================"
    )

    print(
        "HASTKATHA RAG RETRIEVER"
    )

    print(
        "========================================"
    )


    print(
        "\nQuery:",
        query
    )


    for i, result in enumerate(
        results,
        start=1
    ):

        print(
            f"\n--- Result {i} ---"
        )

        print(
            result["document"]
        )

        print(
            "\nMetadata:",
            result["metadata"]
        )

        print(
            "Distance:",
            result["distance"]
        )