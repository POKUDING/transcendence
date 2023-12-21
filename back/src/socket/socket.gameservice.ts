import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";
import { SocketService } from "./socket.service";
import { EventService } from "src/event/event.service";
import { PrismaService } from "src/prisma/prisma.service";
import { gameDataDto } from "src/game/dto/game.dto";

export class GameRoom {
    constructor(user_id: number)
    {
        this.user1_id = user_id;
    }
    game_mode: boolean = false;
    user1_id: number;
    user2_id: number = null;
    user1_ready: boolean = false;
    user2_ready: boolean = false;
}

export class InGameRoom {
    constructor(user_id: number)
    {
        this.user1_id = user_id;
    }
    rank: boolean = true;
    game_mode: boolean = false;
    user1_id: number;
    user2_id: number;
    user1_nickname: string;
    user2_nickname: string;
    user1_ready: boolean = false;
    user2_ready: boolean = false;
    user1_position: number;
    user2_position: number;
    score1: number;
    score2: number;
}

@Injectable()
export class SocketGameService {
    private server: Server;
    constructor(
        private readonly SocketService: SocketService,
        private readonly eventService: EventService,
        private readonly prismaservice: PrismaService,
    ){}
    private gameRoomMap = new Map<number, GameRoom>();
    private gameMatchQue = new Array<number>();
    private InGame = new Map<number, InGameRoom>();

    setServer(server: Server) {
      this.server = server;
    }

    async CheckGameRoom(user_id: number)
    {
        if (this.gameRoomMap.get(user_id) !== undefined)
        {
            this.server.to(String(user_id)).emit(`render-gameroom`, {status: 'gameroom', room: this.gameRoomMap.get(user_id)});
            return {status: true, message: "게임방이 존재합니다."};
        } else if (this.InGame.get(user_id) !== undefined) {
            this.server.to(String(user_id)).emit(`render-gameroom`, {status: 'ingame', room: this.InGame.get(user_id)});
            return {status: true, message: "게임 중입니다."};
        } else if (this.gameMatchQue.includes(user_id)) {
            this.server.to(String(user_id)).emit(`render-gameroom`, {status: 'matching', room: user_id});
            return {status: true, message: "매칭 중입니다."};
        }
        return {status: false, message: "게임방이 없습니다."};
    }

    async CreateGameRoom(user_id: number)
    {
        if (this.gameRoomMap.get(user_id) !== undefined)
        {
            this.server.to(String(user_id)).emit(`render-gameroom`, {status: 'gameroom', room: this.gameRoomMap.get(user_id)});
            return {status: false, message: "이미 게임방이 존재합니다."};
        }
        this.gameRoomMap.set(user_id, new GameRoom(user_id));
        this.server.to(String(user_id)).emit(`render-gameroom`, {status: 'gameroom', room: this.gameRoomMap.get(user_id)});
        return {status: true, message: "게임방 생성 성공"};
    }

    async JoinGameRoom(user1_id: number, user2_id: number, event_id: number)
    {
        this.eventService.DeleteAlarms(event_id);
        if (this.gameRoomMap.get(user2_id) !== undefined || this.InGame.get(user2_id) !== undefined)
            return {status: false, message: "이미 게임방에 속해 있습니다."};
        if (this.gameRoomMap.get(user1_id) === undefined)
            return {status: false, message: "게임방이 존재하지 않습니다."};
        const room = this.gameRoomMap.get(user1_id);
        if(!room || room.user2_id)
            return {status: false, message: "초대가 만료되었습니다."};
        room.user2_id = user2_id;
        this.gameRoomMap.set(user2_id, room);
        const rtn = this.server.to(String(user1_id)).emit(`render-gameroom`, {status: 'gameroom', room: this.gameRoomMap.get(user1_id)});
        console.log(`${this.gameRoomMap.get(user1_id)} ${rtn}`)
        const rtn2 = this.server.to(String(user2_id)).emit(`render-gameroom`, {status: 'gameroom', room: this.gameRoomMap.get(user2_id)});
        console.log(`${this.gameRoomMap.get(user1_id)} ${rtn2}`)
        return {status: true, message: "게임방 참가 성공"};
    }

