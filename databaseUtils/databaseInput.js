const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./databaseUtils/Words.db');
const { parseCSV, randomWeight } = require('./dbUtil');

function updateTables(pos, wrd, nxtWrd){
  db.get("SELECT * FROM WordOrder WHERE word is $w", { $w: wrd }, (e, row) => {
    if (e) console.log(e);
    else if(row) {
      update_posRank(row.id, row.posRank + ((row.position - pos) * 0.002), row.position);
      update_NextWords_and_PerceptronWeights(row.id, nxtWrd);
    }
  });
}

// posRank is a gradient that determines whether to bump up a word position or bump down the word position by 1
function update_posRank(id, newRank, position){
  if (newRank <= 0.0) { // decrease position priority
    if (position < 5) position += 1;
    else position = 5;
    db.run("UPDATE WordOrder SET position = $pos, posRank = $rank WHERE WordOrder.id is $id", { $pos: position, $rank: 0.5, $id: id });
  } else if (newRank >= 1.0) { // increase position priority
    if (position > 0) position -= 1;
    else position = 0;
    db.run("UPDATE WordOrder SET position = $pos, posRank = $rank WHERE WordOrder.id is $id", { $pos: position, $rank: 0.5, $id: id });
  } else { // update just the rank
    db.run("UPDATE WordOrder SET posRank = $rank WHERE WordOrder.id is $id", { $rank: newRank, $id: id });
  }
}

// called in updateTables(): updates the NextWord table and the PerceptronWeights table with the nxtW param
function update_NextWords_and_PerceptronWeights(prevWID, nxtW) {
  db.get("SELECT id FROM WordOrder WHERE word is $w", { $w: nxtW }, (e, nxt_id) => {   // get the nxtWID value for the csv of NextWord
    if (e) console.log(e);
    else if (nxt_id){
      db.get("SELECT * FROM NextWord WHERE PrevWID is $id", { $id: prevWID }, (e, row) => { // check if row is already in there
        if(row){ // if a record for prevWID and wID is in then make sure the NextWord and PerceptronWeights Tables are up to date
          addtoRow_NextWords_and_PerceptronWeights(prevWID, parseCSV(row.wIDcsv), nxt_id.id); // adds only if needed
        } else { // if a record for prevWID and wID wasn't in, then insert it in
          insertRow_NextWords_and_PerceptronWeights(prevWID, nxt_id.id);
        }
      });
    }
  });
}

function insertRow_NextWords_and_PerceptronWeights(prevWID, nxtID) { // if row is undefined, add row
    let strid = String(nxtID) + ",";
    let weight = `${randomWeight()},`;
    console.log(strid, weight);
    db.run("INSERT INTO NextWord (wIDcsv, PrevWID) VALUES ($csv, $prevID)", { $csv: strid, $prevID: prevWID });
    db.run("INSERT INTO PerceptronWeights (wID, weightcsv) VALUES ($id, $csv)", { $id: prevWID, $csv: weight });
}

function addtoRow_NextWords_and_PerceptronWeights(wID, nxtIDArray, nxtID) { // if row is defined, update its values if needed
  //console.log(`in addtorow: ${wID} ${nxtIDArray} ${nxtID}`);
  if(nxtIDArray.includes(nxtID)){ // already in so update frequency of it's occurrence at PerceptronWeights, and subtract a weightdecay constant from the other values in perceptron weights
    //console.log("id array:", nxtIDArray);
    updateWeights(wID, nxtIDArray.indexOf(nxtID));
  } else { // not in, so add the nxtID to NextWord.wIDcsv and add a corresponding weight to PerceptronWeights.weightcsv
    add_Weight_and_nxtWID(wID, nxtID, `${nxtIDArray.join(",")},`);
  }
}

function add_Weight_and_nxtWID(wID, nxtID, nextIDcsv){ // add the nxtID to the PerceptronWeight and NextWord table csv values at wID
  db.get("SELECT * FROM PerceptronWeights WHERE wID is $id", {$id: wID}, (e, row) => {
    if (e) { console.log(e); }
    else if (row) {
      expand_NextWord_PerceptronWeights_CSVs(wID, `${row.weightcsv}${randomWeight()},`, `${nextIDcsv}${nxtID},`);
    }
  });
}

function expand_NextWord_PerceptronWeights_CSVs(wID, newWeights, newIDcsv){
  //console.log(wID, newWeights, newIDcsv);
  reassignPerceptronWeights(wID, newWeights);
  reassign_NextWord_idcsv(wID, newIDcsv);
}

function updateWeights(wordID, weightIndex){
  db.get("SELECT * FROM PerceptronWeights WHERE wID is $id", {$id: wordID}, (e, row) => {
    if (e) { console.log(e); }
    else if (row && weightIndex >= 0) {
      getNewPerceptronWeights(parseCSV(row.weightcsv), weightIndex, wordID, reassignPerceptronWeights);
    }
  });
}

function getNewPerceptronWeights(weights, weightIndex, id, callback) {
  for(let i = 0; i < weights.length; i ++){ // for some reason weights.map wasn't working --maybe something to do with node asynch default?
    weights[i] = (i === weightIndex ? (weights[i] + 0.00200000000000001) : (weights[i] - 0.00010000000000001)); // update the weights to reinforce the occurrence, otherwise do weight decay
  }
  callback(id, (weights.join(",") + ','));
}

function reassignPerceptronWeights(id, newWeights){
  // console.log("new:", newWeights);
  db.run("UPDATE PerceptronWeights SET weightcsv = $newWeights WHERE wID is $id", { $newWeights: newWeights, $id: id });
}

function reassign_NextWord_idcsv(id, new_csv){
  db.run("UPDATE NextWord SET wIDcsv = $csv WHERE PrevWID is $id", { $csv: new_csv, $id: id });
}

module.exports = { updateTables: updateTables };
