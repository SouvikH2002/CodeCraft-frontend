'use client'
import { Participant } from './components/Participant'
import '../css/editor.css'
import '../css/colors.css'
import Editor from '@monaco-editor/react'
import { useState, useRef, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Languages } from './components/Languages'
import { io } from 'socket.io-client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
function CodeEditor() {
  const { userId } = useAuth()
  const [userData, setUserData] = useState(null)
  const [currJoinedList, setCurrJoinedList] = useState()
  const [waitingState, setWaitingState] = useState(false)
  const [rejectionState, setRejectionState] = useState(false)
  useEffect(() => {
    console.log(userId)
    axios
      .post('/api/users', { userId })
      .then((resp) => {
        console.log(resp)
        setUserData(resp.data)
        socket.on('feedback', (m) => {
          console.log(m)
          if (m.msg === 'accepted') {
            console.log(resp.data)
            if (resp.data) {
              socket.emit('joinGroup', {
                roomID,
                userID: userId,
                userData: resp.data,
              })
            }
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
  }, [])
  const socket = useMemo(() => {
    return io(process.env.NEXT_PUBLIC_LIVE_URL, {
      withCredentials: true,
    })
  }, [])

  const editorRef = useRef()
  const codeboxRef = useRef()
  const outputRef = useRef()
  const [value, setValue] = useState('')
  const [language, setLanguage] = useState({
    language: 'javascript',
    version: '18.15.0',
    default:
      '\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n',
  })
  const [output, setOutput] = useState('Click run to see the result')
  const [outputToggle, setOutputToggle] = useState(true)
  const [codeboxToggle, setCodeboxToggle] = useState(true)
  const [gptToggle, setGptToggle] = useState(false)
  const [userLength, setUserLength] = useState()
  const [caretPosition, setCaretPosition] = useState({ left: 0, top: 0 })
  const [caretName, setCaretName] = useState()
  const [caretVisible, setCaretVisible] = useState(false)
  const [requestList, setRequestList] = useState([])
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
      document.querySelector('.container .editor').style.width =
        'calc(45% - 80px)'
    } else {
      document.querySelector('.container .editor').style.width =
        'calc(78% - 80px)'
      document.querySelector('.container .participants').style.width = '20%'
    }
    setGptToggle(!gptToggle)
  }

  const handleCodeboxToggle = () => {
    if (codeboxToggle) {
      document.querySelector('.container .editor').style.width =
        'calc(88% - 80px)'
      document.querySelector('.container .participants').style.width = '10%'
    } else {
      document.querySelector('.container .editor').style.width =
        'calc(78% - 80px)'
      document.querySelector('.container .participants').style.width = '20%'
    }
    setCodeboxToggle(!codeboxToggle)
  }

  const onMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }
  const searchParams = useSearchParams()
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
      stdin: '',
      args: ['1', '2', '3'],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1,
    }
    const resp = await axios.post('https://emkc.org/api/v2/piston/execute', obj)

    const outputCode = resp.data.run.stdout.replace(/\n/g, '<br>')

    document.querySelector('.showOutput').innerHTML = outputCode
    setOutput(outputCode)
  }
  useEffect(() => {
    setValue(language.default)
  }, [language])
  useEffect(() => {
    console.log('socket activity')
    socket.on('joinGroup', (m) => {
      console.log(m)
      setCurrJoinedList(m.userData)
      setUserLength(m.length)
    })
    socket.on('getResponse', (m) => {
      console.log('getting signal')
      console.log(m)
      setValue(m.value)

      setCaretPosition(m.position)
      if (m.userData) setCaretName(m.userData.user.photo)
      setCaretVisible(true)
      setTimeout(() => {
        console.log('check')

        setCaretVisible(false)
      }, 1000)
    })
    socket.on('allowPermission', ({ userData, clientSocketID }) => {
      console.log('asking for permission')
      console.log(userData)
      console.log(clientSocketID)
      setRequestList((previousRequestList) => [
        ...previousRequestList,
        { userData: userData, clientSocketID: clientSocketID },
      ])
    })
  }, [socket])
  useEffect(() => {}, [userData, socket])
  socket.on('getCurrData', () => {
    console.log('targeting owner')
    let position = handleEditorChange()
    console.log(value)
    socket.emit('sendSignal', { roomID, value, position })
  })
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
  return (
    <div className='container'>
      {waitingState || rejectionState ? (
        waitingState ? (
          <div className='waitingCard'>
            <span className='text'>
              Waiting f
              <>
                <span class='loader'></span>
              </>
              r Confirmation...
            </span>
            <div className='userDetails'>
              <div className='logo' style={{backgroundImage:`url(${userData.user.photo})`}}></div>
              <div className='userName'>
                <h3>{`${userData.user.firstName} ${userData.user.lastName}`}</h3>
              </div>
            </div>
          </div>
        ) : (
          <span>rejected :) like my life</span>
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
                      class='fa-solid fa-check'
                      style={{ color: '#46C6C2' }}
                      onClick={() => handleAllowUser(value, idx)}
                    ></i>
                  </div>
                  <div className='rejectBtn button'>
                    <i
                      class='fa-solid fa-xmark'
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
              ></div>
              <div className='option button'></div>
              <div className='option button'></div>
            </div>
            <div className='settings button'></div>
          </div>
          {gptToggle ? (
            <div className='gpt element'>
              <div className='cardHeading'>
                <span>ChatGPT</span>
              </div>
            </div>
          ) : null}
          <div className='editor element'>
            <div
              className='codebox'
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
                theme='vs-dark'
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
                  })
                }}
              />
              <button className='runButton button' onClick={handleCompileRun}>
                Run code
              </button>
            </div>
            <div className='output' ref={outputRef}>
              <div className='cardHeading'>
                <span>Output</span>
                <div
                  className='button toggleOutput'
                  onClick={handleOutputToggle}
                >
                  <span>down &#8595;</span>
                </div>
              </div>
              <div className='showOutput'></div>
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
                ></Participant>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CodeEditor
