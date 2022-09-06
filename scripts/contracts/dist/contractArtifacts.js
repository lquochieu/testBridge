"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractArtifact = void 0;
let IMainCrossDomainMessenger;
try {
    IMainCrossDomainMessenger = require("../../../artifacts/contracts/MainChain/MainBridge/IMainCrossDomainMessenger.sol/IMainCrossDomainMessenger.json");
}
catch (_a1) { 
    console.log("a1: ", _a1);
}

let IMainBridge;
try {
    IMainBridge = require("../../../artifacts/contracts/MainChain/MainBridge/IMainBridge.sol/IMainBridge.json");
}
catch (_a2) { 
    console.log("a2: ", _a2);
}

let MainCrossDomainMessenger;
try {
    MainCrossDomainMessenger = require("../../../artifacts/contracts/MainChain/MainBridge/MainCrossDomainMessenger.sol/MainCrossDomainMessenger.json");
}
catch (_a3) { 
    console.log("a3: ", _a3);
}

let MainBridge;
try {
    MainBridge = require("../../../artifacts/contracts/MainChain/MainBridge/MainBridge.sol/MainBridge.json");
}
catch (_a4) { 
    console.log("a4: ", _a4);
}

let CanonicalTransactionChain;
try {
    CanonicalTransactionChain = require("../../../artifacts/contracts/MainChain/rollup/CanonicalTransactionChain.sol/CanonicalTransactionChain.json");
}
catch (_a5) { 
    console.log("a5: ", _a5);
}

let ICanonicalTransactionChain;
try {
    ICanonicalTransactionChain = require("../../../artifacts/contracts/MainChain/rollup/ICanonicalTransactionChain.sol/ICanonicalTransactionChain.json");
}
catch (_a6) { 
    console.log("a6: ", _a6);
}

let ISideCrossDomainMessenger;
try {
    ISideCrossDomainMessenger = require("../../../artifacts/contracts/SideChain/SideBridge/ISideCrossDomainMessenger.sol/ISideCrossDomainMessenger.json");
} catch (_a7) {
    console.log("a7: ", _a7);
}

let ISideBridge;
try {
    ISideBridge = require("../../../artifacts/contracts/SideChain/SideBridge/ISideBridge.sol/ISideBridge.json");
} catch (_a8) {
    console.log("a8: ", _a8);
}

let SideCrossDomainMessenger;
try {
    SideCrossDomainMessenger = require("../../../artifacts/contracts/SideChain/SideBridge/SideCrossDomainMessenger.sol/SideCrossDomainMessenger.json");
} catch (_a9) {
    console.log("a9: ", _a9);
}

let SideBridge;
try {
    SideBridge = require("../../../artifacts/contracts/SideChain/SideBridge/SideBridge.sol/SideBridge.json");
} catch (_a10) {
    console.log("a10: ", _a10);
}

let IOVM_SideToMainMessagePasser;
try {
    IOVM_SideToMainMessagePasser = require('../../../artifacts/contracts/SideChain/predploys/IOVM_SideToMainMessagePasser.sol/IOVM_SideToMessagePasser.json');
}
catch (_a11) { 
    console.log("a11: ", _a11);
}

let OVM_SideToMainMessagePasser;
try {
    OVM_SideToMainMessagePasser = require('../../../artifacts/contracts/SideChain/predploys/OVM_SideToMainMessagePasser.sol/OVM_SideToMessagePasser.json');
}
catch (_b11) { 
    console.log("b11: ", _b11);
}

let OVM_DeployerWhitelist;
try {
    OVM_DeployerWhitelist = require('../../../artifacts/contracts/SideChain/predploys/OVM_DeployerWhitelist.sol/OVM_DeployerWhitelist.json');
} catch(_a12) {
    console.log("a12: ", _a12);
}

let CrossDomainEnabled;
try {
    CrossDomainEnabled = require('../../../artifacts/contracts/libraries/bridge/CrossDomainEnabled.sol/CrossDomainEnabled.json');
}
catch (_a13) { 
    console.log("a13: ", _a13);
}

