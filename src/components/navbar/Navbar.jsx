import React, { useCallback, useState } from "react";
import styles from "./navbar.module.scss";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { EnvHelper } from "../../helper/Environment";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { toast } from "react-toastify";

const Navbar = () => {
  function getTestnetURI() {
    return "https://data-seed-prebsc-1-s2.binance.org:8545";
  }

  function getMainnetURI() {
    return "https://bsc-dataseed.binance.org";
  }

  const [web3Modal, setWeb3Modal] = useState(
    new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            rpc: {
              97: "https://data-seed-prebsc-1-s2.binance.org:8545",
            },
            chainID: 97,
          },
        },
        binancechainwallet: {
          package: true,
        },
        coinbasewallet: {
          package: CoinbaseWalletSDK, // Required
          options: {
            appName: "My Awesome App", // Required
            rpc: {
              97: "https://data-seed-prebsc-1-s2.binance.org:8545",
            },
            chainID: 97,
          },
        },
      },
    })
  );
  const [uri, setUri] = useState(getMainnetURI());
  const [chainID, setChainID] = useState(1);
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(new StaticJsonRpcProvider(uri));
  const [address, setAddress] = useState("");

  const _initListeners = useCallback(
    (rawProvider) => {
      console.log(rawProvider);
      if (!rawProvider.on) {
        console.log("Not raw Provider");
        return;
      }
      // when wallet account is changed
      rawProvider.on("accountsChanged", async (accounts) => {
        console.log("accounts changed on raw provider");
        // setTimeout(() => window.location.reload(), 1);
      });
      // when chainId is changed
      rawProvider.on("chainChanged", async (chain) => {
        _checkNetwork(chain);
        console.log("chain changed on raw Provider");
        // setTimeout(() => window.location.reload(), 1);
      });

      rawProvider.on("network", (_newNetwork, oldNetwork) => {
        console.log("old network on raw provider raw Provider");
        if (!oldNetwork) return;
        // window.location.reload();
      });
    },
    [provider]
  );

  const _checkNetwork = (otherChainID) => {
    switch (otherChainID) {
      case 1:
        return true;
      default:
        return false;
    }
  };
  // connect - only runs for WalletProviders
  const connect = useCallback(async () => {
    const rawProvider = await web3Modal.connect();
    await web3Modal.toggleModal();
    let liz = _initListeners(rawProvider);
    console.log(liz);

    const connectedProvider = new Web3Provider(rawProvider, "any");

    const chainId = await connectedProvider
      .getNetwork()
      .then((network) => network.chainId);
    console.log(chainId);
    const validNetwork = _checkNetwork(chainId);
    if (!validNetwork) {
      return toast.warn(
        "Switch to the Etherium mainnet and click connect wallet"
      );
    }

    const connectedAddress = await connectedProvider.getSigner().getAddress();
    console.log(connectedAddress);

    console.log(validNetwork);
    setAddress(connectedAddress);
    setProvider(connectedProvider);
    setConnected(true);
    return connectedProvider;
  }, [provider, web3Modal, connected]);

  const disconnect = useCallback(async () => {
    console.log("disconnecting");
    web3Modal.clearCachedProvider();
    setConnected(false);

    setTimeout(() => {
      window.location.reload();
    }, 1);
  }, [provider, web3Modal, connected]);

  let ellipsis = address
    ? `${address.slice(0, 3)}
    ...${address.slice(address.length - 5, address.length)}`
    : "Connect Wallet";

  return (
    <div className={styles.container}>
      <div className={styles.navbar_container}>
        <div>Web3Modal</div>
        <div>
          <button
            onClick={() => {
              {
                !connected ? connect() : disconnect();
              }
            }}
          >
            {connected ? ellipsis : "connect wallet"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
