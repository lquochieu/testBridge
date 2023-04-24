### deploy contracts:

MainChain
```
Lib_AddressManager (./contracts/libraries/resolver/Lib_AddressManager.sol)
MainGate (./contracts/MainChain/MainBridge/MainGate.sol)
MainBridge (./contracts/MainChain/MainBridge/MainBridge.sol)
MainNFTCollection (./contracts/MainChain/Tokens/MainNFTCollection.sol)
CanonicalTransactionChain (./contracts/MainChain/MainBridge/CanonicalTransactionChain.sol)
Transactor  (./libraries//universal/Transactor.sol)
```
At SideChain , we will deploy it like MainChain
### Initiate
Next, initiate some contracts:
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
