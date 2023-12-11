import { Box, Button, Checkbox, FormControlLabel, Grid, Typography } from "@mui/material";
import styles from './match.module.css';
import UserInfo from "./userInfo";
import { useEffect, useState } from "react";
import { axiosToken } from "@/util/token";
import { useCookies } from "next-client-cookies";
import { useChatSocket } from "@/app/main_frame/socket_provider";

export default function GameRoom(props: any) {
	const { setRender, userData, setIsMod} = props;
	const [ready, setReady] = useState(false);
	const [gameStart, setGameStart] = useState(false);
	const [mod, setMod] = useState(false);
	const cookies = useCookies();

	if (!userData)
		return <div></div>;

	useEffect(() => {
		console.log("game room data===", userData);
		if (userData.room && userData.room.user2_ready && userData.room.user1_ready)
			setGameStart(true);
		else
			setGameStart(false);
		setMod(userData.game_mode);
	}, [userData]);

	const handleExit = async () => {
		console.log ("나가기 클릭");
		await axiosToken.patch(`${process.env.NEXT_PUBLIC_API_URL}game/leaveroom`, {
			user_id: Number(cookies.get('user_id')),
		},
		{
			headers: {
				'Authorization': `Bearer ${cookies.get('access_token')}`
		}
		})
		.then((res) => {
			console.log("leave room reesponse===", res);
			setRender(0);
		})
	}

	useEffect(() => {
		const updateStates = async () => {
			await axiosToken.patch(
				`${process.env.NEXT_PUBLIC_API_URL}game/ready`,
				{
					user_id: Number(cookies.get('user_id')),
					ready: ready? true : false,
					game_mode: mod? true : false
				},
				{
					headers: {
						'Authorization': `Bearer ${cookies.get('access_token')}`
					}
				}
			)
			.then((res) => {
				console.log("Update response===", res);
			})
			.catch((error) => {
				console.error("Error updating states:", error);
			});
		};
		if (mod !== null && ready !== null)
			updateStates();
	}, [mod, ready]);

	const handleReady = () => {
		setReady(!ready);
	}

	const handleMod = (e: any) => {
		setMod(e.target.checked);
	}

	const handleStart = async () => {
		console.log("게임 시작 클릭", );
		await axiosToken.post(`${process.env.NEXT_PUBLIC_API_URL}game/start`, {
			user_id: Number(cookies.get('user_id')),
			// game_mode: mod? true : false,
			// rank: false
		},
		{
			headers: {
				'Authorization': `Bearer ${cookies.get('access_token')}`
			}
		})
		.then((res) => {
			console.log("Start response===", res);
		})
	}

	return (
		<>
		{userData && (
			<Grid container justifyContent="space-between" alignItems="center">
			  <Box display="flex" flexDirection="column" alignItems="center" className={styles.player1}>
				<UserInfo userId={userData?.room?.user1_id} cookies={cookies}/>
				{userData?.room?.user1_ready && <Typography style={{ color: 'green', fontWeight: 'bold', fontSize: '2vw'}}>Ready!</Typography>}
			  </Box>	
			  <Box
			  	display="flex"
				flexDirection="column"
				alignItems="center"
				sx={{
					position: 'absolute',
					width: '20%',
					left: '41%',
				}}
			>
				 <FormControlLabel
				 	control={<Checkbox sx={{color: 'white'}} checked={mod} onChange={handleMod}/>}
					label={
						<Typography sx={{ color: 'white', fontSize: '1.5vw' }}>
							Revers Mod
						</Typography>}
					sx={{color: 'white'}}
				/>
				<Button
				variant="contained"
				color="primary"
				onClick={handleStart}
				size="large"
				disabled={!gameStart || Number(cookies.get('user_id')) !== userData?.room?.user1_id}
				sx={{
					position: 'relative',
					width: '100%',
					marginTop: '40%',
					'&:disabled': {
						backgroundColor: 'gray'
					},
					}}
				>
				<Typography sx={{ color: 'white', fontSize: '1.5vw' }}>
					Start
				</Typography>
				</Button>
				<Button sx={{position: 'relative', marginTop: '40%', width: '100%'}} variant="contained" color="success" onClick={handleReady}>
					<Typography sx={{ color: 'white', fontSize: '1.5vw' }}>
						Ready
					</Typography>
				</Button>
				<Button sx={{position: 'relative', marginTop: '40%', width: '100%'}} variant="contained" color="error" onClick={handleExit}>
					<Typography sx={{ color: 'white', fontSize: '1.5vw' }}>
						Exit
					</Typography>
				</Button>
			  </Box>
			  <Box display="flex" flexDirection="column" alignItems="center" className={styles.player2}>
				<UserInfo userId={userData?.room?.user2_id} cookies={cookies}/>
				{userData?.room?.user2_ready && <Typography style={{ color: 'green', fontWeight: 'bold', fontSize: '2vw'}}>Ready!</Typography>}
			  </Box>
			</Grid>
		  )}
		</>
	)
}
