import React, { useMemo } from 'react'
import { Flex, Skeleton, Text } from '@sphynxdex/uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import Balance from 'components/Balance'
import { Pool } from 'state/types'
import { useCakeVault } from 'state/pools/hooks'
import { getBalanceNumber } from 'utils/formatBalance'
import BaseCell, { CellContent } from './BaseCell'

interface TotalStakedCellProps {
  pool: Pool
}

const StyledCell = styled(BaseCell)`
  flex: 2;
`

const TotalStakedCell: React.FC<TotalStakedCellProps> = ({ pool }) => {
  const { t } = useTranslation()
  const { sousId, stakingToken, totalStaked, isAutoVault } = pool
  const { totalCakeInVault } = useCakeVault()

  const isManualCakePool = sousId === 0

  const totalStakedBalance = useMemo(() => {
    // if (isAutoVault) {
    //   return getBalanceNumber(totalCakeInVault, stakingToken.decimals)
    // }
    // if (isManualCakePool) {
    //   const manualCakeTotalMinusAutoVault = new BigNumber(totalStaked).minus(totalCakeInVault)
    //   return getBalanceNumber(manualCakeTotalMinusAutoVault, stakingToken.decimals)
    // }
    return getBalanceNumber(totalStaked, stakingToken.decimals)
  // }, [isAutoVault, totalCakeInVault, isManualCakePool, totalStaked, stakingToken.decimals])
  }, [totalStaked, stakingToken.decimals])

  return (
    <StyledCell role="cell">
      <CellContent>
        <Text fontSize="14px" color="white" textAlign="left" mb='4px'>
          {t('Total staked')}
        </Text>
        {totalStaked && totalStaked.gte(0) ? (
          <Flex mt="4px" alignItems="left" flexDirection='column'>
            <Balance fontSize="16px" value={totalStakedBalance} decimals={0} mb='1px'/>
            <Text fontSize="16px" color="white" textAlign="left">
              {stakingToken.symbol}
            </Text>
          </Flex>
        ) : (
          <Skeleton width="80px" height="16px" />
        )}
      </CellContent>
    </StyledCell>
  )
}

export default TotalStakedCell
