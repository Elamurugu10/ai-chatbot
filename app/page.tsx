"use client";

import { useState, useEffect } from "react";
import axios from "axios";

type Message = { role: string; content: string };
type Chat = { id: number; title: string; messages: Message[] };

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [input, setInput] = useState("");

  // Load chats
  useEffect(() => {
    const saved = localStorage.getItem("chats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) setCurrentChatId(parsed[0].id);
    }
  }, []);

  // Save chats
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  const currentChat = chats.find(c => c.id === currentChatId);

  // Create new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  };

  // Update chat messages
  const updateChat = (messages: Message[]) => {
    setChats(chats.map(chat =>
      chat.id === currentChatId ? { ...chat, messages } : chat
    ));
  };

  // Rename chat
  const renameChat = (id: number) => {
    const newName = prompt("Enter new chat name:");
    if (!newName) return;

    setChats(chats.map(chat =>
      chat.id === id ? { ...chat, title: newName } : chat
    ));
  };

  // Delete chat
  const deleteChat = (id: number) => {
    const filtered = chats.filter(chat => chat.id !== id);
    setChats(filtered);

    if (id === currentChatId) {
      setCurrentChatId(filtered.length ? filtered[0].id : null);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !currentChat) return;

    const updatedMessages = [
      ...currentChat.messages,
      { role: "user", content: input }
    ];

    updateChat(updatedMessages);

    // Auto title for first message
    if (currentChat.messages.length === 0) {
      const title = input.slice(0, 20);
      setChats(chats.map(chat =>
        chat.id === currentChatId ? { ...chat, title } : chat
      ));
    }

    setInput("");

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
        {
          role: "assistant",
          content: "Error: Unable to fetch response"
        }
      ]);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">

      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 p-4">

        <button
          onClick={createNewChat}
          className="bg-gray-800 w-full p-2 rounded hover:bg-gray-700"
        >
          + New Chat
        </button>

        {/* Chat List */}
        <div className="mt-4 space-y-2 overflow-y-auto max-h-[80vh]">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`flex justify-between items-center p-2 rounded ${
                chat.id === currentChatId
                  ? "bg-blue-600"
                  : "bg-gray-800"
              }`}
            >
              {/* Chat Title */}
              <span
                onClick={() => setCurrentChatId(chat.id)}
                className="cursor-pointer flex-1"
              >
                {chat.title}
              </span>

              {/* Actions */}
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => renameChat(chat.id)}
                  className="hover:text-yellow-400"
                >
                  ✏️
                </button>

                <button
                  onClick={() => deleteChat(chat.id)}
                  className="hover:text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {currentChat?.messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 my-2 rounded max-w-xl ${
                msg.role === "user"
                  ? "bg-blue-600 ml-auto"
                  : "bg-gray-700"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 flex gap-2 border-t border-gray-800">
          <input
            className="flex-1 p-3 bg-gray-800 rounded outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 px-4 rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}