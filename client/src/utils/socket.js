import { io } from 'socket.io-client'

// Use environment variable if provided, otherwise default to localhost:5000
const SERVER = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const socket = io(SERVER, {
  autoConnect: true
})

socket.on('connect', () => {
  console.log('🔌 Connected to socket server', socket.id)
})

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from socket server')
})

export default socket
