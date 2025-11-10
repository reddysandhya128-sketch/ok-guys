# services/vanna/app.py
from fastapi import FastAPI
from pydantic import BaseModel
import os, json
from vanna.base import VannaBase
from vanna.groq import Groq_Chat
from vanna.chromadb import ChromaDB_VectorStore
import psycopg2
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

class MyVanna(ChromaDB_VectorStore, Groq_Chat, VannaBase):
    def __init__(self, config):
        Groq_Chat.__init__(self, api_key=os.getenv("GROQ_API_KEY"), model='mixtral-8x7b-32768')
        ChromaDB_VectorStore.__init__(self, config=config.get('chroma_config', {}))
        
        self.db_conn = psycopg2.connect(config['db_conn_str'])

    def run_sql(self, sql: str) -> str:
        # Executes generated SQL on the PostgreSQL database
        with self.db_conn.cursor() as cur:
            cur.execute(sql)
            results = cur.fetchall()
            columns = [desc[0] for desc in cur.description]
            return json.dumps({"columns": columns, "data": results})

# --- Configuration & Initialization ---
DB_CONN_STR = os.getenv("DATABASE_URL")
vanna_config = {
    'db_conn_str': DB_CONN_STR,
    'chroma_config': {'path': './vanna_chromadb'} 
}
vn = MyVanna(vanna_config)

class Question(BaseModel):
    question: str

@app.post("/vanna/ask")
async def ask_vanna(q: Question):
    try:
        # Step 3: Vanna AI generates SQL and executes it
        result = vn.ask(question=q.question, auto_run=True) 
        
        sql = result.get_sql()
        results_json = result.get_results_json()
        
        if not sql or not results_json:
             return {"sql": "", "results": {"columns": ["Error"], "data": [["Could not generate or run SQL."]]}}

        return {
            "sql": sql,
            "results": json.loads(results_json) 
        }
    except Exception as e:
        return {"sql": "", "results": {"columns": ["Error"], "data": [[str(e)]]}}, 500