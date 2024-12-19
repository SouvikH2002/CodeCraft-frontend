'use client'
import { Participant } from './components/Participant'
import '../css/editor.css'
import '../css/colors.css'
import Peer from 'simple-peer'
import { motion } from 'framer-motion'
import Editor, { loader } from '@monaco-editor/react'
import { useState, useRef, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Languages } from './components/Languages'
import { io } from 'socket.io-client'
import { useRouter, useSearchParams } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { SiteHeader } from '@/components/site-header'
import uniqid from 'uniqid'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import TextareaAutosize from 'react-textarea-autosize'
import { useChat } from 'ai/react'

import { useAuth } from '@clerk/nextjs'

const Video = (props) => {
  const ref = useRef()

  useEffect(() => {
    props.peer.on('stream', (stream) => {
      ref.current.srcObject = stream
    })
  }, [props.peer])

  return (
    <video
      playsInline
      autoPlay
      ref={ref}
      style={{ display: 'none', height: '40%', width: '50%' }}
    />
  )
}
function CodeEditor() {
  const searchParams = useSearchParams()
  const roomIDParam = searchParams.get('roomID')

  useEffect(() => {
    if (document.querySelector('.editorContainer .participants')) {
      if (roomIDParam === 'singleUser') {
        document.querySelector('.editorContainer .participants').style.display =
          'none'
        const editorDiv = document.querySelector('.editorContainer .editor')
        if (editorDiv) {
          editorDiv.style.width = 'calc(100% - 95px)'
        } else {
          console.error('Editor div not found')
        }
      }
    }
  }, [])
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.editor.defineTheme('myTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#26262667',
        },
      })
    })
  }, [])
  const { userId } = useAuth()
  const [userData, setUserData] = useState(null)
  const [currJoinedList, setCurrJoinedList] = useState()
  const [waitingState, setWaitingState] = useState(false)
  const [rejectionState, setRejectionState] = useState(false)
  const [globalStream, setGlobalStream] = useState(null)
  const [creator, setCreator] = useState(false)
  const [peers, setPeers] = useState([])
  const [enableEditor, setEnableEditor] = useState(true)
  const [trigger, setTrigger] = useState(0)
  const userVideo = useRef()
  const peersRef = useRef([])

  const router = useRouter()
  window.addEventListener('popstate', function () {
    // Redirect to another page
    window.location.href = '/'
  })
  useEffect(() => {
    if (roomIDParam !== 'singleUser') {
      axios
        .post('/api/users', { userId })
        .then((resp) => {
          setUserData(resp.data)
          socket.on('feedback', (m) => {
            if (m.msg === 'accepted') {
              console.log(m)
              if (socket.id === m.socketID) {
                setCreator(true)
              }
              const socketId = m.socketID
              navigator.mediaDevices
                .getUserMedia({ video: false, audio: true })
                .then((stream) => {
                  setGlobalStream(stream)
                  userVideo.current.srcObject = stream
                  if (resp.data) {
                    socket.emit('joinGroup', {
                      roomID,
                      userID: userId,
                      userData: resp.data,
                    })
                  }

                  socket.on('joinGroup', (m) => {
                    console.log('join group incoming signal')
                    console.log(m)
                    setCurrJoinedList(m.userData)
                    setUserLength(m.length)
                  })
                  socket.on('allUsers', (usersInThisRoom) => {
                    const peers = []
                    usersInThisRoom.forEach((userID) => {
                      const peer = createPeer(
                        userID.socketID,
                        socket.id,
                        stream
                      )
                      peersRef.current.push({
                        peerID: userID.socketID,
                        peer,
                      })
                      peers.push(peer)
                    })
                    setPeers(peers)
                  })
                  socket.on('user joined', (payload) => {
                    const peer = addPeer(
                      payload.signal,
                      payload.callerID,
                      stream
                    )
                    peersRef.current.push({
                      peerID: payload.callerID,
                      peer,
                    })
                    console.log(
                      'adding peer at user joined',
                      peer,
                      payload.callerID
                    )
                    setPeers((users) => [...users, peer])
                  })

                  socket.on('receiving returned signal', (payload) => {
                    const item = peersRef.current.find(
                      (p) => p.peerID === payload.id
                    )
                    console.log('items at receiving return signal')
                    console.log(item)
                    item.peer.signal(payload.signal)
                  })
                })
              // setWaitingState(false)
            } else {
              // setWaitingState(false)
              setRejectionState(true)
            }
            setWaitingState(false)
          })
          socket.emit('checkForRoom', {
            roomID,
            userID: userId,
            userData: resp.data,
          })
          setWaitingState(true)
        })
        .catch((error) => {
          console.error('Error fetching user:', error)
        })
    }
  }, [])
  function createPeer(userToSignal, callerID, stream) {
    console.log('createPeer called', userToSignal, callerID)
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    })

    peer.on('signal', (signal) => {
      socket.emit('sending signal', {
        userToSignal,
        callerID,
        signal,
      })
    })

    return peer
  }

  function addPeer(incomingSignal, callerID, stream) {
    console.log('addPeer called', callerID)
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    })

    peer.on('signal', (signal) => {
      socket.emit('returning signal', { signal, callerID })
    })

    peer.signal(incomingSignal)

    return peer
  }

  const socket = useMemo(() => {
    return io(process.env.NEXT_PUBLIC_LIVE_URL, {
      withCredentials: true,
    })
  }, [])
  useEffect(() => {
    const handlePopState = () => {
      if (socket) {
        socket.disconnect()
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      if (socket) {
        socket.disconnect()
      }
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])
  const editorRef = useRef()
  const codeboxRef = useRef()
  const toggleControllersRef = useRef()
  const outputRef = useRef()
  const [value, setValue] = useState('')
  const [stdInput, setStdInput] = useState('')
  const [language, setLanguage] = useState({
    language: 'javascript',
    version: '18.15.0',
    default:
      '\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n',
  })
  const [output, setOutput] = useState('Click run to see the result')
  const [outputError, setOutputError] = useState('')
  const [outputToggle, setOutputToggle] = useState(true)
  const [codeboxToggle, setCodeboxToggle] = useState(true)
  const [gptToggle, setGptToggle] = useState(false)
  const [userLength, setUserLength] = useState()
  const [caretPosition, setCaretPosition] = useState({ left: 0, top: 0 })
  const [caretName, setCaretName] = useState()
  const [caretVisible, setCaretVisible] = useState(false)
  const [requestList, setRequestList] = useState([])
  const [toggleControllers, setToggleControllers] = useState(false)
  const [toggleMicrophone, setToggleMicrophone] = useState(true)
  const [toggleAccessEditor, setToggleAccessEditor] = useState(true)
  const [toggleAccessAudioAll, setToggleAccessAudioAll] = useState(true)
  const [audioPermissionStatus, setAudioPermissionStatus] = useState([])
  const [disabledAudio, setDisabledAudio] = useState(false)
  const [showAudioNotEnabled, setShowAudioNotEnabled] = useState(false)
  const [showMeetingToast, setShowMeetingToast] = useState(false)

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/gemini'
  })

  const handleToggleControllers = () => {
    if (toggleControllers) {
      toggleControllersRef.current.style.width = '40px'
    } else {
      toggleControllersRef.current.style.width = !creator ? '250px' : '450px'
    }
    setToggleControllers(!toggleControllers)
  }
  const notify = () => toast('Here is your toast.')

  const handleToggleMicrophone = (flag) => {
    // if (!toggleMicrophone) {
    //   globalStream.getTracks().forEach((track) => track.stop())
    //   setGlobalStream(globalStream)
    // } else {
    //   navigator.mediaDevices
    //     .getUserMedia({ audio: true })
    //     .then((stream) => {
    //       setGlobalStream(stream)
    //       userVideo.current.srcObject = stream
    //     })
    //     .catch((error) => {
    //       console.error('Error accessing audio stream:', error)
    //     })
    // }

    console.log('flag from owner', flag)
    if (globalStream) {
      console.log('emitting')
      const audioTrack = globalStream.getAudioTracks()[0]
      console.log(audioTrack)
      globalStream.getAudioTracks()[0].enabled = flag
      console.log(globalStream.getAudioTracks()[0])
      setGlobalStream(globalStream)
    }
    setToggleMicrophone(flag)

    socket.emit('sendAudioStatus', {
      socketID: socket.id,
      toggleMicrophone: flag,
      roomID,
    })
  }
  const handleOutputToggle = () => {
    if (outputToggle) {
      codeboxRef.current.style.height = '88%'
      outputRef.current.style.height = '10%'
    } else {
      codeboxRef.current.style.height = '70%'
      outputRef.current.style.height = '28%'
    }
    setOutputToggle(!outputToggle)
  }

  const handleGptToggle = () => {
    if (!gptToggle) {
      if (roomIDParam !== 'singleUser') {
        document.querySelector('.editorContainer .editor').style.width =
          'calc(33% - 20px)'
      } else {
        document.querySelector('.editorContainer .editor').style.width =
          'calc(52% - 20px)'
      }
    } else {
      if (roomIDParam !== 'singleUser') {
        document.querySelector('.editorContainer .editor').style.width =
          'calc(78% - 80px)'
      } else {
        document.querySelector('.editorContainer .editor').style.width =
          'calc(99% - 80px)'
      }
    }
    setGptToggle(!gptToggle)
  }

  const handleCodeboxToggle = () => {
    if (codeboxToggle) {
      document.querySelector('.editorContainer .editor').style.width =
        'calc(88% - 80px)'
      document.querySelector('.editorContainer .participants').style.width =
        '10%'
    } else {
      document.querySelector('.editorContainer .editor').style.width =
        'calc(78% - 80px)'
      document.querySelector('.editorContainer .participants').style.width =
        '20%'
    }
    setCodeboxToggle(!codeboxToggle)
  }

  const onMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }
  const roomID = searchParams.get('roomID')

  const handleCompileRun = async () => {
    const obj = {
      language: language.language,
      version: language.version,
      files: [
        {
          name: 'my_cool_code.js',
          content: value,
        },
      ],
      stdin: stdInput,
      args: ['1', '2', '3'],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1,
    }
    const resp = await axios.post('https://emkc.org/api/v2/piston/execute', obj)

    const outputCode = resp.data.run.stdout.replace(/\n/g, '<br>')
    const outputError = resp.data.run.stderr.replace(/\n/g, '<br>')
    if (outputCode !== '') {
      document.querySelector('.showOutput1').style.color = 'white'
      document.querySelector('.showOutput1').innerHTML = outputCode
    } else if (outputError !== '') {
      document.querySelector('.showOutput1').style.color = '#ff7676'
      document.querySelector('.showOutput1').innerHTML = outputError
    }
    setOutput(outputCode)
    setOutputError(outputError)
  }
  useEffect(() => {
    setValue(language.default)
  }, [language])
  useEffect(() => {
    if (roomIDParam !== 'singleUser') {
      socket.on('getResponse', (m) => {
        setValue(m.value)
        setLanguage({
          language: m.language,
          version: m.version,
          default: m.value,
        })
        setCaretPosition(m.position)
        if (m.userData) setCaretName(m.userData.user.photo)
        setCaretVisible(true)
        setTimeout(() => {
          setCaretVisible(false)
        }, 1000)
      })
      socket.on('allowPermission', ({ userData, clientSocketID }) => {
        setRequestList((previousRequestList) => [
          ...previousRequestList,
          { userData: userData, clientSocketID: clientSocketID },
        ])
      })
    }
    socket.on('getAudioStatus', (m) => {
      console.log('get audio status')
      console.log(m)

      setCurrJoinedList(m)
    })

    socket.on('getEditorAccess', (m) => {
      console.log(m)
      console.log('checking for keyboard')
      m.users.map((user, i) => {
        console.log(user)
        if (user.socketID === socket.id) {
          if (m.creator !== socket.id) {
            if (user.accessEditor) {
              toast.success('Input access has been enabled.')
            } else {
              toast.error('Input access has been disabled by the creator.')
            }
          }
          setEnableEditor(user.accessEditor)
        }
      })
      setCurrJoinedList(m.userList)
    })
    socket.on('singleUserKeyboardFull', (m) => {
      console.log(m)
      if (m.msg === 'keyboardFull') {
        setToggleAccessEditor(false)
      } else {
        setToggleAccessEditor(true)
      }
    })
    socket.on('singleUserAudioFull', (m) => {
      if (m.msg === 'audioFull') {
        setToggleAccessAudioAll(false)
      } else {
        setToggleAccessAudioAll(true)
      }
    })
    socket.on('getAudioPermissionStatus', (m) => {
      console.log(m)
      setTrigger(trigger+1)
      setCurrJoinedList(m.newUsers)
    })
  }, [roomIDParam, socket])
  useEffect(() => {
    const handleAudioStatus = (m) => {
      console.log(m)
      m.newUsers.map((user, i) => {
        console.log(user)
        if (user.socketID === socket.id) {
          if (user.accessAudio === false) {
            toast.error('Voice access has been disabled by the creator.')
            handleToggleMicrophone(false)
          } else {
            toast.success('Voice access has been enabled.')
          }
          setDisabledAudio(!user.accessAudio)
        }
      })
    }

    socket.on('getAudioStatusAll', handleAudioStatus)

    return () => {
      socket.off('getAudioStatusAll', handleAudioStatus) // Clean up on unmount
    }
  }, [socket, globalStream])
  useEffect(() => {}, [userData, socket])
  if (roomIDParam !== 'singleUser') {
    socket.on('getCurrData', () => {
      let position = handleEditorChange()

      socket.emit('sendSignal', {
        roomID,
        value,
        position,
        language: language.language,
        version: language.version,
      })
    })
  }
  const handleAllowUser = (value, index) => {
    const newItems = requestList.filter((_, i) => i !== index)
    setRequestList(newItems)
    socket.emit('responseFromOwner', {
      roomID: roomID,
      msg: 'allowed',
      clientSocketID: value.clientSocketID,
    })
  }
  const handleRejectUser = (value, index) => {
    const newItems = requestList.filter((_, i) => i !== index)
    setRequestList(newItems)
    socket.emit('responseFromOwner', {
      roomID: roomID,
      msg: 'rejected',
      clientSocketID: value.clientSocketID,
    })
  }
  const handleEditorChange = (value, event) => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition()
      if (position) {
        const { left, top } =
          editorRef.current.getScrolledVisiblePosition(position)
        return { left, top }
      }
    }
    return { left: 0, top: 0 }
  }
  const handleLeaveCall = () => {
    const userConfirmed = window.confirm(
      'Are you sure you want to Leave the call?'
    )
    if (!userConfirmed) return
    if (socket && socket.connected) {
      socket.disconnect()
      console.log('Socket disconnected')
    }
    if (globalStream) {
      globalStream.getTracks().forEach((track) => track.stop())
      console.log('Media stream tracks stopped')
    }
    window.location.href = '/'
  }
  const handleAccessEditor = () => {
    setToggleAccessEditor(!toggleAccessEditor)
    socket.emit('sendEditorAccess', {
      roomID,
      socketID: socket.id,
      toggleAccessEditor: !toggleAccessEditor,
    })
  }
  const handleAllUsersMike = () => {
    setToggleAccessAudioAll(!toggleAccessAudioAll)
    socket.emit('sendAllAudioMute', {
      roomID,
      socketID: socket.id,
      toggleAccessAudioAll: !toggleAccessAudioAll,
    })
  }

  const inputRoomIDRef = useRef(null)
  const handleShowMeetingToast = () => {
    toast(
      (t) => (
        <div
          style={{
            color: '#fff',
          }}
        >
          <div style={{ position: 'absolute', right: '20px', top: '12px' }}>
            <i
              className='fa-solid fa-xmark'
              style={{ color: '#ec5e59', scale: '1.5', cursor: 'pointer' }}
              onClick={() => toast.dismiss(t.id)}
            ></i>
          </div>
          <h2
            style={{
              fontSize: '25px',
              fontWeight: '800',
              color: 'rgb(204, 255, 0)',
            }}
          >
            Multi-User Code Editor
          </h2>
          <span
            style={{
              margin: '10px 0 20px 0',
              display: 'inline-block',
              fontSize: '16px',
              letterSpacing: '1px',
            }}
          >
            Join the voice call and collaborate effortlessly through the
            interactive code editor
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => {
                const createNewRoomID = uniqid()
                window.location.href = `/editor?roomID=${createNewRoomID}`

                toast.dismiss(t.id)
              }}
              style={{
                height: '50px',
                marginRight: '10px',
                backgroundColor: '#46C6C2',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '25%',
              }}
            >
              New Meeting
            </button>
            <input
              type='text'
              placeholder='Enter the code'
              style={{
                height: '50px',
                marginBottom: '10px',
                width: '60%',
                borderRadius: '5px',
                border: '1px solid #ccc',
                color: '#000',
                paddingLeft: '20px',
                fontSize: '17px',
              }}
              ref={inputRoomIDRef}
            />
            <button
              onClick={() => {
                if (inputRoomIDRef.current.value.trim() === '') {
                  toast.error('Room ID cannot be empty')
                  return
                }
                window.location.href = `/editor?roomID=${inputRoomIDRef.current.value}`
                toast.dismiss(t.id)
              }}
              style={{
                height: '50px',
                backgroundColor: '#ec5e59',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '15%',
                marginLeft: '10px',
              }}
            >
              Join
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
        style: {
          background: '#0A0A16',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          width: '600px',
          maxWidth: 'none', // This overrides the default max width
        },
      }
    )
  }
  useEffect(() => {}, [enableEditor])
  return (
    <div className='editorContainer'>
      {roomIDParam !== 'singleUser' ? (
        <>
          <div
            style={{
              zIndex: 9999,
              color: 'rgb(214, 214, 214)',
              position: 'absolute',
              left: '186px',
              top: '12px',
              border: '1px solid rgba(255, 255, 255, 0.27)',
              padding: '4px 15px',
              fontWeight: 500,
              borderRadius: '5px',
              letterSpacing: '1px',
            }}
          >
            Room ID: {roomIDParam}
            <i
              onClick={() => {
                navigator.clipboard
                  .writeText(roomIDParam)
                  .then(() => {
                    toast.success(
                      'The Room ID has been successfully copied to the clipboard.'
                    )
                  })
                  .catch(() => {
                    toast.error(
                      'An error occurred while copying the Room ID. Please try again.'
                    )
                  })
              }}
              style={{ marginLeft: '10px', cursor: 'pointer' }}
              className='fa-solid fa-copy'
            ></i>
          </div>
        </>
      ) : (
        <></>
      )}
      <SiteHeader />

      {/* <h3>{socket.id}</h3> */}
      <video
        style={{ display: 'none' }}
        ref={userVideo}
        autoPlay
        playsInline
        muted
      />
      {peers.map((peer, index) => (
        <Video key={index} peer={peer} />
      ))}

      {roomIDParam === 'singleUser' ? (
        <></>
      ) : (
        <>
          <div className='controllers' ref={toggleControllersRef}>
            <div className='toggleBtn' onClick={handleToggleControllers}>
              <i
                className={`fa-solid ${
                  toggleControllers ? 'fa-chevron-right' : 'fa-chevron-left'
                }`}
              ></i>
            </div>
            <div
              onClick={() => {
                if (disabledAudio) {
                  toast.error(
                    'You are unable to speak as the owner has restricted voice permissions.'
                  )
                  return
                }
                handleToggleMicrophone(!toggleMicrophone)
              }}
              className='controller'
            >
              <i
                className={`fa-solid ${
                  !toggleMicrophone ? 'fa-microphone-slash' : 'fa-microphone'
                }`}
              ></i>
              {disabledAudio ? <i className='fa-solid fa-ban'></i> : <></>}
            </div>
            {creator ? (
              <>
                <div
                  className={`controller accessInputKeyboard ${
                    toggleAccessEditor ? '' : 'enabled'
                  }`}
                  onClick={handleAccessEditor}
                >
                  <i className='fa-solid fa-keyboard'></i>
                  <i className='fa-solid fa-slash'></i>
                </div>
                <div
                  className={`controller accessInputVoice ${
                    toggleAccessAudioAll ? '' : 'enabled'
                  }`}
                  onClick={handleAllUsersMike}
                >
                  <i className='fa-solid fa-users-slash'></i>
                </div>
              </>
            ) : (
              <></>
            )}
            <div className='controller endcall' onClick={handleLeaveCall}>
              <span>End Call</span>
              <i className='endCall fa-solid fa-phone'></i>
            </div>
            {/* <div className='controller'>
          <i className='fa-solid fa-video'></i>
        </div> */}
          </div>
        </>
      )}
      {waitingState || rejectionState ? (
        waitingState ? (
          <div className='waitingCard'>
            <span className='text'>
              Waiting f
              <>
                <span className='loader'></span>
              </>
              r Confirmation...
            </span>
            <div className='userDetails'>
              <div
                className='logo'
                style={{ backgroundImage: `url(${userData.user.photo})` }}
              ></div>
              <div className='userName'>
                <h3>{`${userData.user.firstName} ${userData.user.lastName}`}</h3>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                height: '80vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                color:"white"
              }}
            >
              <div
                style={{
                  height: '225px',
                  width: '300px',
                  backgroundImage: 'url(../../error.png)',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'contain',
                }}
              ></div>
              <h2 style={{fontSize:"30px"}}>You can't join this meeting</h2>
              <span>Admin in the meeting denied your request</span>
              <div
                style={{
                  backgroundColor: '#2CBB5D',
                  padding: '15px 25px',
                  color: 'white',
                  marginTop:'20px',
                  borderRadius:'10px',
                  cursor:'pointer'
                }}
                onClick={() => {
                  window.location.href = '/editor?roomID=singleUser'
                }}
              >
                <span>Go to Editor</span>
              </div>
            </div>
          </>
        )
      ) : (
        <>
          <div className='accessCard'>
            {requestList.length > 0 && (
              <span className='heading'>
                Someone wants to join this session
              </span>
            )}
            {requestList.map((value, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div className='profile'>
                  <div
                    className='dp'
                    style={{
                      backgroundImage: `url(${value.userData.user.photo})`,
                    }}
                  ></div>
                  <span className='name'>
                    {/* {JSON.stringify(value)} */}
                    {value.userData.user.firstName}{' '}
                    {value.userData.user.lastName}
                  </span>
                </div>
                <div className='options'>
                  <div className='allowBtn button'>
                    <i
                      className='fa-solid fa-check'
                      style={{ color: '#46C6C2' }}
                      onClick={() => handleAllowUser(value, idx)}
                    ></i>
                  </div>
                  <div className='rejectBtn button'>
                    <i
                      className='fa-solid fa-xmark'
                      style={{ color: '#ec5e59' }}
                      onClick={() => handleRejectUser(value, idx)}
                    ></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='sideBar element'>
            <div className='logo'></div>
            <div className='options'>
              <div
                className='option button toggleGPT'
                onClick={handleGptToggle}
                style={{ cursor: 'pointer' }}
              >
                <i className='fa-solid fa-brain'></i>
              </div>
              <div
                className='option button'
                onClick={handleShowMeetingToast}
                style={{ cursor: 'pointer' }}
              >
                <i className='fa-solid fa-calendar-plus'></i>
              </div>
            </div>
            <div className='settings button'></div>
          </div>
          {gptToggle ? (
            <div className='gpt element'>
              <div className='cardHeading'>
                <span>AI Assistant</span>
              </div>
              <div className='result'>
                {messages.map((message, i) => (
                  <div key={i} className={`message ${message.role}`}>
                    <div className='message-content'>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline ? (
                              <pre className={className}>
                                <code
                                  {...props}
                                  className={
                                    match ? `language-${match[1]}` : ''
                                  }
                                >
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code {...props} className={className}>
                                {children}
                              </code>
                            )
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubmit} className='msgBar'>
                <TextareaAutosize
                  value={input}
                  onChange={handleInputChange}
                  placeholder='Ask me anything...'
                  maxRows={5}
                  className='chat-input'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <button type='submit'>
                  <i className='fa-solid fa-arrow-up'></i>
                </button>
              </form>
            </div>
          ) : null}
          <div className='editor element'>
            <div
              className={`codebox ${enableEditor ? `` : `disabledEditor`}`}
              ref={codeboxRef}
              style={{ position: 'relative' }}
            >
              <div className='cardHeading'>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ marginRight: '15px' }}>Code Editor</span>
                  <div>
                    <span style={{ fontSize: '12px' }}>
                      {language.language}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        marginLeft: '15px',
                        color: '#ffffff70',
                      }}
                    >
                      {`v ${language.version}`}
                    </span>
                  </div>
                </div>
                <div className='options'>
                  <div className='button option languages'>
                    <Languages setLanguage={setLanguage}></Languages>
                  </div>
                  {roomIDParam !== 'singleUser' ? (
                    <div
                      className='button option expand'
                      onClick={handleCodeboxToggle}
                      style={
                        gptToggle
                          ? {
                              opacity: 0.5,
                              cursor: 'not-allowed',
                              pointerEvents: 'none',
                            }
                          : {}
                      }
                    >
                      <span>expand ➔</span>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div
                className='caretIndicator'
                style={{
                  position: 'absolute',
                  left: caretPosition.left + 5,
                  top: caretPosition.top + 58,
                  zIndex: '200',
                  pointerEvents: 'none',
                  opacity: caretVisible ? '1' : '0',
                }}
              >
                <div
                  className='caretDP'
                  style={{
                    backgroundImage: `url(${caretName})`,
                    height: '30px',
                    width: '30px',
                    borderRadius: '50%',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderBottomLeftRadius: '2px',
                  }}
                ></div>
              </div>
              <Editor
                height='90vh'
                theme='myTheme'
                language={language.language}
                onMount={onMount}
                value={value}
                onChange={(value) => {
                  setValue(value)
                  let position = handleEditorChange()

                  socket.emit('sendSignal', {
                    roomID,
                    value,
                    position,
                    userData,
                    language: language.language,
                    version: language.version,
                  })
                }}
              />
              <button className='runButton button' onClick={handleCompileRun}>
                Run code
              </button>
            </div>
            <div className='bottomOptions'>
              <div className='output'>
                <div className='cardHeading'>
                  <span>Input</span>
                  {/* <div
                    className='button toggleOutput'
                    onClick={handleOutputToggle}
                  >
                    <span>down &#8595;</span>
                  </div> */}
                </div>
                <div className='showOutput'>
                  <textarea
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      backgroundColor: 'transparent',
                    }}
                    className='inputTextArea'
                    onChange={(e) => {
                      setStdInput(e.target.value)
                    }}
                  ></textarea>
                </div>
              </div>
              <div className='output' ref={outputRef}>
                <div className='cardHeading'>
                  <span>Output</span>
                  {/* <div
                    className='button toggleOutput'
                    onClick={handleOutputToggle}
                  >
                    <span>down &#8595;</span>
                  </div> */}
                </div>
                <div className='showOutput showOutput1'></div>
              </div>
            </div>
          </div>
          <div className='participants element'>
            {currJoinedList &&
              currJoinedList.users.map((user, index) => (
                <Participant
                  key={index}
                  profilePic={user.userData.user.photo}
                  name={user.userData.user.firstName}
                  owner={currJoinedList.creator}
                  localID={user.userData.user.clerkId}
                  codeboxToggle={codeboxToggle}
                  audioStatus={user.audioStatus}
                  editorInputStatus={user.accessEditor}
                  creator={creator}
                  socket={socket}
                  socketID={user.socketID}
                  roomID={roomID}
                  accessAudio={user.accessAudio}
                  trigger={trigger}
                ></Participant>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CodeEditor
