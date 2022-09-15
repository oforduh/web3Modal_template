import React, { useState, useContext, useMemo, useCallback } from "react";
import Web3Modal from "web3modal";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { EnvHelper } from "../helper/Environment";
import { toast } from "react-toastify";

const Web3Context = React.createContext(null);

export const useWeb3Context = () => {
  const web3Context = useContext(Web3Context);
  if (!web3Context) {
    throw new Error(
      "useWeb3Context() can only be used inside of <Web3ContextProvider />, " +
        "please declare it at a higher level."
    );
  }
  const { onChainProvider } = web3Context;
  return useMemo(() => {
    return { ...onChainProvider };
  }, [web3Context]);
};

// destructure address from web3context
export const useAddress = () => {
  const { address } = useWeb3Context();
  return address;
};

export const Web3ContextProvider = ({ children }) => {
  const [uri, setUri] = useState(getMainnetURI());
  const [chainID, setChainID] = useState(1);
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(new StaticJsonRpcProvider(uri));
  const [address, setAddress] = useState("");

  function getTestnetURI() {
    return "https://data-seed-prebsc-1-s2.binance.org:8545";
  }

  function getMainnetURI() {
    return "https://bsc-dataseed.binance.org";
  }

  // integrated web3modal providers
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

  //   i haven't figured out this works yet
  const hasCachedProvider = () => {
    if (!web3Modal) return false;
    if (!web3Modal.cachedProvider) return false;
    return true;
  };

  // Check the chainId the user is on
  const _checkNetwork = (otherChainID) => {
    switch (otherChainID) {
      case 1:
        return true;
      default:
        return false;
    }
  };

  // detects if the chainId or metamask account has been changed
  const _initListeners = useCallback(
    (rawProvider) => {
      if (!rawProvider.on) {
        console.log("Not raw Provider");
        return;
      }
      // when wallet account is changed
      rawProvider.on("accountsChanged", async (accounts) => {
        console.log("accounts changed on raw provider");
        console.log(accounts);
        console.log(connectedAddress);
        setTimeout(() => window.location.reload(), 1);
      });
      // when chainId is changed
      rawProvider.on("chainChanged", async (chain) => {
        _checkNetwork(chain);
        console.log("chain changed on raw Provider");
        setTimeout(() => window.location.reload(), 1);
      });

      rawProvider.on("network", (_newNetwork, oldNetwork) => {
        console.log("old network on raw provider raw Provider");
        if (!oldNetwork) return;
        window.location.reload();
      });
    },
    [provider]
  );

  // this functionality handles connect wallet - only runs for WalletProviders
  const connect = useCallback(async () => {
    try {
      const rawProvider = await web3Modal.connect();
      await web3Modal.toggleModal();
      _initListeners(rawProvider);

      const connectedProvider = new Web3Provider(rawProvider, "any");

      const chainId = await connectedProvider
        .getNetwork()
        .then((network) => network.chainId);
      const validNetwork = _checkNetwork(chainId);
      if (!validNetwork) {
        return toast.warn(
          "Switch to the Etherium mainnet and click connect wallet"
        );
      }
      const connectedAddress = await connectedProvider.getSigner().getAddress();
      setAddress(connectedAddress);
      setProvider(connectedProvider);
      setConnected(true);
      return connectedProvider;
    } catch (error) {
      console.log(error);
    }
  }, [provider, web3Modal, connected]);

  // disconnect a user wallet after it has been connected
  const disconnect = useCallback(async () => {
    console.log("disconnecting");
    web3Modal.clearCachedProvider();
    setConnected(false);

    setTimeout(() => {
      window.location.reload();
    }, 1);
  }, [provider, web3Modal, connected]);

  //  saves the value using useMemo
  const onChainProvider = useMemo(
    () => ({
      connect,
      disconnect,
      hasCachedProvider,
      provider,
      connected,
      address,
      chainID,
      web3Modal,
    }),
    [
      connect,
      disconnect,
      hasCachedProvider,
      provider,
      connected,
      address,
      chainID,
      web3Modal,
    ]
  );
  return (
    <Web3Context.Provider value={{ onChainProvider }}>
      {children}
    </Web3Context.Provider>
  );
};
