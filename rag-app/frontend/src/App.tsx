import React, {useState, useEffect, useRef} from 'react';
import './App.css';
import {fetchEventSource} from "@microsoft/fetch-event-source";
import {v4 as uuidv4} from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import {Input} from './components/ui/input';
import { Label } from './components/ui/label';
import 'react-toastify/dist/ReactToastify.css';
import { Textarea } from './components/ui/textarea';
import { FileText, Send, Sparkle, Upload } from 'lucide-react';
import { Button } from './components/ui/button';
import { Skeleton } from './components/ui/skeleton';


interface Message {
  message: string;
  isUser: boolean;
  sources?: string[];
}

function App() {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const sessionIdRef = useRef<string>(uuidv4());

  useEffect(() => {
    sessionIdRef.current = uuidv4();
  }, []);
  

const setPartialMessage = (chunk: string, sources: string[] = []) => {
    setMessages(prevMessages => {
        if (prevMessages.length > 0 && !prevMessages[prevMessages.length - 1].isUser) {
            return [...prevMessages.slice(0, -1), {
                message: prevMessages[prevMessages.length - 1].message + chunk,
                isUser: false,
                sources: [...new Set([...prevMessages[prevMessages.length - 1].sources || [], ...sources])]
            }];
        }
        return [...prevMessages, {message: chunk, isUser: false, sources}];
    });
};

  function handleReceiveMessage(data: string) {
    let parsedData = JSON.parse(data);

    if (parsedData.answer) {
      setPartialMessage(parsedData.answer.content)
    }

    if (parsedData.docs) {
      setPartialMessage("", parsedData.docs.map((doc: any) => doc.metadata.source))
    }
  }

  const handleSendMessage = async (message: string) => {
    setInputValue("")

    setMessages(prevMessages => [...prevMessages, {message, isUser: true}]);

    await fetchEventSource(`http://localhost:8000/rag/stream`, {
      method: 'POST',
      openWhenHidden: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          question: message,
        },
        config: {
          configurable: {
            sessionId: sessionIdRef.current
          }
        }
      }),
      onmessage(event) {
        if (event.event === "data") {
          handleReceiveMessage(event.data);
        }
      },
    })
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSendMessage(inputValue.trim())
    }
  }

  function formatSource(source: string) {
    return source.split("/").pop() || "";
  }

  const handleUploadFiles = async () => {
    if (!selectedFiles) {
      console.error('No files selected');
      return;
    }
  
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append('files', file);
    });
  
    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData, // Fetch automatically adds headers for `multipart/form-data`.
      });
  
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData.message);
        const notify = () => toast.success(`Upload successful: ${responseData.message}`);
        notify();
      } else {
        console.error('Upload failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };
  

  const loadAndProcessPDFs = async () => {
    try {
      const response = await fetch('http://localhost:8000/load-and-process-pdfs', {
        method: 'POST',
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        // Success case: Show success message and output
        console.log(responseData.message);
        const notify = () => toast.success(`Success: ${responseData.message}\n\nOutput:\n${responseData.output}`);
        notify();
      } else {
        // Error case: Show error and details
        console.error('Error:', responseData.error);
        const notify = () => toast.error(`Error: ${responseData.error}\n\nDetails:\n${responseData.details}`);
        notify();
      }
    } catch (error) {
      console.error('Network error:', error);
  
      // Handle the case where `error` is not a standard Error object
      if (error instanceof Error) {
        const notify = () => toast.error(`Network error:`);
        notify();
      } else {
        const notify = () => toast.error('An unexpected network error occurred.');
        notify();
      }
    }
  };
  

  return (
    <div className="min-h-screen bg-white flex flex-col">
          <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">RAG BOT</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">Help</Button>
        </div>
      </div>
    </header>
      <main className="flex-grow container mx-auto p-4 flex-col max-w-[800px] ">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Welcome to RAG-BOT</h2>
            <p className="text-xl text-muted-foreground">
              Upload a PDF and ask questions about its content.
            </p>
          </div>
        <div className="flex-grow bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
          
          <div className="border-b border-gray-200 p-4">
            {messages.map((msg, index) => (
              <div key={index}
                  className={`p-3 my-3 rounded-xl text-gray-800 ml-auto border border-gray-200 ${msg.isUser ? "bg-blue-50" : "bg-gray-50"}`}>
                {msg.message}
                {/* Source */}
                {!msg.isUser && (
                  <div className={"text-xs"}>
                    <hr className="border-b mt-5 mb-5 border-gray-200"></hr>
                    {msg.sources?.map((source, index) => (
                      <div key={index}>
                        <a
                          target="_blank"
                          download
                          href={`${"http://localhost:8000"}/rag/static/${encodeURI(formatSource(source))}`}
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >{formatSource(source)}</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50">
            <Textarea
              className="form-textarea w-full p-2 border rounded-lg text-gray-800 bg-white border-gray-300 resize-none h-auto"
              placeholder="Enter your message here..."
              onKeyUp={handleKeyPress}
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
            ></Textarea>
            <div className='w-full flex justify-end mt-4'>
              <Button type="submit" onClick={() => handleSendMessage(inputValue.trim())}>
              Send <Send className="ms-2 h-4 w-4" /> 
            </Button>
            </div>
            {/* Reordered elements */}
            <div className="mt-2 w-full flex justify-between items-center">
              <Input
              id="pdf-upload"
              multiple
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="file:mr-4 w-fit h-fit file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
              <Button type="submit" className='font-bold' onClick={handleUploadFiles}>
              Upload PDF <Upload className="ms-2 h-4 w-4 " /> 
            </Button>
            </div>
            <div className='w-full flex justify-end items-center mt-8'>
              <Button type="submit" onClick={loadAndProcessPDFs}>
              Load and Process PDFs <Sparkle className="ms-2 h-4 w-4" /> 
            </Button>
            </div>
          </div>
        </div>
  
      </main>
      <footer className="border-t">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          © 2023 RAG-BOT. Made By Anis Bensmail. All rights reserved.
        </p>
        <div className="flex space-x-4">
          <Button variant="ghost" size="sm">
            Terms
          </Button>
          <Button variant="ghost" size="sm">
            Privacy
          </Button>
          <Button variant="ghost" size="sm">
            Contact
          </Button>
        </div>
      </div>
    </footer>
      <ToastContainer />
    </div>
  );
  
}

export default App;