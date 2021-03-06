import { ChainId, JSBI, Percent, Token, WETH } from '@sphynxdex/sdk-multichain'
import { BUSD, DAI, USDT, BTCB, CAKE, WBNB, UST, ETH, USDC, SPHYNX } from './tokens'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ROUTER_ADDRESS = '0x0C8094a69e8e44404371676f07B2C32923B5699c' // sphynx router v1 for mainnet
export const ROUTER_ETH_ADDRESS = '0x98c98f9ac16b0207e73b6ce9868f68d3a5b9d018' // sphynx router v1 for ethereum
export const PANCAKE_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
export const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
export const FEE_WALLET = '0x074222A8A5b6A155A80C533A54E3ef5ED267AE16'
export const SPHYNX_OLD_TOKEN_ADDRESS = '0x2e121ed64eeeb58788ddb204627ccb7c7c59884c'
export const SPHYNX_TOKEN_ADDRESS = '0xe64972C311840cFaf2267DCfD365571F9D9544d9'
export const SPHYNX_PAIR_ADDRESS = '0x93561354a5a4687c54a64cf0aba56a0a392ae882'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.MAINNET]: [
    WETH[ChainId.MAINNET],
    SPHYNX[ChainId.MAINNET],
    CAKE[ChainId.MAINNET],
    BUSD[ChainId.MAINNET],
    USDT,
    BTCB,
    UST,
    ETH,
    USDC,
  ],
  [ChainId.TESTNET]: [WETH[ChainId.TESTNET], SPHYNX[ChainId.TESTNET], CAKE[ChainId.TESTNET], BUSD[ChainId.TESTNET]],
  [ChainId.ETHEREUM]: [WETH[ChainId.ETHEREUM]]
}

/**
 * Addittional bases for specific tokens
 * @example { [WBTC.address]: [renBTC], [renBTC.address]: [WBTC] }
 */
export const ADDITIONAL_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 * @example [AMPL.address]: [DAI, WETH[ChainId.MAINNET]]
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  [ChainId.MAINNET]: [BUSD[ChainId.MAINNET], CAKE[ChainId.MAINNET], BTCB],
  [ChainId.TESTNET]: [WETH[ChainId.TESTNET], CAKE[ChainId.TESTNET], BUSD[ChainId.TESTNET]],
  [ChainId.ETHEREUM]: [WETH[ChainId.ETHEREUM]]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET], DAI, BUSD[ChainId.MAINNET], USDT],
  [ChainId.TESTNET]: [WETH[ChainId.TESTNET], CAKE[ChainId.TESTNET], BUSD[ChainId.TESTNET]],
  [ChainId.ETHEREUM]: [WETH[ChainId.ETHEREUM]]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [CAKE[ChainId.MAINNET], WBNB],
    [BUSD[ChainId.MAINNET], USDT],
    [DAI, USDT],
  ],
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 100
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much BNB so they end up with <.01
export const MIN_BNB: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 BNB
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C',
]

export { default as farmsConfig } from './farms'
export { default as poolsConfig } from './pools'
export { default as ifosConfig } from './ifo'
