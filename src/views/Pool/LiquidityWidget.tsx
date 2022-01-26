import React, { useCallback, useMemo } from 'react'
import { Pair } from '@sphynxdex/sdk-multichain'
import { Text, CardBody, CardFooter, Button, AddIcon } from '@sphynxdex/uikit'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import AddLiquidityWidget from 'views/AddLiquidity/AddLiquidityWidget'
import RemoveLiquidityWidget from 'views/RemoveLiquidity/RemoveLiquidityWidget'
import { useTheme } from 'styled-components'
import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { usePairs } from '../../hooks/usePairs'
import { useSwapType, useSetRouterType } from '../../state/application/hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import Dots from '../../components/Loader/Dots'
import { AppHeader } from '../../components/App'

export default function LiquidityWidget() {
  const { account } = useActiveWeb3React()
  const { routerType } = useSetRouterType()
  const theme = useTheme()

  const { t } = useTranslation()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken([routerType, ...tokens]), tokens })),
    [trackedTokenPairs, routerType],
  )
  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  )
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens,
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  const renderBody = () => {
    if (!account) {
      return (
        <Text color="textSubtle" textAlign="center">
          {t('Connect to a wallet to view your liquidity.')}
        </Text>
      )
    }
    if (v2IsLoading) {
      return (
        <Text color="textSubtle" textAlign="center">
          <Dots>{t('Loading')}</Dots>
        </Text>
      )
    }
    if (allV2PairsWithLiquidity?.length > 0) {
      return allV2PairsWithLiquidity.map((v2Pair, index) => (
        <FullPositionCard
          key={v2Pair.liquidityToken.address}
          pair={v2Pair}
          mb={index < allV2PairsWithLiquidity.length - 1 ? '16px' : 0}
        />
      ))
    }
    return (
      <Text color="textSubtle" textAlign="center">
        {t('No liquidity found.')}
      </Text>
    )
  }

  const { swapType, setSwapType } = useSwapType()

  const handleSwapType = useCallback(() => {
    setSwapType('addLiquidity')
  }, [setSwapType])

  return (
    <div>
      {swapType === 'addLiquidity' ? (
        <AddLiquidityWidget />
      ) : swapType === 'removeLiquidity' ? (
        <RemoveLiquidityWidget />
      ) : (
        <>
          <AppHeader title={t('Your Liquidity')} subtitle={t('Remove liquidity to receive tokens back')} />
          <CardBody style={{ padding: '24px 0px' }}>
            {renderBody()}
          </CardBody>
          <CardFooter style={{ textAlign: 'center', padding: '24px 0px 0px', borderTop: `1px solid ${theme.isDark ? "#21214A" : "#4A5187"}`}}>
            <Button
              id="join-pool-button"
              onClick={handleSwapType}
              width="100%"
              startIcon={<AddIcon color="white" />}
            >
              {t('Add Liquidity')}
            </Button>
          </CardFooter>
        </>
      )}
    </div>
  )
}
