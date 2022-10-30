const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { abi, evm } = require('../compile')

const web3 = new Web3(ganache.provider());

let accounts;
let lotteryContract;

describe('Lottery Contract', () => {
  beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    const bytecode = evm.bytecode.object;
    // Use one of those accounts to deploy
    // the contract
    lotteryContract = await new web3.eth.Contract(abi)
      .deploy({ data: '0x' + bytecode })
      .send({ from: accounts[0], gas: '1000000' });
  }, 10000);

  it('deploys the contract with manager', async () => {
    assert.ok(lotteryContract.options.address)

    const manager = await lotteryContract.methods.manager().call();

    assert.equal(manager, accounts[0]);
  })

  it('allows a new address to enter the lottery', async () => {
    await lotteryContract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.015', 'ether')
    });

    const players = await lotteryContract.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(1, players.length);
    assert.equal(accounts[0], players[0]);
  })

  it('allows a multiple addresses to enter the lottery', async () => {
    await lotteryContract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.015', 'ether')
    });

    await lotteryContract.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.015', 'ether')
    });

    await lotteryContract.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.015', 'ether')
    });

    const players = await lotteryContract.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(3, players.length);

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
  })

  it('requires minimum amount of eth to enter', async () => {
    await assert.rejects(async () =>
      await lotteryContract.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.002', 'ether')
      })
    );
  })

  it('prevents non manager for picking winner', async () => {
    await lotteryContract.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.015', 'ether')
    });

    await assert.rejects(async () =>
      await lotteryContract.methods.pickWinner().send({
        from: accounts[1],
      })
    );
  })

  it('lets manager pick a winner', async () => {
    await lotteryContract.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.015', 'ether')
    });

    await assert.doesNotReject(async () =>
      await lotteryContract.methods.pickWinner().send({
        from: accounts[0],
      })
    );
  })

  it('sends money to winner and resets', async () => {
    await lotteryContract.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('2', 'ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[1]);

    await lotteryContract.methods.pickWinner().send({
      from: accounts[0]
    });

    const finalBalance = await web3.eth.getBalance(accounts[1]);

    // Taking into acount gas fees
    assert(finalBalance - initialBalance > web3.utils.toWei('1.8', 'ether'));
  })

})
