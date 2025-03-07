import json
import heapq
import numpy as np
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
import sys

def preprocess_text(text):
    """Tokenizes text for BM25."""
    return text.lower().split()

# Preload the model once
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded.")

# Preload embedded vectors once
with open("outputs/embedded_vectors.json", "r", encoding='utf-8') as file:
    embedded_data = json.load(file)
print("Embedded vectors loaded. Total chunks:", len(embedded_data))

# Precompute tokenized texts for BM25 and initialize BM25
tokenized_texts = [preprocess_text(chunk.get("chunk_text", "")) for chunk in embedded_data]
bm25 = BM25Okapi(tokenized_texts)
print("BM25 initialized.")
def hybrid_search(query, top_k=5, alpha=0.5):
    """Use BM25 for short queries and hybrid for longer ones."""
    if len(query.split()) <= 4:  # Short query optimization
        print("Using BM25 only for short query.")
        bm25_scores = bm25.get_scores(preprocess_text(query))
        top_indices = np.argsort(bm25_scores)[-top_k:][::-1]  # Get top indices
        
        results = [(bm25_scores[i], embedded_data[i]) for i in top_indices]
        return results

    # Use full hybrid search otherwise
    print("Using hybrid search for longer query.")
    return hybrid_search_full(query, top_k, alpha)

def hybrid_search_full(query, top_k=5, alpha=0.5):
    """Full hybrid search combining BM25 and embeddings."""
    emb_query = model.encode(query)
    emb_query /= np.linalg.norm(emb_query)

    bm25_scores = bm25.get_scores(preprocess_text(query))
    max_bm25_score = max(bm25_scores) if max(bm25_scores) > 0 else 1e-8

    heap = []
    for i, chunk in enumerate(embedded_data):
        if 'chunk_vector' not in chunk:
            continue
        
        vector = np.array(chunk['chunk_vector'])
        vector /= np.linalg.norm(vector)

        emb_score = np.dot(emb_query, vector)
        bm25_score = bm25_scores[i] / max_bm25_score
        hybrid_score = alpha * emb_score + (1 - alpha) * bm25_score

        if len(heap) < top_k:
            heapq.heappush(heap, (hybrid_score, chunk))
        else:
            heapq.heappushpop(heap, (hybrid_score, chunk))

    return sorted(heap,key =lambda x: x[0], reverse=True)

# Get the query from command line arguments
query = sys.argv[1]
print("Query received at query_engine.py:", query)
results = hybrid_search(query, top_k=3)


output = " -> "

for rank, (score, result) in enumerate(results, start=1):
    # print(f"Rank {rank}: Score={score:.4f}")
    # print(f"PDF: {result.get('file_name', 'N/A')}")
    # print(f"Text: {result.get('chunk_text', 'N/A')}")
    # print("\n")
    # output.append({
    #     "query":query,
    #     "rank" : rank,
    #     "score" : score,
    #     "file_name":result.get('file_name',"N/A"),
    #     "text" : result.get('chunk_text','N/A')
    # })
    output += result.get('chunk_text','N/A')

prompt = query + output
with open("outputs/prompt.txt", "w") as file:
    file.write(prompt)

    
# with open("outputs/query_output.json","w") as file :
#     json.dump(output,file,ensure_ascii=True,indent=4)

    # with open("raw_text.json", "w", encoding="utf-8") as f:
        # json.dump(cleaned_text_data, f, ensure_ascii=True, indent=4)

sys.stdout.flush()
