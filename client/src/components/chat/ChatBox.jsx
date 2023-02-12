import React, { useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { AiOutlinePlus } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import draftToHtml from "draftjs-to-html";
import { GoMention } from "react-icons/go";
import { EditorState, convertToRaw, Modifier, Entity } from "draft-js";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { io } from "socket.io-client";
import { Tooltip } from "antd";
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket", "polling"],
});

const ChatBox = ({ connectedUsers, alldata, editorState, setEditorState }) => {
  let localData = JSON.parse(localStorage.getItem("auth"));
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(true);
  };

  function uploadImageCallBack(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ data: { link: e.target.result } });
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  const getMention = (text) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const mentionText = `${text} `;
    const mention = Entity.create("MENTION", "SEGMENTED", { name: text });
    const newContentState = Modifier.insertText(
      contentState,
      selection,
      mentionText,
      null,
      mention
    );
    setEditorState(
      EditorState.push(editorState, newContentState, "insert-characters")
    );
  };

  const handlePastedText = (pastedText) => {
    const url = pastedText.match(/(https?:\/\/[^\s]+)/g);
    if (url) {
      setEditorState({
        type: "link",
        description: pastedText,
        url: url[0],
      });
    }
  };

  return (
    <>
      <Editor
        handlePastedText={handlePastedText}
        toolbar={{
          options: [
            "inline",
            "blockType",
            // "fontSize",
            // "fontFamily",
            "link",
            "image",
            "list",
          ],
          image: {
            className: "",
            popupClassName: "",
            alt: { present: true },
            urlEnabled: true,
            uploadEnabled: true,
            alignmentEnabled: true,
            uploadCallback: uploadImageCallBack,
            previewImage: true,
          },
        }}
        editorState={editorState}
        onEditorStateChange={(e) => setEditorState(e)}
        editorClassName="p-4"
        toolbarCustomButtons={[
          <CustomControls
            toggleEmojiPicker={toggleEmojiPicker}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
          />,
        ]}
        mention={{
          separator: " ",
          trigger: "@",
          suggestions: connectedUsers
            .filter((item) => item.username != alldata.username)
            .map((item) => {
              return {
                text: item.username,
                value: item.username,
                url: item.username,
              };
            }),
        }}
      />
      <div className="flex justify-between p-2">
        <div className="flex justify-between gap-2 items-center">
          <AiOutlinePlus
            size={28}
            className="border-r-2 border-slate-200 pr-2"
          />
          <BsEmojiSmile
            onClick={toggleEmojiPicker}
            className="cursor-pointer"
          />
          <Tooltip
            title={
              <div className="flex flex-col gap-2 h-20 overflow-auto">
                {connectedUsers
                  .filter((item) => item.username != alldata.username)
                  .map((user, i) => (
                    <span
                      key={i}
                      className="cursor-pointer"
                      onClick={() => getMention(`@${user.username}`)}
                    >
                      {user.username}
                    </span>
                  ))}
              </div>
            }
          >
            <GoMention className="cursor-pointer" />
          </Tooltip>
        </div>
        <div>
          <IoSend
            size={24}
            disabled={editorState == "" ? true : false}
            className={`text-indigo-500 cursor-pointer`}
            onClick={() => {
              const rawContent = convertToRaw(editorState.getCurrentContent());
              if (
                !rawContent.blocks.length ||
                (rawContent.blocks.length === 1 &&
                  !rawContent.blocks[0].text.trim().length)
              ) {
              } else {
                socket.emit(
                  "getMessage",
                  draftToHtml(convertToRaw(editorState.getCurrentContent())),
                  alldata?.username || localData.username
                );
                setEditorState(EditorState.createEmpty());
              }
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ChatBox;
function CustomControls({
  editorState,
  onChange,
  toggleEmojiPicker,
  setShowEmojiPicker,
  showEmojiPicker,
}) {
  return (
    <div className="rdw-custom-controls">
      {showEmojiPicker && (
        <Picker
          search={true}
          data={data}
          onEmojiSelect={(e) => {
            const selection = editorState.getSelection();
            const content = editorState.getCurrentContent();
            const newContent = Modifier.replaceText(
              content,
              selection,
              e.native,
              null,
              null
            );
            onChange(
              EditorState.push(editorState, newContent, "insert-characters")
            );
            setShowEmojiPicker(!showEmojiPicker);
          }}
        />
      )}
    </div>
  );
}
