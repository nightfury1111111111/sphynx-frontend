import React from 'react'
import styled from 'styled-components'
import { ChevronDownIcon, Text } from '@sphynxdex/uikit'
import { useTranslation } from 'contexts/Localization'

interface DetailsProps {
  actionPanelToggled: boolean
}

const StyledCell = styled.div`
  display: flex;
  padding: 24px 8px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  flex: 1;
`

const ArrowIcon = styled(ChevronDownIcon) <{ toggled: boolean }>`
  width: 44px;  
  height: 44px;
  margin-bottom: auto;
`

const Details: React.FC<DetailsProps> = ({ actionPanelToggled }) => {
  const { t } = useTranslation()

  return (
    <StyledCell role="cell">
      <Text color="white" fontSize='14px'>
        {actionPanelToggled ? t('Hide') : t('Details')}
      </Text>
      <ArrowIcon color={actionPanelToggled ? '#BC29B1' : 'white'} toggled={actionPanelToggled} />
    </StyledCell>
  )
}

export default Details
