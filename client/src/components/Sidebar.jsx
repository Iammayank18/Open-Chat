import React from "react";
import { List, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { GoPrimitiveDot } from "react-icons/go";
import { useSelector } from "react-redux";
import { IoLogOutOutline } from "react-icons/io5";
import { HiUsers } from "react-icons/hi";
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket", "polling"],
});

const Sidebar = ({ activeUser }) => {
  const navigate = useNavigate();
  const alldata = useSelector((state) => state);

  return (
    <div id="side_bar">
      <div className="mx-auto text-center flex gap-2 items-center justify-center">
        <h3 className="text-indigo-600">Online in users</h3>
        <HiUsers className="text-indigo-600" size={27} />
      </div>
      {activeUser?.length === 0 ? (
        <div className="flex items center justify-center mt-4">
          <Spin />
        </div>
      ) : (
        <List
          className="h-96 m-3 w-20 shadow-lg w-40 overflow-auto"
          itemLayout="horizontal"
          dataSource={activeUser}
          loading={activeUser?.length < 0 ? true : false}
          renderItem={(item) => (
            <List.Item className="cursor-pointer flex justify-start gap-2">
              <GoPrimitiveDot color="green" />
              <p>
                {item?.username === alldata?.MainReducer?.data?.username
                  ? item?.username + " (You)"
                  : item?.username}
              </p>
            </List.Item>
          )}
        />
      )}
      <div
        className="m-3 w-20 shadow-lg w-40 overflow-auto flex justify-between items-center gap-1 p-2 rounded cursor-pointer hover:bg-slate-300"
        onClick={() => {
          socket.emit("logout", alldata?.MainReducer?.data?.username);
          localStorage.setItem("auth", "");
          navigate("/");
        }}
      >
        <p>Logout</p>
        <IoLogOutOutline />
      </div>
    </div>
  );
};

export default Sidebar;
