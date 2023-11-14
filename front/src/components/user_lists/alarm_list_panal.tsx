'use client'
import { useState, useEffect } from 'react';
import React from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import CommentIcon from '@mui/icons-material/Comment';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Button from '@mui/material/Button';

import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';



// 로딩되기 전에 그림자 띄울 수 있음. 아직 적용하지 않았음. 
import Skeleton from '@mui/material/Skeleton';

// styled component (컴포넌트 고정 style로 보임)
import { styled } from '@mui/system';

// get cookie
import { useCookies } from 'next-client-cookies';

import axios from 'axios';

// Queue Library
// import Bull from 'bull';


const MainAlarmPanal = styled(Box) ({
    position: 'absolute',
    top: 60,
    backgroundColor: 'white'
  })


export default function AlarmListPanal (props: any) {
  const cookies = useCookies();
  
  const alarmList = props.alarmList;
  const alarmListRemover = props.alarmListRemover;
  const alarmCountHandler = props.alarmCountHandler;
  const setMTbox = props.setMTbox;

  const removeEventFromDatabase = async (alarm: any) => {
        
        
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}event/deletealarms/${alarm.id}`)
      .then((response) => {
          if (response.status)
          {
              console.log('trying to remove event from alarmList');
              alarmListRemover(alarm);
              alarmCountHandler(false);
              console.log('remove success');
          }
      })
      .catch((err) => {
          console.log('removeEventFromDatabase - api request failed');
      });

  };

  const acceptFriendAddRequest = async (alarm: any) => {

      console.log ('acceptFriendAddRequest - ', alarm)
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}social/acceptfriend`,
      {
        "event_id": alarm.idx,
        "user_id": alarm.to_id,
        "user_nickname": cookies.get('nick_name'),
        "friend_id": 0,
        "friend_nickname": alarm.from_nickname
      })
      .then((response) => {
        console.log('accept event res=====',response)
          if (response.status)
          {
              console.log('trying to remove event from alarmList');
              alarmListRemover(alarm);
              alarmCountHandler(false);
              console.log('remove success');
          }
      })
      .catch((err) => {
          console.log('accepFriendAddRequest - api request failed');
      });
  }

  const acceptRequest = (alarm: any) => () => {
    console.log("accept request of - " + alarm.from_nickname);
    // removeEventFromDatabase(alarm);
        // remove 대신  /social/acceptfriend에 보낸다. 그러면 안에서 이벤트 지워준다고 한다.
    acceptFriendAddRequest(alarm);
        // remove Alarm from List with alarmListHandler
    // alarmCountHandler(false);
  };

  const denyRequest = (alarm: any) => () => {
    console.log("deny request of - " + alarm.from_nickname);
    removeEventFromDatabase(alarm);
    // alarmCountHandler(false);
  };

  const handleProfile = (alarm: any) => () => {
    console.log('profile to ' + alarm.from_nickname);
    
    // MTbox를 리렌더링
      // 1이 프로필인데, 형태 조정하는게 나을 듯
    setMTbox(1, alarm.from_nickname);
        // 특정 부분을 리렌더링하는 함수를 객체로 묶어서 props로 전달하는 건 어떨까?
  }
  
  const imageLoader = ({ src }: any) => {
    return `${process.env.NEXT_PUBLIC_API_URL}user/getimg/nickname/${src}`
  }
  
  return (
    <div>
      {alarmList ? (
        <List dense sx={{ width: '100%', maxWidth: 400, maxHeight: 580,bgcolor: 'background.paper', overflow: 'auto'}}>
          {alarmList.map((alarm :any) => {
            const labelId = `comment-list-secondary-label-${alarm.from_nickname}`
            return (
              <ListItem
                key={alarm.from_nickname}
                disablePadding
              >
                <ListItemButton onClick={handleProfile(alarm)}>
                    <ListItemAvatar>
                    <Avatar
                      src={alarm.from_nickname ? imageLoader({src: alarm.from_nickname}) : null}
                    />
                    </ListItemAvatar>
                    <ListItemText id={labelId} primary={`${alarm.from_nickname}`} />
                </ListItemButton>
                <IconButton onClick={acceptRequest(alarm)}>
                    <CheckCircleOutlineRoundedIcon />
                </IconButton>
                <IconButton onClick={denyRequest(alarm)}>
                    <ClearRoundedIcon />
                </IconButton>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <p>알람이 없습니다.</p>
      )}
    </div>
  );
}

// export default function AlarmListPanal (props: any) {

//     // 1차 렌더링을 할 때, 남은 알람을 모두 가져와서 렌더링하고, state에 저장.
//         // 백에서 저장할 필요 있음 + 백에서 받아오기 위한 GET API 필요함

//     // event를 받아서 자체적으로 리스트를 추가 - back에서 따로 저장하고 넘겨줄 것으로 보임


//     const cookies = useCookies();

//     const alarmList = props.alarmList;
//     const alarmListHandler = props.alarmListHandler;
//     const countChange = props.alarmCountHandler;

//     // eventHandler들을 줄 세우기 위한 state
//         // 동기화 방법론 찾기

//     console.log('alarm_list_rendering starts');

//     useEffect(() => {
//         // alarmList에 따라 그리기
//         console.log('its AlarmList !!!!! - ', alarmList);

//         //

//     }, []);

//     const {alarmCountHandler} = props;

//     return (
//     <div>
//             <MainAlarmPanal sx={{ p: 2 }}>

//             </MainAlarmPanal>
//     </div>
//     );
// }