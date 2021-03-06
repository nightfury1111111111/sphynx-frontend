import React from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { useTranslation } from 'contexts/Localization'
import {
  Flex,
  MetamaskIcon,
  Text,
  TooltipText,
  LinkExternal,
  TimerIcon,
  Skeleton,
  useTooltip,
  Button,
  Link,
  HelpIcon,
} from '@sphynxdex/uikit'
import { BASE_BSC_SCAN_URL } from 'config'
import { useBlock } from 'state/block/hooks'
import { useCakeVault } from 'state/pools/hooks'
import { Pool } from 'state/types'
import { getAddress, getCakeVaultAddress } from 'utils/addressHelpers'
import { registerToken } from 'utils/wallet'
import { getBscScanLink } from 'utils'
import Balance from 'components/Balance'
import { getPoolBlockInfo } from 'views/Pools/helpers'
import SphynxTokenLogo from 'assets/images/MainLogo.png'

interface ExpandedFooterProps {
  pool: Pool
  account: string
}

const ExpandedWrapper = styled(Flex)`
  svg {
    height: 14px;
    width: 14px;
  }
`

const LinkContainer = styled(Flex)`
  flex-direction: column;
  align-items: center;
`

const ItemLink = styled(Flex)`
  width: 100%;
  align-items: center;
  justify-content: center;
  border: 1px solid #2E2E55;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 9px 2px;
  ${({ theme }) => theme.mediaQueries.xs} {
    padding: 9px;
}
`

const ExpandedFooter: React.FC<ExpandedFooterProps> = ({ pool, account }) => {
  const { t } = useTranslation()
  const { currentBlock } = useBlock()
  const {
    totalCakeInVault,
    fees: { performanceFee },
  } = useCakeVault()

  const {
    stakingToken,
    earningToken,
    totalStaked,
    startBlock,
    endBlock,
    stakingLimit,
    contractAddress,
    sousId,
    isAutoVault,
  } = pool

  const tokenAddress = earningToken.address ? getAddress(earningToken.address) : ''
  const poolContractAddress = getAddress(contractAddress)
  const cakeVaultContractAddress = getCakeVaultAddress()
  const isMetaMaskInScope = !!window.ethereum?.isMetaMask
  const isManualCakePool = sousId === 0

  const { shouldShowBlockCountdown, blocksUntilStart, blocksRemaining, hasPoolStarted, blocksToDisplay } =
    getPoolBlockInfo(pool, currentBlock)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('Subtracted automatically from each yield harvest and burned.'),
    { placement: 'bottom-start' },
  )

  const getTotalStakedBalance = () => {
    if (isAutoVault) {
      return getBalanceNumber(totalCakeInVault, stakingToken.decimals)
    }
    if (isManualCakePool) {
      const manualCakeTotalMinusAutoVault = new BigNumber(totalStaked).minus(totalCakeInVault)
      return getBalanceNumber(manualCakeTotalMinusAutoVault, stakingToken.decimals)
    }
    return getBalanceNumber(totalStaked, stakingToken.decimals)
  }

  const {
    targetRef: totalStakedTargetRef,
    tooltip: totalStakedTooltip,
    tooltipVisible: totalStakedTooltipVisible,
  } = useTooltip(t('Total amount of %symbol% staked in this pool', { symbol: stakingToken.symbol }), {
    placement: 'bottom',
  })

  return (
    <ExpandedWrapper flexDirection="column">
      <Flex mb="2px" justifyContent="space-between" alignItems="center" style={{borderBottom: '1px solid #21214A', paddingBottom: '10px'}}>
        <Text fontSize='10px' color='white'>{t('Total staked')}:</Text>
        <Flex>
          <img src={SphynxTokenLogo} style={{ height: '40px', marginLeft: '4px' }} alt="token" />
          <Flex alignItems="flex-start" flexDirection='column'>
            {totalStaked && totalStaked.gte(0) ? (
              <>
                <Text fontSize='14px' color='white'>{t(stakingToken.symbol)}</Text>
                <Balance small value={getTotalStakedBalance()} decimals={0} />
                {/* <span ref={totalStakedTargetRef}>
                  <HelpIcon color="textSubtle" width="20px" ml="6px" mt="4px" />
                </span> */}
              </>
            ) : (
              <Skeleton width="90px" height="21px" />
            )}
            {/* {totalStakedTooltipVisible && totalStakedTooltip} */}
          </Flex>
        </Flex>
      </Flex>
      {stakingLimit && stakingLimit.gt(0) && (
        <Flex mb="2px" justifyContent="space-between">
          <Text small>{t('Max. stake per user')}:</Text>
          <Text small>{`${getFullDisplayBalance(stakingLimit, stakingToken.decimals, 0)} ${stakingToken.symbol}`}</Text>
        </Flex>
      )}
      {shouldShowBlockCountdown && (
        <Flex mb="2px" justifyContent="space-between" alignItems="center">
          <Text small>{hasPoolStarted ? t('Ends in') : t('Starts in')}:</Text>
          {blocksRemaining || blocksUntilStart ? (
            <Flex alignItems="center">
              <Link external href={getBscScanLink(hasPoolStarted ? endBlock : startBlock, 'countdown')}>
                <Balance small value={blocksToDisplay} decimals={0} color="primary" />
                <Text small ml="4px" color="primary" textTransform="lowercase">
                  {t('Blocks')}
                </Text>
                <TimerIcon ml="4px" color="primary" />
              </Link>
            </Flex>
          ) : (
            <Skeleton width="54px" height="21px" />
          )}
        </Flex>
      )}
      {isAutoVault && (
        <Flex mb="2px" justifyContent="space-between" alignItems="center">
          {tooltipVisible && tooltip}
          <TooltipText ref={targetRef} small>
            {t('Performance Fee')}
          </TooltipText>
          <Flex alignItems="center">
            <Text ml="4px" small>
              {performanceFee / 100}%
            </Text>
          </Flex>
        </Flex>
      )}
      <LinkContainer  mt='17px'>
        <ItemLink mb="6px" justifyContent="flex-end">
          <LinkExternal href={`https://bscscan.com/token/${getAddress(earningToken.address)}`} color='white' fontSize='10px'>
            {t('See Token Info')}
          </LinkExternal>
        </ItemLink>
        <Flex width='100%'>
          <ItemLink mr="6px" mb="2px" justifyContent="flex-end">
            <LinkExternal href={earningToken.projectLink} color='white' fontSize='10px'>
              {t('View Project Site')}
            </LinkExternal>
          </ItemLink>
          {poolContractAddress && (
            <ItemLink mb="2px" justifyContent="flex-end">
              <LinkExternal
                href={`${BASE_BSC_SCAN_URL}/address/${isAutoVault ? cakeVaultContractAddress : poolContractAddress}`}
                color='white' fontSize='10px'
              >
                {t('View Contract')}
              </LinkExternal>
            </ItemLink>
          )}
        </Flex>
        {account && isMetaMaskInScope && tokenAddress && (
          <Flex justifyContent="flex-end">
            <Button
              variant="text"
              p="0"
              height="auto"
              onClick={() => registerToken(tokenAddress, earningToken.symbol, earningToken.decimals)}
            >
              <Text color="primary" fontSize="14px">
                {t('Add to Metamask')}
              </Text>
              <MetamaskIcon ml="4px" />
            </Button>
          </Flex>
        )}
      </LinkContainer>
    </ExpandedWrapper>
  )
}

export default React.memo(ExpandedFooter)
