const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ProjectModule = buildModule("ProjectModule", (m) => {
  const contract = m.contract("SmartDonationProjectV1", [
    "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    ["0x1Ff482D42D8727258A1686102Fa4ba925C46Bc42"],
    1,
    171105215,
    2,
    "1000000000000000000",
    0
  ]);

  return { contract };
});

module.exports = ProjectModule;