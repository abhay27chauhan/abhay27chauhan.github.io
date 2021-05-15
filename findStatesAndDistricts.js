let select = document.querySelector(".select");
let districtSelect = document.querySelector(".district-select");

let state_id;
let district_id;
let pinFlag = false;

if(!pinFlag){
    fetch('https://cdn-api.co-vin.in/api/v2/admin/location/states')  // returns promise
        .then(response => response.json())
        .then(obj => {
            let arr = obj["states"]
            for(let i=0; i<arr.length; i++){
                let option = document.createElement("option");
                option.setAttribute("value", `${arr[i]["state_id"]}`);
                option.innerText = arr[i]["state_name"];
                select.appendChild(option)
            }
            console.log(obj["states"])
        })
        .catch(error => console.log(error));
}

select.addEventListener("change", function(){
    state_id = select.value;
    // console.log("state_id: ",state_id);
    let getAllOptions = document.querySelectorAll(".district-select option");
    if(getAllOptions.length > 0){
        for(let i=1; i<getAllOptions.length; i++){
            getAllOptions[i].remove();
        }
    }

    districtSelect = document.querySelector(".district-select");
    fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${state_id}`)  // returns promise
        .then(response => response.json())
        .then(obj => {
            let arr = obj["districts"]
            for(let i=0; i<arr.length; i++){
                let option = document.createElement("option");
                option.setAttribute("value", `${arr[i]["district_id"]}`);
                option.innerText = arr[i]["district_name"];
                districtSelect.appendChild(option)
            }
            console.log(obj["districts"])
        })
        .catch(error => console.log(error));
})

districtSelect.addEventListener("change", function(){
    district_id = districtSelect.value;
    // console.log("district_id: ",district_id)
})
