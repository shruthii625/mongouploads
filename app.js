const express= require('express');
const bodyParser=require('body-parser');
const path=require('path');
const crypto= require('crypto');
const mongoose= require('mongoose');
const multer=require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid= require('gridfs-stream');
const methodOverride=require('method-override');
const assert = require("assert");
const mongodb=require ('mongodb');
const { appendFileSync } = require('fs');
const app=express();
const router= express.Router();
const url = require('url');
var imgurl="";
var rs="";
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


const mongoURI="mongodb+srv://abc123:1234@cluster0.hgpze.mongodb.net/image_database?retryWrites=true&w=majority";
app.locals.myVar="";
const conn= mongoose.createConnection(mongoURI,{ useNewUrlParser: true });

const MongoClient = require('mongodb').MongoClient;
const con1=mongodb.MongoClient.connect(mongoURI );
con1.then(client => {
  console.log("Connected correctly to server");

  const db = client.db("image_database");
  const collection = db.collection("pics.files");
  //const collection1= db.collection("pics");
  const changeStream = collection.watch();
 // const changeStream1= collection1.watch();
  changeStream.on("change", function (change) {
    console.log(" change=",change.fullDocument.filename);
    console.log(" change=",change.fullDocument.uploadDate);
    app.locals.myVar = change.fullDocument.filename;
    app.locals.date=change.fullDocument.uploadDate;
    rs = gfs.createReadStream(app.locals.myVar);

   // readstream.pipe(res);
   // router.get('/changed/change.fullDocument.filename');
  });

 /* changeStream1.on("change", function (change) {
    console.log(" change=",change);
    //console.log(" change=",change.fullDocument.uploadDate);
    //app.locals.myVar = change.fullDocument.filename;
    
    
  })*/

});



  
let gfs;

conn.once('open',()=>{
    gfs=Grid(conn.db, mongoose.mongo);
    gfs.collection('pics');
});

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'pics'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

  
 

  app.post('/upload', upload.single('file'),async (req, res) => {
   // res.json({file: req.file});
   //await con1.db('image_database').collection('pics').insertOne({createdAt: new Date()});
  //  res.redirect('/changed/:apps.locals.myVar');
  //res.redirect('/');
  //console.log("YO");
  //await console.log(app.locals.myVar);
   //const readstream = gfs.createReadStream(app.locals.myVar);
  //await readstream.pipe(res);
  
  //res.render('change');

  imgurl= req.protocol + '://' + req.get('host') +'/image/'+app.locals.myVar;
  console.log(imgurl);
  rs.pipe(res);


  });

  /*app.get('/changed/:filename', (req, res) => {
    const filename=req.params.filename;
    console.log(filename)
    const readstream = gfs.createReadStreamfilename(filename);
    readstream.pipe(res);

  });*/
  
 
  

  app.get('/', (req, res) => {
    res.render('index');
  });

  
  
  app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
  
      // Check if image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  });

 
  
const port=5000; 

app.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
}) ;