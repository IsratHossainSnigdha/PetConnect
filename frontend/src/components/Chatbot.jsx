import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        const userMessage = message.trim();

        if (!userMessage || loading) {
            return;
        }

        setMessages((previous) => [
            ...previous,
            {
                sender: "user",
                text: userMessage,
            },
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/chatbot/message",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        message: userMessage,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Request failed"
                );
            }

            setMessages((previous) => [
                ...previous,
                {
                    sender: "bot",
                    text:
                        data.answer ||
                        "I could not generate an answer.",
                },
            ]);
        } catch (error) {
            console.error("Chatbot error:", error);

            setMessages((previous) => [
                ...previous,
                {
                    sender: "bot",
                    text:
                        "Sorry, I could not connect to the PetConnect assistant.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <>
            {/* Floating button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: "fixed",
                        right: "25px",
                        bottom: "25px",
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        border: "none",
                        backgroundColor: "#059669",
                        color: "white",
                        fontSize: "28px",
                        cursor: "pointer",
                        boxShadow:
                            "0 6px 20px rgba(0,0,0,0.25)",
                        zIndex: 99999,
                    }}
                >
                    🐾
                </button>
            )}

            {/* Chat window */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        right: "25px",
                        bottom: "25px",
                        width: "370px",
                        height: "520px",
                        backgroundColor: "white",
                        borderRadius: "20px",
                        boxShadow:
                            "0 10px 40px rgba(0,0,0,0.25)",
                        overflow: "hidden",
                        zIndex: 99999,
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid #e5e7eb",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            backgroundColor: "#059669",
                            color: "white",
                            padding: "15px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                }}
                            >
                                🐾 PetConnect Assistant
                            </div>

                            <div
                                style={{
                                    fontSize: "12px",
                                    marginTop: "3px",
                                }}
                            >
                                Ask about available pets
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={clearChat}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    marginRight: "5px",
                                }}
                                title="Clear chat"
                            >
                                🗑️
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "24px",
                                }}
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "15px",
                            backgroundColor: "#f9fafb",
                        }}
                    >
                        {messages.length === 0 && (
                            <div
                                style={{
                                    textAlign: "center",
                                    marginTop: "70px",
                                    color: "#6b7280",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "45px",
                                    }}
                                >
                                    🐶🐱
                                </div>

                                <h3
                                    style={{
                                        color: "#111827",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Hi! 👋
                                </h3>

                                <p
                                    style={{
                                        fontSize: "13px",
                                    }}
                                >
                                    I can help you find available
                                    pets.
                                </p>

                                <div
                                    style={{
                                        marginTop: "20px",
                                        padding: "12px",
                                        backgroundColor: "#ecfdf5",
                                        borderRadius: "10px",
                                        color: "#047857",
                                        fontSize: "12px",
                                        lineHeight: "1.7",
                                    }}
                                >
                                    Try:
                                    <br />
                                    "Show me available cats"
                                    <br />
                                    "Show me female dogs"
                                    <br />
                                    "Show me pets in Uttara"
                                </div>
                            </div>
                        )}

                        {messages.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        item.sender === "user"
                                            ? "flex-end"
                                            : "flex-start",
                                    marginBottom: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "80%",
                                        padding: "10px 13px",
                                        borderRadius: "14px",
                                        backgroundColor:
                                            item.sender === "user"
                                                ? "#059669"
                                                : "white",
                                        color:
                                            item.sender === "user"
                                                ? "white"
                                                : "#1f2937",
                                        fontSize: "13px",
                                        lineHeight: "1.5",
                                        border:
                                            item.sender === "bot"
                                                ? "1px solid #e5e7eb"
                                                : "none",
                                        overflowWrap:
                                            "break-word",
                                    }}
                                >
                                    {item.sender === "bot" ? (
                                        <ReactMarkdown
                                            remarkPlugins={[
                                                remarkBreaks,
                                            ]}
                                            components={{
                                                p: ({
                                                    children,
                                                }) => (
                                                    <p
                                                        style={{
                                                            margin:
                                                                "0 0 8px 0",
                                                        }}
                                                    >
                                                        {children}
                                                    </p>
                                                ),

                                                ul: ({
                                                    children,
                                                }) => (
                                                    <ul
                                                        style={{
                                                            margin:
                                                                "6px 0",
                                                            paddingLeft:
                                                                "20px",
                                                        }}
                                                    >
                                                        {children}
                                                    </ul>
                                                ),

                                                ol: ({
                                                    children,
                                                }) => (
                                                    <ol
                                                        style={{
                                                            margin:
                                                                "6px 0",
                                                            paddingLeft:
                                                                "20px",
                                                        }}
                                                    >
                                                        {children}
                                                    </ol>
                                                ),

                                                li: ({
                                                    children,
                                                }) => (
                                                    <li
                                                        style={{
                                                            marginBottom:
                                                                "4px",
                                                        }}
                                                    >
                                                        {children}
                                                    </li>
                                                ),

                                                strong: ({
                                                    children,
                                                }) => (
                                                    <strong>
                                                        {children}
                                                    </strong>
                                                ),
                                            }}
                                        >
                                            {item.text}
                                        </ReactMarkdown>
                                    ) : (
                                        item.text
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading */}
                        {loading && (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: "white",
                                        border: "1px solid #e5e7eb",
                                        padding: "10px 14px",
                                        borderRadius: "14px",
                                        color: "#6b7280",
                                        fontSize: "13px",
                                    }}
                                >
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div
                        style={{
                            padding: "12px",
                            borderTop: "1px solid #e5e7eb",
                            backgroundColor: "white",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: "8px",
                            }}
                        >
                            <input
                                type="text"
                                value={message}
                                onChange={(event) =>
                                    setMessage(event.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about pets..."
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    padding: "10px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "10px",
                                    outline: "none",
                                }}
                            />

                            <button
                                onClick={sendMessage}
                                disabled={
                                    loading ||
                                    !message.trim()
                                }
                                style={{
                                    padding: "0 15px",
                                    border: "none",
                                    borderRadius: "10px",
                                    backgroundColor:
                                        loading ||
                                        !message.trim()
                                            ? "#9ca3af"
                                            : "#059669",
                                    color: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}