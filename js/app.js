var token = null;
var lastChatTime = null;

// Chats
const api =
  "https://yo8zpkt433.execute-api.us-west-1.amazonaws.com/Production/";
const localDataPath = "./data/conversations.json";
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var apiClient = apigClientFactory.newClient();

function loadDetails(ids) {
  console.log("loading details of ids" + ids);
  var convos = [];
  ids.forEach(function (id) {
    let convo = { id: id };
    convos.push(convo);
  });
  console.log("convos = " + convos);

  convos.forEach((conv) => console.log(conv));
}

function loadChats() {
  getJWTToken(function (token) {
    apiClient
      .conversationsGet({}, null, { headers: { Authorization: token } })
      .then(function (result) {
        console.log(result);
        displayChats(result.data);
      })
      .catch((err) => console.log(err));
  });
}

function handleBtn(id) {
  console.log(id);
  location.href = "chats.html#" + id;
}

function displayChats(data) {
  const chatContainer = document.querySelector(".container");
  data.forEach((conv) => {
    // <div class="conv">
    //     <p class="conv-text">Student - frank</p>
    //     <button class="conv-btn">details</button>
    // </div>
    const div = document.createElement("div");
    div.classList.add("conv");

    const p = document.createElement("p");
    p.classList.add("conv-text");
    p.innerText = conv.participants;
    div.appendChild(p);

    const tm = document.createElement("p");
    tm.classList.add("time");
    tm.innerText = moment(new Date(conv.last)).fromNow();
    div.appendChild(tm);

    const btn = document.createElement("button");
    btn.classList.add("conv-btn");
    btn.innerHTML = '<i class="fas fa-info-circle"></i>';
    // btn.innerText = "Details";
    btn.addEventListener("click", () => handleBtn(conv.id));
    div.appendChild(btn);
    chatContainer.append(div);
  });
}

// Chat Details
function loadChatDetails() {
  const id = location.hash.substring(1);
  getJWTToken(function (token) {
    apiClient
      .conversationsIdGet({ id: id }, null, {
        headers: { Authorization: token },
      })
      .then(function (result) {
        console.log(result);
        displayChatDetails(result.data);
      })
      .catch((err) => console.log("err = " + err));
  });
}

function displayChatDetails(conv) {
  const chatContainer = document.querySelector(".message-container");
  chatContainer.innerHTML = "";
  console.log("chats= " + conv.messages);
  const messages = conv.messages;
  const defaultUser = conv.participants[0];
  messages.forEach((msg) => {
    // <div class="message left">
    //      <p class="sender">sender</p>
    //      <p class="msg-text">This is a sample message</p>
    //      <p class="time">15 minutes ago</p>
    // </div>
    // div
    const direction = msg.sender === defaultUser ? "left" : "right";
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(direction);

    const pSender = document.createElement("p");
    pSender.classList.add("sender");
    pSender.innerText = msg.sender;
    div.appendChild(pSender);

    const pMessage = document.createElement("p");
    pMessage.classList.add("msg-text");
    pMessage.innerText = msg.message;
    div.appendChild(pMessage);

    const pTime = document.createElement("p");
    pTime.classList.add("time");
    console.log("time = " + msg.time);
    const d = new Date(Number(msg.time));
    console.log("date = " + d);
    pTime.innerText = moment(d).fromNow();
    div.appendChild(pTime);

    chatContainer.appendChild(div);
  });
}

// Loads the users registered
function loadUsers() {
  getJWTToken(function (token) {
    apiClient
      .usersGet({}, null, { headers: { Authorization: token } })
      .then(function (result) {
        console.log(result);
        displayUsers(result.data);
      })
      .catch((err) => console.log(err));
  });
}

function displayUsers(data) {
  const chatContainer = document.querySelector(".container");
  data.forEach((user) => {
    // <div class="conv">
    //     <p class="conv-text">Student - frank</p>
    //     <button class="conv-btn">details</button>
    // </div>
    const div = document.createElement("div");
    div.classList.add("conv");

    const p = document.createElement("p");
    p.classList.add("conv-text");
    p.innerText = user.Username;
    div.appendChild(p);

    const btn = document.createElement("button");
    btn.classList.add("conv-btn");
    //btn.innerHTML = '<i class="fas fa-comment"></i>';
    btn.innerText = "Start Chat";
    btn.addEventListener("click", () => startChat(user.Username));
    div.appendChild(btn);
    chatContainer.append(div);
  });
}

