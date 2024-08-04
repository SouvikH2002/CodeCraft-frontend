import React, { useState } from 'react'
import defaults from '../data/defaults.json'
import languages from '../data/languages.json'
export const Languages = ({ setLanguage }) => {
  // const [toggleList,setToggleList]=useState(null)

  return (
    <>
      <span>Languages</span>
      <div className='langOptions'>
        {languages.map((item, index) => {
          return (
            <div
              key={index}
              className='langOption button'
              onClick={() => {
                setLanguage({
                  language: item.language,
                  version: item.version,
                  default: defaults[index].code,
                })
              }}
            >
              {item.language}
            </div>
          )
        })}
      </div>
    </>
  )
}
