import React from 'react'
export const Participant = ({profilePic,name,owner,localID,codeboxToggle}) => {
  console.log(owner)
  console.log(localID)
  return (
    <div className='participant'>
      {(owner.clrkID===localID)?<i class='fa-solid fa-crown'></i>:<></>}
      <div
        className='logo'
        style={{
          backgroundImage: `url(${profilePic})`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
        }}
      ></div>
      {(codeboxToggle)?<span>{name}</span>:<></>}
    </div>
  )
}