// This function inserts the users into the conversations table
// get the id of conversation and use it for inserting messages into
// messages table
function startChat(username) {
  console.log(username);
  let id = null;
  getJWTToken(function (token) {
    apiClient
      .conversationsGet({}, null, { headers: { Authorization: token } })
      .then(function (result) {
        if (result.data !== null) {
          result.data.forEach(function (conv) {
            if (conv.participants.includes(username)) {
              id = conv.id;
            }
          });
        }
        if (id === null) {
          apiClient
            .conversationsPost({}, [username], {
              headers: { Authorization: token },
            })
            .then(function (result) {
              id = result.data;
            })
            .catch(function (err) {
              console.log(err);
            });
        }
        if(id !== null){
          location.href = "chats.html#" + id;
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  });
}

// This method post a chat message to the messages table based
// on conversationId;
function postChat(event) {
  event.preventDefault();
  getJWTToken(function (token) {
    const msgInput = document.querySelector(".msg-input");
    var msg = msgInput.value;
    if (msg === "") return;
    msgInput.value = "";
    console.log("post chat !" + msg);
    const id = location.hash.substring(1);
    apiClient
      .conversationsIdPost({ id: id }, msg, {
        headers: { Authorization: token },
      })
      .then(function (data) {
        loadChatDetails();
      })
      .catch((err) => console.log("err = " + err));
  });
}

// Authentication
function checkLogin() {
  console.log(location.pathname);

  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser !== null) {
    location.href = "users.html";
  } else {
    if (location.pathname !== "/index.html") {
      location.href = "index.html";
    }
  }
}

function logOut() {
  console.log("logging out");
  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) cognitoUser.signOut();
  location.href = "index.html";
}

function signIn() {
  event.preventDefault();

  const username = document.querySelector("#username").value;
  const pwd = document.querySelector("#password").value;
  let authenticationData = {
    Username: username,
    Password: pwd,
  };

  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );
  var userData = {
    Username: username,
    Pool: userPool,
  };

  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function () {
      console.log("login success");
      location.href = "users.html";
    },
    onFailure: function (err) {
      alert(JSON.stringify(err));
    },
  });
}

function showsignUp() {
  event.preventDefault();
  location.href = "signup.html";
}

function signUp() {
  event.preventDefault();
  console.log("signup");
  const username = document.querySelector("#username").value;
  const emailadd = document.querySelector("#email").value;
  const pwd = document.querySelector("#password").value;

  console.log(username + "-" + pwd + "-" + emailadd);

  //   var email = new AmazonCognitoIdentity.CognitoUserAttribute({
  //     Name: 'email',
  //     Value: $('#email').val()
  // });

  var email = new AmazonCognitoIdentity.CognitoUserAttribute({
    Name: "email",
    Value: emailadd,
  });

  userPool.signUp(username, pwd, [email], null, function (err, result) {
    if (err) {
      alert(err);
    } else {
      location.href = "confirm.html#" + username;
    }
  });
}

function onConfirm() {
  var username = location.hash.substring(1);
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
    Username: username,
    Pool: userPool,
  });
  const code = document.querySelector("#confirm").value;
  console.log("code =" + code);
  cognitoUser.confirmRegistration(code, true, function (err, results) {
    if (err) {
      alert(err);
    } else {
      console.log("confirmed");
      location.href = "users.html";
    }
  });
}

function onResend() {
  var username = location.hash.substring(1);
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
    Username: username,
    Pool: userPool,
  });
  cognitoUser.resendConfirmationCode(function (err) {
    if (err) {
      alert(err);
    }
  });
}

function getJWTToken(callback) {
  if (token == null) {
    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        if (err) {
          location.href = "index.html";
        }
        token = session.getIdToken().getJwtToken();
        callback(token);
      });
    }
  } else {
    callback(token);
  }
}
