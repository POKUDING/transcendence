import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from "class-validator";

export class ChatRoomDto
{
    @ApiProperty()
    @IsInt()
    @IsOptional()
    room_idx?: number;

    @ApiProperty()
    @IsInt()
    user_id: number;

    @ApiProperty()
    @IsString()
    user_nickname: string;

    @ApiProperty()
    @IsString()
    chatroom_name: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    password?: string;

    @ApiProperty()
    @IsBoolean()
    private: boolean;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    is_changePass?: boolean;
}

export class JoinRoomDto
{
    @ApiProperty()
    @IsInt()
    user_id: number;

    @ApiProperty()
    @IsString()
    user_nickname: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    from_nickname?: string;

    @ApiProperty()
    @IsInt()
    room_id: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    password?: string;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    event_id?: number;
}

export class SetChatUserDto
{
    @ApiProperty()
    @IsInt()
    user_id: number;

    @ApiProperty()
    @IsInt()
    room_id: number;

    @ApiProperty()
    @IsInt()
    target_id: number;

    @ApiProperty()
    @IsString()
    target_nickname: string;
}

export class InviteChatDto
{
    @ApiProperty()
    @IsString()
    to: string;

    @ApiProperty()
    @IsString()
    type: string;// 'add_friend' | 'invite_game' | 'invite_chat'

    @ApiProperty()
    @IsString()
    from: string;

    @ApiProperty()
    @IsInt()
    chatroom_id?: number;

    @ApiProperty()
    @IsString()
    chatroom_name?: string;
}
