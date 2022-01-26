import { Currency, CurrencyAmount, ETHER, JSBI, Pair, Percent, Price, TokenAmount } from '@sphynxdex/sdk-multichain'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { PairState, usePair } from 'hooks/usePairs'
import useTotalSupply from 'hooks/useTotalSupply'

import { wrappedCurrency, wrappedCurrencyAmount } from 'utils/wrappedCurrency'
import { AppDispatch, AppState } from '../index'
import { tryParseAmount } from '../swap/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, typeInput } from './actions'


const ZERO = JSBI.BigInt(0)

export function useBridgeState(): AppState['bridge'] {
  return useSelector<AppState, AppState['bridge']>((state) => state.bridge)
}

export function useBridgeActionHandlers(): {
  onFieldSpxInput: (typedValue: string) => void
  onFieldOthInput: (typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onFieldSpxInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.BRIDGE_TOKENSPX, typedValue}))
    },
    [dispatch],
  )
  const onFieldOthInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.BRIDGE_TOKENOTH, typedValue}))
    },
    [dispatch],
  )
  return {
    onFieldSpxInput,
    onFieldOthInput
  }
}

export function useDerivedBridgeInfo(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): {
  dependentField: Field
  currencies: { [field in Field]?: Currency }
  pair?: Pair | null
  pairState: PairState
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  price?: Price
  noLiquidity?: boolean
  liquidityMinted?: TokenAmount
  poolTokenPercentage?: Percent
  error?: string
} {
  const { account, chainId } = useActiveWeb3React()

  const { independentField, typedValue } = useBridgeState()

  const dependentField = independentField === Field.BRIDGE_TOKENSPX ? Field.BRIDGE_TOKENOTH : Field.BRIDGE_TOKENSPX

  // tokens
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.BRIDGE_TOKENSPX]: currencyA ?? undefined,
      [Field.BRIDGE_TOKENOTH]: currencyB ?? undefined,
    }),
    [currencyA, currencyB],
  )

  // pair
  const [pairState, pair] = usePair(currencies[Field.BRIDGE_TOKENSPX], currencies[Field.BRIDGE_TOKENOTH])

  const totalSupply = useTotalSupply(pair?.liquidityToken)

  const noLiquidity: boolean =
    pairState === PairState.NOT_EXISTS || Boolean(totalSupply && JSBI.equal(totalSupply.raw, ZERO))

  // balances
  const balances = useCurrencyBalances(account ?? undefined, [
    currencies[Field.BRIDGE_TOKENSPX],
    currencies[Field.BRIDGE_TOKENOTH],
  ])
  const currencyBalances: { [field in Field]?: CurrencyAmount } = {
    [Field.BRIDGE_TOKENSPX]: balances[0],
    [Field.BRIDGE_TOKENOTH]: balances[1],
  }

  // amounts
  const independentAmount: CurrencyAmount | undefined = tryParseAmount(typedValue, currencies[independentField])
  const dependentAmount: CurrencyAmount | undefined = useMemo(() => {
    if (independentAmount) {
      // we wrap the currencies just to get the price in terms of the other token
      const wrappedIndependentAmount = wrappedCurrencyAmount(independentAmount, chainId)
      const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
      if (tokenA && tokenB && wrappedIndependentAmount && pair) {
        const dependentCurrency = dependentField === Field.BRIDGE_TOKENOTH ? currencyB : currencyA
        const dependentTokenAmount =
          dependentField === Field.BRIDGE_TOKENOTH
            ? pair.priceOf(tokenA).quote(wrappedIndependentAmount)
            : pair.priceOf(tokenB).quote(wrappedIndependentAmount)
        return dependentCurrency === ETHER[chainId] ? CurrencyAmount.ether(dependentTokenAmount.raw) : dependentTokenAmount
      }
      return undefined
    }
    return undefined
  }, [ dependentField, independentAmount, currencyA, chainId, currencyB, pair])

  const parsedAmounts: { [field in Field]: CurrencyAmount | undefined } = useMemo(
    () => ({
      [Field.BRIDGE_TOKENSPX]: independentField === Field.BRIDGE_TOKENSPX ? independentAmount : dependentAmount,
      [Field.BRIDGE_TOKENOTH]: independentField === Field.BRIDGE_TOKENSPX ? dependentAmount : independentAmount,
    }),
    [dependentAmount, independentAmount, independentField],
  )

  const price = useMemo(() => {
    if (noLiquidity) {
      const { [Field.BRIDGE_TOKENSPX]: currencyAAmount, [Field.BRIDGE_TOKENOTH]: currencyBAmount } = parsedAmounts
      if (currencyAAmount && currencyBAmount) {
        return new Price(currencyAAmount.currency, currencyBAmount.currency, currencyAAmount.raw, currencyBAmount.raw)
      }
      return undefined
    }
    const wrappedCurrencyA = wrappedCurrency(currencyA, chainId)
    return pair && wrappedCurrencyA ? pair.priceOf(wrappedCurrencyA) : undefined
  }, [chainId, currencyA, noLiquidity, pair, parsedAmounts])

  // liquidity minted
  const liquidityMinted = useMemo(() => {
    const { [Field.BRIDGE_TOKENSPX]: currencyAAmount, [Field.BRIDGE_TOKENOTH]: currencyBAmount } = parsedAmounts
    const [tokenAmountA, tokenAmountB] = [
      wrappedCurrencyAmount(currencyAAmount, chainId),
      wrappedCurrencyAmount(currencyBAmount, chainId),
    ]
    if (pair && totalSupply && tokenAmountA && tokenAmountB) {
      return pair.getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB)
    }
    return undefined
  }, [parsedAmounts, chainId, pair, totalSupply])

  const poolTokenPercentage = useMemo(() => {
    if (liquidityMinted && totalSupply) {
      return new Percent(liquidityMinted.raw, totalSupply.add(liquidityMinted).raw)
    }
    return undefined
  }, [liquidityMinted, totalSupply])

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }

  if (pairState === PairState.INVALID) {
    error = error ?? 'Invalid pair'
  }

  if (!parsedAmounts[Field.BRIDGE_TOKENSPX] || !parsedAmounts[Field.BRIDGE_TOKENOTH]) {
    error = error ?? 'Enter an amount'
  }

  const { [Field.BRIDGE_TOKENSPX]: currencyAAmount, [Field.BRIDGE_TOKENOTH]: currencyBAmount } = parsedAmounts

  if (currencyAAmount && currencyBalances?.[Field.BRIDGE_TOKENSPX]?.lessThan(currencyAAmount)) {
    error = `Insufficient ${currencies[Field.BRIDGE_TOKENSPX]?.symbol} balance`
  }

  if (currencyBAmount && currencyBalances?.[Field.BRIDGE_TOKENOTH]?.lessThan(currencyBAmount)) {
    error = `Insufficient ${currencies[Field.BRIDGE_TOKENOTH]?.symbol} balance`
  }

  return {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  }
}

