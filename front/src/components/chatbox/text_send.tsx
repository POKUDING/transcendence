import React, { useEffect, useRef, useState } from 'react';
import { Grid, ListItem, Stack, Chip, Typography, Avatar } from "@mui/material";

const TextSend = ({ imageLoader, my_name, socket, setMTbox }: any) => {
  const messageAreaRef = useRef(null);
  const [renderedMessages, setRenderedMessages] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleChat = (data: any) => {
      const newMessage = renderMessage(data);
	    console.log('newMessage: ', data);
      setRenderedMessages(prevMessages => [...prevMessages, newMessage]);
      moveScoll();
    };

    socket.on("chat", handleChat);

  }, [socket]);

  const moveScoll = () => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  };

  const handleClick = (name: any) => {
    setMTbox(1, name);
  };

  const renderMessage = (message: any) => {
    return (
      <Grid container key={message.time}>
        <ListItem style={{ padding: '5px', paddingBottom: '0px', marginLeft: message.from === my_name? '455px' : '0px'}}>
          <Stack direction="row" spacing={1}>
            <Chip
              avatar={<Avatar src={imageLoader(message.from)} />}
              label={message.from}
              component='div'
              onClick={() => handleClick(message.from)}
            />
          </Stack>
        </ListItem>
        <ListItem
          style={{
            display: 'flex',
            justifyContent: message.from === my_name ? 'flex-end' : 'flex-start',
            paddingRight: message.from === my_name ? '25px' : '0px', // 오른쪽 정렬 시 간격 조절
            wordBreak: 'break-word',
          }}
        >
          <Typography style={{ overflowWrap: 'break-word' }}>
            {`${message.message}`}
          </Typography>
        </ListItem>
      </Grid>
    );
  };

  return (
    <div ref={messageAreaRef} style={{ overflowX: 'hidden' }}>
      {renderedMessages}
    </div>
  );
};

export default TextSend;
