import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { useAccount, useWriteContract, useReadContracts, useConnect, useChains, useWalletClient, useBalance } from 'wagmi';
import presaleAbi from '../PresaleContractABI.json'
import tokenAbi from '../TokenContractABI.json'
import { useState, useRef, useEffect } from 'react';
import { formatEther, parseEther } from 'viem';
import { walletConnect } from 'wagmi/connectors';


const Home: NextPage = () => {
  const [inputValue, setInputValue] = useState('0')
  const chains = useChains()
  const { connect } = useConnect()
  const account = useAccount()
  const { writeContract } = useWriteContract()
  const { connector, address, chainId } = useAccount()
  const { data: userBalance } = useBalance({ address: account.address, query: { enabled: account.isConnected } })
  const { data: walletClient } = useWalletClient()
  const [err, setErr] = useState<string | null>(null)

  const presaleContract = {
    address: '0x0D65E7DB70C8204C5bb2A64Afa18f6aE92ca254e',
    abi: presaleAbi,
    // chainId: 8453
    chainId
  } as const
  const tokenContract = {
    address: '0xfC83133193d436C7aB3F53f7b9d9358B8C2DD6A8',
    abi: tokenAbi,
    chainId
    // chainId: 8453
  } as const


  const connectWallet = () => {
    // Connect wallet logic using Rainbow SDK
    alert('Connect wallet functionality will be implemented using Rainbow SDK.');
  };

  const buyTokens = () => {
    console.log("CALLING BUY TOKENS")
    writeContract({
      ...presaleContract,
      functionName: "buyTokens",
      value: parseEther(inputValue),
      chainId

    }, {
      onError(error, variables, context) {
        console.log("ERROR", error)
      },
      onSuccess(data, variables, context) {
        console.log("SUCCESS", data)
      },
    })
    // Your buyTokens function logic here
  };

  const claimRefund = () => {
    console.log("CALLING CLAIM REFUND")
    writeContract({
      ...presaleContract,
      functionName: 'claimRefundAndReturnTokens',
      chainId
    }, {
      onError(error, variables, context) {
        console.log("ERROR", error)
        setErr(error.name)
      },
      onSuccess(data, variables, context) {
        console.log("SUCCESS", data)
      },
    })
    // Your claimRefund function logic here
  };

  const approveDRAIN = () => {
    // Your approveDRAIN function logic here
    console.log("CALLING approveDRAIN")
    writeContract({
      ...tokenContract,
      functionName: "approve",
      value: parseEther(inputValue),
      // chainId: 84532,
      chainId,
      args: [address, parseEther(inputValue)]
    }, {
      onError(error, variables, context) {
        console.log("ERROR", error)
      },
      onSuccess(data, variables, context) {
        console.log("SUCCESS", data)
      },
    })
  };

  const { data: contractsData, error: contractsErr, isError } = useReadContracts(
    {
      contracts: [
        {
          ...presaleContract,
          functionName: 'owner'
        },
        {
          ...presaleContract,
          functionName: 'softCap'
        },
        {
          ...presaleContract,
          functionName: 'hardCap'
        },
        {
          ...presaleContract,
          functionName: 'endTime'
        },
        {
          ...presaleContract,
          functionName: 'totalRaised'
        },
        {
          ...presaleContract,
          functionName: 'minContribution'
        },
        {
          ...presaleContract,
          functionName: 'maxContribution'
        },
      ],
      }

  useEffect(() => {
    if (contractsData) {
      console.log("OWNER", contractsData)
      console.log(new Date(Number(contractsData[3].result) * 1000).toLocaleString());
      console.log(userBalance ? formatEther(userBalance.value) + "ETH" : " NO BALANCE")
    }

    if (contractsErr) {
      console.log("ERROR", contractsErr)
    }

  }, [contractsData, contractsErr])
  return (
    <div className={styles.container}>
      <Head>
        <title>$DRAIN Presale</title>
        <meta
          content="Welcome to the $DRAIN Presale!"
          name="description"
        />
        <link rel="shortcut icon" href="https://i.ibb.co/gyKbhxy/bbonke-2048x1871.png" />
      </Head>

      <header className={styles.header}>
        <h1>BALL DRAINER Presale</h1>
        <div id="walletConnection">
          <ConnectButton />
          <p id="walletAddress" hidden></p>
        </div>
      </header>

      <main className={styles.main}>
        <img src="https://i.ibb.co/gyKbhxy/bbonke-2048x1871.png" alt="Example Image" width="200" height="150" />
        <h1>Welcome to The $DRAIN presale!</h1>
        <p><a href="https://basescan.org/address/0x0D65E7DB70C8204C5bb2A64Afa18f6aE92ca254e" target='_blank' style={{ color: '#FFFFFF', textDecoration: 'none' }}>Click Here For The Official Presale Contract</a></p>
        <div className={styles.sectionsContainer}>
          <section className={styles.section}>
            <h2>Buy Tokens</h2>
            <span style={{ float: "right", minWidth: '30px', textAlign: "right" }}>{inputValue}</span>
            <input id="buyAmount" type="range" placeholder="Amount in ETH" min={0} max={userBalance ? userBalance.formatted : 100} step={0.1} style={{ width: "100%" }} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button id="buyTokensButton" onClick={buyTokens} className={`${styles.button} ${styles.buyButton}`}>Buy</button>
            <p id="buyError" className="error"></p>
            <p>Minimum Contribution: <span id="minContribution"></span>{contractsData ? formatEther(contractsData[5]?.result as bigint ?? '') : '0'} ETH</p>
            <p>Maximum Contribution: <span id="maxContribution"></span>{contractsData ? formatEther(contractsData[6]?.result as bigint ?? '') : '0'} ETH</p>
          </section>
          <section className={styles.section}>
       		<h2>Presale Opens:</h2>
			<p id="endTime">{contractsData?.[3] && contractsData[3].result ? new Date((Number(contractsData[3].result) - (2 * 24 * 60 * 60)) * 1000).toLocaleString() : ''}</p>
            <h2>Presale Closes:</h2>
			<p id="endTime">{contractsData?.[3] && contractsData[3].result ? new Date(Number(contractsData[3].result) * 1000).toLocaleString() : ''}</p>
          </section>
          <section className={styles.section}>
            <h2>Presale Stats</h2>
            <p>ETH Raised: <span id="totalRaised"></span> {contractsData ? formatEther(contractsData[4]?.result as bigint ?? '') : '0'} ETH</p>
            <p>Softcap: <span id="softCap"></span> {contractsData ? formatEther(contractsData[1]?.result as bigint ?? '') : '0'} ETH</p>
            <p>Hardcap: <span id="hardCap"></span> {contractsData ? formatEther(contractsData[2]?.result as bigint ?? '') : '0'} ETH</p>
          </section>
        </div>
        <section className={styles.section}>
          <div id="refundSection" className="center-content">
            <h2>Claim Refund</h2>
            <p>This function will only work if the presale fails to reach the softcap!</p>
            <button id="refundButton" onClick={claimRefund} className={styles.button}>Claim Refund</button>
            <button id="approveButton" onClick={approveDRAIN} className={styles.button}>Approve DRAIN</button>
            <div id="refundError" style={{ textAlign: "center" }}>{err}</div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        2024 © BALLDRAINER
      </footer>
    </div>
  );
};

export default Home;
