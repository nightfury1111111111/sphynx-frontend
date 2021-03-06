import styled from 'styled-components'
import { Box } from '@sphynxdex/uikit'

const Card = styled(Box)<{
  width?: string
  padding?: string
  border?: string
  borderRadius?: string
  bgColor?: string
}>`
  width: ${({ width }) => width ?? '100%'};
  border-radius: 16px;
  padding: 1.25rem;
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
  box-shadow: 0px 2px 12px rgba(37, 51, 66, 0.15);
  background-color: ${({ bgColor }) => bgColor};
`

export default Card

export const LightCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`

export const LightGreyCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.background};
`

export const GreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.colors.dropdown};
`
export const BlackCard = styled(Card)`
  background-color: '#fff';
`
