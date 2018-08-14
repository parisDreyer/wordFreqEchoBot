const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./databaseUtils/Words.db');
const { parseCSV, softmax, maxIndex, tanH, lex_diverse } = require('./dbUtil');


function chooseWords(textArray, callback, previous_words = []) {
  perceptronWeightsObjects(textArray, (weightsObjArray) => {
    weightsToWords(weightsObjArray, (reply) => {
      let replarr = reply.split(' ').concat(previous_words);
      if (replarr.length > sumOfPositions(weightsObjArray) || lex_diverse(replarr) < 0.4) callback(reply);
      else {
        chooseWords(textArray.slice(-1).concat(replarr), callback, replarr)
      }
    });
  });
}

// used to determine how many words still need to be assembled into an output
function sumOfPositions(ObjArray) {
  let sum = 0;
  for(let i = 0; i < ObjArray.length; ++i){
    sum += (ObjArray[i].position + 1);  // +1 to accommodate for 0 index which is a feature of the datastructure
  }
  return sum;
}

function weightsToWords(weightsObjArray, callback) {
  numbersToWordIndices(weightsObjArray, (indices) => {
    //console.log('weightsToWords indices: ', indices);
    if (!indices || indices.length === 0) { callback(""); }
    else { indicesAsWords(indices, callback); }
  });
}

// helper function for weightsToWords
function indicesAsWords(indices, callback){
  let chosen_count = 0; // tracks async return values
  let words = [];
  let max_count = indices.length;
  indices.forEach((idx) => {
    getWordByIndex(idx, (e, row) => {
      chosen_count++;
      if(e) console.log(e);
      else if (row) {
        words.push(row.word);
        if (chosen_count === max_count) { // i had this condition as >= max_count but that was causing multiple callbacks which is a node [Error: Can't set headers after they are sent. \n at validateHeader (_http_outgoing.js:494:11) ...]
          let reply = words.join(" "); //console.log("reply:", reply);
          callback(reply); // do something with the words using the callback passed to the module at chooseWords()
        }
      }
    });
  });
}

// helper function for indicesAsWords
function getWordByIndex(idx, callback){
  db.get("SELECT * FROM WordOrder WHERE id is $idx", { $idx: idx.prevWID }, (e, row) => {
    callback(e, row);
  });
}

function numbersToWordIndices(weightsObjArray, handle_indices){
  //console.log('weights', weightsObjArray);
  let words_indices = [];
  let five_weights_set = [];
  let max = weightsObjArray.length;
  //console.log('weightsObjArr', weightsObjArray)
  for (let i = 0; i < max; i++){
    //console.log('weightsObjArr at i',weightsObjArray[i].weights);
    five_weights_set.push(weightsObjArray[i].weights);
    let can_get_words = (i === max - 1 && five_weights_set.length > 0);
    if(five_weights_set.length === 5 || can_get_words) {
      //console.log('weights set five: ', five_weights_set);
      let word_positions = nextWordPositions(five_weights_set);
      //console.log('word pos softmax:', word_positions);
      words_indices.push({ prevWID: weightsObjArray[i].wID, index: maxIndex(word_positions) }); // index in Words.NextWord.wIDcsv for a given PrevWID entry
      five_weights_set.length = []; // empty the array for more values
    }
  }
  //console.log('handling: ', words_indices);
  handle_indices(words_indices);
}

// returns an index in the NextWord.wIDcsv for the corresponding
// PerceptronWeights.weightcsv value of the fifth array in five_weightsArrays
function nextWordPositions(five_weightsArrays){
  let nextProbabilities = five_weightsArrays[five_weightsArrays.length-1].map((weight) => weight); // initialize with array of 0s to be summed to probabilities in neural network
  for(let i = 0; i < five_weightsArrays.length - 1; ++i) { // sum up product of each wordweights * prevWordWeights into nextProbabilities
    nextProbabilities = nxtWordProbs(nextProbabilities, five_weightsArrays[i]);
  }
  return softmax(nextProbabilities);
}

// helper function for nextWordPositions
function nxtWordProbs(nextProbabilities, weights){
  let layerProbs = nextProbabilities.map((weight) => 0);
  for (const [idx, nxtProb] of nextProbabilities.entries()) {
    layerProbs[idx] += weights.reduce((sum, prvProb) => sum + (prvProb * nxtProb)); // previously calculated values as input to next perceptron layer
  }
  return layerProbs.map((summedProbs) => tanH(summedProbs)); // squash sum between -1 and 1
}


// return values objects from database corresponding to the words input
function perceptronWeightsObjects(words, callback){
  let all_weights = [];
  let itemsProcessed = 0;
  words.forEach((w) => {
    getPerceptronWeightsByW(w, (weights) => {
      itemsProcessed++;
      if(weights) { if (weights['weights'].length > 0) all_weights.push(weights); }
      if(itemsProcessed === words.length) { // console.log(all_weights);
        callback(all_weights); } // all the weights have been assembled
    });
  });
}

// returns the set of perceptron weights for a single word
function getPerceptronWeightsByW(w, callback){
  db.get("SELECT * FROM WordOrder WHERE word is $w", { $w: w }, (e, row) => {
    if(row) getPerceptronWeights(row.position, row.id, callback);
    else callback();
  });
}

// helper for getPerceptronWeightsByW()
// returns a js object { wID: id, weights: weights}
function getPerceptronWeights(position, id, callback) {
  db.get("SELECT * FROM PerceptronWeights WHERE wID is $id", {$id: id}, (e, row) => {
    if(e) console.log(e);
    else if (row) callback({ wID: id, weights: parseCSV(row.weightcsv), position: position });
    else callback();
  });
}

module.exports = { chooseWords: chooseWords };
