import React, { useCallback, useState } from 'react'
import styled, { css } from 'styled-components'
import { ethers } from 'ethers'
import { useSelector, useDispatch } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import { Button, useWalletModal, Flex, Text } from '@sphynxdex/uikit'
import { Currency, TokenAmount, ChainId } from '@sphynxdex/sdk-multichain'
import { ReactComponent as ArrowRightIcon } from 'assets/svg/icon/ArrowRightBridge.svg'
import Web3 from 'web3'
import getRpcUrl from 'utils/getRpcUrl'
import useAuth from 'hooks/useAuth'
import { AutoRow } from 'components/Layout/Row'
import { setConnectedNetworkID } from 'state/input/actions'
import { switchNetwork } from 'utils/wallet'
import { AppState } from 'state'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import MainLogo from 'assets/svg/icon/logo_new.svg'
import BridgeOtherToken from 'assets/svg/icon/BridgeOtherToken.svg'

import { useCurrency } from '../../../hooks/Tokens'
import { useBridgeActionHandlers, useBridgeState, useDerivedBridgeInfo } from '../../../state/bridge/hooks'
import { maxAmountSpend } from '../../../utils/maxAmountSpend'
import { currencyId } from '../../../utils/currencyId'
import { Field } from '../../../state/bridge/actions'
import Tokencard from './TokenCard'
import CurrencyInputPanel from '../../../components/CurrencyInputPanel'


import {
  onUseRegister,
  onUseBSCApprove,
  onUseEthApprove,
  onUseSwapBSC2ETH,
  onUseSwapETH2BSC,
  onUseSwapFee,
  onUseBscSwapFee,
} from '../../../hooks/useBridge'


const Container = styled.div`
  color: white;
  background: rgba(0, 0, 0, 0.4);
  width: 372px;
  height: fit-content;
  margin: 0px 60px 20px;
  border-radius: 16px;
  padding: 0px 20px;
`
const CardHeader = styled.div`
  text-align: center;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 19px;
  
  margin: 8px;
`
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, auto);
  margin-bottom: 12px;
`
const AmountContainer = styled.div`
  margin-top: 12px;
  padding-right: 10px;
  position: relative;
  height: 84px;
  border-bottom: 1px solid ${({ theme }) => theme.isDark ? "#21214A" : "#4A5187"};
`
const BottomLabel = styled.div`
  position: absolute;
  bottom: 7px;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 19px;
  color: white;
`

const MinMaxContainger = styled.div<{ isMin: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 19px;
  color: white;
  border-bottom: 1px solid ${({ theme }) => theme.isDark ? "#21214A" : "#4A5187"};
`

const ErrorArea = styled.div`
  font-weight: 400;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: white;
  text-align: -webkit-center;
`

const ArrowWrapper = styled.div<{ clickable: boolean }>`
  border-radius: 12px;
  padding: 2px;
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
            padding: 3px;

          }
        `
      : null}
`

const Divider = styled.div`
  background-color: #21214A;
  height: 1px;
  margin: 24px 0px 10px;
  width: 100%;
