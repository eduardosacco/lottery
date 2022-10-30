const fs = require('fs');
const path = require('path');
const solc = require('solc');

const ENABLE_LOGGING = false;

const lotteryContractPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const source = fs.readFileSync(lotteryContractPath, 'utf8');
const buildPath = path.resolve(__dirname, 'build');

if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath);
}

const input = {
  language: 'Solidity',
  sources: {
    'Lottery.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (ENABLE_LOGGING) {
  for (let contractName in output.contracts['Lottery.sol']) {
    console.log(
      contractName + ': ' + output.contracts['Lottery.sol'][contractName]
    );
  }
}

module.exports = output.contracts['Lottery.sol']['Lottery'];
