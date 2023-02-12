import { useEffect, useState } from "react";
import Chatlist from "./components/chat/Chatlist";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { EditorState } from "draft-js";
import "../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import Sidebar from "./components/Sidebar";
import { LoginUser } from "./redux/action";
import ChatBox from "./components/chat/ChatBox";
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket", "polling"],
});

function App() {
  const dispatch = useDispatch();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [msgss, setMsgs] = useState([]);
  const [connectedUsers, setConnectedUSers] = useState([]);
  const alldata = useSelector((state) => state?.MainReducer);
  const uname = alldata?.data?.username;

  const localData = JSON.parse(localStorage.getItem("auth"));

  useEffect(() => {
    dispatch(LoginUser(localData));
  }, []);

  useEffect(() => {
    socket.on("messages", (data, username) => {
      setMsgs([...msgss, { msg: data, username: username }]);
    });
  }, [msgss]);

  useEffect(() => {
    socket.emit("send-connected-users", {
      username: uname || localData.username,
      id: socket.id,
    });
  }, []);

  useEffect(() => {
    socket.on("get-connected-users", function(data) {
      setConnectedUSers(data);
    });
  });

  return (
    <div className="App">
      <div className="p-2 container mx-auto w-11/12  sm:w-6/12 md:w-6/12 flex">
        <div className="h-full">
          <Sidebar activeUser={connectedUsers} />
        </div>
        <div>
          <Chatlist message={msgss} />
          <div className="bg-slate-100 shadow-xl mt-3">
            <ChatBox
              connectedUsers={connectedUsers}
              alldata={alldata?.data}
              editorState={editorState}
              setEditorState={setEditorState}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
