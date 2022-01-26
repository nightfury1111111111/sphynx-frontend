import React, { useEffect } from 'react'
import {
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalBody,
  InjectedModalProps,
  Heading,
  Text,
  Box,
} from '@sphynxdex/uikit'
import styled from 'styled-components'
import { AutoRow } from 'components/Row'
import { useSelector, useDispatch } from 'react-redux'
import { AppState } from 'state'
import { setConnectedNetworkID } from 'state/input/actions'
import { switchNetwork } from 'utils/wallet'

const StyledModalContainer = styled(ModalContainer)`
  background-color: ${({ theme }) => theme.isDark ? "#191C41" : "#2A2E60"};
  div:first-child {
    border-bottom: none;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 420px
  }
  ${({ theme }) => theme.mediaQueries.md} {
    width: 680px
  }
`

const StyledModalBody = styled(ModalBody)`
  padding: 24px;
`

const NetworkList = styled.div`
  display: grid;
  grid-gap: 20px;
  width: 100%;
  height: 100%;
  overflow-y: auto;

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-template-columns: repeat(1, 1fr);
  }
  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: repeat(2, 1fr);
  }
`

const NetworkItem = styled(Box) <{ selected?: boolean }>`
  display: flex;
  background: ${({ selected }) => !selected ? `${({ theme }) => theme.isDark ? "#191C41" : "#2A2E60"}` : 'linear-gradient(90deg, #610D89 0%, #C42BB4 100%)'};
  color: white;
  border-radius: 0.625rem;
  padding: 2px;
  border: '1px solid #202231';
  text-decoration: 'none';

  div {
    background: ${({ theme }) => theme.isDark ? "#2A2E60" : "#191C41"};
    display: flex;
    padding: 0.4rem 0.8rem;
    border-radius: 0.625rem;
    img {
      border-radius: 0.375rem;
    }
  }
  
  &: ${({ selected }) => !selected &&
    `hover {
    background: linear-gradient(90deg, #610D89 0%, #C42BB4 100%);
    div { 
      background: ${({ theme }) => theme.isDark ? "#2A2E60" : "#191C41"};
    }
  }`};
`

interface NetworkData {
  ChainID: number,
  btIcon: string,
  networkName: string,
  selected: boolean,
}

interface NetworkSearchModalProps extends InjectedModalProps {
  selectedNetwork?: NetworkData | null
  otherSelectedNetwork?: NetworkData | null
  showCommonBases?: boolean
}

const NETWORK_LIST = [
  {
    ChainID: 1,
    btIcon: "/images/net/ethereum.png",
    networkName: "Ethereum",
    selected: false,
  },
  {
    ChainID: 56,
    btIcon: "/images/net/bsc.png",
    networkName: "BSC",
    selected: false,
  },
  {
    ChainID: 137,
    btIcon: "/images/net/polygon.png",
    networkName: "Polygon (coming soon)",
    selected: false,
  },
  {
    ChainID: 250,
    btIcon: "/images/net/fantom.png",
    networkName: "Fantom (coming soon)",
    selected: false,
  },
  {
    ChainID: 42161,
    btIcon: "/images/net/arbitrum.png",
    networkName: "Arbitrum (coming soon)",
    selected: false,
  },
  {
    ChainID: 66,
    btIcon: "/images/net/okex.png",
    networkName: "OKEx (coming soon)",
    selected: false,
  },
  {
    ChainID: 4441,
    btIcon: "/images/net/heco.png",
    networkName: "HECO (coming soon)",
    selected: false,
  },
  {
    ChainID: 100,
    btIcon: "/images/net/xdai.png",
    networkName: "xDai (coming soon)",
    selected: false,
  },
  {
    ChainID: 4442,
    btIcon: "/images/net/harmonyone.png",
    networkName: "Harmony (coming soon)",
    selected: false,
  },
  {
    ChainID: 43114,
    btIcon: "/images/net/avalanche.png",
    networkName: "Avalanche (coming soon)",
    selected: false,
  },
  {
    ChainID: 42220,
    btIcon: "/images/net/celo.png",
    networkName: "Celo (coming soon)",
    selected: false,
  },
  {
    ChainID: 11297108109,
    btIcon: "/images/net/palm.png",
    networkName: "Palm (coming soon)",
    selected: false,
  },
  {
    ChainID: 1285,
    btIcon: "/images/net/moonriver.png",
    networkName: "Moonriver (coming soon)",
    selected: false,
  },
]

const PREFIX = '0x'

export default function NetworkSwitchModal({
  onDismiss = () => null,
  selectedNetwork,
  otherSelectedNetwork,
  showCommonBases = false,
}: NetworkSearchModalProps) {

  const dispatch = useDispatch()
  const connectedNetworkID = useSelector<AppState, AppState['inputReducer']>((state) => state.inputReducer.connectedNetworkID)

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [])

  const handleNetworkItemClick = (networkItem) => {
    switchNetwork(PREFIX + networkItem.ChainID.toString(16))
    dispatch(setConnectedNetworkID({ connectedNetworkID: networkItem.ChainID }));
    onDismiss()
  }

  return (
    <StyledModalContainer minWidth="320px">
      <ModalHeader>
        <ModalTitle>
          <Heading>Select a Network</Heading>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </ModalHeader>
      <StyledModalBody>
        <NetworkList>
          {NETWORK_LIST.map((item) => (
            <>
              <NetworkItem onClick={() => handleNetworkItemClick(item)} selected={item.ChainID === connectedNetworkID}>
                <AutoRow>
                  <img src={item.btIcon} width="32" height="32" alt="icon" />
                  <Text bold fontSize="14px">{item.networkName}</Text>
                </AutoRow>
              </NetworkItem>
            </>
          ))}
        </NetworkList>
      </StyledModalBody>
    </StyledModalContainer>
  )
}
