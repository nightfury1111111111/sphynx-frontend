import { useCallback } from 'react'
import { harvestFarm } from 'utils/calls'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ChainId } from '@sphynxdex/sdk-multichain'
import { useMasterchef } from 'hooks/useContract'

const useHarvestFarm = (farmPid: number) => {
  const masterChefContract = useMasterchef()
  const { chainId } = useActiveWeb3React()

  const handleHarvest = useCallback(async () => {
    await harvestFarm(masterChefContract, farmPid)
  }, [farmPid, masterChefContract])

  if(chainId !== ChainId.MAINNET) {
    return { onReward: () => false }
  }

  return { onReward: handleHarvest }
}

export default useHarvestFarm
