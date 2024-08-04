<<<<<<< HEAD
'use client'
import { Participant } from './components/Participant'
import '../css/editor.css'
import '../css/colors.css'
import Editor from '@monaco-editor/react'
import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Languages } from './components/Languages'

function editor() {
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

=======
"use client";
import { Participant } from "./components/Participant";
import "../css/editor.css";
import "../css/colors.css";
import Editor from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
function editor() {
   const { isLoaded, isSignedIn} = useUser();
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("Click run to see the result");
  const [outputToggle, setOutputToggle] = useState(true);
  const [codeboxToggle, setCodeboxToggle] = useState(true);
  const [gptToggle, setGptToggle] = useState(false);
  const handleOutputToggle = () => {
    if (outputToggle) {
      document.querySelector(".container .editor .codebox").style.height =
        "88%";
      document.querySelector(".container .editor .output").style.height = "10%";
    } else {
      document.querySelector(".container .editor .codebox").style.height =
        "70%";
      document.querySelector(".container .editor .output").style.height = "28%";
    }
    setOutputToggle(!outputToggle);
  };
>>>>>>> auth
  const handleGptToggle = () => {
    if (!gptToggle) {
      document.querySelector(".container .editor").style.width =
        "calc(45% - 80px)";
    } else {
      document.querySelector(".container .editor").style.width =
        "calc(76% - 80px)";
      document.querySelector(".container .participants").style.width = "20%";
    }
<<<<<<< HEAD
    setGptToggle(!gptToggle)
  }

=======
    setGptToggle(!gptToggle);
  };
>>>>>>> auth
  const handleCodeboxToggle = () => {
    if (codeboxToggle) {
      document.querySelector(".container .editor").style.width =
        "calc(87% - 80px)";
      document.querySelector(".container .participants").style.width = "10%";
    } else {
      document.querySelector(".container .editor").style.width =
        "calc(76% - 80px)";
      document.querySelector(".container .participants").style.width = "20%";
    }
    setCodeboxToggle(!codeboxToggle);
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

<<<<<<< HEAD


  const handleCompileRun = async () => {
    const obj = {
      language: language.language,
      version: language.version,
=======
  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };
  const handleCompileRun = async () => {
    const obj = {
      language: "java",
      version: "15.0.2",
>>>>>>> auth
      files: [
        {
          name: "my_cool_code.js",
          content: value,
        },
      ],
      stdin: "",
      args: ["1", "2", "3"],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1,
<<<<<<< HEAD
    }
    console.log(obj)
    const resp = await axios.post('https://emkc.org/api/v2/piston/execute', obj)
    console.log('checkintg')
    console.log(resp.data.run.stdout)
    const outputCode = resp.data.run.stdout.replace(/\n/g, '<br>')

    document.querySelector('.showOutput').innerHTML = outputCode
    setOutput(outputCode)
  }
  useEffect(()=>{
    setValue(language.default)
  },[language])
=======
    };
    const resp = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      obj
    );
    console.log("checkintg");
    console.log(resp.data.run.stdout);
    const outputCode = resp.data.run.stdout.replace(/\n/g, "<br>");

    document.querySelector(".showOutput").innerHTML = outputCode;
    setOutput(outputCode);
  };
>>>>>>> auth
  return (
    <div className="container">
      <div className="sideBar element">
        <div className="logo"></div>
        <div className="options">
          <div
            className="option button toggleGPT"
            onClick={handleGptToggle}
          ></div>
          <div className="option button"></div>
          <div className="option button"></div>
        </div>
        <div className="settings button"></div>
      </div>
      {gptToggle ? (
<<<<<<< HEAD
        <div className='gpt element'>
          <div className='cardHeading'>
            <span>ChatGPT</span>
          </div>
        </div>
      ) : null}
      <div className='editor element'>
        <div className='codebox' ref={codeboxRef}>
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
=======
        <>
          <div className="gpt element">
            <div className="cardHeading">
              <span>ChatGPT</span>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      <div className="editor element">
        <div className="codebox">
          <div className="cardHeading">
            <span>Code Editor</span>
            <div className="options">
              <div className="button option">
                <span>languages</span>
>>>>>>> auth
              </div>
              <div
                className="button option expand"
                onClick={handleCodeboxToggle}
                style={
                  gptToggle
                    ? {
                        opacity: 0.5,
                        cursor: "not-allowed",
                        pointerEvents: "none",
                      }
                    : {}
                }
              >
                <span>expand ➔</span>
              </div>
            </div>
          </div>
          <Editor
<<<<<<< HEAD
            height='90vh'
            theme='vs-dark'
            language={language.language}
=======
            height="90vh"
            theme="vs-dark"
            defaultLanguage="java"
            defaultValue="// some comment"
>>>>>>> auth
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
          />
          <button className="runButton button" onClick={handleCompileRun}>
            Run code
          </button>
        </div>
<<<<<<< HEAD
        <div className='output' ref={outputRef}>
          <div className='cardHeading'>
            <span>Output</span>
            <div className='button toggleOutput' onClick={handleOutputToggle}>
              <span>down &#8595;</span>
=======
        <div className="output">
          <div className="cardHeading">
            <span>Output</span>
            <div className="button toggleOutput" onClick={handleOutputToggle}>
              <span>down</span>
>>>>>>> auth
            </div>
          </div>
          <div className="showOutput"></div>
        </div>
      </div>
      <div className="participants element">
        <Participant></Participant>
        <Participant></Participant>
        <Participant></Participant>
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default editor
=======
export default editor;
>>>>>>> auth
