import express from 'express'
// require('dotenv').config()
const app=express()

app.get('/',(req,res)=>{
 res.send("your server was ready")
})

/// get a list of 5 jokes

app.get('/api/jokes',(req,res)=>{
  const jokes=[
    {
      id:1,
      title:'A joke',
      content:"jon bane a don"
      
    },
    {
      id:2,
      title:'A second joke',
      content:"jon bane a don"
      
    },
    {
      id:3,
      title:'A third joke',
      content:"jon bane a don"
      
    },
    {
      id:4,
      title:'A fourth joke',
      content:"jon bane a don"
      
    },
    {
      id:5,
      title:'A last joke',
      content:"jon bane a don"
      
    }
  ]
  res.send(jokes)
})

const port=process.env.PORT||3000

app.listen(port,()=>{
  console.log(`server are running on this server http://localhost:${port}/`)
})