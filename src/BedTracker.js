App = {
  web3Provider: null,
  contracts: {},

  initWeb3: async () => {
    // if (window.ethereum) {
    //   handleEthereum();
    // } else {
    //   window.addEventListener('ethereum#initialized', handleEthereum, {
    //     once: true,
    //   });
    
    //   // If the event is not dispatched by the end of the timeout,
    //   // the user probably doesn't have MetaMask installed.
    //   setTimeout(handleEthereum, 3000); // 3 seconds
    // }
    
    // function handleEthereum() {
    //   const { ethereum } = window;
    //   if (ethereum && ethereum.isMetaMask) {
    //     App.web3Provider = ethereum;
    //     console.log('Ethereum successfully detected!');
    //     // Access the decentralized web!
    //   } else {
    //     console.log('Please install MetaMask!');
    //   }
    // }




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
    else if (window.web3) {
     App.web3Provider = window.web3.currentProvider;
    }
    //If no injected web3 instance is detected, fall back to Ganache
    else {
      //App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
      //App.web3Provider = new HDWalletProvider("run spell cluster agent capable divert document advance crowd cheap disease divorce", `https://ropsten.infura.io/v3/cadc6b0dc5c54720b973b3720eab5584`);
      App.web3Provider = new Web3.providers.HttpProvider(
        "HTTP://127.0.0.1:7545"
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
          $('<td>').text(hospitalData[i].name),
          $('<td>').text(hospitalData[i].location),
          $('<td>').attr("id", hospitalData[i].address).append(
            $('<button>').text("Fetch").addClass("btn").addClass("btn-info").on("click", function e() {
              App.fetchHospitalData(hospitalData[i].address, hospitalData[i].address);
            })

          )
        ).appendTo('#hospitalTableBody');
      }
      $('#hospitalTable').DataTable({
        "paging": false,
        "info": false
      });
  });
  },


  fetchHospitalData:async(id, address)=>{
    var instance;
    var currentBed;
      instance = await App.contracts.BedTracker.deployed()
      currentBed = await instance.balanceOf(address)
      usedBeds = await instance.getRecord(address)
      currentBed = currentBed.toNumber()
      usedBeds = usedBeds.toNumber()
      const totalBeds = currentBed + usedBeds
      const availableBeds = totalBeds - usedBeds;
      $('#' + id).html(App.generateDataHtml(totalBeds, usedBeds, availableBeds));
  },

  generateDataHtml(totalBeds, usedBeds, availableBeds) {
    return `<img src="./assets/images/hospital-bed.svg" width="30" height="30" class="filter-blue" />
    <p class="text-info d-inline">Total Beds: `+ totalBeds + `</p> &nbsp;
    <img src="./assets/images/hospital-bed.svg" width="30" height="30" class="filter-green" />
    <p class="text-success d-inline">Available Beds: `+ usedBeds + `</p> &nbsp;
    <img src="./assets/images/hospital-bed.svg" width="30" height="30" class="filter-grey" />
    <p class="text-secondary d-inline">Used Beds: `+ availableBeds + `</p> &nbsp;`
  }
};


$(() => {
  $(window).on("load", () => {
    App.initWeb3();
  });
});
