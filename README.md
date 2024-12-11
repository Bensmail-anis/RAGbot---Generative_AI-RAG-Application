# RAGbot - Generative AI RAG Application

A powerful chatbot assistant leveraging Retrieval-Augmented Generation (RAG) to answer questions from multiple PDF documents. RAGbot generates accurate responses and provides source references, making it an ideal assistant for working with domain-specific PDFs.

![rag](https://github.com/user-attachments/assets/58719381-f326-41ff-be0f-f20eedd1c7fc)

## Table of Contents

- [Project Structure](#project-structure)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
- [Video Demo](#video-demo)
- [License](#license)

## Project Structure
- You will find a helpful readme files in the backend and frontend directories.
### Backend (`rag-app`)

- **Core Files**  
  - `pyproject.toml` and `poetry.lock`: Dependency management files for the backend.  
  - `rag-data-loader/`: Module for loading and processing PDF documents.  
  - `pdf-documents/`: Directory to store the input PDF files.  
  - `app/`: Main backend logic, including:  
    - `server.py`: API entry point for the backend server.  
    - `rag_chain.py`: Logic for connecting LangChain with PDF data.  

- **Utilities**  
  - `.env`: Environment variable configurations , put "OPENAI_API_KEY" and Langchain tracing keys .  
  - `Dockerfile`: Containerization support for the backend.

### Frontend (`frontend`)

- **Core Files**  
  - `src/`: React source code for the RAGbot user interface.  
  - `public/`: Static assets for the frontend.

- **Configuration**  
  - `package.json` and `package-lock.json`: Frontend dependencies and scripts.  
  - `tailwind.config.js` and `tsconfig.json`: Configuration files for Tailwind CSS and TypeScript.

### Additional Files

- `README.md`: Project documentation.  
- `LICENSE`: Licensing details for the project.

## Installation

### Backend Setup

1. Install Poetry:

   ```bash
   pip install poetry
   ```

2. Navigate to the `rag-app` directory:

   ```bash
   cd rag-app
   ```

3. Install dependencies:

   ```bash
   poetry install
   ```

Ensure that a PostgreSQL database is installed with the `pgvector` extension enabled. This is required for storing and querying vector embeddings efficiently.Check the official documentations.Next, connect your created database to your RAG-data-loader/rag_load_process_and_process.py by providing your credentials in PGVector.from_documents() method and in app/rag_chain in PGVector() and 'postgres_memory_url' where you will create another database for chat history.
### Frontend Setup

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Start the frontend:

   ```bash
   npm start
   ```

## Usage

### Running the Backend

Run the backend using one of the following commands:

- Using LangChain:

   ```bash
   poetry run langchain serve
   ```

- Using Uvicorn:

   ```bash
   uvicorn app.server:app --reload
   ```

The backend will start on `http://localhost:8000` by default.

### Running the Frontend

After setting up the frontend, visit `http://localhost:3000` in your browser to interact with the RAGbot. The frontend communicates with the backend to process PDFs and generate responses.

## Video Demo

Watch the video demo below to see RAGbot in action:

https://github.com/user-attachments/assets/92bc31c4-96b6-4634-bb9b-36af525d4328



## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
