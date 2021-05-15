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

let colors = ["lightpink", "lightblue", "lightgreen", "black"]
let flag = false;
let age_param = null;
let newDate;

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

        // mainContainer = document.querySelector(".main-container");
        // if(mainContainer.children.length > 0){
        //     let tContainer = document.querySelectorAll(".ticket-container");
        //     for(let i=0; i<tContainer.length; i++){
        //         mainContainer.removeChild(tContainer[i])

        //     }
        // }

        let ageElem = modalFilters[i].children[0];
        if(ageElem.innerText == "18+"){
            age_param = 18;
        }else if(ageElem.innerText == "45+"){
            age_param = 45;
        }else if(ageElem.innerText == "ALL"){
            age_param = null;
        }
        modalFilters[i].classList.add("border");
        if(district_id && newDate){
            console.log("fetching...");
            getData(mainContainer);
        }
    })
}

pinDistContainer.addEventListener("click", function(){
    pinFlag = !pinFlag;
    
    if(pinFlag){
        pinDist.innerText = "Pincode";
        inputContainer.style.display = "flex";
        select.style.display = "none";
        districtSelect.style.display = "none";
    }else{
        pinDist.innerText = "District";
        inputContainer.style.display = "none";
        select.style.display = "block";
        districtSelect.style.display = "block";
    }
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

    if(district_id && newDate){
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

    fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${district_id}&date=${newDate}`)  // returns promise
        .then(response => response.json())
        .then(obj => {
            let arr = obj["sessions"]
            if(age_param !== null && arr.length > 0){
                arr = arr.filter(obj => obj["min_age_limit"] == age_param)
            }
            if(arr.length > 0){
                audio.play();
            }

            if(arr.length == 0){
                infoContainer.style.display = "flex";
            }

            for(let i=0; i<arr.length; i++){
                infoContainer.style.display = "none";
                let vName = arr[i]["vaccine"];
                let pincode = arr[i]["pincode"]
                let state_name = arr[i]["state_name"];
                let district_name = arr[i]["district_name"]
                let center_name = arr[i]["name"];
                let available_capacity = arr[i]["available_capacity"];
                let date = arr[i]["date"]
                let age = arr[i]["min_age_limit"];

                let cColor = colors[Math.floor(Math.random() * colors.length)];
                console.log(age)
                createTicket(mainContainer, vName, pincode, state_name, district_name, center_name, available_capacity, date, age, cColor);
                
            }
            console.log(obj["sessions"])
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
    if(district_id && newDate){
        getData(mainContainer)
    }
}, 5000);