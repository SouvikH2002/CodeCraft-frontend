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

function editor() {
  const socket = useMemo(() => {
    return io(process.env.NEXT_PUBLIC_LIVE_URL, {
      withCredentials: true,
    })
  }, [])
  useEffect(() => {
    socket.emit('joinGroup', { roomID })
  }, [socket])
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
  const [caretName, setCaretName] = useState('')
  const [caretVisible, setCaretVisible] = useState(false)
  const [requestList,setRequestList]=useState([])
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
        'calc(76% - 80px)'
      document.querySelector('.container .participants').style.width = '20%'
    }
    setGptToggle(!gptToggle)
  }

  const handleCodeboxToggle = () => {
    if (codeboxToggle) {
      document.querySelector('.container .editor').style.width =
        'calc(87% - 80px)'
      document.querySelector('.container .participants').style.width = '10%'
    } else {
      document.querySelector('.container .editor').style.width =
        'calc(76% - 80px)'
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
      setUserLength(m.length)
    })
    socket.on('getResponse', (m) => {
      console.log('getting signal')
      console.log(m)
      setValue(m.value)

      setCaretPosition(m.position)
      setCaretName(m.id)
      setCaretVisible(true)
      setTimeout(() => {
        console.log('check')

        setCaretVisible(false)
      }, 1000)
    })
    socket.on('allowPermission',(socket)=>{
      console.log("asking for permission")
      setRequestList([...requestList,{id:socket}])
      console.log(requestList)
      console.log(socket)
    })
  }, [socket])
  socket.on('getCurrData', () => {
    console.log("targeting owner")
    let position = handleEditorChange()
    console.log(value)
    socket.emit('sendSignal', { roomID, value, position })
  })
  const handleEditorChange = (value, event) => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition()
      const { left, top } =
        editorRef.current.getScrolledVisiblePosition(position)
      return { left, top }

    }
  }
  
  return (
    <div className='container'>
      {
        requestList.map((value,i)=>{
          <div className='accessCard' style={{position:"absolute",bottom:0,right:0}}>
            <span>{value.id} wants to join</span>
            <button onClick={() => {}}>join</button>
            <button>reject</button>
          </div>
        }) 
      }
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
                <span style={{ fontSize: '12px' }}>{language.language}</span>
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
              left: caretPosition.left,
              top: caretPosition.top + 58,
              zIndex: '200',
              backgroundColor: 'red',
              pointerEvents: 'none',
              opacity: caretVisible ? '1' : '0',
            }}
          >
            <span>{caretName}</span>
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

              socket.emit('sendSignal', { roomID, value, position })
            }}
          />
          <button className='runButton button' onClick={handleCompileRun}>
            Run code
          </button>
        </div>
        <div className='output' ref={outputRef}>
          <div className='cardHeading'>
            <span>Output</span>
            <div className='button toggleOutput' onClick={handleOutputToggle}>
              <span>down &#8595;</span>
            </div>
          </div>
          <div className='showOutput'></div>
        </div>
      </div>
      <div className='participants element'>
        {Array.from({ length: userLength }, (_, index) => (
          <Participant key={index} />
        ))}
      </div>
    </div>
  )
}

export default editor
