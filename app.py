from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import pipeline

# BERT model fine-tuned on SQuAD 2.0.
MODEL_NAME = "deepset/bert-base-cased-squad2"

app = FastAPI(title="Lab 7 - BERT Question Answering")

# Allow the GitHub Pages frontend to call this API.
# For production, replace "*" with your exact website origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model once when the server starts.
qa_pipeline = pipeline(
    "question-answering",
    model=MODEL_NAME,
    tokenizer=MODEL_NAME
)


class QARequest(BaseModel):
    context: str = Field(min_length=1, max_length=20000)
    question: str = Field(min_length=1, max_length=1000)


@app.get("/")
def home():
    return {"message": "BERT Question Answering API is running."}


@app.post("/answer")
def answer_question(request: QARequest):
    try:
        result = qa_pipeline(
            question=request.question,
            context=request.context
        )

        # SQuAD 2.0 models can return an empty answer when
        # the context does not contain the answer.
        answer = result["answer"].strip()

        return {
            "answer": answer,
            "score": float(result["score"])
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
