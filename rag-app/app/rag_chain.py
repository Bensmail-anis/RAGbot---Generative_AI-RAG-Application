import os
from operator import itemgetter
from typing import TypedDict

from dotenv import load_dotenv
from langchain_community.vectorstores.pgvector import PGVector
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.runnables import RunnableParallel
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import get_buffer_string

load_dotenv()

# Add explicit error handling for database connection
try:
    vector_store = PGVector(
        collection_name="collection164",
        connection_string="postgresql+psycopg://postgres:super4869@localhost:5432/rag",
        embedding_function=OpenAIEmbeddings()
    )
except Exception as e:
    print(f"Vector Store Connection Error: {e}")
    raise

# template = """
# Answer given the following context:
# {context}

# Question: {question}
# """

# ANSWER_PROMPT = ChatPromptTemplate.from_template(template)

# llm = ChatOpenAI(temperature=0, model='gpt-4o-mini', streaming=True)


# class RagInput(TypedDict):
#     question: str

# multiquery = MultiQueryRetriever.from_llm(
#     retriever=vector_store.as_retriever(),
#     llm=llm,
# )

# old_chain = (
#         RunnableParallel(
#             context=(itemgetter("question") | multiquery),
#             question=itemgetter("question")
#         ) |
#         RunnableParallel(
#             answer=(ANSWER_PROMPT | llm),
#             docs=itemgetter("context")
#         )
# ).with_types(input_type=RagInput)

# postgres_memory_url = "postgresql+psycopg://postgres:super4869@localhost:5432/pdf_rag_history"

# get_session_history = lambda session_id: SQLChatMessageHistory(
#     connection_string=postgres_memory_url,
#     session_id=session_id,
#     async_mode=True
# )

# template_with_history="""
# Given the following conversation and a follow
# up question, rephrase the follow up question
# to be a standalone question, in its original
# language

# Chat History:
# {chat_history}
# Follow Up Input: {question}
# Standalone question:"""

# standalone_question_prompt = PromptTemplate.from_template(template_with_history)

# standalone_question_mini_chain = RunnableParallel(
#     question=RunnableParallel(
#         question=RunnablePassthrough(),
#         chat_history=lambda x:get_buffer_string(x["chat_history"])
#     )
#     | standalone_question_prompt
#     | llm
#     | StrOutputParser()
# )


# final_chain = RunnableWithMessageHistory(
#     runnable=standalone_question_mini_chain | old_chain,
#     input_messages_key="question",
#     history_messages_key="chat_history",
#     output_messages_key="answer",
#     get_session_history=get_session_history,
# )


template = """
Answer given the following context:
{context}

Question: {question}
"""

ANSWER_PROMPT = ChatPromptTemplate.from_template(template)

llm = ChatOpenAI(temperature=0, model='gpt-4-1106-preview', streaming=True)


class RagInput(TypedDict):
    question: str


final_chain = (
    {
    "context": (itemgetter("question") | vector_store.as_retriever()),
    "question": itemgetter("question")
    }
    | ANSWER_PROMPT
    | llm
    | StrOutputParser()
).with_types(input_type=RagInput)