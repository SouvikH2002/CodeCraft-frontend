'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'

export default function Home() {
  const [roomID, setRoomId] = useState('')
  const socket = useMemo(() => {
    return io(process.env.NEXT_PUBLIC_LIVE_URL, {
      withCredentials: true,
    })
  }, [])

  useEffect(() => {
    socket.on('generateRoomRequest', (m) => {
      setRoomId(m.roomID)
      // socket.emit('joinGroup', { roomID: m.roomID })
    })

    return () => {
      socket.off('generateRoomRequest')
    }
  }, [socket])

  const router = useRouter()

  return (
    <>
      <span>Home page</span>
      <div className='createRoom' style={{ zIndex: 100 }}>
        <button
          className='createRoomID'
          onClick={() => {
            socket.emit('generateRoomRequest')
          }}
        >
          create id
        </button>
        <br />
        <span>{roomID}</span>
        <br />
        <input
          type='text'
          onChange={(e) => {
            setRoomId(e.target.value)
          }}
        />
        <button
          onClick={() => {
            router.push(`/editor?roomID=${roomID}`)
          }}
        >
          join
        </button>
      </div>
    </>
  )
}
