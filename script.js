'use strict';

let filterOptions = document.querySelectorAll(".filter-colors__container")
let mainContainer = document.querySelector(".main-container")
let selectDate = document.querySelector("#start");
let addBtn  = document.querySelector(".add");
let modalContainer = document.querySelector(".modal-container")
let modalFilters = document.querySelectorAll(".modal-filters");
let audio = document.querySelector("#audio_id");
let h1 = document.querySelector(".notice");
let pinDistContainer = document.querySelector(".pin-dist_container");
let pinDist = document.querySelector(".pin-dist");
let inputContainer = document.querySelector(".input-container");
let infoContainer = document.querySelector(".info-container");
let inputPin = document.querySelector("#input-pin");

let colors = ["lightpink", "lightblue", "lightgreen", "black"]
let flag = false;
let age_param = null;
let newDate;
let pincode;
let initialUrl = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public"

mainContainer.addEventListener("click", function(){
    addBtn.classList.remove("active");
    modalContainer.style.display = "none";
    flag = false;
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
        if(newDate && (district_id || pincode)){
            console.log("fetching...");
            getData(mainContainer);
        }
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

    let fullUrl = pinFlag ? `${initialUrl}/calendarByPin?pincode=${pincode}&date=${newDate}` : `${initialUrl}/calendarByDistrict?district_id=${district_id}&date=${newDate}`

    fetch(fullUrl)  // returns promise
        .then(response => response.json())
        .then(obj => {
            let arr = obj["centers"]
            let arrOfSessions = [];
            
            if(arr.length > 0){
                for(let i=0; i<arr.length; i++){
                    arrOfSessions = arr[i]["sessions"];
                }
            }

            if(age_param !== null && arrOfSessions.length > 0){
                arrOfSessions = arrOfSessions.filter(obj => obj["min_age_limit"] == age_param)
            }
            if(arrOfSessions.length > 0){
                audio.play();
            }

            if(arrOfSessions.length == 0){
                infoContainer.style.display = "flex";
            }

            for(let i=0; i<arr.length; i++){
                for(let j=0; j<arrOfSessions.length; j++){
                    infoContainer.style.display = "none";
                    let vName = arrOfSessions[j]["vaccine"];
                    let pincode = arr[i]["pincode"]
                    let state_name = arr[i]["state_name"];
                    let district_name = arr[i]["district_name"]
                    let center_name = arr[i]["name"];
                    let available_capacity = arrOfSessions[j]["available_capacity"];
                    let date = arrOfSessions[j]["date"]
                    let age = arrOfSessions[j]["min_age_limit"];

                    let cColor = colors[Math.floor(Math.random() * colors.length)];

                    createTicket(mainContainer, vName, pincode, state_name, district_name, center_name, available_capacity, date, age, cColor);
                }
                
            }
            console.log(obj["centers"])
        })
        .catch(error => {
            console.log(error)
        });
}

function createTicket(mainContainer, vName, pincode, state_name, district_name, center_name, available_capacity, date, age, cColor){
    let id = uid();
    
    let ticketContainer = document.createElement("div");
    ticketContainer.setAttribute("class", "ticket-container");
    
    ticketContainer.innerHTML = `<div class="ticket-color ${cColor}"></div>
        <div class="ticket_sub-container">
            <h3 class="ticket-id">#${id}</h3>
           <p><strong>Vaccine Name: </strong> ${vName}</p>
            <p><strong>No. of doses: </strong> ${available_capacity}</p>
            <p><strong>Date: </strong> ${date}</p>
            <p><strong>Age: </strong> ${age}</p>
            <p><strong>Pincode: </strong> ${pincode}</p>
            <p><strong>Center Name: </strong> ${center_name}</p>
            <p><strong>State Name: </strong> ${state_name}</p>
            <p><strong>District Name: </strong> ${district_name}</p>
        </div>`
    

    mainContainer.appendChild(ticketContainer);
}

setInterval(() => {
    if(newDate && (district_id || pincode)){
        getData(mainContainer)
    }
}, 5000);