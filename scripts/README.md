**deploy contracts** in following order:
```
MainBridge (main)
MainCrossDomainMessenger (main)
Lib_AddressManager (main)
MainNFTCore (main)
CanonicalTransactionChain (main)

OVM_SideToMainMessagePasser (side)
OVM_DeployerWhitelist (side)
SideCrossDomainMessenger (side)
Lib_AddressManager (side)
SideBridge (side)
SideNFTCore (side)
```
Finally, initiate some contracts:
```
MainBridge (main)
MainCrossDomainMessenger (main)
SideCrossDomainMessenger (side)
```
and set address contractss
```
MainBridge (main)
CanonicalTransactionChain (main)
OVMSideToMainMessagePasser (side)
```