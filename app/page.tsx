"use client";

import { useState, useEffect } from "react";
import axios from "axios";

type Message = { role: string; content: string };
type Chat = { id: number; title: string; messages: Message[] };

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("chats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) setCurrentChatId(parsed[0].id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  const currentChat = chats.find(c => c.id === currentChatId);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  };

  const updateChat = (messages: Message[]) => {
    setChats(chats.map(chat =>
      chat.id === currentChatId ? { ...chat, messages } : chat
    ));
  };

  const renameChat = (id: number) => {
    const newName = prompt("Enter new chat name:");
    if (!newName) return;

    setChats(chats.map(chat =>
      chat.id === id ? { ...chat, title: newName } : chat
    ));
  };

  const deleteChat = (id: number) => {
    const filtered = chats.filter(chat => chat.id !== id);
    setChats(filtered);

    if (id === currentChatId) {
      setCurrentChatId(filtered.length ? filtered[0].id : null);
    }
  };

  // NORMAL CHAT
  const sendMessage = async () => {
    if (!input.trim() || !currentChat) return;

    const updatedMessages = [
      ...currentChat.messages,
      { role: "user", content: input }
    ];

    updateChat(updatedMessages);

    if (currentChat.messages.length === 0) {
      const title = input.slice(0, 20);
      setChats(chats.map(chat =>
        chat.id === currentChatId ? { ...chat, title } : chat
      ));
    }

    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", {
        messages: updatedMessages
      });

      const reply = res.data.choices?.[0]?.message || {
        role: "assistant",
        content: "No response"
      };

      updateChat([...updatedMessages, reply]);

    } catch {
      updateChat([
        ...updatedMessages,
        { role: "assistant", content: "Error fetching response" }
      ]);
    }

    setLoading(false);
  };

  // SUMMARIZE
  const handleSummarize = async () => {
    if (!input || !currentChat) return;

    const updatedMessages = [
      ...currentChat.messages,
      { role: "user", content: `Summarize: ${input}` }
    ];

    updateChat(updatedMessages);
    setInput("");
    setLoading(true);

    const res = await axios.post("/api/summarize", { text: input });

    const reply = res.data.choices?.[0]?.message?.content || "No response";

    updateChat([
      ...updatedMessages,
      { role: "assistant", content: reply }
    ]);

    setLoading(false);
  };

  // RAG
  const handleRAG = async () => {
    if (!input || !currentChat) return;

    const updatedMessages = [
      ...currentChat.messages,
      { role: "user", content: `RAG: ${input}` }
    ];

    updateChat(updatedMessages);
    setInput("");
    setLoading(true);

    const res = await axios.post("/api/rag", { question: input });

    const reply = res.data.choices?.[0]?.message?.content || "No response";

    updateChat([
      ...updatedMessages,
      { role: "assistant", content: reply }
    ]);

    setLoading(false);
  };

  // SEARCH
  const handleSearch = async () => {
    if (!input || !currentChat) return;

    const updatedMessages = [
      ...currentChat.messages,
      { role: "user", content: `Search: ${input}` }
    ];

    updateChat(updatedMessages);
    setInput("");
    setLoading(true);

    const res = await axios.post("/api/search", { query: input });

    const reply = res.data.result || "No match found";

    updateChat([
      ...updatedMessages,
      { role: "assistant", content: reply }
    ]);

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-black text-white">

      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 p-4">
        <button
          onClick={createNewChat}
          className="bg-gray-800 w-full p-2 rounded-xl hover:bg-gray-700 transition"
        >
          + New Chat
        </button>

        <div className="mt-4 space-y-2 overflow-y-auto max-h-[80vh]">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`flex justify-between items-center p-2 rounded-xl cursor-pointer transition ${
                chat.id === currentChatId
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <span
                onClick={() => setCurrentChatId(chat.id)}
                className="flex-1"
              >
                {chat.title}
              </span>

              <div className="flex gap-2 text-sm">
                <button onClick={() => renameChat(chat.id)}>✏️</button>
                <button onClick={() => deleteChat(chat.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-gray-800 text-lg font-semibold">
          AI Chatbot 🚀
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto scroll-smooth">
          {currentChat?.messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 my-2 rounded-2xl max-w-xl shadow ${
                msg.role === "user"
                  ? "bg-blue-600 ml-auto"
                  : "bg-gray-800 border border-gray-700"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="text-gray-400 italic animate-pulse">
              AI is thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-blue-500 transition"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>

          {/* AI Buttons */}
          <div className="flex gap-2 mt-2">
            <button onClick={handleSummarize} className="bg-gray-800 px-3 py-1 rounded-lg hover:bg-gray-700 transition">
              Summarize
            </button>
            <button onClick={handleRAG} className="bg-gray-800 px-3 py-1 rounded-lg hover:bg-gray-700 transition">
              RAG
            </button>
            <button onClick={handleSearch} className="bg-gray-800 px-3 py-1 rounded-lg hover:bg-gray-700 transition">
              Search
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}