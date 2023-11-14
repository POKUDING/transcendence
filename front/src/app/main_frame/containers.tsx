'use client';
import React, { useState, useCallback } from 'react';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import MyProfile from '@/components/profile/my_profile';
import MatchingButton from '@/components/matching/matching';
import SearchUser from '@/components/search_bar/search_user';
import UserLists from '@/components/user_lists/user_lists';
import Mainbox from '@/components/mainbox/mainbox';
import ChatBlock from '@/components/chatbox/chat_block';
import particlesOptions from "../particles.json";
import { loadFull } from "tsparticles";
import Particles from "react-tsparticles";
import { ISourceOptions } from "tsparticles-engine";
import type { Engine } from "tsparticles-engine";


import TestWebsocket from '@/components/test_chat_box/test_websocket';
import Divider from '@mui/material/Divider';

// Top left Box
const TLBox = styled(Box) ({
  // backgroundColor: 'grey',
  top: 0,
  left: 0,
  width:400,
  height:400,
  position: 'absolute'
});

// Middle Left Box
const MLBox = styled(Box) ({
  backgroundColor: 'white',
  top: 400,
  left: 0,
  width: 400,
  height:450,
  position: 'absolute',
  // opacity: '0.7'
});

// Bottom Left Box
const BLBox = styled(Box) ({
  // backgroundColor: 'green',
  top: 650,
  left: 0,
  width: 400,
  height:0,
  position: 'absolute',
});

// Middle Top Box
const MTBox = styled(Box) ({
  top: 0,
  left: 400,
  width: 1600,
  height: 1332,
  position: 'absolute'
});


const Chatbox = styled(Box) ({
  top: 0,
  left: 2000,
  width: 560,
  height: 1332,
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
})


export default function Main() {
  const [clicked, setClick] = useState(0);
  const [id, setSearch] = useState('');

  const particlesInit = useCallback(async (engine: Engine) => {
    // console.log(engine);
    await loadFull(engine);
  }, []);
  const handleClick = (value: number, searchTarget?: string) => {
    setClick(value);
    setSearch(searchTarget || '');
  }
  /*
  랜더링 sse
  
  handler1{
    data : 1

    setClick(1);
    setSearch();
  }

  */

  console.log('Main component');

 return (
   <React.Fragment>
          <Particles options={particlesOptions as ISourceOptions} init={particlesInit} />
          <CssBaseline />
          {/* <GuardLogin> */}
          {/* <TLBox> */}
            <MyProfile setMTbox={handleClick}/>
          {/* </TLBox> */}
          <MTBox>
            <Mainbox mod={clicked} search={id}/>
          </MTBox>
          <MLBox>
            <SearchUser setMTbox={handleClick}/>
            <MatchingButton setMTbox={handleClick}/>
          </MLBox>
          <Divider />
          <BLBox>
            <UserLists setMTbox={handleClick}/>
          </BLBox>
          <Chatbox>
              <ChatBlock setMTbox={handleClick}/>
          </Chatbox>
        </React.Fragment>
    )
  }
  