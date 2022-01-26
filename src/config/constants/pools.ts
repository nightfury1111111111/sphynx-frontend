import tokens from './tokens'
import { PoolConfig, PoolCategory } from './types'

const pools: PoolConfig[] = [
  {
    sousId: 0,
    stakingToken: tokens.sphynx,
    earningToken: tokens.sphynx,
    contractAddress: {
      97: '0xEE0C0E647d6E78d74C42E3747e0c38Cef41d6C88',
      56: '0x39dDE712D0B08C3Ce11AF7bd5b6E2ef9A495D3Be',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '37.5',
    sortOrder: 1,
    isFinished: false,
  },
]

export default pools
