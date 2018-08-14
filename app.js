const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const { textToFile, readFromFile } = require('./utils')
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));


//======================================
// listeners
//======================================
app.get('/alltext', (req, res, next) => {
  let data = readFromFile((data) => { res.send(data); }); //console.log(`${data}` + " data");
});

app.post('/text', (req, res, next) => {
  //console.log(req.body.text);
  textToFile(req.body.text, (word_reply) => { res.status(201).send(word_reply) });
});

app.post('/textappend', (req, res, next) => {
  console.log(req.body.text);
  textToFile(req.body.text);
  res.status(201).send();
});


//======================================
// open the port
//======================================
app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
