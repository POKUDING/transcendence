import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";
import { Socket } from "dgram";

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
}

export class JoinRoomDto
{
    @ApiProperty()
    @IsInt()
    user_id: number;

    @ApiProperty()
    @IsInt()
    room_id: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    password?: string;
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
}