`

export default function BridgeCard({ label, isSphynx = false }) {

  const { account, library } = useActiveWeb3React()
  const signer = library.getSigner();
  const dispatch = useDispatch()

  const { login, logout } = useAuth();
  const [currencyA1, setCurrencyA1] = useState('USDT')
  const { independentField, typedValue } = useBridgeState();
  const { onPresentConnectModal } = useWalletModal(login, logout)

  const [networkFromName, setNetworkFromName] = React.useState('bsc');
  const [networkToName, setNetworkToName] = React.useState('eth');
  const [chainId, setChainId] = React.useState(56);
  const [minAmount, setMinAmount] = React.useState(10000);
  const [maxAmount, setMaxAmount] = React.useState(1000000);
  const web3 = new Web3(Web3.givenProvider || 'ws://some.local-or-remote.node:8546');

  React.useEffect(() => {
    web3.eth.getChainId().then((response) => setChainId(response));
  }, [web3.eth])

  const isNetworkError = React.useMemo(() =>
    !((networkFromName === 'bsc' && chainId === ChainId.MAINNET) ||
      (networkFromName === 'eth' && chainId === 1))
    , [networkFromName, chainId])

  const handleFromChange = useCallback((value) => {
    setNetworkFromName(value.value);
  }, []);

  const handleToChange = useCallback((value) => {
    setNetworkToName(value.value);
  }, []);

  const exchangeNetwork = () => {
    setNetworkFromName(networkToName);
    setNetworkToName(networkFromName);
  }

  const handleSwitch = () => {
    if (chainId !== ChainId.MAINNET) {
      switchNetwork('0x'.concat(ChainId.MAINNET.toString(16)));
      dispatch(setConnectedNetworkID({ connectedNetworkID: ChainId.MAINNET }));
    } else {
      switchNetwork('0x'.concat(Number(1).toString(16)));
      dispatch(setConnectedNetworkID({ connectedNetworkID: 1 }));
    }
  }

  const handleNext = async () => {
    // onUseRegister(testSigner);
    // await onUseSwapFee(testSigner);
    // await onUseEthApprove(signer, '1000')
    // await onUseSwapETH2BSC(signer, '1000');

    // await onUseBscSwapFee(signer);
    await onUseBSCApprove(signer, '1000')
    await onUseSwapBSC2ETH(signer, '1000');
    // onUseSwapETH2BSC(testSigner);
  }

  const currency = useCurrency(currencyA1);
  const sphynxCurrency = useCurrency('0x2e121Ed64EEEB58788dDb204627cCB7C7c59884c');

  const handleCurrencyASelect = (currencyA_: Currency) => {
    const newCurrencyIdA = currencyId(currencyA_)
    setCurrencyA1(newCurrencyIdA)
  }

  const { onFieldSpxInput, onFieldOthInput } = useBridgeActionHandlers()

  const {
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
  } = useDerivedBridgeInfo(sphynxCurrency ?? undefined, currency ?? undefined)

  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.BRIDGE_TOKENSPX].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {},
  )

  const maxOthAmounts: { [field in Field]?: TokenAmount } = [Field.BRIDGE_TOKENOTH].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {},
  )
  const handleMax = () => {
    if (isSphynx)
      onFieldSpxInput(maxAmounts[Field.BRIDGE_TOKENSPX]?.toFixed(4) ?? '')
    else
      onFieldOthInput(maxOthAmounts[Field.BRIDGE_TOKENOTH]?.toFixed(4) ?? '')
  }

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const isNextClickable = React.useMemo(() => {
    const formattedAmount = {
      [independentField]: typedValue,
      [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }
    const amount = isSphynx ? formattedAmount[Field.BRIDGE_TOKENSPX] : formattedAmount[Field.BRIDGE_TOKENOTH];
    console.log(amount);
  }, [dependentField, independentField, isSphynx, parsedAmounts, typedValue])


  return (
    <Container>
      <Flex justifyContent='center' pt="22px">
        <img width="60px" height="57px" src={isSphynx? MainLogo: BridgeOtherToken} alt="Logo" />
      </Flex>
      <CardHeader>{label}</CardHeader>
      <Divider />
      <Flex justifyContent="space-between" mt="20px">
        <Tokencard isFrom networkName={networkFromName} chainId={chainId} handleChange={handleFromChange} />
        <Flex pt="6px" height="fit-content">
          <ArrowWrapper clickable onClick={exchangeNetwork} >
            <ArrowRightIcon style={{ alignSelf: 'center' }} />
          </ArrowWrapper>
        </Flex>
        <Tokencard isFrom={false} networkName={networkToName} chainId={chainId} handleChange={handleToChange} />
      </Flex>
      <Flex justifyContent="space-between" alignItems="center" mt="12px" mr="10px">
        <Flex alignItems="center">
          <img width="35px" height="31px" src={isSphynx? MainLogo: BridgeOtherToken} alt="Logo" />
          <Text fontSize="14px" fontWeight="600" color="white"> {isSphynx ? 'Sphynx' : 'Token'} to Bridge</Text>
        </Flex>
        <Button
          variant="tertiary"
          style={{
            fontStyle: 'normal',
            fontWeight: 'bold',
            fontSize: '12px',
            lineHeight: '14px',
            backgroundColor: '#1A1A3A',
            width: '73px',
            height: '30px',
            color: 'white',
            borderRadius: '4px',
          }}
          onClick={handleMax}
        >
          Max
        </Button>
      </Flex>
      <AmountContainer>
        <CurrencyInputPanel
          value={isSphynx ? formattedAmounts[Field.BRIDGE_TOKENSPX] : formattedAmounts[Field.BRIDGE_TOKENOTH]}
          onUserInput={isSphynx ? onFieldSpxInput : onFieldOthInput}
          onMax={null}
          onCurrencySelect={handleCurrencyASelect}
          showMaxButton={false}
          currency={isSphynx ? sphynxCurrency : currency}
          id="bridge-asset-token"
          showCommonBases
          disableCurrencySelect={isSphynx}
          isBridge
        />
        <BottomLabel>Balance on {isSphynx ? 'Sphynx' : currency !== undefined && currency !== null ? currency.symbol : 'Token'}</BottomLabel>
      </AmountContainer>
      <MinMaxContainger isMin={false}>
        <div>Max Bridge Amount</div>
        <Text fontSize="14px" color="#F2C94C" fontWeight="600">{maxAmount} {isSphynx ? 'SPX' : currency !== undefined && currency !== null ? currency.symbol : 'Token'}</Text>
      </MinMaxContainger>
      <MinMaxContainger isMin>
        <div>Min Bridge Amount</div>
        <Text fontSize="14px" color="#F2C94C" fontWeight="600">{minAmount} {isSphynx ? 'SPX' : currency !== undefined && currency !== null ? currency.symbol : 'Token'}</Text>
      </MinMaxContainger>
      <ErrorArea>
        {!account ? (
          <>
            <Text fontSize="14px" color="white" style={{ textAlign: 'center', margin: '24px 0px' }}>Please connect your wallet to the chain you wish to bridge from!</Text>
            <Flex style={{ columnGap: '10px' }} mb="34px" mx="-8px">
              <Button
                variant="tertiary"
                style={{
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '14px',
                  background: 'linear-gradient(90deg, #610D89 0%, #C42BB4 100%)',
                  height: '34px',
                  color: 'white',
                  width: '166px',
                  borderRadius: '8px',
                }}
                onClick={handleSwitch}
              >
                Click Here to Switch
              </Button>
              <Button
                variant="tertiary"
                height="40px"
                style={{
                  background: 'linear-gradient(90deg, #610D89 0%, #C42BB4 100%)',
                  fontSize: '13px',
                  color: 'white',
                  borderRadius: '8px',
                  height: '34px',
                  width: '166px',
                }}
                onClick={!account ? onPresentConnectModal : handleNext}
              >
                {!account ? 'Connect Wallet' : 'Next'}
              </Button>
            </Flex>
          </>
        ) :
          <Flex my="34px" mx="-8px" style={{columnGap: '10px'}}>
            <Button
              variant="tertiary"
              height="40px"
              style={{
                background: 'linear-gradient(90deg, #610D89 0%, #C42BB4 100%)',
                fontSize: '13px',
                color: 'white',
                borderRadius: '8px',
                height: '34px',
                width: '166px',
              }}
              onClick={!account ? onPresentConnectModal : handleNext}
            >
              Approve
            </Button>
            <Button
              variant="tertiary"
              height="40px"
              style={{
                background: 'linear-gradient(90deg, #610D89 0%, #C42BB4 100%)',
                fontSize: '13px',
                color: 'white',
                borderRadius: '8px',
                height: '34px',
                width: '166px',
              }}
              onClick={!account ? onPresentConnectModal : handleNext}
            >
              {!account ? 'Connect Wallet' : 'Next'}
            </Button>
          </Flex>
        }
      </ErrorArea>
    </Container>
  )
}
