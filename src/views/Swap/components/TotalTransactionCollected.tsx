import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Text } from '@sphynxdex/uikit'
import { useTranslation } from 'contexts/Localization'
import Web3 from 'web3'
import { web3Provider } from 'utils/providers'
import { FEE_WALLET } from 'config/constants'
import QuestionHelper from 'components/QuestionHelper'
import { AutoRow } from 'components/Row'

const CollectedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  margin: 4px;
  margin-left: 12px;
  border: 1px solid #5E2B60;
  border-radius: 5px;
  padding: 8px;
  height: 64px;
  & > div:nth-child(1) {
    font-size: 11px;
    text-align: start;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    white-space: nowrap;
    width: 100%;
    height: 80px;
    max-width: 410px;
    div:nth-child(1) {
      font-size: 18px;
      text-align: center;
    }
    padding: 12px;
  }
`

const BalanceContent = styled(AutoRow)`
  justify-content: flex-start;
  gap: 2px;
  div:nth-child(1) {
    font-size: 16px;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    justify-content: center;
    div:nth-child(1) {
      font-size: 22px;
      text-align: flex-start;
    }
  }
`

const TotalTransactionCollected: React.FC = () => {
  const [balance, setBalance] = useState(0)
  const { t } = useTranslation()

  useEffect(() => {
    const ac = new AbortController()
    const web3 = new Web3(web3Provider)
    const getBalance = () => {
      web3.eth.getBalance(FEE_WALLET).then((bnbBalance) => {
        let bnb: any = web3.utils.fromWei(bnbBalance)
        bnb = Number(bnb)
          .toFixed(3)
          .replace(/(\d)(?=(\d{3})+\.)/g, '$&,')
        setBalance(bnb)
        setTimeout(() => getBalance(), 60000)
      })
    }

    getBalance()

    return () => ac.abort()
  }, [])

  return (
    <CollectedWrapper>
      <Text color="white" bold textAlign="center" fontSize="18px">
        {t('Total Transaction Fees Collected')}
      </Text>
      <BalanceContent>
        <Text color="#C32BB4" bold textAlign="center" fontSize="22px">
          {t(`${balance}BNB`)}
        </Text>
        <QuestionHelper
          text={t(
            'Total fees will be redistributed to holders on a weekly basis. Holders must hold Sphynx Token for 7 days to be eligible for the reward. Amount distributed will be dependent on the amount of supply an investor holds.',
            )}
            />
      </BalanceContent>
    </CollectedWrapper>
  )
}

export default TotalTransactionCollected
