import { Body, Injectable } from '@nestjs/common';
import { EventService } from 'src/event/event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { friendDto } from './dto/social.dto';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class SocialService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly eventService: EventService,
        private readonly socketGateway: SocketGateway,
    ) {}

    async CheckFriend(user1_id: number, user2_name: string)
    {
        const user2 = await this.prismaService.user.findUnique({
            where: {
                nick_name: user2_name,
            },
        });
        if (user2 === null)
            return {status: false, message: "not found user"};
        const frined = await this.prismaService.friends.findFirst({
            where: {
                following_user_id: user1_id,
                followed_user_id: user2.user_id,
            },
        },);
        if (frined === null)
            return {status: false, message: "친구 아님"};
        return {status: true, message: "친구"};
    }
   
    async AddFriend(@Body() addFriend : friendDto)
    {
        const friend = await this.prismaService.user.findUnique({
            where: {
                nick_name: addFriend.friend_nickname,
            },
        });
        if (friend === null)
            return {status: false, message: "not found friend"}
        const ban = await this.prismaService.block. findFirst({
            where: {
                user_id: friend.user_id,
                blocked_user_id: addFriend.user_id,
            }
        })
        if (ban !== null)
            return {status: false, message: 'ban user'};
        const check =  await this.prismaService.friends.findFirst({
            where: {
                following_user_id: addFriend.user_id,
                followed_user_id: friend.user_id,
            },
        });
        if (check !== null)
            return {status: false, message: "already frined"};
        const sent_res = await this.eventService.SendEvent({
            to: friend.user_id,
            type: "add_friend",
            from: addFriend.user_nickname,
            chatroom_id: 0,
            chatroom_name: "",
        })
        return {status: sent_res.status, message: sent_res.message};
    }

    async AcceptFriend(@Body() addFriend : friendDto)
    {
        await this.eventService.DeleteAlarms(addFriend.event_id);
        const friend = await this.prismaService.user.findUnique({
            where: {
                nick_name: addFriend.friend_nickname,
            },
        });
        if (friend === null)
            return {status: false, message: "frined user not found"};
        const check =  await this.prismaService.friends.findFirst({
            where: {
                following_user_id: addFriend.user_id,
                followed_user_id: friend.user_id,
            },
        });
        if (check !== null)
            return {status: false, message: "already frined"};
        try 
        {
            await this.prismaService.friends.create({
                data: {
                    following_user_id: addFriend.user_id,
                    following_user_nickname: addFriend.user_nickname,
                    followed_user_id: friend.user_id,
                    followed_user_nickname: friend.nick_name,
                },
            });
            await this.prismaService.friends.create({
                data: {
                    following_user_id: friend.user_id,
                    following_user_nickname: friend.nick_name,
                    followed_user_id: addFriend.user_id,
                    followed_user_nickname: addFriend.user_nickname,
                },
            });
        } catch (error) {
            console.error("AddFriend failed error: ", error);
            return {status: false, message: "AddFriend failed"}
        }
        // await this.eventService.SendFriendEvent(addFriend.user_id);
        // await this.eventService.SendFriendEvent(friend.user_id);
        await this.socketGateway.JoinRoom(addFriend.user_id, `status-${friend.user_id}`);
        await this.socketGateway.JoinRoom(friend.user_id, `status-${addFriend.user_id}`);
        await this.socketGateway.SendRerender(addFriend.user_id, 'friend');
        await this.socketGateway.SendRerender(friend.user_id, 'friend');
        await this.socketGateway.SendRerender(addFriend.user_id, 'profile');
        await this.socketGateway.SendRerender(friend.user_id, 'profile');
        return {status: true, message: "success"};
    }
    
    async DeleteFriend(delFriend : friendDto)
    {
        const friend = await this.prismaService.user.findUnique({
            where: {
                nick_name: delFriend.friend_nickname,
            },
        });
        const check = await this.prismaService.friends.findFirst({
            where: {
                following_user_id: delFriend.user_id,
                followed_user_id: delFriend.friend_id,
            },
        });
        if (check === null)
            return {status: false, message: "not frined"};
        try {
            await this.prismaService.friends.deleteMany({
                where: { following_user_id: friend.user_id,
                    followed_user_id: delFriend.user_id, },
            },);
            await this.prismaService.friends.deleteMany({
                where: { following_user_id: delFriend.user_id,
                    followed_user_id: friend.user_id },
            },);
        }
        catch (error) {
            console.error("DeleteFriend failed error: ", error);
            return {status: false, message: "DeleteFriend failed"}
        }
        await this.socketGateway.SendRerender(delFriend.user_id, 'profile');
        await this.socketGateway.SendRerender(friend.user_id, 'profile');
        await this.socketGateway.SendRerender(delFriend.user_id, `friend`);
        await this.socketGateway.SendRerender(friend.user_id, `friend`);
        return {status: true, message: "success"};
    }

    async GetFriendList(id: number)
    {
        const frinedList = await this.prismaService.friends.findMany({
            where: {
                following_user_id: id,
            },
            select: {
                followed_user_nickname: true,
                followed_user_id: true,
            },
        });
        if (!frinedList.length)
            return {status: false, message: "친구목록 없음" };
        return {status: true, data: frinedList};
    }

    async GetBlockList(id : number)
    {
        const blockList = await this.prismaService.block.findMany({
            where: {
                user_id: id,
            },
            select: {
                blocked_user_id: true,
                blocked_user_nickname: true,
            },
        });
        if (blockList !== null)
            return {status: true, list: blockList};
        else
            return {status: false};
    }
    
    async AddBlockUser(data: friendDto)
    {
        const block_check = await this.prismaService.block.findFirst({
            where: {
                user_id: data.friend_id,
                blocked_user_id: data.user_id,
            },
        });
        if (block_check !== null)
            return {status: false, message: "already block user"};
        const friend_check = await this.prismaService.friends.findFirst({
            where: {
                following_user_id: data.user_id,
                followed_user_id: data.friend_id,
            },
        });
        if (friend_check !== null)
            await this.DeleteFriend(data);
        await this.prismaService.block.create({
            data: {
                user_id: data.friend_id,
                blocked_user_id:  data.user_id,
                blocked_user_nickname: data.user_nickname,
            },
        });
        await this.prismaService.event.deleteMany({
            where: {
                from_nickname: data.user_nickname,
                to_id: data.friend_id,
            },
        });
        await this.prismaService.event.deleteMany({
            where: {
                from_nickname: data.friend_nickname,
                to_id: data.user_id,
            },
        });
        await this.socketGateway.JoinRoom(data.user_id, `block-${data.friend_id}`);
        await this.socketGateway.SendRerender(data.user_id, `friend`);
        await this.socketGateway.SendRerender(data.friend_id, `friend`);
        return {status: true, message: "Add block success"};
    }

    async DeleteBlockUser(data: friendDto)
    {
        // const check = await this.prismaService.block.findFirst({
        //     where: {
        //         user_id: data.user_id,
        //         blocked_user_id: data.friend_id,
        //         blocked_user_nickname: data.friend_nickname
        //     },
        // });
        const check = await this.prismaService.block.findFirst({
            where: {
                user_id: data.friend_id,
                blocked_user_id: data.user_id,
                blocked_user_nickname: data.user_nickname,
            },
        });
        if (check === null)
            return {status: false, message: "not block user"};
        try
        {
            await this.prismaService.block.deleteMany({
                where: { 
                    user_id: data.friend_id,
                    blocked_user_id: data.user_id,
                    blocked_user_nickname: data.user_nickname,
                },
            });
        }
        catch(error) {
            console.error("DeleteblockUser failed error: ", error);
            return {status: false, message: "DeleteblockUser failed"}
        }
        await this.socketGateway.LeaveRoom(data.user_id, `block-${data.friend_id}`);
        return {status: true, message: "success"};
    }
}
