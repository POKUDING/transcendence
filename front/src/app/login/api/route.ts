import { NextRequest, NextResponse } from "next/server";

import { cookies } from 'next/headers';

import { permanentRedirect } from "next/navigation";

import axios from 'axios';

// 직렬화 주의
// NextResponse를 반환해야함.
// axios.post 대신, fetch 사용한 다음, 상태에 따라 동작 분화하는게 맞을 것 같음.

// NextRespons를 생성할 때, 해당 response의 쿠키를 설정하거나 반환할 redirect도 지정할 수 있음.

export async function POST (request: NextRequest)
{
    let response;
    let error_status;

    try
    {
        const   data = await request.json();

        console.log('login/api - data: ', data);

        // response = await fetch(process.env.NEXT_PUBLIC_API_URL + 'user/create', {
        //     method: "POST",
        //     body: JSON.stringify({
        //         access_token: data.access_token,
        //         nick_name: data.nick_name,
        //         img_name: data.img_name
        //     }),
        // });


        // console.log('login/api - response:', response.status);

        // if (!response.ok)
        // {
        //     // error 발생한 경우
        //     error_status = response.status;
        //     throw new Error ("login/api - POST fetch error status");
        // }
        // console.log('login/api - response:', response.status);

        response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}user/create`, {
            access_token: data.access_token,
            nick_name: data.nick_name,
            img_name: data.img_name
        });
        // created 201


    }
    catch (error)
    {
        console.log('login/api failed');
        // error response 만들어야함.
        // error 분석 필요 - 닉네임 중복, 
        return (NextResponse.json({ error: 'login/api Error'}, { status: error_status}));
    }
    // 성공 시 main_frame으로 이동. cookie는 어떻게하는게 맞을까? 일단 access_token, refresh_token 보관은 필요함.
    // 실패 시 실패를 알리기 위한 구조를 반환하고 동작 처리

    if (response.data.token.status == true)
    {
        console.log('status:', response.data.status);
        cookies().set('access_token', response.data.token.access_token, {
            maxAge: 60 * 3,
            // httpOnly: true,
        });
        cookies().set('refresh_token', response.data.token.refresh_token, {
            maxAge: 60 * 3,
            // httpOnly: true,
        });
        // permanentRedirect('/main_frame');
        // 왜 나중에 다시 login 쪽으로 돌아가는가?
    }
    return (NextResponse.redirect("/main_frame"));
}
