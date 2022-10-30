const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, evm } = require('./compile');

const provider = new HDWalletProvider(
  '<MNEMONIC>',
  'https://goerli.infura.io/v3/<API-KEY>'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);
  const bytecode = evm.bytecode.object;
  const contract = await new web3.eth.Contract(abi)
    .deploy({ data: '0x' + bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  provider.engine.stop();
  console.log('Contract deployed to:', contract.options.address);
};

deploy();
