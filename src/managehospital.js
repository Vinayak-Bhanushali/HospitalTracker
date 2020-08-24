if (window.ethereum) {
  var web3Provider = window.ethereum
  web3 = new Web3(web3.currentProvider);
  window.ethereum.enable()
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
  ethereum.enable()
}

$(() => {
  $(window).on("load", () => {
    initContract();
  });
});

var hospitalContract;
var hospitalData=[];
var fetchLen;
const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true })

function initContract() {
  $.getJSON("BedTracker.json", (data) => {
    hospitalContract = TruffleContract(data);
    hospitalContract.setProvider(web3Provider);
  });
  fecthHospitalData();
}

async function fecthHospitalData() {
  // Read data from metamask and fecth the values from system

  //const data = '[{"id": "01", "time": "1592916472"},{"id": "02","time":"1592916479"},{"id": "03","time":"1592916485"},{"id": "04", "time":"1592916485"}]'
  acc = await web3.eth.getAccounts()
  instance = await hospitalContract.deployed()
  fetchLen = await instance.fetchLength({ from: acc[0] })
  fetchLen = fetchLen.toNumber()
  console.log(fetchLen)
  //hospitalData = jQuery.parseJSON(data)
  buildTable()
}

async function buildTable() {
  let temp;
  console.log(fetchLen)
  $('#hospitalTableBody').empty();
  for (let i = 0; i < fetchLen; i++) {
    acc = await web3.eth.getAccounts()
    instance = await hospitalContract.deployed()
    temp = await instance.getIdTimestamp(i, { from: acc[0] })
    temp[0] = temp[0].toNumber()
    temp[1] = temp[1].toNumber()
    hospitalData.push(temp) 
    console.log(hospitalData)
    //console.log(hospitalData[].toNumber())


    const date = new Date(hospitalData[i][1] * 1000)
    const id = hospitalData[i][0]
    const [{ value: month }, , { value: day }, , { value: year }, , { value: hour }, , { value: minute }, , { value: dayPeriod }] = dateTimeFormat.formatToParts(date)
    var $tr = $('<tr>').append(
      $('<th>').text(id),
      $('<th>').html("<p>" + day + " " + month + ", " + year + " " + hour + ":" + minute + " " + dayPeriod + "<p>"),
      $('<td>').attr("id", "discharge" + id).append(
        $('<button>').text("Discharge").addClass("btn").addClass("btn-info").on("click",()=>{
          dischargePatient(id);
        })
      )
    ).appendTo('#hospitalTableBody');
  }
}


async function dischargePatient(id){
  $('#discharge' + id).html('<div class="spinner-border text-secondary" role="status"><span class="sr-only">Loading...</span></div>')
          // call backend to remove patient
          acc = await web3.eth.getAccounts()
          instance = await hospitalContract.deployed()
          console.log(id)
          await instance.discharge(id, { from: acc[0] })
          //hospitalData.splice(i, 1);
          //fecthHospitalData();
          location.reload(true);
}

async function addPatient() {
  $('#addPatient').html('<div class="spinner-border text-success" role="status"><span class="sr-only">Loading...</span></div>')
  const id = $('#patientID').val();
  $('#patientID').val('');
  // Hit server with new id
  acc = await web3.eth.getAccounts()
  instance = await hospitalContract.deployed()
  await instance.admit(id, { from: acc[0] })


//hospitalData.push({ "id": id,"time": Math.floor((new Date()).getTime() / 1000)});
//buildTable();
$('#addPatient').html('<button class="btn btn-outline-success my-2 my-sm-0" onclick="addPatient()">Admit</button>')
fecthHospitalData()
    }