import { useState } from "react";
import { sendChatRequest } from "../services/chatService";

const ChatbotUI = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn về phim?" },
  ]);

  const sendChatMessage = async () => {
  const message = chatInput.trim();
  if (!message) return;

  setChatMessages((prev) => [...prev, { sender: "user", text: message }]);
  setChatInput("");

  setChatMessages((prev) => [
    ...prev,
    { sender: "bot", text: "Đang xử lý..." },
  ]);

  try {
    const response = await sendChatRequest(message);

    let rawAnswer = response?.data?.answer || "";
    let botReply = rawAnswer;

    try {
      // Thử parse nếu là chuỗi JSON
      const parsed = JSON.parse(rawAnswer);
      if (parsed && parsed.text) {
        botReply = parsed.text;
      }
    } catch (e) {
      // Nếu parse lỗi thì giữ nguyên rawAnswer
      console.warn("Không phải JSON hợp lệ, dùng answer thô:", rawAnswer);
    }

    setChatMessages((prev) => {
      const updated = [...prev];
      updated.pop(); // remove "Đang xử lý..."
      return [...updated, { sender: "bot", text: botReply }];
    });
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    setChatMessages((prev) => {
      const updated = [...prev];
      updated.pop();
      return [
        ...updated,
        { sender: "bot", text: "Đã xảy ra lỗi khi gửi câu hỏi." },
      ];
    });
  }
};


  return (
    <>
      {/* Nút chat góc dưới phải */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "#007bff",
          borderRadius: "50%",
          width: 50,
          height: 50,
          border: "none",
          color: "white",
          fontSize: 28,
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          zIndex: 1000,
        }}
        aria-label="Toggle chat"
      >
        💬
      </button>

      {/* Hộp chat popup */}
      {chatOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: 320,
            height: 400,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: 8,
            boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px",
              fontWeight: "bold",
              userSelect: "none",
            }}
          >
            Chatbot Xem Phim
          </div>

          <div
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto",
              fontSize: 14,
            }}
          >
            {chatMessages.length === 0 && (
              <p style={{ color: "#666" }}>
                Xin chào! Bạn muốn hỏi gì về phim?
              </p>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "10px 16px",
                    borderRadius: 20,
                    backgroundColor:
                      msg.sender === "user" ? "#dcf8c6" : "#007bff",
                    color: msg.sender === "user" ? "#000" : "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    fontSize: 15,
                    maxWidth: "80%",
                    wordWrap: "break-word",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              borderTop: "1px solid #ccc",
              padding: "8px",
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendChatMessage();
              }}
              placeholder="Nhập câu hỏi..."
              style={{
                flex: 1,
                padding: "8px",
                fontSize: 14,
                borderRadius: 4,
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
            <button
              onClick={sendChatMessage}
              style={{
                marginLeft: 8,
                backgroundColor: "#007bff",
                border: "none",
                color: "white",
                padding: "0 15px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotUI;
