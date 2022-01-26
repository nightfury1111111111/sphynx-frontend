/* eslint-disable */
import Web3 from 'web3'
import { ethers } from 'ethers'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useEffect, useMemo, useState, useCallback } from 'react'

import { simpleRpcProvider } from '../utils/providers'
import { getLotteryV2Address, getSphynxAddress } from 'utils/addressHelpers'
import getNodeUrl from 'utils/getRpcUrl'
import { reverseString } from 'utils'

import ETHSwapAgentabi from "assets/abis/ETHSwapAgentImp.json"
import BSCSwapAgentabi from "assets/abis/BSCSwapAgentImp.json"
import ERC20ABI from "assets/abis/ERC20Org.json"

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))
let web3Bsc = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545"))

const ethswapaddress = '0xe33a3b122741b1ace0f7A124118DEfF55175084f'
const bscswapaddress = '0x1CE53835d9C59a98AbF691466EEf1fc590346776'

const erc20Addr = '0x7947d900F7683C7643aD3d884a781B692759cb83';
const bep20Addr = '0x09Aca9A3A27df3ae407b6590263C3E360B4179Ed';

const ethabi: any = ETHSwapAgentabi.abi
const bscAbi: any = BSCSwapAgentabi.abi
const erc20abi: any = ERC20ABI.abi
const ethSwapContract = new ethers.Contract(ethswapaddress, ethabi, new ethers.providers.JsonRpcProvider("http://localhost:7545"));
const bscSwapContract = new ethers.Contract(bscswapaddress, bscAbi, new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545"))
const bscSwapWeb3Contract = new web3.eth.Contract(bscAbi, bscswapaddress);
const erc20Contract = new ethers.Contract(erc20Addr, erc20abi, new ethers.providers.JsonRpcProvider("http://localhost:7545"))
const erc20ContractWeb3 = new web3.eth.Contract(erc20abi, erc20Addr)
const bep20Contract = new ethers.Contract(bep20Addr, erc20abi, new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545"))
const bep20ContractWeb3 = new web3.eth.Contract(erc20abi, bep20Addr)


const deepEqual = (object1, object2) => {
  if (object1 === null || object2 === null) return false
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    const val1 = object1[key]
    const val2 = object2[key]
    const areObjects = isObject(val1) && isObject(val2)
    if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      return false
    }
  }
  return true
}

const isObject = (object) => {
  return object != null && typeof object === 'object'
}

export const getBSCApproveAmount = async (account: string) => {
  const response = await erc20ContractWeb3.methods.allowance(account, erc20Addr).call()
  return response
}

export const getETHApproveAmount = async (account: string) => {
  const response = await bep20ContractWeb3.methods.allowance(account, bep20Addr).call()
  return response
}

export const onUseSwapBSC2ETH = async (signer, amount) => {
  try {
   {
      const regTX = await bscSwapContract.connect(signer).swapBSC2ETH(bep20Addr,  ethers.utils.parseEther(amount), {value:ethers.utils.parseEther('0.01')});
      const receipt = await regTX.wait();
      if (receipt.status === 1) {
        console.log("success");
      } else {
        console.error("fail");
      }
    }
    
    
  } catch (error) {
    console.error("fail" , error);
  } finally{

  }
};

export const onUseSwapETH2BSC = async (signer, amount) => {
  try {
    const regTX = await ethSwapContract.connect(signer).swapETH2BSC(erc20Addr,  ethers.utils.parseEther(amount), {value:ethers.utils.parseEther('1')});
    const receipt = await regTX.wait();
    if (receipt.status === 1) {
      console.log("success");
    } else {
      console.error("fail");
    }
  } catch (error) {
    console.error("fail" , error);
  } finally{

  }
};

export const onUseEthApprove = async (signer, amount) => {
  try {
    const regTX = await erc20Contract.connect(signer)
      .approve(ethswapaddress, ethers.utils.parseEther(amount))
    const receipt = await regTX.wait()
    if (receipt.status === 1) {
      console.log("success5");
    } else {
      console.error("fail5");
    }
  } catch (error) {
    console.error("fail5" , error);
  } finally{

  }
};

export const onUseBSCApprove = async (signer, amount) => {
  try {
    const regTX = await bep20Contract.connect(signer)
      .approve(bscswapaddress, ethers.utils.parseEther(amount))
    const receipt = await regTX.wait()
    if (receipt.status === 1) {
      console.log("success5");
    } else {
      console.error("fail5");
    }
  } catch (error) {
    console.error("fail5" , error);
  } finally{
  }
};

export const onUseRegister = async (signer) => {
  try {
    const regTX = await ethSwapContract.connect(signer).
      registerSwapPairToBSC(erc20Addr, bep20Addr)
    const receipt = await regTX.wait()
    if (receipt.status === 1) {
      console.log("success");
    } else {
      console.error("fail");
    }
  } catch (error) {
    console.error("fail" , error);
  } finally{

  }
};

export const onUseSwapFee = async (signer) => {
  try{
    const regTX = await ethSwapContract.connect(signer).
    setSwapFee(ethers.utils.parseEther('1'))
    const receipt = await regTX.wait();
    if (receipt.status === 1) {
      console.log("success2");
    } else {
      console.error("fail2");
    }
  } catch {
    console.log("error2");
  } finally {
    
  }
  // console.log(receipt);
}

export const onUseBscSwapFee = async (signer) => {
  try{
    const regTX = await bscSwapContract.connect(signer).
    setSwapFee(ethers.utils.parseEther('0.01'))
    const receipt = await regTX.wait();
    if (receipt.status === 1) {
      console.log("success2");
    } else {
      console.error("fail2");
    }
  } catch {
    console.log("error2");
  } finally {
    
  }
  // console.log(receipt);
}
