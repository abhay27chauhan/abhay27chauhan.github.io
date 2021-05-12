'use strict';

let filterOptions = document.querySelectorAll(".filter-colors__container")
let mainContainer = document.querySelector(".main-container")
let selectDate = document.querySelector("#start");


let colors = ["lightpink", "lightblue", "lightgreen", "black"]
let newDate;
let allTasks = [];

selectDate.addEventListener("change", function(){
    let date = selectDate.value;
    let dateArr = date.split("-");
    let day = dateArr[2];
    let month = dateArr[1];
    let year = dateArr[0];
    newDate = [day, month, year].join("-");
    console.log(newDate);

    if(district_id && newDate){
        fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${district_id}&date=${newDate}`)  // returns promise
            .then(response => response.json())
            .then(obj => {
                let arr = obj["sessions"]
                for(let i=0; i<arr.length; i++){
                    let vName = arr[i]["vaccine"];
                    let pincode = arr[i]["pincode"]
                    let state_name = arr[i]["state_name"];
                    let district_name = arr[i]["district_name"]
                    let center_name = arr[i]["name"];
                    let available_capacity = arr[i]["available_capacity"]

                    createTicket(vName, pincode, state_name, district_name, center_name, available_capacity);
                }
                console.log(obj["sessions"])
            })
            .catch(error => {
                console.log(error)
            });
    }
})

function createTicket(vName, pincode, state_name, district_name, center_name, available_capacity){
    let id = uid();
    let cColor = colors[Math.floor(Math.random() * colors.length)];

    let ticketContainer = document.createElement("div");
    ticketContainer.setAttribute("class", "ticket-container");
    
    ticketContainer.innerHTML = `<div class="ticket-color ${cColor}"></div>
        <div class="ticket_sub-container">
            <h3 class="ticket-id">#${id}</h3>
           <p><strong>Vaccine Name: </strong> ${vName}</p>
                <p><strong>No. of doses: </strong> ${available_capacity}</p>
                <p><strong>Pincode: </strong> ${pincode}</p>
                <p><strong>Center Name: </strong> ${center_name}</p>
                <p><strong>State Name: </strong> ${state_name}</p>
                <p><strong>District Name: </strong> ${district_name}</p>
        </div>`
    

    mainContainer.appendChild(ticketContainer);
}