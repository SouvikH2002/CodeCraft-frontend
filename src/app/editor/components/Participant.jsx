import React, { useState } from 'react'
export const Participant = ({
  profilePic,
  name,
  owner,
  localID,
  codeboxToggle,
  audioStatus,
  editorInputStatus,
  creator,
  socket,
  socketID,
  roomID
}) => {
  console.log(owner)
  console.log(localID)
  console.log(editorInputStatus)
  const [keyboardAccess,setKeyboardAccess]=useState(true);
  const [audioAccess,setAudioAccess]=useState(true)
  const sendSingleUserKeyboard=()=>{
    console.log(roomID,socketID)
    setKeyboardAccess(!keyboardAccess)
    socket.emit('sendSingleUserKeyboardAccess',{roomID,socketID,keyboardAccess:!keyboardAccess})
  }
  const sendSingleUserAudio=()=>{
    setAudioAccess(!audioAccess)
    socket.emit('sendSingleUserAudiodAccess', {
      roomID,
      socketID,
      accessAudio: !audioAccess,
    })
  }
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
      {creator && owner.clrkID !== localID ? (
        <>
          <div className='controls'>
            <div className='control' onClick={sendSingleUserKeyboard}>
              <i className='fa-solid fa-keyboard'></i>
            </div>
            <div className='control' onClick={sendSingleUserAudio}>
              <i className='fa-solid fa-microphone'></i>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      {!editorInputStatus ? (
        <>
          <div className='profileShow'>
            <i className='fa-solid fa-keyboard'></i>
            <i className='fa-solid fa-slash'></i>
          </div>
        </>
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
