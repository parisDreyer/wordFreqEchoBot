//const sqlite3 = require('sqlite3');
//const db = new sqlite3.Database('./Words.db');
/*
const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('./wordlist10000') // from: http://www.mit.edu/~ecprice/wordlist.10000
});
 // inserts a bunch of words into the database
lineReader.on('line', function (line) {
  //console.log('Line from file:', line);
  db.run("insert into WordOrder (word, position) values ($line, '0')", { $line: line });
});*/

//used before and after for checking that things work
/*
console.log(db);
db.all("SELECT * FROM sqlite_master", (e, tables) => {
  console.log(tables);
});
*/
//db.all("SELECT * FROM WordOrder", (e, wrds) => {
//  console.log(wrds);
//});


//downloaded gutenberg corpus into ./txt/ directory then trained with the following
const testFolder = './txt/';
const fs = require('fs');
const { textToFile, readFromFile, dngrDELETEdupRows } = require('./utils')


function processTrainingText(){
  let files = fs.readdirSync(testFolder);
  i = 0;
  processText(fs.readFileSync(testFolder + files[i]).toString());

  function processText(text){
    console.log(`${i}_th file.`);
    textToFile(text);
    if (i < files.length) {
      setTimeout(function() { i++;
          processText(fs.readFileSync(testFolder + files[i]).toString())
        }, 100000);
    }
    else {
      //dngrDELETEdupRows();
    }
  }
}
processTrainingText();
