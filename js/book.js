let headerContainer = document.querySelector(".book_header-container");

let h2 = document.createElement("h2");
h2.setAttribute("class", "book-header");
h2.innerText = `vaccine name: ${vName} | pincode: ${pincode} | center name: ${center_name} | dose type: ${dose_type}`;

let inputContainer = document.createElement("div");
inputContainer.setAttribute("class", "input-box");
inputContainer.style.display = "none";
inputContainer.innerHTML = `<span class="prefix">+91</span>
    <input class="mbno" type="tel" placeholder="Enter Your Registered Mobile Number" />`

let topContainer = document.querySelector(".top-container")

headerContainer.appendChild(h2);
topContainer.appendChild(inputContainer);

if(phone_number == "null"){
    inputContainer.style.display = "flex";
    let inputElem = inputContainer.querySelector(".mbno");

    inputElem.addEventListener("keyup", function(){
        if(inputElem.value.length == 10){
            let mbno = inputElem.value
            inputElem.value = "";
            inputElem.setAttribute("placeholder", "Requesting Otp...")
            generateOtp(mbno);
        }
    })
}else{
    generateOtp(phone_number);
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
    .catch(err => alert(`${err.message}. Refresh or try directly on cowin website`));
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
            txnId: txnId,
            mode: "cors"
        }),
        headers: {
            "Content-type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => fetchBene(data["token"]))
    .then(obj => fetchCaptcha(obj))
    .then(dataObj => showOnUI(dataObj))
    .catch(err => alert(`${err.message}. Refresh or try directly on cowin website`))
}

function fetchBene(token){
    console.log("fetching beneficiary....")
    return new Promise((resolve, reject) => {
        fetch("https://cw.r41.io/booker/bene", {
            method: "POST",
            body: JSON.stringify({
                token: token,
                mode: "cors"
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

    if(obj["p0"] == undefined){
        console.log("calling fetchBene...");
        fetchBene(dataObj["token"]);
    }

    let inputContainer = document.querySelector(".input-box");
    inputContainer.remove();

    let mainContainer = document.createElement("div");
    mainContainer.setAttribute("class", "main-container");

    mainContainer.innerHTML = `<p class="action">Beneficiaries</p>`

    for(let i=0; i<4; i++){
        if(obj[`p${i}`]){
            mainContainer.innerHTML += `<div class="item">
                <input type="checkbox" name="checkbox" value="${obj[`p${i}`]["beneficiary_reference_id"]}">
                <p>${obj[`p${i}`]["bName"]}</p>
            </div>`
        }
    }

    let captchaContainer = document.createElement("div");
    captchaContainer.setAttribute("class", "captcha-container");

    captchaContainer.innerHTML = `${obj["captcha"]}
    <input type="text" class="type-captcha">`

    let topContainer = document.querySelector(".top-container")
    topContainer.appendChild(mainContainer)
    topContainer.appendChild(captchaContainer);

    let beneficiaries = [];

    let checkbox = document.querySelectorAll("input[type='checkbox']");
    for(let i=0; i<checkbox.length; i++){
        checkbox[i].addEventListener("change", function(){
            if(this.checked == true){
                beneficiaries.push(checkbox[i].value);
            }else{
                beneficiaries = beneficiaries.filter(val => val !== checkbox[i].value);
            }
        })
    }

    let input = document.querySelector(".type-captcha");
    input.addEventListener("keydown", function(e){
        if(e.key == "Enter"){
            obj["captcha"] = input.value;
            let dose = dose_type.split(" ")[1]
            bookVaccine(obj, beneficiaries, dataObj["token"], dose);
        }
    })
}

function processData(beneficiaries, captcha){
    let obj = {};
    obj["captcha"] = captcha;
    obj["slot"] = "10:00AM-11:00AM"

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

function bookVaccine(obj, beneficiaries, token, dose){
    console.log(beneficiaries);
    fetch("https://cw.r41.io/booker/schedule", {
        method: "POST",
        body: JSON.stringify({
            beneficiaries,
            captcha: obj["captcha"],
            center_id,
            dose,
            session_id,
            slot: obj["slot"],
            token
        }),
        headers: {
            "Content-type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => generateAlert(data))
    .catch(err => alert(err.message));
}

function generateAlert(data){
    if(data.appointment_id){
        alert(`Hooray!! You have successfully booked your appointment. 
    Your Appointment id: ${data.appointment_id}. Please download your appointment slip from cowin.`)
    }else if(data.error){
        alert(`Booking Failed!!
    Error: ${data.error}`)
    }
}