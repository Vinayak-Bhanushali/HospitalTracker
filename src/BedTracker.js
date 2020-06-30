App = {
  web3Provider: null,
  contracts: {},

  initWeb3: async () => {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    //else if (window.web3) {
    //  App.web3Provider = window.web3.currentProvider;
    //}
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: () => {
    $.getJSON("BedTracker.json", (data) => {
      App.contracts.BedTracker = TruffleContract(data);
      App.contracts.BedTracker.setProvider(App.web3Provider);
      return App.hospitalList()
    });
  },


  hospitalList: () => {
    $.getJSON('hospital.json', function (hospitalData) {
      for (let i = 0; i < hospitalData.length; i++) {
        var $tr = $('<tr>').append(
          $('<th>').text(i),
          $('<td>').text(hospitalData[i].name),
          $('<td>').text(hospitalData[i].location),
          $('<td>').attr("id", hospitalData[i].address).append(
            $('<button>').text("Fetch").addClass("btn").addClass("btn-info").on("click", function e() {
              App.fetchHospitalData(hospitalData[i].address, hospitalData[i].address);
            })

          )
        ).appendTo('#hospitalTableBody');
      }
      $('#hospitalTable').DataTable();
  });
  },


  fetchHospitalData:(id, address)=>{
    var instance;
    var currentBed;
    App.contracts.BedTracker.deployed().then((result)=>{
      instance = result;
      return instance.balanceOf(address)
    }).then((currentB)=>{
        currentBed = currentB
        return instance.getRecord(address)
    }).then((usedBeds)=>{
      currentBed = currentBed.toNumber()
      usedBeds = usedBeds.toNumber()
      const totalBeds = currentBed + usedBeds
      const availableBeds = totalBeds - usedBeds;
      $('#' + id).html("Total Beds: " + totalBeds + "\nUsed Beds: " + usedBeds + "\nAvailable Beds: " + availableBeds);
    })
  },
};


$(() => {
  $(window).on("load", () => {
    App.initWeb3();
  });
});
