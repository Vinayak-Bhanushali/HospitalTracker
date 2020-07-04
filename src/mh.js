App = {
    web3Provider: null,
    contracts: {},
    fetchLen: null,
    dateTimeFormat: new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true }),
    currPage: 0,
    entriesPerPage: 4,
    cb:null,
    ub:null,
    tb:null,
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
      // else {
      //   App.web3Provider = new Web3.providers.HttpProvider(
      //     "http://localhost:7545"
      //   );
      // }
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
        App.fetchLen = await instance.fetchLength({ from: acc[0] })
        App.fetchLen = App.fetchLen.toNumber()
        //console.log(fetchLen)
        //hospitalData = jQuery.parseJSON(data)
        App.buildPageCounter()
        App.buildTable()
        App.HospitalData()
      },

      buildTable:async()=> {
        let temp;
        $('#hospitalTableBody').empty();
        let start = App.currPage*App.entriesPerPage;
        for (let i = start; (i < start+App.entriesPerPage && i< App.fetchLen); i++) {
          acc = await web3.eth.getAccounts()
          instance = await App.contracts.BedTracker.deployed()
          temp = await instance.getIdTimestamp(i, { from: acc[0] })
          temp[0] = temp[0].toNumber()
          temp[1] = temp[1].toNumber()
      
          const date = new Date(temp[1] * 1000)
          const id =temp[0]
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
                //App.buildTable();
                //fecthHospitalData();
                if(Math.floor(App.fetchLen/App.entriesPerPage)==App.currPage && App.fetchLen%App.entriesPerPage==1){
                  App.currPage -=1;
                }
                // if((App.currPage+1)*App.entriesPerPage!=App.fetchLen && App.fetchLen%App.entriesPerPage==1){
                //   App.currPage -=1;
                //   }
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
      // if(App.fetchLen%App.entriesPerPage == 0){
        
      //   App.buildPageCounter();
      //   //return App.fecthHospitalData()
      // }
      $('#addPatient').html('<button class="btn btn-success my-2 my-sm-0" onclick="App.addPatient()">Admit</button>')
      //return App.buildTable();
      if((App.currPage+1)*App.entriesPerPage==App.fetchLen && App.fetchLen%App.entriesPerPage==0){
        App.currPage +=1;
        }
      return App.fecthHospitalData()
          },

      buildPageCounter: ()=>{
        $("#pageCounter").empty();
        for(let i=0; i<App.fetchLen; i+=App.entriesPerPage){
          const val  = Math.floor(i/App.entriesPerPage);
          $('<button type="button" class="btn btn-secondary">').text(val+1).on("click", ()=>{
            App.nextPage(val);
          }).appendTo("#pageCounter")
        }
      },

      nextPage: (pageNo)=>{
        App.currPage = pageNo;
        App.buildTable();
      },

      showSearchModal: async ()=>{
        $('#searchPatient').html('<div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>')
          const id = $('#patientID').val();
          $('#patientID').val('');
          $('#hospitalSearchTableBody').empty();
  
        // fetch data of patient
        acc = await web3.eth.getAccounts()
        instance = await App.contracts.BedTracker.deployed()
        //console.log(id)
        timestamp = await instance.getById(id, { from: acc[0] })
        timestamp = timestamp.toNumber()
        // if data found
        if (timestamp) {
          const [{ value: month }, , { value: day }, , { value: year }, , { value: hour }, , { value: minute }, , { value: dayPeriod }] = App.dateTimeFormat.formatToParts(timestamp*1000)
          var $tr = $('<tr>').append(
              $('<th>').text(id),
              $('<td>').html("<p>" + day + " " + month + ", " + year + " " + hour + ":" + minute + " " + dayPeriod + "<p>"),
              $('<td>').attr("id", "discharge" + id).append(
                $('<button>').text("Discharge").addClass("btn").addClass("btn-info").on("click",()=>{
                  App.closeDischarge(id);
                })
              )
            ).appendTo('#hospitalSearchTableBody');
          $('#patientSearchModal').modal('show')
        } else {
          alert("No data found for Patient ID: "+id)
        }
        $('#searchPatient').html('<button class="btn btn-primary my-2 mx-1 my-sm-0" type="button" onclick="App.showSearchModal()">Search</button>')
      },

      HospitalData:async ()=>{
        acc = await web3.eth.getAccounts()
        var instance;
        var currentBed;
        instance = await App.contracts.BedTracker.deployed()
        currentBed = await instance.balanceOf(acc[0])
        usedBeds = await instance.getRecord(acc[0])
        currentBed = currentBed.toNumber()
        usedBeds = usedBeds.toNumber()
        const totalBeds = currentBed + usedBeds
        $('#totalBeds').text('Total Beds: '+totalBeds)
        $('#availableBeds').text('Available Beds: '+currentBed)
        $('#usedBeds').text('Used Beds: '+usedBeds)
      },

      closeDischarge:async (id)=>{
        await App.dischargePatient(id)
        $('#patientSearchModal').modal('hide')
      }

     
  

  };
  
  
  $(() => {
    $(window).on("load", () => {
      App.initWeb3();
    });
  });