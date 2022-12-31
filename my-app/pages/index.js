import Head from 'next/head'

import styles from '../styles/Home.module.css'
import { useEffect, useRef, useState } from 'react'

import Web3Modal from "web3modal";
import { Contract, providers } from 'ethers';
import { abi, WHITELIST_CONTRACT_ADDRESS } from '../constants';


export default function Home() {

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const web3ModelRef = useRef();

  useEffect(() => {
  if(!walletConnected){
    web3ModelRef.current = new Web3Modal({
      network: "goerli",
      providerOptions:{},
      disableInjectedProvider: false
    })

    connectWallet();
  }
   
  }, [walletConnected])

  const getProviderOrSigner = async( needSigner = false ) => {
    try {

      const provider = await web3ModelRef.current.connect();
      const web3Provider = new providers.Web3Provider( provider );
      const { chainId } = await web3Provider.getNetwork();

      if(chainId !== 5){
        window.alert("Change the network to Goerli");
        throw new Error("Change netwrok to Goerli")
      }

      if( needSigner ) return web3Provider.getSigner();

      return web3Provider;

    } catch (error) {
      console.error(error);
    }

  }

  const checkIfAddressInWhitelist = async() => {
    try {
      const signer = await getProviderOrSigner( true );

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses( address );

      setJoinedWhitelist(_joinedWhitelist);

    } catch (error) {
      console.error(error);
    }
  }

  const getNumberOfWhitelisted = async() => {
    try {
      
      const provider = await getProviderOrSigner();

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      )

      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);

    } catch (error) {
      console.error(error);
    }
  }

  const addAddressToWhitelist = async() => {
    try {
      
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )
      
      setLoading(true)
      const tx = await whitelistContract.addAddressToWhitelist();
      await tx.wait();

      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);

      setLoading(false)

    } catch (error) {
      console.error(error);
    }
  }

  const renderButton = () => {
    if( walletConnected ){
      if(joinedWhitelist){
        return <div className={ styles.description }>Thanks for joining the Whitelist</div>
      }else if( loading ){
        return <div>...Loading</div>
      }else{
        return(
          <button 
            onClick={ addAddressToWhitelist }
            className={ styles.button }
          >
            Join the Whitelist
          </button>
        )
      }
    }else{
      return(
        <button 
          onClick={ connectWallet }
          className={ styles.button }
        >
          Connect your wallet
        </button>
      )
    }
  }

  const connectWallet = async() => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (error) {
      console.error(error);
    }
  }
  

  return (
    <div>
      <Head>
        <title>Whitelist dApp</title>
        <meta name="description" content="Whitelist-Dapp" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>


      <footer className={ styles.footer }>
        Made with &#10084; Crypto Devs
      </footer>
    </div>
  )
}
