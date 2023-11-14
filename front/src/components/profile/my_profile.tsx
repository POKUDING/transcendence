import React from 'react';
import Image from 'next/image';
import styles from '../mainbox/mainbox.module.css'
import { useCookies } from 'next-client-cookies';

interface MyProfileProps {
  setMTbox: (num: number, searchTarget: string | undefined) => void;
}
export default function MyProfile({ setMTbox }: MyProfileProps) {
  const cookies = useCookies();
  const my_nick = cookies.get('nick_name');

  const handleMTbox = (num: number) => () => {
    setMTbox(num, my_nick);
  }
  const imageLoader = ({ src }: any) => {
    return `${process.env.NEXT_PUBLIC_API_URL}user/getimg/nickname/${src}`
  }
  return (
    <Image
      loader={imageLoader}
      src={`${my_nick}`}
      className={styles.myprofilelink}
      alt="User Image"
      width={0}
      height={0}
      onClick={handleMTbox(1)}
    />
  );
}