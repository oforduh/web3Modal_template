import React, { useCallback, useState } from "react";
import styles from "./navbar.module.scss";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { EnvHelper } from "../../helper/Environment";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { toast } from "react-toastify";
import { useAddress, useWeb3Context } from "../../context/web3Context";

const Navbar = () => {
  const address = useAddress();
  const { connect, disconnect, connected } = useWeb3Context();

  // format the address
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
