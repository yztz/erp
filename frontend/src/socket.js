import SocketIO from 'socket.io-client'

const io = SocketIO(process.env.VUE_APP_API_BASE_URL, {
  path: process.env.VUE_APP_SOCKET_PREFIX,
  autoConnect: false,
})

io.on('connect', () => {
  console.log('socket connected')
})

io.on('disconnect', () => {
  console.log('socket disconnected')
})

export default io
