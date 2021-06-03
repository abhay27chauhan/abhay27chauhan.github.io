let headerContainer = document.querySelector(".book_header-container");

function renderUI(vName, pincode, center_name, dose){
    let h2 = document.createElement("h2");
    h2.setAttribute("class", "book-header");
    h2.innerText = `vaccine name: ${vName} | pincode: ${pincode} | center name: ${center_name} | dose type: ${dose}`;

    let inputContainer = document.createElement("div");
    inputContainer.setAttribute("class", "input-box");
    inputContainer.innerHTML = `<span class="prefix">+91</span>
        <input class="mbno" type="tel" placeholder="Enter Your Registered Mobile Number" />`

    let topContainer = document.querySelector(".top-container")

    headerContainer.appendChild(h2);
    topContainer.appendChild(inputContainer);

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
            "Content-type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        let txnId = data["txnId"]
        changeUI(txnId);
    })
    .catch(err => alert(err.message));
}

function changeUI(txnId){
    console.log("changing ui...")
    let oldInputContainer = document.querySelector(".input-box");
    oldInputContainer.remove();

    let inputContainer = document.createElement("div");
    inputContainer.setAttribute("class", "input-box");
    inputContainer.innerHTML = `
        <input class="otp" type="text" placeholder="Enter Your OTP Number" />`
    
    let topContainer = document.querySelector(".top-container")
    topContainer.appendChild(inputContainer);
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
            "Content-type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => fetchBene(data["token"]))
    .then(obj => fetchCaptcha(obj))
    .then(dataObj => showOnUI(dataObj))
    .catch(err => alert(err.message))
}

function fetchBene(token){
    console.log("fetching beneficiary....")
    return new Promise((resolve, reject) => {
        fetch("https://cw.r41.io/booker/bene", {
            method: "POST",
            body: JSON.stringify({
                token: token,
            }),
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            let obj = {}
            obj["beneficiaries"] = data["beneficiaries"]
            obj["token"] = token
            return obj
        })
        .then((obj) => resolve(obj))
        .catch(err => reject(err))
    })
}

function fetchCaptcha(obj){
    console.log("fetching captcha....")
    return new Promise((resolve, reject) => {
        fetch("https://cw.r41.io/booker/getCaptcha", {
            method: "POST",
            body: JSON.stringify({
                token: obj["token"],
            }),
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            obj["captcha"] = data["captcha"];
            return obj
        })
        .then(obj => resolve(obj))
        .catch(err => reject(err))
    })
}

function showOnUI(dataObj){
    console.log("showing data..")
    let obj = processData(dataObj["beneficiaries"], dataObj["captcha"]);

    let inputContainer = document.querySelector(".input-box");
    inputContainer.remove();

    let mainContainer = document.createElement("div");
    mainContainer.setAttribute("class", "main-container");

    mainContainer.innerHTML = `<div class="main-container">
        <p class="action">Beneficiaries</p>
        <div class="item">
            <input type="checkbox" name="checkbox" value="Person1">
            <p>${obj["p0"]["bName"]}</p>
        </div>
        <div class="item">
            <input type="checkbox" name="checkbox" value="Person2">
            <p>${obj["p1"]["bName"]}</p>
        </div>
        <div class="item">
            <input type="checkbox" name="checkbox" value="Person3">
            <p>${obj["p2"]["bName"]}</p>
        </div>
        <div class="item">
            <input type="checkbox" name="checkbox" value="Person4">
            <p>${obj["p3"]["bName"]}</p>
        </div>
    </div>`

    let topContainer = document.querySelector(".top-container")
    topContainer.appendChild(mainContainer)

}

function processData(beneficiaries, captcha){
    let obj = {};
    obj["captcha"] = captcha;

    for(let i=0; i<beneficiaries.length; i++){
        obj[`p${i}`] = {}
        obj[`p${i}`]["bName"] = beneficiaries[i]["name"];
        obj[`p${i}`]["status"] = beneficiaries[i]["vaccination_status"];
        obj[`p${i}`]["vaccine"] = beneficiaries[i]["vaccine"];
        obj[`p${i}`]["dose1_date"] = beneficiaries[i]["dose1_date"];
        obj[`p${i}`]["dose2_date"] = beneficiaries[i]["dose2_date"];
        obj[`p${i}`]["beneficiary_reference_id"] = beneficiaries[i]["beneficiary_reference_id"];
    }

    return obj;
}
