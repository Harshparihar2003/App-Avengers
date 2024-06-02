const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const PORT = 4000;

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({credentials:true,origin:true}));

// Connecting to the database
mongoose.connect('mongodb+srv://harsh9454696030:ZCMtkWiPKvdbBf6j@cluster0.gled27z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
console.log("Connected to database successfully...");

// Registering the User
app.post('/register', async (req,res) => {
mongoose.connect('mongodb+srv://harsh9454696030:ZCMtkWiPKvdbBf6j@cluster0.gled27z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  const {username,password} = req.body;
  try{
    const userDoc = await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// Login the User
app.post('/login', async (req,res) => {
mongoose.connect('mongodb+srv://harsh9454696030:ZCMtkWiPKvdbBf6j@cluster0.gled27z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

  const {username,password} = req.body;
  const userDoc = await User.findOne({username});
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc?.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });
    });
  }
  }
   else {
    res.status(400).json('wrong credentials');
  }
});

// User Profile
app.get('/profile', (req,res) => {
mongoose.connect('mongodb+srv://harsh9454696030:ZCMtkWiPKvdbBf6j@cluster0.gled27z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, secret, {}, (err,info) => {
        if (err) throw err;
        res.json(info);
      });
  }
  else {
    res.json(null);
  }
  
});

// Deleting the Blog
app.delete("/deleteblog/:id", async (req,res)=>{
    try {        
        let  blog = await Post.findById(req.params.id)
        if(!blog){
            return res.status(404).send("Not found")
        }
        blog = await Post.findByIdAndDelete(req.params.id)
        res.json({"Success": "Blog has been deleted."})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured") 
    }
})

// Logut
app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

// Uploading the photo
app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {title,summary,content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    });
    res.json(postDoc);
  });

});

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
mongoose.connect('mongodb+srv://harsh9454696030:ZCMtkWiPKvdbBf6j@cluster0.gled27z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  const {id,title,summary,content} = req.body;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc?.author) === JSON.stringify(info?.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    postDoc.set({
      title,summary,content,cover: newPath ? newPath : postDoc.cover,
    })
    await postDoc.save();

    res.json(postDoc);
  });

});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

app.listen(PORT, ()=>{
    console.log(`Server is running on the port ${PORT}`)
})
//