    async LeaveGameRoom(user_id: number)
    {
        if (this.gameRoomMap.get(user_id) === undefined)
            return {status: false, message: "게임방이 존재하지 않습니다."};
        const room = this.gameRoomMap.get(user_id);
        const user2 = room.user2_id;
        if (room.user1_id === user_id)
        {
            this.gameRoomMap.delete(room.user1_id);
            room.user1_id = null;
            room.user1_ready = false;
        }
        this.gameRoomMap.delete(user2);
        room.user2_id = null;
        room.user2_ready = false;
        this.server.to(String(room.user1_id)).emit(`render-gameroom`, {status: 'gameroom', room: room});
        if(user2 !== null)
            this.server.to(String(user2)).emit(`render-gameroom`, {status: 'home', room: room});
        return {status: true, message: "게임방 나가기 성공"};
    }

    async InviteGameRoom(user_id: number, target_id: number, user_nicknmae: string)
    {
        if (this.gameRoomMap.get(user_id) === undefined)
            return {status: false, message: "게임방이 존재하지 않습니다."};
        const room = this.gameRoomMap.get(user_id);
        if (room.user2_id !== null)
            return {status: false, message: "이미 상대가 있습니다."};
        this.eventService.SendEvent({to: target_id, type: `game`, from: user_nicknmae, chatroom_id: user_id});
        return {status: true, message: "게임 초대 보내기 성공"};
    }

    GetRoomInfo(user_id: number)
    {
        return this.gameRoomMap.get(user_id);
    }

    Ready(game_mode: boolean, user_id: number, ready: boolean)
    {
        const room = this.gameRoomMap.get(user_id);
        if (room === undefined)
            return {status: false, message: "게임이 존재하지 않습니다."}; 
        if (room.user1_id === user_id)
            room.user1_ready = ready;
        else
            room.user2_ready = ready;
        if (!(room.user1_ready === true && room.user2_ready === true) && user_id === room.user1_id)
            room.game_mode = game_mode;
        this.server.to(String(room.user1_id)).emit(`render-gameroom`, {status: 'gameroom', room: room, game_mode: room.game_mode});
        if (room.user2_id !== null)
            this.server.to(String(room.user2_id)).emit(`render-gameroom`, {status: 'gameroom', room: room, game_mode: room.game_mode});
        return {status: true, message: "게임 준비 성공"};
    }
    // 일반
    Start(user_id: number)
    {
        const room = this.gameRoomMap.get(user_id);
        if (room === undefined || room.user1_id !== user_id || room.user2_id === null)
            return {status: false, message: "정상적인 방이 아닙니다."};
        if (!room.user1_ready || !room.user2_ready)
            return {status: false, message: "준비가 되지 않았습니다."};
        this.gameRoomMap.delete(room.user1_id);
        this.gameRoomMap.delete(room.user2_id);
        this.InGame.set(room.user1_id, new InGameRoom(room.user1_id));
        this.InGame.get(room.user1_id).user2_id = room.user2_id;
        this.InGame.get(room.user1_id).rank = false;
        this.InGame.get(room.user1_id).game_mode = room.game_mode;
        this.InGame.set(room.user2_id, this.InGame.get(room.user1_id));
        this.server.to(`${room.user1_id}`).emit(`render-gameroom`, {status:'ingame', room: room});
        this.server.to(`${room.user2_id}`).emit(`render-gameroom`, {status:'ingame', room: room});
        this.SocketService.JoinRoom(room.user1_id, `game-${room.user1_id}`, this.server);
        this.SocketService.JoinRoom(room.user2_id, `game-${room.user1_id}`, this.server);
        return {status: true, message: "게임 시작 성공"};
    }

