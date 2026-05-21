import React from "react";
import ChatHistoryPage from "main/pages/ChatHistoryPage"; // adjust path if needed

const AdminChatPage = () => {
  return <ChatHistoryPage readOnly={true} isAdmin={true} />;
};

export default AdminChatPage;