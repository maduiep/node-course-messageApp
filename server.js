const express = require('express')
const bodyparser = require('body-parser')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = 3000
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/messageApp', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
mongoose.Promise = Promise

const Message = mongoose.model('Message', {
 name: String,
 message: String
})

app.use(express.static(__dirname))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))


app.get('/messages', (req, res) => {
 Message.find({}, (err, messages) => {
  res.send(messages)
 })
})

app.get('/messages/:user', (req, res) => {
 const user = req.params.user
 Message.find({name: user}, (err, messages) => {
  res.send(messages)
 })
})

app.post('/messages', async (req, res) => {

 try {

  const message = new Message(req.body)
  const savedMessage = await message.save()

  console.log('saved')
  const censored = await Message.findOne({ message: 'badword' })

  if (censored)
   await Message.remove({ _id: censored.id })
  else
   io.emit('message', req.body)
  io.emit('message', req.body)
  res.sendStatus(200)

 } catch (error) {
  res.sendStatus(500)
  return console.error(error)
 } finally {
  console.log('message post called')
 }

})

io.on('connection', (socket) => {
 console.log('A user is connected')
})

app.get('/', (req, res) => res.render('Hello World'))
http.listen(port, 'localhost', () => console.log(`Sever is listening!`))