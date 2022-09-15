import React, { useCallback, useState } from 'react'
import styles from "./navbar.module.scss"
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { EnvHelper } from '../../helper/Environment';

const Navbar = () => {

  function getTestnetURI() {
    return "https://data-seed-prebsc-1-s2.binance.org:8545";
  }
  
  function getMainnetURI() {
    return "https://bsc-dataseed.binance.org";
  }
  

  const [web3Modal, setWeb3Modal] = useState(new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions: { 
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            97: 'https://data-seed-prebsc-1-s2.binance.org:8545'
          },
          chainID: 97
        },
      },
    },
  }),);
  const [uri, setUri] = useState(getMainnetURI());
  const [chainID, setChainID] = useState(1);
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(new StaticJsonRpcProvider(uri));
  const [address, setAddress] = useState("")

  const _initListeners = useCallback(
    rawProvider => {
      if (!rawProvider.on) {
        console.log("Not raw Provider");
        return;
      }
      // when wallet account is changed
      rawProvider.on("accountsChanged", async (accounts) => {
        console.log("accounts changed on raw provider");
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
    [provider],
  );

  const _checkNetwork = (otherChainID) => {  
    console.error(
      "You are switching networks",
      EnvHelper.getOtherChainID(),
      otherChainID === EnvHelper.getOtherChainID() || otherChainID === 4,
    );
    // when chainID is not test-BSC, it will return false and processes are halt.
    if (chainID !== otherChainID) {
      console.warn("You are switching networks", EnvHelper.getOtherChainID());
      if (otherChainID === EnvHelper.getOtherChainID() || otherChainID === 4) {
        setChainID(otherChainID);
        otherChainID === EnvHelper.getOtherChainID() ? setUri(getMainnetURI()) : setUri(getTestnetURI());
        return true;
      }
      return false;
    }
    return true;
  };
    // connect - only runs for WalletProviders
    const connect = useCallback(async () => {
      const rawProvider = await web3Modal.connect();
      await web3Modal.toggleModal();
      console.log("This is the raw provider"+ rawProvider);
      console.log(rawProvider.on);
      _initListeners(rawProvider)
      const connectedProvider = new Web3Provider(rawProvider, "any");

      const chainId = await connectedProvider.getNetwork().then(network => network.chainId);
      console.log(chainId);
      const connectedAddress = await connectedProvider.getSigner().getAddress();
      console.log(connectedAddress);
      const validNetwork = _checkNetwork(chainId);
      console.log(validNetwork);
      if (!validNetwork) {
        alert("Wrong network, please switch to bsc testnet")
        console.error("Wrong network, please switch to bsc mainnet");
        return;
      }

      console.log(validNetwork);
      setAddress(connectedAddress);
      setProvider(connectedProvider);
      setConnected(true);
      return connectedProvider;
  
    }, [ provider, web3Modal,connected]);

    const disconnect = useCallback(async () => {
      console.log("disconnecting");
      web3Modal.clearCachedProvider();
      setConnected(false);
  
      setTimeout(() => {
        window.location.reload();
      }, 1);
    }, [provider, web3Modal, connected]);
  
    console.log(`This is our address ${address}`);
  return (
    <div className={styles.container}>

        <div className={styles.navbar_container}>
            <div>Web3Modal</div>
            <div><button onClick={()=>{
            {!connected? connect():disconnect()}
            }}>{connected?address:"connect wallet"}</button></div>

        </div>
    </div>
  )
}

export default Navbar