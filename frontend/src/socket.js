import SocketIO from 'socket.io-client'

const io = SocketIO(process.env.VUE_APP_BASE_API, {
  path: '/api/socket.io/',
  autoConnect: false,
})

io.on('connect', () => {
  console.log('socket connected')
})

io.on('disconnect', () => {
  console.log('socket disconnected')
})

export default io
