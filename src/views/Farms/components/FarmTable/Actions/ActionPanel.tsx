
import React from 'react'
import styled, { css, keyframes } from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import { LinkExternal, Text, Flex, useMatchBreakpoints } from '@sphynxdex/uikit'
import { BASE_SWAP_URL } from 'config'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import { getAddress } from 'utils/addressHelpers'
import { getBscScanLink } from 'utils'
import { CommunityTag, CoreTag, DualTag } from 'components/Tags'

import HarvestAction from './HarvestAction'
import TokenLogo from './TokenLogo'
import StakedAction from './StakedAction'
import { AprProps } from '../Apr'
import { MultiplierProps } from '../Multiplier'
import { LiquidityProps } from '../Liquidity'

export interface ActionPanelProps {
  apr: AprProps
  multiplier: MultiplierProps
  liquidity: LiquidityProps
  details: FarmWithStakedValue
  userDataReady: boolean
  expanded: boolean
}

const expandAnimation = keyframes`
  from {
    max-height: 0px;
  }
  to {
    max-height: 500px;
  }
`

const collapseAnimation = keyframes`
  from {
    max-height: 500px;
  }
  to {
    max-height: 0px;
  }
`

const Container = styled.div<{ expanded, isMobile: boolean }>`
  animation: ${({ expanded }) =>
    expanded
      ? css`
      ${expandAnimation} 300ms linear forwards
    `
      : css`
      ${collapseAnimation} 300ms linear forwards
    `};
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: ${({ theme }) => theme.isDark ? "#1A1A3A" : "#20234E"};
  display: flex;
  flex-direction: ${({ isMobile }) => isMobile ? "column" : "row"};
  justify-content: center;
  padding: 5px;

  ${({ theme }) => theme.mediaQueries.xs} {
    padding: 12px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 16px 32px;
  }
`

const StyledLinkExternal = styled(LinkExternal)`
  font-size: 8px;
  font-weight: 400;
  flex-flow: row-reverse;
  > svg {
    width: 15px;
    margin-right: 3px;
    margin-left: 0px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 10px;
  }
`
const TagsContainer = styled.div`
  display: flex;
  align-items: center;
  
  > div {
    border: 0px;
    height: 24px;
    padding: 0 6px;
    font-size: 12px;
    margin-right: 4px;
    color: #F9B043;
    svg {
      width: 14px;
    }
  }
`

const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    flex-basis: 0;
  }
`

const InfoContainer = styled.div`
  // min-width: 200px;
`

const DetailContainer = styled(Flex)`
  display: flex;
  gap: 10px;
  flex-direction: row;
  align-items: center;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    flex-grow: 2;
    flex-basis: 0;
  }
`

const BorderFlex = styled(Flex)`
  color: white;
  border-radius: 5px;
  border: 1px solid #2E2E55;
  padding: 3px;
  ${({ theme }) => theme.mediaQueries.xs} {
    padding: 8px;
  }
`

const TokenLogoSection = styled(Flex)`
  justify-content: center;
  align-items: center;
  display: flex;
  flex-grow: 1;
`

const ViewGroupWrapper = styled(Flex)`
  display: flex;
  flex-direction: column;
  margin-bottom: unset;
  gap: 10px;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
    margin-bottom: 8px;
  }
`

const ActionPanel: React.FunctionComponent<ActionPanelProps> = ({
  details,
  userDataReady,
  expanded,
}) => {
  const farm = details

  const { t } = useTranslation()
  const { isXl } = useMatchBreakpoints()
  const isMobile = !isXl
  const { dual } = farm
  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  const farmLabel = lpLabel && lpLabel.replace(' LP', '')
  const lpAddress = getAddress(farm.lpAddresses)
  const bsc = getBscScanLink(lpAddress, 'address')
  const info = `${BASE_SWAP_URL}/pool/${lpAddress}`

  return (
    <Container expanded={expanded} isMobile={isMobile}>
      <DetailContainer>
        <InfoContainer>
          <Flex mb='5px'>
            <Text bold>{farmLabel}</Text>
            <TagsContainer>
              {farm.isCommunity ? <CommunityTag /> : <CoreTag />}
              {dual ? <DualTag /> : null}
            </TagsContainer>
          </Flex>
          <ViewGroupWrapper>
            <BorderFlex mr={isMobile ? '0' : '2px'}>
              <StyledLinkExternal href={bsc}>{t('View Contract')}</StyledLinkExternal>
            </BorderFlex>
            <BorderFlex ml={isMobile ? '0' : '2px'}>
              <StyledLinkExternal href={bsc}>{t('See Pair Info')}</StyledLinkExternal>
            </BorderFlex>
          </ViewGroupWrapper>
        </InfoContainer>
        <TokenLogoSection>
          <TokenLogo {...farm} userDataReady={userDataReady} />
        </TokenLogoSection>
      </DetailContainer>
      <ActionContainer>
        <HarvestAction {...farm} userDataReady={userDataReady} />
        <StakedAction {...farm} userDataReady={userDataReady} />
      </ActionContainer>
    </Container>
  )
}

export default ActionPanel
