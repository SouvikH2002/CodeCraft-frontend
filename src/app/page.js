"use client"
import Image from "next/image";
import Editor from '@monaco-editor/react'
import { useState,useEffect,useRef } from "react";
import axios from "axios"
export default function Home() {
   const editorRef = useRef()
   const [value, setValue] = useState('')
   const [language, setLanguage] = useState('javascript')

   const onMount = (editor) => {
     editorRef.current = editor
     editor.focus()
   }

   const onSelect = (language) => {
     setLanguage(language)
     setValue(CODE_SNIPPETS[language])
   }
  return (
    <>
      <Editor
        height='90vh'
        theme='vs-dark'
        defaultLanguage='java'
        defaultValue='// some comment'
        onMount={onMount}
        value={value}
        onChange={(value) => setValue(value)}
      />
      <button onClick={async()=>{
        const obj = {
          language: 'java',
          version: '15.0.2',
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
        const resp=await axios.post("https://emkc.org/api/v2/piston/execute",obj)
        console.log(resp.data.run.stdout)
      }}>RUN</button>
      ;
    </>
  )
}
