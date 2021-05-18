'use strict';

let selectDate = document.querySelector("#start");
let inputContainer = document.querySelector(".input-container");
let inputPin = document.querySelector("#input-pin");
let pinDistContainer = document.querySelector(".pin-dist_container");
let pinDist = document.querySelector(".pin-dist");
let addBtn  = document.querySelector(".add");
let pauseResumeBtn = document.querySelector(".pr-container");

let mainContainer = document.querySelector(".main-container");
let modalContainer = document.querySelector(".modal-container")
let modalFilters = document.querySelectorAll(".modal-filters");
let infoContainer = document.querySelector(".info-container");
let capOptions = document.querySelectorAll(".capacity-filters");
let vacOptions = document.querySelectorAll(".vaccine-filters");
let audio = document.querySelector("#audio_id");
let h1 = document.querySelector(".notice");

let colors = ["lightpink", "lightblue", "lightgreen", "black"]
let flag = false;
let age_param = null;
let cap_param = "Dose 1";
let vac_param = null;
let pinFlag = false;
let prFlag = false;
let timer;
let newDate;
let pincode;
let initialUrl = "https://cdn-api.co-vin.in/api/v2/appointment/sessions";

pauseResumeBtn.addEventListener("click", function(){
    if(prFlag === false){
        let textElem = pauseResumeBtn.children[0];
        textElem.innerText = "Resume";
        timer.pause();
        pauseResumeBtn.classList.add("active");
    }else{
        let textElem = pauseResumeBtn.children[0];
        textElem.innerText = "Pause";
        timer.resume();
        pauseResumeBtn.classList.remove("active");
    }
    prFlag = !prFlag;
})

addBtn.addEventListener("click", function(){
    if(flag === false){
        modalContainer.style.display = "flex";
        addBtn.classList.add("active");
    }else{
        addBtn.classList.remove("active");
        modalContainer.style.display = "none";
    }
    flag = !flag;
})

for(let i=0; i<modalFilters.length; i++){
    modalFilters[i].addEventListener("click", function(){
        modalFilters.forEach(filterOption => {
            filterOption.classList.remove("border");
        })

        let ageElem = modalFilters[i].children[0];
        if(ageElem.innerText == "18+"){
            age_param = 18;
        }else if(ageElem.innerText == "45+"){
            age_param = 45;
        }else if(ageElem.innerText == "ALL"){
            age_param = null;
        }
        modalFilters[i].classList.add("border");
    })
}

for(let i=0; i<capOptions.length; i++){
    capOptions[i].addEventListener("click", function(){
        capOptions.forEach(capOption => {
            capOption.classList.remove("border");
        })

        let capElem = capOptions[i].children[0];
        if(capElem.innerText == "DOSE 1"){
            cap_param = "Dose 1";
        }else if(capElem.innerText == "DOSE 2"){
            cap_param = "Dose 2"
        }
        capOptions[i].classList.add("border");
    })
}

for(let i=0; i<vacOptions.length; i++){
    vacOptions[i].addEventListener("click", function(){
        vacOptions.forEach(vacOption => {
            vacOption.classList.remove("border");
        })
        let vacElem = vacOptions[i].children[0];
        if(vacElem.innerText == "COVAXIN"){
            vac_param = "COVAXIN"
        }else if(vacElem.innerText == "C-SHIELD"){
            vac_param = "COVISHIELD"
        }else{
            vac_param = null;
        }
        vacOptions[i].classList.add("border");
    })
}

pinDistContainer.addEventListener("click", function(){
    pinFlag = !pinFlag;
    
    if(pinFlag){
        pinDist.innerText = "Pincode";
        districtSelect.value = "";
        district_id = null;
        inputContainer.style.display = "flex";
        select.style.display = "none";
        districtSelect.style.display = "none";
    }else{
        pinDist.innerText = "District";
        pincode = null;
        inputPin.value = "";
        inputContainer.style.display = "none";
        select.style.display = "block";
        districtSelect.style.display = "block";
    }

    infoContainer.style.display = "none";
})

inputPin.addEventListener("blur", function(){
    pincode = inputPin.value;
    console.log(pincode)
})

selectDate.addEventListener("change", function(){

    let date = selectDate.value;
    let dateArr = date.split("-");
    let day = dateArr[2];
    let month = dateArr[1];
    let year = dateArr[0];
    newDate = [day, month, year].join("-");
    console.log(newDate);
    
    h1.style.display = "none";

    let textElem = pauseResumeBtn.children[0];

    if(prFlag){
        textElem.innerText = "Pause";
        timer.resume();
        pauseResumeBtn.classList.remove("active");
        prFlag = false;
    }

    if(newDate && (district_id || pincode)){
        console.log("fetching...");
        getData(mainContainer);
    }
})

