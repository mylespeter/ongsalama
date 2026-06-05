'use client'
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../public/anima.json'; // ✅ Import direct du JSON

export default function LottieAnimation() {
  return (
    <div className='flex justify-center items-center h-full'>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ height: 150, width: 150 }}
      />
    </div>
  );
}
