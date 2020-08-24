const BedTracker = artifacts.require("BedTracker");

module.exports = function (deployer) {
  deployer.deploy(BedTracker);
};
