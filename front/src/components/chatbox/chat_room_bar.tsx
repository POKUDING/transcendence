'use client'
import { useState, useEffect } from 'react';

import ChatRoomCreate from './chat_room_create';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import IconButton from '@mui/material/IconButton';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';



import { styled } from '@mui/system';

// import { useCookies } from 'next-client-cookies';

import axios from 'axios';


export default function ChatRoomBar(props: any) {
	// const cookies = useCookies();
	// const user_id = cookies.get("user_id")

    const { setMTbox, handleRenderMode } = props;

    function handleNewChat() {
        handleRenderMode(1);    
    };

	// useEffect(() => {

	// }, [])

    // 새 채팅 핸들러


	return (
		<div>
            <AppBar position="static">
				<Toolbar>
                    {/* <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        // onClick={handleDrawer}
                    >
                    </IconButton> */}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        채팅방 목록
                    </Typography>
                    <Button color="inherit" variant='contained' onClick={handleNewChat}>
                        새 채팅
                    </Button>
				</Toolbar>
			</AppBar>
		</div>
	);
}
