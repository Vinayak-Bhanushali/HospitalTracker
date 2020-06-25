App = {
    web3Provider: null,
    contracts: {},
    fetchLen: null,
    dateTimeFormat: new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true }),
  
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
        return App.fecthHospitalData()
      });
    },

    fecthHospitalData: async()=> {
        // Read data from metamask and fecth the values from system
      
        //const data = '[{"id": "01", "time": "1592916472"},{"id": "02","time":"1592916479"},{"id": "03","time":"1592916485"},{"id": "04", "time":"1592916485"}]'
        acc = await web3.eth.getAccounts()
        instance = await App.contracts.BedTracker.deployed()
        fetchLen = await instance.fetchLength({ from: acc[0] })
        fetchLen = fetchLen.toNumber()
        console.log(fetchLen)
        //hospitalData = jQuery.parseJSON(data)
        App.buildTable()
      },

      buildTable:async()=> {
        let temp;
        let hospitalData = [];
        console.log(fetchLen)
        $('#hospitalTableBody').empty();
        for (let i = 0; i < fetchLen; i++) {
          acc = await web3.eth.getAccounts()
          instance = await App.contracts.BedTracker.deployed()
          temp = await instance.getIdTimestamp(i, { from: acc[0] })
          temp[0] = temp[0].toNumber()
          temp[1] = temp[1].toNumber()
          hospitalData.push(temp) 
          console.log(hospitalData)
          //console.log(hospitalData[].toNumber())
      
      
          const date = new Date(hospitalData[i][1] * 1000)
          const id =hospitalData[i][0]
          const [{ value: month }, , { value: day }, , { value: year }, , { value: hour }, , { value: minute }, , { value: dayPeriod }] = App.dateTimeFormat.formatToParts(date)
          var $tr = $('<tr>').append(
            $('<th>').text(id),
            $('<th>').html("<p>" + day + " " + month + ", " + year + " " + hour + ":" + minute + " " + dayPeriod + "<p>"),
            $('<td>').attr("id", "discharge" + id).append(
              $('<button>').text("Discharge").addClass("btn").addClass("btn-info").on("click",()=>{
                App.dischargePatient(id);
              })
            )
          ).appendTo('#hospitalTableBody');
        }
      },

      dischargePatient:async(id)=>{
        $('#discharge' + id).html('<div class="spinner-border text-secondary" role="status"><span class="sr-only">Loading...</span></div>')
                // call backend to remove patient
                acc = await web3.eth.getAccounts()
                instance = await App.contracts.BedTracker.deployed()
                console.log(id)
                await instance.discharge(id, { from: acc[0] })
                //App.hospitalData.splice(i, 1);
                //fecthHospitalData();
                App.fecthHospitalData()
      },
  
      addPatient:async()=> {
        $('#addPatient').html('<div class="spinner-border text-success" role="status"><span class="sr-only">Loading...</span></div>')
        const id = $('#patientID').val();
        $('#patientID').val('');
        // Hit server with new id
        acc = await web3.eth.getAccounts()
        instance = await App.contracts.BedTracker.deployed()
        await instance.admit(id, { from: acc[0] })
      
      
      //hospitalData.push({ "id": id,"time": Math.floor((new Date()).getTime() / 1000)});
      //buildTable();
      $('#addPatient').html('<button class="btn btn-outline-success my-2 my-sm-0" onclick="App.addPatient()">Admit</button>')
      App.fecthHospitalData()
          },
  

  };
  
  
  $(() => {
    $(window).on("load", () => {
      App.initWeb3();
    });
  });