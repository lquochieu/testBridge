When deploy mainnet, please change:
- Contract 
+ file contracts/constant/Lib_DefaultValues.sol
 change field **BSC_CHAIN_ID_MAINNET**

- Scripts
+ scripts/sdk/rdOwner.js
 change sideProvider from goerli to eth

- Env
see ENV_EXAMPLE
change ETH_CHAIN_ID, BSC_CHAIN_ID

## Quick Use
See .env_example and set some information
+ ABI_KEY
+ PRIVATE_KEY

+ MAIN_BOT_ADRESS : address will receive trava fee when deposit on BSC
+ MAIN_TRAVA_ADDRESS: address of trava on BSC
+ MAIN_BRIDGE_FEE: fee when deposit NFT

+ SIDE_BOT_ADRESS : address will receive trava fee when withdraw on ETH
+ SIDE_TRAVA_ADDRESS: address of trava on ETH
+ SIDE_BRIDGE_FEE: fee when withdraw NFT
Then Deploy
```
node scripts/deploy/MainChain/deployMainChain.js
```
Write these address contract has just been deployed to .env file. Then
```
node scripts/deploy/SideChain/deploySideChain.js
```
Write these address contract has just been deployed to .env file. After that, initiate some contracts
```
node scripts/init/initForMainChain.js
node scripts/init/initForSideChain.js
```
### deploy contracts:
Deploy BSC contract first before deploying ETH contract

#### deploy BSC Contract

Before Deploy MainBridge on BSC, fill these fields below in file .env
ABI_KEY
PRIVATE_KEY

+ MAIN_BOT_ADRESS : address will receive trava fee when deposit on BSC
+ MAIN_TRAVA_ADDRESS: address of trava on BSC
+ MAIN_BRIDGE_FEE: fee when deposit NFT

Run file scripts/deploy/MainChain/deployMainChain.js for deploying all contract on BSC

If you want to deploy each contract, please deploy these contracts in the order below. After deploy each contract, write its addres into .env file before deploying the other contract

MainChain
```
Lib_AddressManager (./contracts/libraries/resolver/Lib_AddressManager.sol)
MainGate (./contracts/MainChain/MainBridge/MainGate.sol)
MainBridge (./contracts/MainChain/MainBridge/MainBridge.sol)
MainNFTCollection (./contracts/MainChain/Tokens/MainNFTCollection.sol)
MaiCanonicalTransactionChain (./contracts/MainChain/MainBridge/MaiCanonicalTransactionChain.sol)
MainTransactor  (./libraries//universal/MainTransactor.sol)
```
#### deploy ETH Contract
Before Deploy SideBridge on ETH, fill these fields below in file .env
+ MAIN_LIB_ADDRESS_MANAGER
+ MAIN_BRIDGE
+ MAIN_GATE
+ MAIN_TRANSACTOR
+ MAIN_CANONICAL_TRANSACTION_CHAIN

+ SIDE_BOT_ADRESS : address will receive trava fee when withdraw on ETH
+ SIDE_TRAVA_ADDRESS: address of trava on ETH
+ SIDE_BRIDGE_FEE: fee when withdraw NFT

Run file scripts/deploy/SideChain/deploySideChain.js for deploying all contract on ETH
If you want to deploy each contract, please deploy these contracts in the order below. After deploy each contract, write its addres into .env file before deploying the other contract

Remember write these address to .env file
```
Lib_AddressManager (./contracts/libraries/resolver/Lib_AddressManager.sol)
SideGate (./contracts/SideChain/SideBridge/SideGate.sol)
SideBridge (./contracts/SideChain/SideBridge/SideBridge.sol)
SideNFTCollection (./contracts/SideChain/Tokens/SideNFTCollection.sol)
SideCanonicalTransactionChain (./contracts/SideChain/SideBridge/SideCanonicalTransactionChain.sol)
SideTransactor  (./libraries//universal/SideTransactor.sol)
```

### Initiate
After deloying contract, initiate some contracts.

Run file 
```
scripts/init/initForMainChain.js
scripts/init/initForSideChain.js
```
```
MainBridge (main)
MainGate (main)
SideBridge (side)
SideGate (side)
```
### Set address
Then set address contractss at Lib_AddressManager

**Ctrl + Shift + F** and type `resolve` to seach some address what we need store them

main: set it on MainChain
side: set it on SideChain

setAddress
```
MainBridge (main)
CanonicalTransactionChain (main)
SideBridge (side)
CanonicalTransactionChain (side)
```

setGate
```
sideGate (main)
mainGate (side)
```

setTransactor
```
MainTransactor (main)
SideTransactor (main)
MainTransactor (side)
SideTransactor (side)
```
### Deposit
Before deposit NFTCollection, please setApprovalForAll NFTCollection what you want to deposit.

Catch event **TransactorEvent** and sign parameters **(sender, target, data, messageNonce)** with **deadline**. Send signature for user, then save these parameters with signature to database. Please check contract `Transactor` to know detail

When user want claim NFT, they will call function `claimNFTCollection`, we will check signature user sent, if valid, address `target` will call `data`. It will call function `relayMessage` in SideGate and then call function `finalizeDeposit` in SideBridge. User will receive their NFT depoisited.

### Withdraw
It's similar to **Deposit**
