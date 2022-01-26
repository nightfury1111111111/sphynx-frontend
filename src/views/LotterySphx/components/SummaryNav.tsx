/* eslint-disable */
import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import { Button } from '@sphynxdex/uikit'
import SwapRouter from 'config/constants/swaps'

const StyledNav = styled.div`
  display: flex;
  height: 24px;
  width: 100%;
  justify-content: center;
  background: transparent;
  border-radius: 16px;
  margin-bottom: 16px;
  button:nth-child(1) {
    width: 100%;
    max-width: 120px;
    font-weight: 600;
    font-size: 12px;
    color: white;
    height: 30px;
    padding: 0 16px;
    background: ${({ theme }) => theme.isDark ? "transparent" : "#20234E"};
    border: 1px solid ${({ theme }) => theme.isDark ? "#21214A" : "#710D89"};
    border-radius: 16px 0px 0px 16px;
    box-shadow: none !important;
    outline: none;
    &:hover,
    &.active {
      background: #710D89 !important;
      border: 1px solid #710D89;
    }
  }
  button:nth-child(2) {
    width: 100%;
    max-width: 120px;
    font-weight: 600;
    font-size: 12px;
    color: white;
    height: 30px;
    padding: 0 16px;
    background: ${({ theme }) => theme.isDark ? "transparent" : "#20234E"};
    border: 1px solid ${({ theme }) => theme.isDark ? "#21214A" : "#710D89"};
    border-radius: 0px 16px 16px 0px;
    box-shadow: none !important;
    outline: none;
    &:hover,
    &.active {
      background: #710D89 !important;
      border: 1px solid #710D89;
    }
  }
`

const SummaryNav = (props) => {
  const { router, setRouter } = props

  const { t } = useTranslation()

  return (
    <StyledNav>
      {/* <Button
        className={swapRouter === SwapRouter.AUTO_SWAP ? 'active' : ''}
        id="auto-nav-link"
        onClick={() => {
          setRouterType(RouterType.sphynx)
          setSwapRouter(SwapRouter.AUTO_SWAP)
        }}
      >
        {t('AUTO')}
      </Button> */}
      <Button
        className={router === 'all' ? 'active' : ''}
        id="dgsn-nav-link"
        onClick={() => {
          setRouter("all")
        }}
      >
        All History
      </Button>
      <Button
        className={router === 'your' ? 'active' : ''}
        id="pcv-nav-link"
        onClick={() => {
          setRouter("your")
        }}
      >
        your History
      </Button>
    </StyledNav>
  )
}

export default SummaryNav
