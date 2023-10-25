import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto, TokenDto } from 'src/auth/dto/token.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { TokenExpiredError } from 'jsonwebtoken';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type UserToken = {
	nick_name: string;
	uuid: string;
}

@Injectable()
export class AuthService {
	constructor(
        private userService: UserService,
		private readonly httpService: HttpService,
		private jwtService: JwtService,
		private prisma: PrismaService,
        ) {}
        
    async ReCreateToken(token: TokenDto)
    {
        //2. 우리가 최근에 발급한 access 토큰이고
		const decoded = this.jwtService.decode(token.access_token);
		const user_id = decoded['user_id'];// access 토큰 uid 비교필요
        return await this.CreateToken(user_id);// 새토큰 발급
    }

	async CreateToken(nickName: string)
	{
		const payload = { nick_name: nickName };
		
		const user_token = await this.prisma.tokens.upsert({
			where: {
				nick_name : nickName,
			},
			update: {
				access_token: await this.jwtService.signAsync(payload, {expiresIn: '3m', secret: process.env.JWT_SECRET}),
				refresh_token:await this.jwtService.signAsync(payload, {expiresIn: '5m', secret: process.env.JWT_SECRET}),
			},
			create: {
				nick_name: nickName,
				access_token: await this.jwtService.signAsync(payload, {expiresIn: '3m', secret: process.env.JWT_SECRET}),
				refresh_token:await this.jwtService.signAsync(payload, {expiresIn: '5m', secret: process.env.JWT_SECRET}),
			},
		});
		if (user_token == null)
			return {status: false, message: "토큰 발급 실패"}
		else
			return {status: true, message: "토큰 발급 성공", access_token: user_token.access_token, refresh_token: user_token.refresh_token};
	}

	async Auth42(token: string)
	{
        const getTokenConfig = {
			url: '/oauth/token/info',
			method: 'get',
			baseURL : 'https://api.intra.42.fr/',
			headers : {'Authorization': `Bearer ${token}`}
		};
		try {
			const { data } = await firstValueFrom(this.httpService.request(getTokenConfig));
			return Number(data.resource_owner_id);
		} catch (error) {
			console.log(error); // error 처리 필요 - kyoenkim
		}
	}

	async Login(token : TokenDto)
	{
		try {
			const authorizedId = await this.Auth42(token.access_token);
			if (authorizedId === null)
				return {status: false, access_token: token.access_token};
			const userData = await this.prisma.user.findUnique({
				where: {
				  user_id: authorizedId,
				},
			});
			if (userData === null)
				return {status: false, access_token: token.access_token};
			else // access_token 발급 refresh_token 발급
			{
				const tokenData = await this.CreateToken(userData.nick_name);
				return {status: true, userdata: await this.userService.GetUserDataById(userData.user_id), token: tokenData};
			}
		} catch (error) {
			console.error(error);
			return {status: false, access_token: token.access_token};
		}
	}

    async SignUp(userData : SignUpDto)
    {
		const authorizedId = await this.Auth42(userData.access_token);
		if (authorizedId === null)
			return {status: false, access_token: userData.access_token};
		const newUser = await this.userService.CreateUser( authorizedId, userData.nick_name);
        console.log("newUser ====\n\n",newUser);
        if (newUser == null)
            return {status: false, message: "이미 사용 중인  이름입니다."};
        else
        {
            const tokenData = await this.CreateToken(newUser.nick_name);
            return {status: true,  message: "success", userdata: newUser, token: tokenData};
        }
    }
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
	private prisma: PrismaService,
	private jwtService: JwtService
  ) {
	super({
	  //Request에서 JWT 토큰을 추출하는 방법을 설정 -> Authorization에서 Bearer Token에 JWT 토큰을 담아 전송해야한다.
	  jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
	  //true로 설정하면 Passport에 토큰 검증을 위임하지 않고 직접 검증, false는 Passport에 검증 위임
	  ignoreExpiration: false,
	  //검증 비밀 값(유출 주의)
	  secretOrKey: process.env.JWT_SECRET,
	});
  }
  /**
   * @description 클라이언트가 전송한 Jwt 토큰 정보
   *
   * @param payload 토큰 전송 내용
   */
  async validate(payload: UserToken): Promise<any> {
	return { status: true };
  }
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
	private prisma: PrismaService,
	private jwtService: JwtService
  ) {
	super({
	  //Request에서 JWT 토큰을 추출하는 방법을 설정 -> Authorization에서 Bearer Token에 JWT 토큰을 담아 전송해야한다.
	  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	  //true로 설정하면 Passport에 토큰 검증을 위임하지 않고 직접 검증, false는 Passport에 검증 위임
	  ignoreExpiration: false,
	  //검증 비밀 값(유출 주의)
	  secretOrKey: process.env.JWT_SECRET,
	  // request 값을 가져올 수 있도록 허용
	  passReqToCallback: true,
	});
  }
  /**
   * @description 클라이언트가 전송한 Jwt 토큰 정보
   *
   * @param payload 토큰 전송 내용
   */
  async validate(req: any, payload: UserToken): Promise<any> {
	const storedToken = await this.prisma.tokens.findUnique({
		where: {
		  nick_name: payload.nick_name,
		},
	});
	if (storedToken == null)
		throw new UnauthorizedException();
	if (storedToken.access_token !== req.body.access_token)
		throw new UnauthorizedException(); 
	try {
		await this.jwtService.verifyAsync(storedToken.access_token, { secret: process.env.JWT_SECRET });
	} catch (error) {
		if (error instanceof TokenExpiredError)
			return { status: true };
	}
	throw new UnauthorizedException(); 
  }
}
