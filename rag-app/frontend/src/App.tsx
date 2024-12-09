import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white text-gray-900 font-bold text-center p-4 shadow-sm">
      RAGbot---Generative_AI-RAG-Application
      </header>
      <main className="flex-grow container mx-auto p-4 flex-col">
        <div className="flex-grow bg-white shadow overflow-hidden sm:rounded-lg my-4">
        <div className="p-4">
            <div className="p-3 my-3 rounded-lg text-gray-700 ml-auto bg-gray-100">
              The previous user question will be displayed here.
            </div>
            <div className="p-3 my-3 rounded-lg text-gray-700 ml-auto bg-gray-100">
              The RAGbot answer will be displayed here.
              <div className="text-xs">
                <hr className="border-b mt-5 mb-5 border-gray-200"></hr>
                <div>
                  <p>Sources will be listed here:</p>
                  <div>
                    <a
                      target="_blank"
                      download
                      href="file1.pdf"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >File1.pdf</a>
                  </div>
                  <div>
                    <a
                      target="_blank"
                      download
                      href="file2.pdf"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >File2.pdf</a>
                  </div> 
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-100">
            <textarea
              className="form-textarea w-full p-2 border rounded text-gray-700 bg-white border-gray-300 resize-none h-auto"
              placeholder="The user will ask questions about the PDFs here."
            ></textarea>
            <button
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              Send
            </button>
          </div>
        </div>
      </main>
      <footer className="bg-white text-gray-700 text-center p-4 text-xs border-t border-gray-200">
        Footer text: Copyright, etc.
      </footer>
    </div>
  );
}

export default App;