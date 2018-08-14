const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./databaseUtils/Words.db');
const { updateTables } = require('./databaseUtils/databaseInput.js');
const { chooseWords } = require('./databaseUtils/databaseOutput.js');

function readFromFile(functn){
  db.all('SELECT * FROM WordOrder', (e, rows) => { functn(rows); });
}


function textToFile(text, callback = false){
  words = parseToArray(text); //console.log("callback", callback);
  if (callback) { chooseWords(words, callback); } // separating callback this way because otherwise get Database Locked Error for asynonchronous read while still writing to the sqlite3 db with nodejs
  else { for(let i = 0; i < words.length - 1; i++){ updateTables(i % 5, words[i], words[i + 1]); } } // i % 5 because we just want to track groups of five words in sentences so that if a text with 1000 words goes in we don't have to set positions to 1000 and such, lol
}

function parseToArray(text) { // parses strings of user input into text data that could be put into the Word.db database
  let punctuationless = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""); // remove punctuation
  let finalString = punctuationless.replace(/\s{2,}/g," "); // remove extra whitespace
  return finalString.toLowerCase().split(" "); // convert to array of lowercase letters
}


function removeDuplicateRows(){
  db.all("SELECT * FROM WordOrder", (e, outerrows) =>{
    if(e) console.log(e);
    if(outerrows){
    console.log(outerrows)
    outerrows.forEach((row)=>{
      db.all("SELECT * FROM NextWord WHERE PrevWID is $id", {$id: row.id }, (e, rows) =>{
        if(rows)
        if(rows.length > 1){
          let csv = rows[0].wIDcsv.length > rows[1].wIDcsv.length ? rows[1].wIDcsv.length : rows[0].wIDcsv.length;
          if(csv) db.run("DELETE FROM NextWord WHERE wIDcsv IS $csv", {$csv: `${csv}`}, (e) => {console.log(e)});
        }
      });
      db.all("SELECT * FROM PerceptronWeights WHERE wID is $id", {$id: row.id }, (e, rows) =>{
        if(rows)
        if(rows.length > 1){
          let csv = rows[0].weightcsv.length > rows[1].weightcsv.length ? rows[1].weightcsv.length : rows[0].weightcsv.length;
          if(csv) db.run("DELETE FROM PerceptronWeights WHERE weightcsv IS $csv", {$csv: `${csv}`}, (e) => {console.log(e)});
        }
      });
    });
    }
  });
}

module.exports = {
  textToFile: textToFile,
  readFromFile: readFromFile,
  dngrDELETEdupRows: removeDuplicateRows
};
