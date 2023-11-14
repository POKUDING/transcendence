'use client'
import React from 'react'
import Button from '@mui/material/Button';
import type { Engine } from "tsparticles-engine";
import { ISourceOptions } from "tsparticles-engine";
import { useCallback } from 'react';
import particlesOptions from "../particles.json";
import { loadFull } from "tsparticles";
import Particles from "react-tsparticles";
import {redirect} from 'next/navigation';

const buttonStyle = {
  color : 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
};


export default function Home() {
  const particlesInit = useCallback(async (engine: Engine) => {
    // console.log(engine);
    await loadFull(engine);
  }, []);

  const handleLogin = () => {
     window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-0df03a6be6b8b865402f4b719f20c1dcc04c4a3d0f47e9a5f2c58b9baa87cd12&redirect_uri=http%3A%2F%2F10.13.8.1%3A3000%2Flogin&response_type=code';
  };


function ButtonUsage() {
  return <Button variant="contained" onClick={handleLogin}>Hello world</Button>;

}


  return (
    <>
    <Particles options={particlesOptions as ISourceOptions} init={particlesInit} />
    <div style={buttonStyle}>
      <ButtonUsage />
    </div>
    </>
  ) 
}