function getData(mainContainer){
    infoContainer.style.display = "none";
    
    mainContainer = document.querySelector(".main-container");
    if(mainContainer.children.length > 0){
        let tContainer = document.querySelectorAll(".ticket-container");
        for(let i=0; i<tContainer.length; i++){
            mainContainer.removeChild(tContainer[i])

        }
    }

    console.log(`Date: ${newDate} | district_id: ${district_id} | pincode: ${pincode} | cap_param: ${cap_param} | age_param: ${age_param} | vac_param: ${vac_param}`)

    let fullUrl = pinFlag ? `${initialUrl}/calendarByPin?pincode=${pincode}&date=${newDate}` : `${initialUrl}/calendarByDistrict?district_id=${district_id}&date=${newDate}`

    fetch(fullUrl)  // returns promise
        .then(response => response.json())
        .then(obj => {
            let arr = obj["centers"];

            for(let i=0; i<arr.length; i++){
                let arrOfSessions = [];

                if(arr.length > 0){
                    arrOfSessions = arr[i]["sessions"];

                    if(age_param !== null && arrOfSessions.length > 0){
                        arrOfSessions = arrOfSessions.filter(obj => obj["min_age_limit"] == age_param)
                    }

                    if(arrOfSessions.length > 0){
                        arrOfSessions = arrOfSessions.filter(obj => { 
                            return obj["available_capacity"] > 0
                        })
                    }

                    if(cap_param == "Dose 1" && arrOfSessions.length > 0){
                        arrOfSessions = arrOfSessions.filter(obj => obj["available_capacity_dose1"] > 0)
                    }else if(cap_param == "Dose 2" && arrOfSessions.length > 0){
                        arrOfSessions = arrOfSessions.filter(obj => obj["available_capacity_dose2"] > 0)
                    }

                    if(vac_param !== null && arrOfSessions.length > 0){
                        arrOfSessions = arrOfSessions.filter(obj => obj["vaccine"] == vac_param)
                    }

                    if(arrOfSessions.length > 0){
                        audio.play();
                    }

                    for(let j=0; j<arrOfSessions.length; j++){

                        let vName = arrOfSessions[j]["vaccine"];
                        let pincode = arr[i]["pincode"]
                        let state_name = arr[i]["state_name"];
                        let district_name = arr[i]["district_name"]
                        let center_name = arr[i]["name"];
                        let date = arrOfSessions[j]["date"]
                        let age = arrOfSessions[j]["min_age_limit"];
                        let dose1 = cap_param == "Dose 1" && arrOfSessions[j]["available_capacity_dose1"];
                        let dose2 = cap_param == "Dose 2" && arrOfSessions[j]["available_capacity_dose2"];

                        let cColor = colors[Math.floor(Math.random() * colors.length)];
                        createTicket(mainContainer, vName, pincode, state_name, district_name, dose1, dose2, center_name, date, age, cColor);
                    }
                }
                
            }
            let ticketContainer = document.querySelector(".ticket-container");
            if(!ticketContainer){
                infoContainer.style.display = "flex";
            }
            console.log(obj["centers"])
        })
        .catch(error => {
            console.log(error)
        });
}

function createTicket(mainContainer, vName, pincode, state_name, district_name, dose1, dose2, center_name, date, age, cColor){

    let ticketContainer = document.createElement("div");
    ticketContainer.setAttribute("class", "ticket-container");
    
    ticketContainer.innerHTML = `<div class="ticket-color ${cColor}"></div>
        <div class="ticket_sub-container">
           <p><strong>Vaccine Name: </strong> ${vName}</p>
            <p><strong>No. of ${cap_param}: </strong>  ${dose1 ? dose1 : dose2}</p>
            <p><strong>Date: </strong> ${date}</p>
            <p><strong>Age: </strong> ${age}</p>
            <p><strong>Pincode: </strong> ${pincode}</p>
            <p><strong>Center Name: </strong> ${center_name}</p>
            <p><strong>State Name: </strong> ${state_name}</p>
            <p><strong>District Name: </strong> ${district_name}</p>
        </div>`
    

    mainContainer.appendChild(ticketContainer);
}

function IntervalTimer(callback, interval) {
    let timerId, startTime, remaining = 0;
    let state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

    this.pause = function () {
        if (state != 1) return;

        remaining = interval - (new Date() - startTime);
        window.clearInterval(timerId);
        state = 2;
        console.log("paused!!")
    };

    this.resume = function () {
        if (state != 2) return;

        state = 3;
        window.setTimeout(this.timeoutCallback, remaining);
        console.log("resume!!")
    };

    this.timeoutCallback = function () {
        if (state != 3) return;

        callback();

        startTime = new Date();
        timerId = window.setInterval(callback, interval);
        state = 1;
    };

    startTime = new Date();
    timerId = window.setInterval(callback, interval);
    state = 1;
}

timer = new IntervalTimer(() => {
    if(newDate && (district_id || pincode)){
        getData(mainContainer)
    }
}, 4000);