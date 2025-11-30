from langchain_text_splitters import RecursiveCharacterTextSplitter

def split_into_chunks(text: str, chunk_size: int = 800, chunk_overlap: int = 150):
    """
    Uses LangChain's RecursiveCharacterTextSplitter to produce high-quality chunks.
    Automatically removes empty or whitespace-only chunks.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    chunks = splitter.split_text(text)

    clean_chunks = [c.strip() for c in chunks if c and c.strip()]

    return clean_chunks