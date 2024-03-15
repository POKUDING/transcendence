"use client"

import axios from "axios";
import { useRouter } from "next/navigation";
import { Avatar, Button, Grid, TextField, Typography } from "@mui/material"
import styles from './login.module.css'
import { useEffect, useState } from 'react';
import particlesOptions from "../../particles.json";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function Signup (props:any) {
	const [imageFile, setFile] = useState<File>();
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [nickname, setNickname] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState("");
	const router = useRouter();
	const formData = new FormData();

	const [ init, setInit ] = useState(false);

    // this should be run only once per application lifetime
    useEffect(() => {
        initParticlesEngine(async (engine: any) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = async (container: Container) => {

    };
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 1024 * 1024 * 1) {
				window.alert('1MB 이하의 이미지만 업로드 가능합니다.');
				return;
			}
			setFile(file);
			const imageURL = URL.createObjectURL(file);
			setProfileImage(imageURL)
		}
	}

	const handleNicknameChange = (e: any) => {
		setNickname(e.target.value);
	}
	
	useEffect(() => {
		setToken(props.access_token);
	}
	, [props.access_token])



	const handleEnter = async () => {
		setError('');
		setLoading(true);
		const rex = /^[a-zA-Z0-9]{2,10}$/;
		if (!rex.test(nickname)) {
			setLoading(false);
			setError('영문, 숫자를 조합해서 2~10자 내로 입력해주세요.');
			return;
		}
		formData.append('nick_name', nickname);
		if (imageFile) {
			formData.append('file', imageFile);
		}

		await axios.post( `${process.env.NEXT_PUBLIC_API_URL}auth/googlesignup`, {
				access_token: token,
				nick_name: nickname,
			})
			.then(async (response) => {
				if(!response.data.status) {
					setLoading(false);
					setError(response.data.message);
				} else {
					formData.append('access_token', response.data.token.access_token);

					await axios.post( `${process.env.NEXT_PUBLIC_API_DIRECT_URL}user/upload`,
					formData,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
							'Authorization': `Bearer ${response.data.token.access_token}`
						},
						params: {
							nickname: nickname
						}
					}).then((res :any) => {					
						if(res.data.status)
							router.replace('/main_frame');
						else
						{
							setLoading(false);
							window.alert('Image upload failed');
						}

					}).catch((err:any) => {
						// console.log('signup err');
					})
			}})
	}

	const imageLoader = ({ src }: any) => {
		return `${process.env.NEXT_PUBLIC_API_URL}user/getimg/nickname/${src}`
	}

	return (
		<div>
			{init && <Particles id="tsparticles" options={particlesOptions as ISourceOptions} particlesLoaded={particlesLoaded}/>}
			<Grid container className={styles.signupBox} justifyContent="center">
				<Typography variant="h1" className={styles.signupTitle} style={{fontSize: '7vw'}}>
					Wellcome!!
				</Typography>
				<Grid item className={styles.signupImage}>
					<Avatar
						src={profileImage ? profileImage : imageLoader('')}
						alt="Uploaded"
						style={{
							width: '10vw',
							height: '10vw',
							borderRadius: '50%'
						}}
					/>
				</Grid>
				<Grid item className={styles.signupImageText}>
						<Typography style={{fontSize: '1.5vw'}}>🙏이미지를 등록해주세요🙏</Typography>
				</Grid> 
			</Grid>
			<Grid item className={styles.signupImageUpload}>
				<Button variant="contained" component="label">
					<Typography style={{fontSize: '1vw'}}>
						이미지 업로드
					</Typography>
					<input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
				</Button>
			</Grid>
			{loading ? (
					<div id="loading"></div>
			) : (
			<Grid item className={styles.signupNickname}>
				<TextField
					color={error ? "error" : "primary"}
					id="outlined-basic"
					label="Nickname"
					variant="outlined"
					InputProps={{
						inputProps: {
							maxLength: 10,
							minLength: 2,
						},
						style: { color: 'white' },
					  }}
					className={styles.inputNickname}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setNickname(e.target.value);
					  }}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							if (e.nativeEvent.isComposing) return;
							handleEnter();
						}}}
					/> 
			</Grid>
			)}
			{error ? (
			<Grid item className={styles.signupError}>
				<Typography variant="caption" color="error" style={{fontSize: '1.5vw'}}>
					{error}
				</Typography>
			</Grid>
			): (
				<Grid item className={styles.signupError}>
					<Typography variant="caption" style={{fontSize: '1.5vw'}} color="#87ceeb">
						영문, 숫자를 조합해서 2~10자 내로 입력 후 엔터를 눌러주세요.
					</Typography>
				</Grid>
			)
			}
		</div>
	)
}
