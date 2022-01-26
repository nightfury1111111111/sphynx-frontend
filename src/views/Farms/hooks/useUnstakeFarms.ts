import { useCallback } from 'react'
import { unstakeFarm } from 'utils/calls'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ChainId } from '@sphynxdex/sdk-multichain'
import { useMasterchef } from 'hooks/useContract'

const useUnstakeFarms = (pid: number) => {
  const masterChefContract = useMasterchef()

  const { chainId } = useActiveWeb3React()

  const handleUnstake = useCallback(
    async (amount: string) => {
      await unstakeFarm(masterChefContract, pid, amount)
    },
    [masterChefContract, pid],
  )

  if(chainId !== ChainId.MAINNET) {
    return { onUnstake: () => false }
  }

  return { onUnstake: handleUnstake }
}

export default useUnstakeFarms
