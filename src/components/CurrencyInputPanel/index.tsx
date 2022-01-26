import React from 'react'
import { Currency, Pair } from '@sphynxdex/sdk-multichain'
import { Button, ChevronDownIcon, Text, useModal, Flex } from '@sphynxdex/uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { CurrencyLogo, DoubleCurrencyLogo } from '../Logo'
import { Input as NumericalInput } from './NumericalInput'

const InputRow = styled.div<{ selected: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 8px 0px;

  & input {
    text-align: right;
    color: white;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: -0.04em;
    &::placeholder {
      color: white;
    }
  }
`
const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'xs', selected: false })`
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  background-color: transparent;
  color: ${({ selected, theme }) => (selected ? theme.colors.text : '#FFFFFF')};
  border: 1px solid ${({ theme }) => theme.isDark ? "#2E2E55" : "#4A5187"};
  border-radius: 5px;
  outline: none;
  cursor: pointer;
  user-select: none;
  padding: 15px 8px;
  margin-right: 4px;

  :focus,
  :hover {
    opacity: 0.6;
  }

  & > div {
    & > div {
      font-weight: 600;
      font-size: 10px;
      letter-spacing: -0.02em;
      color: white;
    }
    & > svg > path {
      fill: white;
    }
  }
`

const MaxButtonWrapper = styled.div`
  & button {
    background-color: #8b2a9b;
    color: white;
    margin-left: 4px;
    padding: 8px 6px;
    font-size: 14px;
    &:hover {
      background-color: #8b2a9b !important;
      opacity: 0.6;
    }
  }
`

const InputPanel = styled.div<{ hideInput?: boolean; isBridge?: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  border-top: 1px solid ${({ theme }) => theme.isDark ? "#21214A" : "#4A5187"};
  border-bottom: ${({ isBridge, theme }) => isBridge ? 'none' : theme.isDark ? "1px solid #21214A" : "1px solid #4A5187"};
  background-color: transparent;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: 16px;
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  isBridge?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  isBridge = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
}: CurrencyInputPanelProps) {
  const { account } = useActiveWeb3React()

  const { t } = useTranslation()
  const translatedLabel = label || t('Input')

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currency}
      otherSelectedCurrency={otherCurrency}
      showCommonBases={showCommonBases}
    />,
  )
  
  const handleSelectCurrencyModal = () => {
    if (!disableCurrencySelect) {
      onPresentCurrencyModal()
    }
  }

  return (
    <InputPanel id={id} isBridge={isBridge}>
      <Container hideInput={hideInput}>
        <InputRow style={hideInput ? { padding: '0' } : {}} selected={disableCurrencySelect}>
          <CurrencySelectButton
            selected={!!currency}
            className="open-currency-select-button"
            onClick={handleSelectCurrencyModal}
          >
            <Flex alignItems="center" justifyContent="space-between">
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={14} margin />
              ) : currency ? (
                <CurrencyLogo currency={currency} size="14px" style={{ marginRight: '4px' }} />
              ) : null}
              {pair ? (
                <Text id="pair">
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </Text>
              ) : (
                <Text id="pair">
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                        currency.symbol.length - 5,
                        currency.symbol.length,
                      )}`
                    : currency?.symbol) || (isBridge && disableCurrencySelect ? t('SPX') : t('Select a currency'))}
                </Text>
              )}
              {!disableCurrencySelect && <ChevronDownIcon />}
            </Flex>
          </CurrencySelectButton>
          {!hideInput && (
            <>
              <NumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
              />
              {account && currency && showMaxButton && translatedLabel !== 'To' && (
                <MaxButtonWrapper>
                  <Button onClick={onMax} scale="sm" variant="text">
                    {t('MAX')}
                  </Button>
                </MaxButtonWrapper>
              )}
            </>
          )}
        </InputRow>
      </Container>
    </InputPanel>
  )
}
