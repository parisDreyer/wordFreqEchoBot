
function parseCSV(csv_txt){ // parses the csv IDs stored in the NextWord and PerceptronWeights tables
  let str_arr = csv_txt.slice(0, -1).split(",");
  let arr = str_arr.map(str => parseFloat(str));
  if (typeof arr === Number) { arr = [arr] }
  return arr;
}

function randomWeight(){ return Math.random() * (1.0 + 0.5) - 0.5; } // number between -0.9999999 and 0.9999999


//https://gist.github.com/cyphunk/6c255fa05dd30e69f438a930faeb53fe
function softmax(arr) {
    return arr.map(function(value,index) {
      return Math.exp(value) / arr.map( function(y /*value*/){ return Math.exp(y) } ).reduce( function(a,b){ return a+b })
    });
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }
    let max = arr[0];
    let maxIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }
    return maxIndex;
}

function hyperbolic_tangent(x){
  let eterm = Math.exp(-2*x);
  return (1 - eterm) / (1+ eterm)
}

function uniqueWords(words_array){
  let uniqs = [];
  for(let i = 0; i < words_array.length; i++){
    let dupl = uniqs.join(' ').includes(words_array[i]);
    if (!dupl) uniqs.push(words_array[i]);
  }
  return uniqs;
}

function lexical_diversity(words_arr) {
  return uniqueWords(words_arr).length / words_arr.length;
}

module.exports = { parseCSV: parseCSV, randomWeight: randomWeight,
    softmax: softmax, maxIndex: indexOfMax, tanH: hyperbolic_tangent,
    uniqueWords: uniqueWords, lex_diverse: lexical_diversity
  };
