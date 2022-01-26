import {
  SPHYNX_FACTORY_ADDRESS,
  PANCAKE_FACTORY_ADDRESS,
  SPHYNX_ETH_FACTORY_ADDRESS,
  UNISWAP_FACTORY_ADDRESS,
} from '@sphynxdex/sdk-multichain'
import { WETH_ADDRESS } from 'config/constants/addresses'
import factoryAbi from 'config/abi/factoryAbi.json'
import Web3 from 'web3'
import { web3Provider, ethWeb3Provider } from 'utils/providers'
import { WBNB } from 'config/constants/tokens'
import {
  getChartData,
  getMarksData,
  getChartDurationData,
  getChartDurationPanData,
  getTokenInfoForChart,
} from 'utils/apiServices'

const web3 = new Web3(web3Provider)
const web3ETH = new Web3(ethWeb3Provider)
const abi: any = factoryAbi
const sphynxFactoryContract = new web3.eth.Contract(abi, SPHYNX_FACTORY_ADDRESS)
const sphynxEthFactoryContract = new web3ETH.eth.Contract(abi, SPHYNX_ETH_FACTORY_ADDRESS)
const pancakeFactoryContract = new web3.eth.Contract(abi, PANCAKE_FACTORY_ADDRESS)
const uniswapFactoryContract = new web3ETH.eth.Contract(abi, UNISWAP_FACTORY_ADDRESS)

export async function getHistoricalData(path: any, routerVersion: any, resolution: any, chainId = 56) {
  try {
    if (chainId === 1) {
      const factoryContract = routerVersion === 'sphynx' ? sphynxEthFactoryContract : uniswapFactoryContract
      const pairAddress = await factoryContract.methods.getPair(path, WETH_ADDRESS).call()
      const data: any = await getChartData(path, pairAddress, resolution, routerVersion, chainId)
      return data
    }
    const factoryContract = routerVersion === 'sphynx' ? sphynxFactoryContract : pancakeFactoryContract
    const pairAddress = await factoryContract.methods.getPair(path, WBNB.address).call()
    const data: any = await getChartData(path, pairAddress, resolution, routerVersion)
    return data
  } catch (error) {
    console.log('error', error)
    return []
  }
}

export async function getTokenInfo(path: any, routerVersion: any, chainId = 56) {
  try {
    if (chainId === 1) {
      const factoryContract = routerVersion === 'sphynx' ? sphynxEthFactoryContract : uniswapFactoryContract
      if (routerVersion === 'sphynx') {
        const pairAddress = await factoryContract.methods.getPair(path, WETH_ADDRESS).call()
        const data: any = await getTokenInfoForChart(path, pairAddress, routerVersion, chainId)
        return data
      }
      const data: any = await getTokenInfoForChart(path, '', routerVersion, chainId)
      return data
    }
    const factoryContract = routerVersion === 'sphynx' ? sphynxFactoryContract : pancakeFactoryContract
    if (routerVersion === 'sphynx') {
      const pairAddress = await factoryContract.methods.getPair(path, WBNB.address).call()
      const data: any = await getTokenInfoForChart(path, pairAddress, routerVersion, chainId)
      return data
    }
    const data: any = await getTokenInfoForChart(path, '', routerVersion, chainId)
    return data
  } catch (error) {
    console.log('error', error)
    return []
  }
}

export function generateSymbol(exchange: any, fromSymbol: any, toSymbol: any) {
  const short = `${fromSymbol}/${toSymbol}`
  return {
    short,
    full: `${exchange}:${short}`,
  }
}

export function parseFullSymbol(fullSymbol: any) {
  const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/)
  if (!match) {
    return null
  }
  return {
    exchange: match[1],
    fromSymbol: match[2],
    toSymbol: match[3],
  }
}

export async function getAllTransactions(account: any, path: any, chainId = 56) {
  try {
    const data: any = await getMarksData(account, path)
    return data
  } catch (error) {
    console.log('error', error)
    return []
  }
}

export async function makeApiDurationRequest(
  path: any,
  routerVersion: any,
  resolution: any,
  to: any,
  countBack: any,
  chainId = 56,
) {
  try {
    if (chainId === 1) {
      const factoryContract = routerVersion === 'sphynx' ? sphynxEthFactoryContract : uniswapFactoryContract
      const pairAddress = await factoryContract.methods.getPair(path, WETH_ADDRESS).call()
      const data: any =
        routerVersion === 'sphynx'
          ? await getChartDurationData(path, pairAddress, resolution, to, countBack, chainId)
          : await getChartDurationPanData(path, routerVersion, resolution, to, countBack, chainId)
      return data
    }
    const factoryContract = routerVersion === 'sphynx' ? sphynxFactoryContract : pancakeFactoryContract
    const pairAddress = await factoryContract.methods.getPair(path, WBNB.address).call()
    const data: any =
      routerVersion === 'sphynx'
        ? await getChartDurationData(path, pairAddress, resolution, to, countBack, chainId)
        : await getChartDurationPanData(path, routerVersion, resolution, to, countBack, chainId)
    return data
  } catch (error) {
    console.log('error', error)
    return []
  }
}
