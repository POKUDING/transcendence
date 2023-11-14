import React, { useEffect, useState } from 'react';
import { Avatar, Box, Divider, List, ListItem, ListItemButton, Paper, Popper, Typography } from "@mui/material";
import axios from "axios";

export default function UserList(props: any) {
  const { handleDrawerClose, imageLoader, style, pop, setPop, setAnchorEl, anchorEl } = props;
  const [list, setList] = useState([]);

  const fetchUserList = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}chat/roominfo/3`);
      const userList = response.data.room.roomusers || [];
      setList(userList);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  useEffect(() => {
    fetchUserList();

    const interval = setInterval(() => {
      fetchUserList();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePopup = (event: any) => {
	if (anchorEl === event.currentTarget) {
	  setPop(!pop);
	} else {
	  setAnchorEl(event.currentTarget);
	  setPop(true);
	}
  };

  const isOwner = true;
	console.log(list);
  return (
	<Box
	  sx={{ width: '300px' }}
	  role="presentation"
	  onKeyDown={handleDrawerClose}
	>
	  <List>
		<Typography variant="inherit" align="center">
		  참여자 목록
		</Typography>
		<Divider />
		{list.map((user: any) => (
		  <div key={user.user_id}>
			<ListItem disablePadding>
			  <ListItemButton onClick={handlePopup}>
				<Avatar src={imageLoader({ src: user.user_nickname })} />
				<ListItem style={{ paddingTop: '1px', marginLeft: '1px', width: '200px' }}>
				  <Typography variant="inherit" noWrap>
					{user.user_nickname}
				  </Typography>
				</ListItem>
			  </ListItemButton>
			</ListItem>
			<Divider />
		  </div>
		))}
	  </List>
	  <Popper open={pop} anchorEl={anchorEl} placement="left-start" style={{ zIndex: 9999 }}>
		<List className={style}>
		  <Paper elevation={16}>
			<ListItemButton>
			  <Typography variant="inherit">프로필</Typography>
			</ListItemButton>
			<Divider />
			<ListItemButton>
			  <Typography variant="inherit">친구추가</Typography>
			</ListItemButton>
			<Divider />
			<ListItemButton>
			  <Typography variant="inherit">차단</Typography>
			</ListItemButton>
		  </Paper>
		</List>
		{isOwner ? (
		  <List>
			<Paper elevation={16}>
			  <ListItemButton>
				<Typography variant="inherit"></Typography>
			  </ListItemButton>
			  <ListItemButton>
				<Typography variant="inherit">권한부여</Typography>
			  </ListItemButton>
			  <Divider />
			  <ListItemButton>
				<Typography variant="inherit">뮤트</Typography>
			  </ListItemButton>
			  <Divider />
			  <ListItemButton>
				<Typography variant="inherit">강퇴</Typography>
			  </ListItemButton>
			</Paper>
		  </List>
		) : null}
	  </Popper>
	</Box>
  );
}