    // 랭크
    MatchGame(user_id: number)
    {
        if (this.gameMatchQue.includes(user_id)) {
            return {status: false, message: "매칭 대기 중"};
        }
        if (this.gameMatchQue.length === 0)
        {
            this.gameMatchQue.push(user_id);
            this.server.to(String(user_id)).emit(`render-gameroom`, {status: 'matching', room: user_id});
            return {status: false, message: "매칭 대기 중"};
        }
        const enemy_id = this.gameMatchQue.pop();
        this.InGame.set(enemy_id, new InGameRoom(enemy_id));
        this.InGame.get(enemy_id).user2_id = user_id;
        this.InGame.set(user_id, this.InGame.get(enemy_id));
        this.SocketService.JoinRoom(enemy_id, `game-${enemy_id}`, this.server);
        this.SocketService.JoinRoom(user_id, `game-${enemy_id}`, this.server);
        this.server.to(`game-${enemy_id}`).emit(`render-gameroom`, {status: 'ingame', room: this.InGame.get(enemy_id)});
        return {status: true, message: "매칭 성공", data: this.InGame.get(user_id)};
    }

    CancelMatch(user_id: number)
    {
        console.log("before CancelMatch : ", this.gameMatchQue);
        this.gameMatchQue = this.gameMatchQue.filter((id) => id !== user_id);
        console.log(`after CancelMatch : ${this.gameMatchQue}`);
        return {status: true, message: "매칭 취소 완료", data: user_id}
    }


    async ExitGame(user_id: number)
    {

        const room = this.InGame.get(user_id);
        if (room == undefined)
            return {status: false, message: "게임이 존재하지 않습니다."};
        // this.server.to(`status-${room.user1_id}`).emit(`status`, {user_id: room.user1_id, status: `online`});
        // this.server.to(`status-${room.user2_id}`).emit(`status`, {user_id: room.user2_id, status: `online`});
        const user1_id = room.user1_id;
        const user2_id = room.user2_id;
        this.server.to(`game-${user1_id}`).emit(`game-end`, {gameData: room});
        this.SocketService.LeaveRoom(String(user1_id), `game-${user1_id}`, this.server);
        this.SocketService.LeaveRoom(String(user2_id), `game-${user1_id}`, this.server);
        // 객체 삭제
        this.InGame.delete(user1_id);
        this.InGame.delete(user2_id);
        console.log("ExitGame : ", room.rank);
        if (room.rank === false)
            return {status: true, message: "게임 종료"};
        const user1 =   await this.prismaservice.user.findUnique({
            where: {
                user_id: user1_id,
            },
        });
        const user2 =   await this.prismaservice.user.findUnique({
            where: {
                user_id: user2_id,
            },
        });
        //Elo 계산
        const user2_we = 1 / ((10 ** ((user1.ladder - user2.ladder) / 400)) + 1);
        const user1_we = 1 - user2_we;
        const k = 20;
        const user2_winLose = user_id === user2.user_id ? 0 : 1;
        const user1_winLose = user_id === user1.user_id ? 0 : 1;
        const user2_pb = user2.ladder + k * (user2_winLose - user2_we);
        const user1_pb = user1.ladder + k * (user1_winLose - user1_we);
        user1.win += user1_winLose;
        user1.lose += user2_winLose;
        user2.win += user2_winLose;
        user2.lose += user1_winLose;
        //prisma data에 넣기
        await this.prismaservice.user.update({
            where: {
                user_id: user1_id,
            },
            data: {
                win : user1.win,
                lose : user1.lose,
                ladder: user1_pb,
            },
        });
        await this.prismaservice.user.update({
            where: {
                user_id: user2_id,
            },
            data: {
                win : user2.win,
                lose : user2.lose,
                ladder: user2_pb,
            },
        });
        // 전적 추가
        this.AddGameData({rank: room.rank, user_nickname: room.user1_nickname, user_id: room.user1_id, enemy_id: room.user2_id, my_score: room.score1, enemy_score: room.score2});
        return {status: true, message: "게임 종료"};
    }

