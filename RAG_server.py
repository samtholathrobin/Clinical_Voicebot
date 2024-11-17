from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import LanceDB
from langchain_ollama import OllamaEmbeddings
from langchain.docstore.document import Document
from langchain_ollama import ChatOllama
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64
 
# RAG Template
RAG_TEMPLATE = """
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. 
If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.

<context>
{context}
</context>

Answer the following question:
{question}
"""

FILE_PATH = "clinical_data.txt"


#Cipher class so that they dont use the same object every time but create a new one.
class AESCipher:
    def _init_(self, key, iv):
        self.key = key
        self.iv = iv

    def encrypt(self, raw):
        cipher = AES.new(self.key, AES.MODE_CBC, self.iv)
        padded_data = pad(raw.encode('ascii'), AES.block_size)
        return base64.b64encode(cipher.encrypt(padded_data))

    def decrypt(self, enc):
        enc = base64.b64decode(enc)
        cipher = AES.new(self.key, AES.MODE_CBC, self.iv)
        return unpad(cipher.decrypt(enc), AES.block_size).decode('ascii')

class Item(BaseModel):
    question: str

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def add_data(text):
    with open(FILE_PATH, 'r') as file:
        input_data = file.read()
    updated_content = input_data + '\n' + text
    with open(FILE_PATH, 'w') as file:
        file.write(updated_content)

def invoke_RAG(question):
    print("Searching for similar documents")
    docs = vectorstore.similarity_search(question)
    print("Found similar documents")
    print("Generating output")
    output = chain.invoke({"context": docs, "question": question})
    print("Output generated")
    return output

#Cipher Initialization
KEY = b'SamAbelAashuSang'
IV = b'Something Better'
cipher = AESCipher(KEY, IV)

with open(FILE_PATH, 'r') as file:
    input_data = file.read()

data = [Document(page_content=input_data, metadata={"source": "Mistral Large"})]
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)
local_embeddings = OllamaEmbeddings(model="nomic-embed-text")
vectorstore = LanceDB.from_documents(documents=all_splits, embedding=local_embeddings)
model = ChatOllama(model="llama3.1:8b")
rag_prompt = ChatPromptTemplate.from_template(RAG_TEMPLATE)

chain = (
    RunnablePassthrough.assign(context=lambda input: format_docs(input["context"]))
    | rag_prompt
    | model
    | StrOutputParser()
)

print("-------------------------------- READY TO RUMBLE --------------------------------")

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return "Hello and welcome to the Clinical RAG"

@app.post("/qa/")
async def create_item(item: Item):
    try:
        i_dict = item.model_dump()
        
        if item.question:
            # Decrypt question
            decrypted_question = cipher.decrypt(item.question)
            print(f'Decrypted Question: {decrypted_question}')
            
            # Get response from RAG
            response = invoke_RAG(decrypted_question)
            print(f'Response: {response}')
            
            # Encrypt response
            encrypted_response = cipher.encrypt(response).decode('ascii')
            i_dict.update({"answer": encrypted_response})
        else:
            i_dict.update({"answer": cipher.encrypt("No Question Found!!").decode('ascii')})
        
        return i_dict
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        encrypted_error = cipher.encrypt(f"Error: {str(e)}").decode('ascii')
        return {"question": item.question, "answer": encrypted_error}