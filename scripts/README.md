### deploy contracts:

MainChain
```
MainBridge (./contracts/MainChain/MainBridge/MainBridge.sol)
MainGate (./contracts/MainChain/MainBridge/MainGate.sol)
Lib_AddressManager (./contracts/libraries/resolver/Lib_AddressManager.sol)
MainNFTCore (./contracts/MainChain/Tokens/MainNFTCollection.sol)
CanonicalTransactionChain (./contracts/MainChain/MainBridge/CanonicalTransactionChain.sol)
Transactor  (./libraries//universal/Transactor.sol)
```
SideChain
```
SideBridge (./contracts/SideChain/SideBridge/SideBridge.sol)
SideGate (./contracts/SideChain/SideBridge/SideGate.sol)
Lib_AddressManager (./contracts/libraries/resolver/Lib_AddressManager.sol)
SideNFTCore (./contracts/SideChain/Tokens/SideNFTCollection.sol)
Transactor  (./libraries/universal/Transactor.sol)
```
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

**Ctrl + Shift + F** and type `resolve("` to seach some String need store their address

main: set it on MainChain
side: set it on SideChain
```
MainBridge (main)
CanonicalTransactionChain (main)
MainTransactor (main)
SideTransactor (main)
SideGate (main)

SideBridge (side)
MainGate (side)
SideTransactor (side)
```

### Deposit
Before deposit NFTCollection, please setApprovalForAll NFTCollection what you want to deposit.
Catch event **MainTransactorEvent** and sign parameters (target, gasLimit, data).
After we confirm this event is `true`, use contract **Transactor** to call this parameters. 
The parameter 'data' in event contain function `target` will call and it is `relayMessage` function in `SideGate` contract

Check event **RelayedMessage**, if it exists, doposit finalized, user will use **claimNFTCollection** in **SideBridge** to receive their NFTCollection what they deposited
But if **FailedRelayedMessage** event exists, deposit failed