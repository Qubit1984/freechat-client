import PropTypes from "prop-types";
import { forwardRef, useRef, useImperativeHandle } from "react";
import styled from "styled-components";
import Avatar from "../../components/Avatar";
import { useAuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import { timeFormatter } from "../../utils/timeFormatter";
import { useState, useEffect } from "react";

const ChatMessage = forwardRef(function ChatMessage(
  {
    sender,
    avatarImage,
    _id,
    message,
    updatedAt,
    readers,
    imageData,
    imageUrl,
    isLastMessage,
  },
  ref
) {
  const { user } = useAuthContext();
  const { chatInfo } = useChatContext();
  const messageRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const imageRef = useRef(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        scrollIntoView() {
          messageRef.current.scrollIntoView({
            behavior: "smooth",
          });
        },
      };
    },
    []
  );
  if (isLastMessage) {
    useEffect(() => {
      // 监听图片加载事件

      const handleImageLoad = () => {
        // 图片加载完成后滚动到最下方
        imageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      };
      if (imageRef.current) {
        imageRef.current.addEventListener("load", handleImageLoad);
      }
      // 清除监听器
      return () => {
        if (imageRef.current) {
          imageRef.current.removeEventListener("load", handleImageLoad);
        }
      };
    }, [imageSrc]);
  }

  const fromSelf = user._id === sender;
  const isRoom = chatInfo.chatType === "room";

  useEffect(() => {
    if (imageData) {
      loadImage(imageData)
        .then((url) => setImageSrc(url))
        .catch((error) => console.error(error));
    }
  }, [imageData]);

  function loadImage(buffer) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([new Uint8Array(buffer.data)], {
        type: "image/jpeg",
      });
      const url = URL.createObjectURL(blob);
      resolve(url);
    });
  }

  return (
    <Message className={fromSelf ? "self" : null} ref={messageRef}>
      <Avatar size="medium" src={`data:image/svg+xml;base64,${avatarImage}`} />
      {imageUrl ? (
        <Text className={fromSelf ? "self" : null}>
          <Image src={imageSrc} alt="image loading" ref={imageRef} />
        </Text>
      ) : message ? (
        <Text className={fromSelf ? "self" : null}>{message}</Text>
      ) : null}
      <MessageDetail>
        {readers.length > 0 && fromSelf && (
          <Status>Read {isRoom && readers.length}</Status>
        )}
        <Time>{timeFormatter(updatedAt)}</Time>
      </MessageDetail>
    </Message>
  );
});

ChatMessage.propTypes = {
  sender: PropTypes.string.isRequired,
  avatarImage: PropTypes.string.isRequired,
  _id: PropTypes.string.isRequired,
  message: PropTypes.string,
  updatedAt: PropTypes.string.isRequired,
  readers: PropTypes.array.isRequired,
};

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 1.5rem 0;

  &.self {
    flex-direction: row-reverse;
    align-self: flex-end;
  }
`;

const Text = styled.p`
  padding: 1rem 1rem;
  margin-left: 0.5rem;
  background-color: var(--bg-color-darken);
  border-radius: 20px;
  border-top-left-radius: 4px;
  max-width: 55%;
  font-weight: 400;
  word-wrap: break-word; /* 允许单词内换行 */
  overflow-wrap: break-word; /* 允许单词内换行（兼容旧版浏览器） */
  white-space: pre-wrap; /* 允许换行和保留空格 */

  &.self {
    border-top-right-radius: 4px;
    border-top-left-radius: 20px;
    background-color: var(--secondary);
    color: ${(props) =>
      props.theme.mode === "light"
        ? "var(--bg-color-main)"
        : "var(--main-color)"};
  }
`;

const MessageDetail = styled.div`
  align-self: flex-end;
  color: var(--main-color);
`;

const Status = styled.span`
  font-size: 0.75rem;
  text-transform: capitalize;
  font-weight: 400;
`;

const Time = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 4px;
`;
const Image = styled.img`
  max-width: 100%;
  height: auto;
`;
export default ChatMessage;