let ICrossDomainMessenger;
try {
    ICrossDomainMessenger = require('../../../artifacts/contracts/libraries/bridge/ICrossDomainMessenger.sol/ICrossDomainMessenger.json');
}
catch (_a14) {
    console.log("a14: ", _a14);
 }

 let Lib_CrossDomainUtils;
 try {
     Lib_CrossDomainUtils = require('../../../artifacts/contracts/libraries/bridge/Lib_CrossDomainUtils.sol/Lib_CrossDomainUtils.json');
 }
 catch (_a15) {
    console.log("a15: ", _a15);
  }

 let Lib_OVMCodec;
 try {
     Lib_OVMCodec = require('../../../artifacts/contracts/libraries/codec/Lib_OVMCodec.sol/Lib_OVMCodec.json');
 }
 catch (_a16) {
    console.log("a16: ", _a16);
  }

 let Lib_DefaultValues;
 try {
     Lib_DefaultValues = require('../../../artifacts/contracts/libraries/constant/Lib_DefaultValues.sol/Lib_DefaultValues.json');
 }
 catch (_a17) {
    console.log("a17: ", _a17);
  }

 let Lib_PredeployAddresses;
 try {
     Lib_PredeployAddresses = require('../../../artifacts/contracts/libraries/constant/Lib_PredeployAddresses.sol/Lib_PredeployAddresses.json');
 }
 catch (_18) {
    console.log("a18: ", _a18);
  }

 let Lib_AddressManager;
 try {
     Lib_AddressManager = require('../../../artifacts/contracts/libraries/resolver/Lib_AddressManager.sol/Lib_AddressManager.json');
 }
 catch (_a19) { 
    console.log("a19: ", _a19);
 }

 let Lib_AddressResolver;
 try {
     Lib_AddressResolver = require('../../../artifacts/contracts/libraries/resolver/Lib_AddressResolver.sol/Lib_AddressResolver.json');
 }
 catch (_a20) {
    console.log("a20: ", _a20);
  }

let AddressAliasHelper;
try {
    AddressAliasHelper = require('../../../artifacts/contracts/standards/AddressAliasHelper.sol/AddressAliasHelper.json');
} catch(_a21) {
    console.log("a21: ", _a21);
}

let ISideNFTCore;
try {
    ISideNFTCore = require("../../../artifacts/contracts/SideChain/NFTCore/ISideNFTCore.sol/ISideNFTCore.json");
} catch(_a22) {
    console.log("a22: ", _a22);
}

let SideNFTCore;
try {
    SideNFTCore = require("../../../artifacts/contracts/SideChain/NFTCore/SideNFTCore.sol/SideNFTCore.json");
} catch(_a22) {
    console.log("a23: ", _a23);
}

let IMainNFTCore;
try {
    IMainNFTCore = require("../../../artifacts/contracts/MainChain/NFTCore/IMainNFTCore.sol/IMainNFTCore.json");
} catch(_a24) {
    console.log("a24: ", _a24);
}

let MainNFTCore;
try {
    MainNFTCore = require("../../../artifacts/contracts/MainChain/NFTCore/MainNFTCore.sol/MainNFTCore.json");
} catch(_a25) {
    console.log("a25: ", _a25);
}

const getContractArtifact = (name) => {
    return {
        IMainCrossDomainMessenger,
        IMainBridge,
        MainCrossDomainMessenger,
        MainBridge,
        CanonicalTransactionChain,
        ICanonicalTransactionChain,
        ISideCrossDomainMessenger,
        ISideBridge,
        SideCrossDomainMessenger,
        SideBridge,
        IOVM_SideToMainMessagePasser,
        OVM_DeployerWhitelist,
        OVM_SideToMainMessagePasser,
        CrossDomainEnabled,
        ICrossDomainMessenger,
        Lib_CrossDomainUtils,
        Lib_OVMCodec,
        Lib_DefaultValues,
        Lib_PredeployAddresses,
        Lib_AddressManager,
        Lib_AddressResolver,
        AddressAliasHelper,
        ISideNFTCore,
        SideNFTCore,
        IMainNFTCore,
        MainNFTCore,
    }[name];
};
exports.getContractArtifact = getContractArtifact;
