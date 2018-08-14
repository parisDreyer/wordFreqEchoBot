function loadDoc() {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    // if (this.readyState == 4 && this.status == 200) {
    document.getElementById("textdisplay").innerHTML = this.response;
    // }
  }
  xhttp.open("GET", "/alltext");
  xhttp.send();
}

function appendToDoc(data){ // https://stackoverflow.com/questions/32084571/why-is-an-object-in-an-xmlhttprequest-sent-to-a-node-express-server-empty/32084765#32084765
  let textData = {to: "app", subject: "add", text: data};
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    console.log(this.response);
  }
  xhttp.open("POST", `/textappend`);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(JSON.stringify(textData));
}

function getResponse(data){ // https://stackoverflow.com/questions/32084571/why-is-an-object-in-an-xmlhttprequest-sent-to-a-node-express-server-empty/32084765#32084765
  let textData = {to: "app", subject: "add", text: data};
  let notcalledyet = true; // used to prevent callback from happening more than once
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (`${this.response}`.length > 0 && notcalledyet){
      document.getElementById("textdisplay").innerHTML = `<br><div id="bot">BOT:> ${this.response}</div><br><div id="user">YOU:> ${data}</div>` + document.getElementById("textdisplay").innerHTML;
      let knfld = document.getElementById("knowledgefield");
      knfld.value += ` .. ${data}`;
      notcalledyet = false; // no more callbacks
    }
  }
  xhttp.open("POST", `/text`);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(JSON.stringify(textData));
}
