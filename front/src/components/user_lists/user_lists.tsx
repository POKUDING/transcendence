"use client"

import { useEffect, useState } from 'react';

import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import FriendListPanel from './friend_list_panal';
import AlarmListPanal from './alarm_list_panal';

import Badge from '@mui/material/Badge';  
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import ForumIcon from '@mui/icons-material/Forum';
import ThreePIcon from '@mui/icons-material/ThreeP';

// get cookie
import { useCookies } from 'next-client-cookies';

import axios from 'axios';
import Paper from '@mui/material/Paper';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SearchUserProps {
  setMTbox: (num: number, searchTarget: string) => void;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 4 }}>
            {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs({ setMTbox }: SearchUserProps) {
  const [value, setValue] = useState(0);
  const [alarmCount, setAlarmCount] = useState(0);

  // Alarm 리스트 관리 - array를 추가하는 법
  const [AlarmList, setAlarmList] = useState<any>([]);

  const cookies = useCookies();

  console.log('BasicTabs alarmCount - ', alarmCount);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  
  const setAlarmCountHandler = (increment :boolean) => {
    if (increment === true)
    {
      setAlarmCount((prevAlarmCount) => prevAlarmCount + 1);
      console.log('it increased!!!');
    }
    else
    {
      if (alarmCount !== 0)
      {
        setAlarmCount((prevAlarmCount) => prevAlarmCount - 1);
        console.log('it decreased!!!');
      }
    }

  };

  const setAlarmListAdd = (alarm: any) => {
    setAlarmList((prevAlarmList :any) => 
      [...prevAlarmList, alarm]);
  }

  const setAlarmListRemover = (alarm :any) => {

    // alarm에서 추가는 그냥하면 되는데 제거 할 때 event_id - DB에서의 구분 기준. 반드시 보내서 제거하게 만들어야함
    // 제거 기능
    // array를 순회하여 특정 id를 찾는다.
    const newAlarmList = AlarmList.filter(
      (listAlarm :any) => listAlarm.id != alarm.id);

    setAlarmList(newAlarmList);
  }; 

    // 초기 알람 목록 설정하기 (api)
  const fetchAlarms = async () => {
    console.log('start getalarms');
    console.log('my user_id - ', cookies.get('user_id'));
    await axios.get(`${process.env.NEXT_PUBLIC_API_URL}event/getalarms/${cookies.get('user_id')}`)
    .then((response) => {
      console.log('in alarmBaseList callback');
      console.log('respone format - ', response);
      if (response.data.status)
      {
        console.log('alarmList success - ', response.data);
          // sse 요청이 자동으로 전달됨
      }
      else
      {
        console.log('alarmList fail - ', response.data);
      }
    })
    .catch((err) => {
      console.log('getalarm error');
    })

  }

  useEffect(() => {
    console.log('start BasicTabs');


    // 너와 나의 연결고리 만들어 주기
    const sseEvents = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}event/alarmsse/${cookies.get('user_id')}`);
    // const sseEvents = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}event/sse?id=${cookies.get('user_id')}`);
    

    console.log('my user_id - ', cookies.get('user_id'));

    sseEvents.onopen = function() {
        // 연결 됐을 때 
        console.log('----------established connection------------');
        fetchAlarms();
    }

    sseEvents.onerror = function (error) {
        // 에러 났을 때
    }

    sseEvents.onmessage = function (stream) {
        // 메세지 받았을 때 - 기본적으로 추가
        const parsedData = JSON.parse(stream.data);
        // const parsedData = stream.data;

      
        setAlarmCountHandler(true);
        setAlarmListAdd(parsedData);

        console.log('sseEvents occured!!! - ', alarmCount);
        console.log(' and these are datas!!! - ', parsedData);
    }


    // rerendering될 때, 열려있던 EventSource는 어떻게 될까?
     // Component의 unmount나 re-rendering이 발생하면 기존 EventSource를 닫는다.

    // 백에 요청 보내서 AlarmList 초기 설정 준비.


    return () => {
        sseEvents.close();
        console.log('close connection - alarm');
    };



}, []);


console.log('alarm list - ', AlarmList);

// 알람 카운트 설정하기

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider'}}>
        <Paper elevation={6}>
        <Tabs value={value} onChange={handleChange} centered aria-label="basic tabs example">
          <Tab icon={<GroupIcon/>} {...a11yProps(0)} />
          <Tab icon={<ForumIcon/>} {...a11yProps(1)} />
          <Tab icon={<ThreePIcon/>} {...a11yProps(2)} />
            <Tab icon={
            <Badge color="secondary" badgeContent={alarmCount}>
              <NotificationsRoundedIcon/>
            </Badge>
              } {...a11yProps(3)} />
        </Tabs>
        </Paper>
      </Box>
      <CustomTabPanel value={value} index={0}>
        친구 목록
        <FriendListPanel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        Channel list
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        User list
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
              AL
        <AlarmListPanal
          alarmList={AlarmList}
          alarmListRemover={setAlarmListRemover}
          alarmCountHandler={setAlarmCountHandler}
          setMTbox={setMTbox}/>
      </CustomTabPanel>
    </Box>
  );
}

/*
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Item One" {...a11yProps(0)} />
          <Tab label="Item Two" {...a11yProps(1)} />
          <Tab label="Item Three" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>`
        Item One
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        Item Two
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel>
    </Box>
  );
}
*/
