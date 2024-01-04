import { Headers, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatRoomDto, InviteChatDto, JoinRoomDto, SetChatUserDto } from './dto/chat.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Chat API')
@Controller('chat')
export class ChatController {
    constructor(
        private readonly ChatService: ChatService,
        private readonly socketService: SocketGateway,
    ) {}

    @ApiOperation({summary: `채팅방 목록 API`, description: `채팅방 목록을 가져온다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Get("roomlist/:id")
    async RoomList(@Req() req, @Param('id', ParseIntPipe) id: number)
    {
        id = req.tokenuserdata.user_id;
        return await this.ChatService.GetRoomList(id);
    }

    @ApiOperation({summary: `채팅방 정보 API`, description: `채팅방 정보를 가져온다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Get("roominfo/:room_idx")
    async RoomInfo(@Param('room_idx', ParseIntPipe) room_idx: number)
    {
        return await this.ChatService.RoomInfo(room_idx);
    }

    @ApiOperation({summary: `채팅 방 생성 API`, description: `채팅방을 만든다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Post("createroom")
    async CreateRoom(@Req() req, @Body() room: ChatRoomDto)
    {
        room.user_id = req.tokenuserdata.user_id;
        room.user_nickname = req.tokenuserdata.nick_name;
        return await this.ChatService.CreateRoom(room);
    }

    @ApiOperation({summary: `채팅 방 수정 API`, description: `채팅방을 수정한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Patch("changeroom")
    async ChangeRoom(@Req() req, @Headers() headers, @Body() data: ChatRoomDto)
    {
        data.user_id = req.tokenuserdata.user_id;
        data.user_nickname = req.tokenuserdata.nick_name;
        const room =  await this.ChatService.GetMyRoomByHeader(headers);
        if (room === null || room.chatroom_id !== data.room_idx || room.chatroom.owner_id !== room.user_id)
            return {status: false, message: 'not manager'};
        return await this.ChatService.ChangeRoom(data);
    }

    @ApiOperation({summary: `채팅 방 입장 API`, description: `채팅방에 입장한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Patch("joinroom")
    async JoinRoom(@Req() req, @Body() data : JoinRoomDto)
    {
        data.user_id = req.tokenuserdata.user_id;
        data.user_nickname = req.tokenuserdata.nick_name;
        return await this.ChatService.JoinRoom(data);
    }

    @ApiOperation({summary: `채팅 방 퇴장 API`, description: `채팅방에서 퇴장한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Patch("leaveroom")
    async LeaveRoom(@Req() req, @Body() room : JoinRoomDto)
    {
        room.user_id = req.tokenuserdata.user_id;
        room.user_nickname = req.tokenuserdata.nick_name;
        const rtn = await this.ChatService.LeaveRoom(room);
        if (rtn.status === true)
            this.socketService.HandleNotice(room.room_id, `유저 ${room.user_nickname}님이 퇴장하였습니다.`);
        return rtn;
    }

    //내가 방장인지 확인하는 방법이 있어야하지 않을까?
    @ApiOperation({summary: `관리자 임명 API`, description: `관리자를 임명한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Patch("setmanager")
    async SetManager(@Req() req, @Headers() headers, @Body() data : SetChatUserDto)
    {
        data.user_id = req.user_id;
        const room =  await this.ChatService.GetMyRoomByHeader(headers);
        if (room === null || room.chatroom_id !== data.room_id || room.chatroom.owner_id !== room.user_id)
            return {status: false, message: 'not manager'};
        return await this.ChatService.SetManager(data);
    }

    @ApiOperation({summary: `관리자 해제 API`, description: `관리자를 해제한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Patch("unsetmanager")
    async UnsetManager(@Req() req, @Headers() headers, @Body() data : SetChatUserDto)
    {
        data.user_id = req.tokenuserdata.user_id;
        const room =  await this.ChatService.GetMyRoomByHeader(headers);
        if (room === null || room.chatroom_id !== data.room_id || room.chatroom.owner_id !== room.user_id)
            return {status: false, message: 'not manager'};
        return await this.ChatService.UnsetManager(data);
    }

    @ApiOperation({summary: `유저 mute API`, description: `유저를 mute한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Patch("muteuser")
    async MuteUser(@Req() req, @Headers() headers, @Body() data : SetChatUserDto)
    {
        data.user_id = req.tokenuserdata.user_id;
        const room =  await this.ChatService.GetMyRoomByHeader(headers);
        if (room === null || room.chatroom_id !== data.room_id || room.is_manager !== true)
            return {status: false, message: 'not manager'};
        return await this.ChatService.MuteUser(data);
    }

    @ApiOperation({summary: `유저 unmute API`, description: `유저를 unmute한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Patch("unmuteuser")
    async UnmuteUser(@Req() req, @Headers() headers, @Body() data : SetChatUserDto)
    {
        data.user_id = req.tokenuserdata.user_id;
        const room =  await this.ChatService.GetMyRoomByHeader(headers);
        if (room === null || room.chatroom_id !== data.room_id || room.is_manager !== true)
            return {status: false, message: 'not manager'};
        return await this.ChatService.UnmuteUser(data);
    }

    @ApiOperation({summary: `유저 ban API`, description: `유저를 ban한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Patch("banuser")
    async BanUser(@Req() req, @Headers() headers, @Body() data : SetChatUserDto)
    {
        data.user_id = req.tokenuserdata.user_id;
        const room =  await this.ChatService.GetMyRoomByHeader(headers);
        if (room === null || room.chatroom_id !== data.room_id || room.is_manager !== true)
            return {status: false, message: 'not manager'};
        return await this.ChatService.BanUser(data);
    }

    @ApiOperation({summary: `유저 unban API`, description: `유저를 unban한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Patch("unbanuser")
    async UnbanUser(@Req() req, @Headers() headers, @Body() data : SetChatUserDto)
    {
        data.user_id = req.tokenuserdata.user_id;
        const room =  await this.ChatService.GetMyRoomByHeader(headers);
        if (room === null || room.chatroom_id !== data.room_id || room.is_manager !== true)
            return {status: false, message: 'not manager'};
        return await this.ChatService.UnbanUser(data);
    }

    @ApiOperation({summary: `강제퇴장 API`, description: `유저를 강제퇴장시킨다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Patch("kickuser")
    async KickUser(@Req() req, @Headers() headers, @Body() data : SetChatUserDto)
    {
        data.user_id = req.tokenuserdata.user_id;
        const room =  await this.ChatService.GetMyRoomByHeader(headers);
        if (room === null || room.chatroom_id !== data.room_id || room.is_manager !== true)
            return {status: false, message: 'not manager'};
        const rtn = await this.ChatService.KickUser(data);
        if(rtn.status === true)
            await this.socketService.HandleNotice(data.room_id, `${data.target_nickname}님이 강제퇴장 당하셨습니다.`);
        return rtn;
    }

    @ApiOperation({summary: `채팅방 초대 API`, description: `채팅방에 유저를 초대한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Post("inviteuser")
    async InviteUser(@Req() req, @Body() data : InviteChatDto)
    {
        data.from = req.tokenuserdata.nick_name;
        return await this.ChatService.InviteUser(data);
    }

    @ApiOperation({summary: `채팅방 초대 수락 API`, description: `채팅방 초대를 수락한다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Post("acceptinvite")
    async AcceptInvite(@Req() req, @Body() data : JoinRoomDto)
    {
        data.user_id = req.tokenuserdata.user_id;
        data.user_nickname = req.tokenuserdata.nick_name;
        // console.log("AcceptInviteAcceptInviteAcceptInvite : ", data);
        return await this.ChatService.AcceptInvite(data);
    }

    @ApiOperation({summary: `dm 가져오기 API`, description: `dm 을 가져온다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Get("dm")
    async GetDm(@Req() req, @Query('id', ParseIntPipe) id: number, @Query('from_id', ParseIntPipe) from_id: number, @Query(`idx`, ParseIntPipe) idx: number)
    {
        id = req.tokenuserdata.user_id;
        return await this.ChatService.GetDm(idx, id, from_id);
    }

    @ApiOperation({summary: `안읽은 dm 가져오기 API`, description: `안읽은 dm 을 가져온다.`})
	@UseGuards(AuthGuard('jwt-access'))
	@ApiBearerAuth('JWT-acces')
    @Get("unreaddm")
    async GetUnreadDm(@Req() req, @Query('user_id', ParseIntPipe) user_id: number, @Query('from_id', ParseIntPipe) from_id: number)
    {
        user_id = req.tokenuserdata.user_id;
        return await this.ChatService.GetUnreadDm(user_id, from_id);
    }
}
