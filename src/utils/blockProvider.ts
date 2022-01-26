import { ethers } from 'ethers'
import masterchefABI from 'config/abi/masterchef.json'
import { getMasterChefAddress } from 'utils/addressHelpers'
import {simpleRpcProvider} from 'utils/providers'

export const getSphynxPerBlock: any = async () => {
    const masterChefAddress = getMasterChefAddress()
    const masterChef = new ethers.Contract(masterChefAddress, masterchefABI, simpleRpcProvider)
    const sphynxPerBlock = (await masterChef.sphynxPerBlock()) / (10 ** 18)
    return sphynxPerBlock
}