    async ForceGameEnd(user_id: number)
    {
        const inGame = this.InGame.get(user_id);
        if (inGame === undefined)
            return {status: false, message: "게임이 존재하지 않습니다."};
        if (inGame.user1_id === user_id)
        {
            inGame.score2 = 11;
            inGame.score1 = 0;
        }
        else
        {
            inGame.score2 = 0;
            inGame.score1 = 11;
        }
        this.ExitGame(user_id);
    }

    async GameStart(payload: any)
    {
        if (!this.InGame.get(Number(payload.user_id)))
            return ;
        if (this.InGame.get(Number(payload.user_id)).user1_id === Number(payload.user_id))
        {
            this.InGame.get(Number(payload.user_id)).user1_ready = true;
            this.InGame.get(Number(payload.user_id)).user1_nickname = payload.user_nickname;
        }
        else
        {
            this.InGame.get(Number(payload.user_id)).user2_ready = true;
            this.InGame.get(Number(payload.user_id)).user2_nickname = payload.user_nickname;
        }
        if (this.InGame.get(Number(payload.user_id)).user1_ready && this.InGame.get(Number(payload.user_id)).user2_ready)
        {
            const room = this.InGame.get(Number(payload.user_id));
            // this.server.to(`status-${room.user1_id}`).emit(`status`, {user_id: room.user1_id, status: `ingame`});
            // this.server.to(`status-${room.user2_id}`).emit(`status`, {user_id: room.user2_id, status: `ingame`});
            // room.rank = payload.rank;
            // if (room.rank === false)
            //     room.game_mode = payload.game_mode;
            console.log(room);
            this.server.to(`game-${room.user1_id}`).emit(`game-init`, {room: room});
        }
    }

    async GameUserPosition(payload: any, user_id: number)
    {
        if (this.InGame.get(user_id) === undefined)
            return ;
        if (this.InGame.get(user_id).user1_id === user_id) {
            this.server.to(`${this.InGame.get(user_id).user2_id}`).emit(`game-user-position`, payload);
        }
        else {
            this.server.to(`${this.InGame.get(user_id).user1_id}`).emit(`game-user-position`, payload);
        }
    }

    async GameBallHit(payload: any, user_id: number)
    {
        if (this.InGame.get(user_id) === undefined)
            return ;
        this.InGame.get(user_id).score1 = payload.score.player1;
        this.InGame.get(user_id).score2 = payload.score.player2;
        if (this.InGame.get(user_id).score1 >= 11 || this.InGame.get(user_id).score2 >= 11)
            return this.ExitGame(user_id);
        if (this.InGame.get(user_id).user1_id === user_id)
            this.server.to(`${this.InGame.get(user_id).user2_id}`).emit(`game-ball-fix`, payload);
        else
            this.server.to(`${this.InGame.get(user_id).user1_id}`).emit(`game-ball-fix`, payload);
    }

    async AddGameData(gameData: gameDataDto)
    {
        const isWin : boolean = gameData.my_score > gameData.enemy_score ? true : false;
        try {
            const enemy = await this.prismaservice.user.findUnique({
                where: {
                    user_id: gameData.enemy_id,
                },
            });
            await this.prismaservice.game.create({
                data: {
                    rank: gameData.rank,
                    user_id: gameData.user_id,
                    enemy_id: gameData.enemy_id,
                    enemy_name: enemy.nick_name,
                    winner: isWin,
                    my_score: gameData.my_score,
                    enemy_score: gameData.enemy_score,
                },
            });
            await this.prismaservice.game.create({
                data: {
                    rank: gameData.rank,
                    user_id: gameData.enemy_id,
                    enemy_id: gameData.user_id,
                    enemy_name: gameData.user_nickname,
                    winner: !isWin,
                    my_score: gameData.enemy_score,
                    enemy_score: gameData.my_score,
                },
            }); 
        } catch (error) {
            console.error("AddGameData error: ", error);
        }
    }


}