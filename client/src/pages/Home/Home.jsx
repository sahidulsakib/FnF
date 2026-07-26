import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../services/authService";
import {
  createConversation,
  getMessages,
} from "../../services/messageService";
import { useAuth } from "../../context/AuthContext";
import UserList from "../../components/chat/UserList";
import ChatBox from "../../components/chat/ChatBox";
import { sendMessage } from "../../services/messageService";
const Home = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await getAllUsers(token);
        setUsers(res.data.users);
      } catch (error) {
        logout();
        navigate("/login");
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [navigate, logout]);

  const handleSelectUser = async (receiver) => {
    try {
      setSelectedUser(receiver);

      const res = await createConversation({
        senderId: user._id,
        receiverId: receiver._id,
      });

      setConversation(res.data.conversation);

      const msgRes = await getMessages(res.data.conversation._id);
      setMessages(msgRes.data.messages);
    } catch (error) {
      console.log(error);
    }
  };
  const handleSendMessage = async (text) => {
    try {
      const res = await sendMessage({
        conversationId: conversation._id,
        sender: user._id,
        text,
      });

      setMessages((prev) => [
        ...prev,
        res.data.message,
      ]);
    } catch (error) {
      console.log(error);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome {user?.name} 👋
          </h1>

          <p className="opacity-70">{user?.email}</p>
        </div>

        <button
          className="btn btn-error"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* User List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            All Users
          </h2>

          <UserList
            users={users}
            usersLoading={usersLoading}
            selectedUser={selectedUser}
            handleSelectUser={handleSelectUser}
          />
        </div>

        {/* Chat Preview */}
        <ChatBox
          user={user}
          selectedUser={selectedUser}
          messages={messages}
          handleSendMessage={handleSendMessage}
        />

      </div>
    </div>
  );
};

export default Home;