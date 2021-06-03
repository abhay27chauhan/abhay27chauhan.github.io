let headerContainer = document.querySelector(".book_header-container");
let beneficiaries = [];
let 

function renderUI(vName, pincode, center_name, dose){
    let h2 = document.createElement("h2");
    h2.setAttribute("class", "book-header");
    h2.innerText = `vaccine name: ${vName} | pincode: ${pincode} | center name: ${center_name} | dose type: ${dose}`;

    let inputContainer = document.createElement("div");
    inputContainer.setAttribute("class", "input-box");
    inputContainer.innerHTML = `<span class="prefix">+91</span>
        <input class="mbno" type="tel" placeholder="Enter Your Registered Mobile Number" />`

    headerContainer.appendChild(h2);
    document.body.appendChild(inputContainer);

    let inputElem = inputContainer.querySelector(".mbno");

    inputElem.addEventListener("keyup", function(){
        if(inputElem.value.length == 10){
            let mbno = inputElem.value
            inputElem.value = "";
            inputElem.setAttribute("placeholder", "Requesting Otp...")
            generateOtp(mbno);
        }
    })
}

function generateOtp(mbno){
    console.log("making request...")
    fetch("https://cw.r41.io/booker/generateOTP", {
        method: "POST",
        body: JSON.stringify({
            mobile: Number(mbno)
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then(data => {
        let txnId = data["txnId"]
        changeUI(txnId);
    })
    .catch(err => alert("Some error occured. Type Again!!"));
}

function changeUI(txnId){
    console.log("changing ui...")
    let oldInputContainer = document.querySelector(".input-box");
    oldInputContainer.remove();

    let inputContainer = document.createElement("div");
    inputContainer.setAttribute("class", "input-box");
    inputContainer.innerHTML = `
        <input class="otp" type="text" placeholder="Enter Your OTP Number" />`
    
    document.body.appendChild(inputContainer);
    let inputElem = inputContainer.querySelector(".otp");

    inputElem.addEventListener("keyup", function(){
        if(inputElem.value.length == 6){
            confirmOtp(inputElem.value, txnId);
        }
    })

    alert("Enter OTP")
}

function confirmOtp(otp, txnId){
    console.log("confirming otp...")
    fetch("https://cw.r41.io/booker/validateOTP", {
        method: "POST",
        body: JSON.stringify({
            otp: otp,
            txnId: txnId
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then(data => {
        fetchBene(data["token"]);
        return data;
    })
    .then(data => fetchCaptcha(data["token"]))
    .then((captcha) => showOnUI(captcha));
}

function fetchBene(token){
    console.log("fetching beneficiary....")
    fetch("https://cw.r41.io/booker/bene", {
        method: "POST",
        body: JSON.stringify({
            token: token,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then(data => beneficiaries = data["beneficiaries"])
    .catch(err => alert("unable to fetch beneficiaries"))
}

function fetchCaptcha(token){
    console.log("fetching captcha....")
    fetch("https://cw.r41.io/booker/getCaptcha", {
        method: "POST",
        body: JSON.stringify({
            token: token,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then(data => data["captcha"])
    .catch(err => alert("unable to fetch Captcha"))
}

function showOnUI(captcha){
    let inputContainer = document.querySelector(".input-box");
    inputContainer.remove();
}

