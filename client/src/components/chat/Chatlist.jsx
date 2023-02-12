import React, { memo, useEffect, useState, useRef } from "react";
import { List } from "antd";
import moment from "moment";
import DOMPurify from "dompurify";

const Chatlist = ({ message }) => {
  const [userDetails, setUserDetails] = useState({
    email: "",
    username: "",
  });
  const listRef = useRef(null);
  useEffect(() => {
    let url = new URL(window.location.href);
    setUserDetails({
      email: url.searchParams.get("email"),
      username: url.searchParams.get("username"),
    });
    handleClick();
  }, [message]);

  const handleClick = () => {
    listRef?.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  function createMarkup(html) {
    return {
      __html: DOMPurify.sanitize(html),
    };
  }
  return (
    <div>
      <List
        className="h-80 overflow-auto dark:border-1 dark:border-slate-700 dark:shadow-2xl dark:outline-blue-500"
        header={
          <div>
            <h2 className="dark:text-white">
              Hello {userDetails.username}-{userDetails.email}
            </h2>
          </div>
        }
        bordered
        dataSource={message}
        renderItem={(item, i) => {
          return (
            <List.Item
              ref={listRef}
              id="chat_list"
              style={{
                display: "flex",
                justifyContent:
                  item.username == userDetails.username
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              <div
                className={`${
                  item.username === userDetails.username
                    ? "bg-sky-100 "
                    : "bg-slate-50"
                } py-2 px-3  rounded `}
              >
                <p
                  className={`${
                    item.username === userDetails.username
                      ? "text-slate-400 text-end"
                      : "text-red-700 text-start"
                  } text-xs underline`}
                >
                  {item.username}
                </p>
                <div
                  className={`${
                    item.username === userDetails.username
                      ? "text-slate-700"
                      : "text-black"
                  } py-2 chats`}
                  // dangerouslySetInnerHTML={{ __html: item.msg }}
                  dangerouslySetInnerHTML={createMarkup(item.msg)}
                ></div>
                <p
                  className={`${
                    item.username === userDetails.username
                      ? "text-slate-500 text-end"
                      : "text-slate-500 text-start"
                  } text-xs `}
                >
                  {moment().format("hh:mm a")}
                </p>
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default memo(Chatlist);
