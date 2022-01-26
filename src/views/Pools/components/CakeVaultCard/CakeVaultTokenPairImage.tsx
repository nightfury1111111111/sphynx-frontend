import React from 'react'
import { TokenPairImage, ImageProps } from '@sphynxdex/uikit'
import tokens from 'config/constants/tokens'
import { ChainId } from '@sphynxdex/sdk-multichain'

const CakeVaultTokenPairImage: React.FC<Omit<ImageProps, 'src'>> = (props) => {
  const getAddress = (address) => {
    const chainId = parseInt(window?.ethereum?.networkVersion || window?.trustwallet?.Provider?.chainId)
    return address[chainId] ? address[chainId] : address[ChainId.MAINNET]
  }
  const primaryTokenSrc = `/images/tokens/${getAddress(tokens.sphynx.address)}.svg`

  return <TokenPairImage primarySrc={primaryTokenSrc} secondarySrc="/images/tokens/autorenew.svg" {...props} />
}

export default CakeVaultTokenPairImage
