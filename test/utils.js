const mineBlock = async (provider) => {
  await provider.send("evm_mine");
};

const increaseTime = async (provider, time) => {
  await provider.send("evm_increasetime", [time]);
};

module.exports = { mineBlock };
