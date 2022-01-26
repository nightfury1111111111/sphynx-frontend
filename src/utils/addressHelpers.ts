import { ChainId } from '@sphynxdex/sdk-multichain'
import addresses from 'config/constants/contracts'
import tokens from 'config/constants/tokens'
import { Address } from 'config/constants/types'

export const getAddress = (address: Address, defaultChainId = null): string => {
  if(defaultChainId === null) {
    const chainId = parseInt(window?.ethereum?.networkVersion || window?.trustwallet?.Provider?.chainId)
    return address[chainId] ? address[chainId] : address[ChainId.MAINNET]
  } 
  return address[defaultChainId] ? address[defaultChainId] : undefined
}

export const getCakeAddress = () => {
  return getAddress(tokens.sphynx.address)
}
export const getSphynxAddress = () => {
  return getAddress(tokens.sphynx.address)
}
export const getMasterChefAddress = () => {
  return getAddress(addresses.masterChef)
}
export const getMulticallAddress = () => {
  return getAddress(addresses.multiCall)
}
export const getWbnbAddress = () => {
  return getAddress(tokens.wbnb.address)
}
export const getLotteryV2Address = () => {
  return getAddress(addresses.lotteryV2)
}
export const getPancakeProfileAddress = () => {
  return getAddress(addresses.pancakeProfile)
}
export const getPancakeRabbitsAddress = () => {
  return getAddress(addresses.pancakeRabbits)
}
export const getBunnyFactoryAddress = () => {
  return getAddress(addresses.bunnyFactory)
}
export const getClaimRefundAddress = () => {
  return getAddress(addresses.claimRefund)
}
export const getPointCenterIfoAddress = () => {
  return getAddress(addresses.pointCenterIfo)
}
export const getBunnySpecialAddress = () => {
  return getAddress(addresses.bunnySpecial)
}
export const getTradingCompetitionAddress = () => {
  return getAddress(addresses.tradingCompetition)
}
export const getEasterNftAddress = () => {
  return getAddress(addresses.easterNft)
}
export const getCakeVaultAddress = () => {
  return getAddress(addresses.cakeVault)
}
export const getPredictionsAddress = () => {
  return getAddress(addresses.predictions)
}
export const getChainlinkOracleAddress = () => {
  return getAddress(addresses.chainlinkOracle)
}
export const getBunnySpecialCakeVaultAddress = () => {
  return getAddress(addresses.bunnySpecialCakeVault)
}
export const getBunnySpecialPredictionAddress = () => {
  return getAddress(addresses.bunnySpecialPrediction)
}
export const getFarmAuctionAddress = () => {
  return getAddress(addresses.farmAuction)
}
export const getPresaleAddress = (chainId = 56) => {
  return getAddress(addresses.presale, chainId)
}
export const getSphynxRouterAddress = (chainId = 56) => {
  return getAddress(addresses.sphynxRouter, chainId)
}
export const getRouterAddress = (chainId = 56) => {
  return getAddress(addresses.pancakeRouter, chainId)
}
export const getLockerAddress = (chainId = 56) => {
  return getAddress(addresses.locker, chainId)
}
export const getFairLaunchAddress = (chainId = 56) => {
  return getAddress(addresses.fairLaunch, chainId)
}
