import React, { useState, useRef, useCallback } from 'react';
import { useChatSocket } from "../../app/main_frame/socket_provider"
import { useCookies } from 'next-client-cookies';
import {Paper, Grid, Box, Divider, TextField, Typography, List, Fab,
	IconButton, AppBar, Toolbar, Drawer} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import TextSend from './text_send';
import UserList from './chat_user_list';
import styles from './chat.module.css';

export default function Chat(props: any) {
	const messageAreaRef = useRef(null);
	const [message, setMessage] = useState('');
	const [drawer, setDrawer] = useState(false);
	const [pop, setPop] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);
	const { setMTbox } = props;
	
	const socket = useChatSocket();
	const cookies = useCookies();

	const my_name = cookies.get('nick_name');
	const my_id = cookies.get('user_id');

	const handleSendMessage = () => {
		console.log('send message:==== \n', message);
		if (message.trim() === '') {
			return;
		}
		
		const newMassage = {
			from: my_id,
			user_name: my_name,
			room_id: /*채널이름 or nickname*/"3",
			message: message,
		};
		socket.emit("chat", newMassage);
		setMessage('');
		moveScoll();
	};

	const moveScoll = useCallback(() => {
		if (messageAreaRef.current) {
			messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
		}
	}, []);

	const handleDrawer = useCallback(() => {
		setDrawer(true);
	}, []);

	const handleDrawerClose = useCallback(() => {
		setDrawer(false);
		setPop(false);
	}, []);

	const imageLoader = useCallback(({ src }: any) => {
		return `${process.env.NEXT_PUBLIC_API_URL}user/getimg/nickname/${src}`
	}, []);

	return (
		<div>
			<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
				<IconButton
					size="large"
					edge="start"
					color="inherit"
					aria-label="close"
					sx={{ mr: 2 }}
					onClick={handleDrawer}
				>
					<CloseIcon />
				</IconButton>
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 ,align: 'center' }}>
					ChatRoom1
				</Typography>
				<IconButton
					size="large"
					edge="end"
					color="inherit"
					aria-label="menu"
					sx={{ mr: 2 }}
					onClick={handleDrawer}
				>
					<MenuIcon />
				</IconButton>
				</Toolbar>
			</AppBar>
			</Box>
			<Drawer anchor='right' open={drawer} onClose={handleDrawerClose}>
				<IconButton edge="start"onClick={handleDrawerClose}>
					<ChevronRightIcon />
				</IconButton>
				<UserList
					handle={handleDrawerClose}
					imageLoader={imageLoader}
					setPop={setPop}
					setAnchorEl={setAnchorEl}
					styles={styles.userList}
					pop={pop}
					anchorEl={anchorEl}
				/>
			</Drawer>
			<Grid container component={Paper}>
				<List className={styles.messageArea} ref={messageAreaRef}>
					<TextSend
						imageLoader={imageLoader}
						my_name={my_name}
						socket={socket}
						setMTbox={setMTbox}
					/>
				</List>
				<Divider />
				<Grid container style={{ padding: "20px" }}>
					<Grid item xs={11}>
						<TextField
							id="outlined-basic-email"
							label="Input message"
							fullWidth 
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									handleSendMessage();
								}}}
						/>
					</Grid>
					<Grid item xs={1}>
						<Fab color="primary" aria-label="add" onClick={handleSendMessage}>
							<SendIcon />
						</Fab>
					</Grid>
				</Grid>
			</Grid>
		</div>
	);
};