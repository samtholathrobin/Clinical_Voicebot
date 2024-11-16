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
from Crypto.Util.Padding import pad,unpad
import base64

RAG_TEMPLATE = """
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.

<context>
{context}
</context>

Answer the following question:

{question}"""

FILE_PATH="clinical_data.txt"

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def add_data(text):
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

class Item(BaseModel):
    question:str

with open(FILE_PATH, 'r') as file:
    input_data = file.read()

data = [Document(page_content=input_data, metadata={"source": "Mistral Large"})]
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=0) #chunk_size can be optimized we can introduce overlap
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
KEY = b'SamAbelAashuSang'
IV = b'Something Better'
CIPHER = AES.new(KEY, AES.MODE_CBC, IV)

print("-------------------------------- READY TO RUMBLE --------------------------------")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows the React app to access the API
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    return "Hello and  welcome to the Clinical RAG"

@app.post("/qa/")
async def create_item(item:Item):

    global CIPHER
    i_dict=item.model_dump()

    if item.question:
        qn=str(item.question)
        print("Call Recieved")
        qn=base64.b64decode(qn)
        de_qn = unpad(CIPHER.decrypt(qn), AES.block_size).decode("ascii")
        print(f'Decrypted Question : {de_qn}')
        response=invoke_RAG(de_qn)
    else:
        response="No Question Found!!"

    print(f'Response : {response}')
    print("Encrypting with AES")
    CIPHER = AES.new(KEY, AES.MODE_CBC, IV)
    ciphertext = CIPHER.encrypt(pad(response.encode('ascii'), AES.block_size))
    b64_response = base64.b64encode(ciphertext).decode("ascii")

    i_dict.update({"answer": b64_response})
    return i_dict