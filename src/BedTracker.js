App = {
  web3Provider: null,
  contracts: {},
  init: () => {
    $.getJSON("./hospital.json", (data) => {});
  },

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
      return App.bindEvents();
    });
  },
  bindEvents: () => {
    $(document).on("click", ".btn-ether", App.Event);
  },
  Event: () => {},
};

$(() => {
  $(window).on("load", () => {
    App.init();
  });
});
