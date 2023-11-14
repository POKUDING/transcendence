'use client'
import React, { useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import Button from '@mui/material/Button';

import Box from '@mui/material/Box';

import TextField from '@mui/material/TextField';

// import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import Select, { SelectChangeEvent } from '@mui/material/Select';

import Switch from '@mui/material/Switch';

import { useCookies } from 'next-client-cookies';

import { styled } from '@mui/system';

import axios from 'axios';


const MainChatRoomCreate = styled(Box) ({
	position: 'absolute',
	top: 60,
	left: 0,
	width: 560,
	height: 1332
	
  });

export default function ChatRoomCreate(props: any) {
	const cookies = useCookies();
	const user_id = Number(cookies.get("user_id"));
	const user_nickname = cookies.get("nick_name");

	const	[ roomName, setRoomName ] = useState('');
	// const	[ roomMode, setRoomMode ] = useState('');
	const	[roomPrivate, setRoomPrivate] = useState(false);
	// const	[roomHidden, setRoomHidden] = useState(false);
	const 	[roomPassword, setRoomPassword] = useState('');

	const {handleRenderMode} = props;

	// TextField를 채워야 완료 활성화시키기

	async function handleDone() {
		
		if (roomName === '')
		{
			return ;
		}

		await axios.post(`${process.env.NEXT_PUBLIC_API_URL}chat/createroom`, 
		{
			user_id : user_id,
			user_nickname: user_nickname,
			chatroom_name: roomName,
			password: roomPassword,
			private: roomPrivate,
		}) 
		.then((res) => {
		if (res.data.status === true)
		{
			handleRenderMode(2);
		}
		else
		{
			// 에러 예외처리
		}
		})
	};

	function handleRoomnameChange(event) {
		setRoomName(event.target.value as string);
	}

	function handleRoomPasswordChange(event) {
		setRoomPassword(event.target.value as string);
	}

	// function handleChange(event: SelectChangeEvent) {
	// 	setRoomMode(event.target.value as string);
	// }

	function handleCancel() {
		handleRenderMode(0);
	};

	// function handleHidden(event) {
	// 	console.log(event);
	// 	setRoomHidden(event.target.checked);
	// }

	function handleRoomPrivate(event) {
		setRoomPrivate(event.target.checked);
	}

	// useEffect(() => {

	// }, [])

	// modal 형태 고려 - 우선순위 낮음
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
                    <Button color="inherit" variant='contained' onClick={handleDone}>
                        완료
                    </Button>
                    <Button color="inherit" variant='contained' onClick={handleCancel}>
                        취소
                    </Button>
				</Toolbar>
			</AppBar>
			<MainChatRoomCreate
				sx={{
						bgcolor: 'white',
          			}}
			>
				<TextField
					sx={{
						left:30,
						top:30,
						width:400
					}}
					id="chatroom_name_text_field"
					label="Chatroom Name"
					onChange={handleRoomnameChange}
				/>
				<TextField
					sx={{
						left:30,
						top:60,
						width:400
					}}
					id="password_text_field"
					label="password"
					onChange={handleRoomPasswordChange}
					/>
				<FormControlLabel
					sx={{
						left:100,
						top:100,
						width:400
					}}
					control={<Switch checked={roomPrivate} onChange={handleRoomPrivate}/>} label="Private" labelPlacement='end'
					style={{ marginLeft: '20px', marginTop: '90px' }}
					/>
				{/* <FormControl
					sx={{
						left:30,
						top:60,
						width:400
					}}>
					<InputLabel id="visibility_mode_select_label">Visibility</InputLabel>
					<Select
						labelId="visibility_mode_select_label"
						id="visibility_mode_select"
						value={roomMode}
						label="mode"
						onChange={handleChange}
					>
						<MenuItem value={"public"}>Public</MenuItem>
						<MenuItem value={"private"}>Private</MenuItem>
					</Select>
				</FormControl> */}
				{/* <FormControlLabel
					sx={{
						left:100,
						top:100,
						width:400
					}}
					control={<Switch checked={roomHidden} onChange={handleHidden}/>} label="Private" labelPlacement='end'
					style={{ marginLeft: '20px', marginTop: '90px' }}
					/> */}
				{/* {roomHidden ? (
					<TextField
					sx={{
						left:30,
						top:30,
						width:400
					}}
					id="password_text_field"
					label="password"
					onChange={handleRoomPasswordChange}
					/>
				) : (
				<div></div>
				)} */}
			</MainChatRoomCreate>
		</div>
	);
}
