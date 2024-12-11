import React from 'react'
export const Participant = ({profilePic,name,owner,localID,codeboxToggle,audioStatus}) => {
  console.log(owner)
  console.log(localID)
  return (
    <div className='participant'>
      {audioStatus === false ? (
        <i
          className='fa-solid fa-microphone-slash'
          style={{
            color: '#fb6969',
            position: 'absolute',
            bottom: '20px',
            right: `20px`,
          }}
        ></i>
      ) : (
        <></>
      )}
      {owner.clrkID === localID ? (
        <i className='fa-solid fa-crown crown'></i>
      ) : (
        <></>
      )}
      <div
        className='logo'
        style={{
          backgroundImage: `url(${profilePic})`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
        }}
      ></div>
      {codeboxToggle ? <span>{name}</span> : <></>}
    </div>
  )
}
