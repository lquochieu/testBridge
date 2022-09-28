import { eth, currentProvider } from "web3";

let provider = window.ethereum;
signTypedDataV4Button.addEventListener("click", async function (event) {
  event.preventDefault();

  const msgParams = JSON.stringify({
    domain: {
      // Defining the chain aka Rinkeby testnet or Ethereum Main Net
      chainId: 97,
      // Give a user friendly name to the specific contract you are signing for.
      name: "2_Owner",
      // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
      verifyingContract: "0x99C0Ef62Aef27b4D14AA74AFc002A69AC62f3764",
      // Just let's you know the latest version. Definitely make sure the field name is correct.
      version: "1",
    },

    // Defining the message signing data content.
    message: {
      addressOwner: "0x0a38Ad8281202e11fEE8F1c0E1eBED6C8E410015",
    },
    // Refers to the keys of the *types* object below.
    primaryType: "changeOwner",
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      changeOwner: [{ name: "addressOwner", type: "address" }],
    },
  });

  var from = await eth.getAccounts();

  var params = [from[0], msgParams];
  var method = "eth_signTypedData_v4";

  currentProvider.sendAsync(
    {
      method,
      params,
      from: from[0],
    },
    function (err, result) {
      if (err) return console.dir(err);
      if (result.error) {
        alert(result.error.message);
      }
      if (result.error) return console.error("ERROR", result);
      console.log("TYPED SIGNED:" + JSON.stringify(result.result));

      const recovered = sigUtil.recoverTypedSignature_v4({
        data: JSON.parse(msgParams),
        sig: result.result,
      });

      if (
        ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)
      ) {
        alert("Successfully recovered signer as " + from);
      } else {
        alert(
          "Failed to verify signer when comparing " + result + " to " + from
        );
      }
    }
  );
});
