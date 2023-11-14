import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';

import { styled } from '@mui/system';

// item component의 의미는?

const MainChatRoomList = styled(Grid) ({
  position: 'absolute',
  top: 100,
  left: 100,
  width: 1400,
  height: 833
});

// 채팅 방 1개
const ChatRoom = styled(Card) ({
  // width: 400,
  height: 200,
  backgroundColor: 'white'
})

const ChatRoomList = () => {
  // const [roomList, setRoomList] = useState([
  //   {
  //     name: 'string',
  //     is_secret: false,
  //   }
  // ]);

  // useEffect(() => {

  //   setRoomList([
  //     {name: 'good', is_secret: false},
  //     {name: 'great', is_secret: false},
  //     {name: 'nice', is_secret: true},
  //     {name: 'excellent', is_secret: true},
  //     {name: 'brilliant', is_secret: false},
  //     {name: 'mavelous', is_secret: false},
  //     {name: 'tremendous', is_secret: true}
  //   ]);

  // }, [])

  // 방 목록을 받아오기

    // 갱신은 없이?
  
  // 방의 기능
    // 방 이름
    // 
  

	return (
    <div>
      {/* {roomList ? (
        <MainChatRoomList container rowSpacing={5} columnSpacing={5}>
          {roomList.map((room) => {
            return (
                <Grid item xs={4}>
                  <CardContent>
                    <ChatRoom elevation={8}>
                      <Typography variant='h4' gutterBottom>
                        {room.name}
                      </Typography>
                      <IconButton>
                        <CommentIcon />
                      </IconButton>
                    </ChatRoom>
                  </CardContent>
                </Grid>
              );
          })}
          </MainChatRoomList>
      ) : (
        <p> 방이 없습니다 </p>
      )} */}
    </div>
	);
}

export default ChatRoomList;
