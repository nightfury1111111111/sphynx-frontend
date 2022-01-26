import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Button, Text, Flex, useModal } from '@sphynxdex/uikit'
import { useTranslation } from 'contexts/Localization'
import { ChainId } from '@sphynxdex/sdk-multichain'
import { useSelector, useDispatch } from 'react-redux'
import { AppState } from 'state'
import { setConnectedNetworkID } from 'state/input/actions'
import { getNetworkID } from 'utils/wallet'
import NetworkSwitchModal from './NetworkSwitchModal/NetworkSwitchModal'

const SwitchNetworkButtonWrapper = styled.div`
  button {
    padding: 9px 18px;
    color: white;
    background: #2A2E60;
    border-radius: 5px;
    height: 34px;
  }
`

const SwitchNetworkButton = (props) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const ref = useRef(null)

  getNetworkID().then((networkID: string) => {
    dispatch(setConnectedNetworkID({ connectedNetworkID: Number(networkID) }))
  })

  const connectedNetworkID = useSelector<AppState, AppState['inputReducer']>(
    (state) => state.inputReducer.connectedNetworkID,
  )
  const disableNetworkSelect = false

  useEffect(() => {
    if (connectedNetworkID === ChainId.MAINNET) {
      ref.current.src = '/images/net/bsc.png'
    } else {
      ref.current.src = '/images/net/ethereum.png'
    }
  }, [connectedNetworkID])

  const [onPresentNetworkModal] = useModal(<NetworkSwitchModal />)

  const handleSelectNetworkModal = () => {
    if (!disableNetworkSelect) {
      onPresentNetworkModal()
    }
  }

  return (
    <SwitchNetworkButtonWrapper>
      <Button onClick={handleSelectNetworkModal} {...props} variant="tertiary">
        <Flex alignItems="center">
          <img
            ref={ref}
            src="/images/net/bsc.png"
            style={{ width: '16px', height: '16px', borderRadius: '0.375rem' }}
            alt="network"
          />
          <Text color="white" ml={2} textAlign="center">
            {connectedNetworkID === ChainId.MAINNET ? t('BSC') : t('ETH')}
          </Text>
        </Flex>
      </Button>
    </SwitchNetworkButtonWrapper>
  )
}

export default SwitchNetworkButton
