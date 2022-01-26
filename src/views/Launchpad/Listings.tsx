import React, { useEffect, useState, useMemo } from 'react'
import Pagination from '@material-ui/lab/Pagination'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import axios from 'axios'
import * as ethers from 'ethers'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { getPresaleContract } from 'utils/contractHelpers'
import ListIcon from 'assets/svg/icon/ListIcon.svg'
import { useMenuToggle } from 'state/application/hooks'
import Spinner from 'components/Loader/Spinner'
import { SEARCH_OPTION, LAUNCHPAD_NUM_PER_PAGE } from 'config/constants/launchpad'
import TokenCard from './components/TokenCard'
import SearchPannel from './components/SearchPanel'

import {
  Wrapper,
  HeaderWrapper,
  TitleWrapper,
  Title,
  LogoTitle,
  TokenListContainder,
  PaginationWrapper,
} from './ListingsStyles'

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`

const Presale: React.FC = () => {
  const { chainId, library } = useActiveWeb3React()
  const presaleContract = useMemo(() => getPresaleContract(library, chainId), [library])
  const { t } = useTranslation()
  const { menuToggled } = useMenuToggle()
  const [tokenList, setTokenList] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchOption, setSearchOption] = useState(SEARCH_OPTION.ALL)
  const [searchKey, setSearchKey] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      const data = {
        chain_id: chainId,
        token_level: searchOption,
        key: searchKey,
        page_index: pageIndex,
        num_per_page: LAUNCHPAD_NUM_PER_PAGE,
      }

      setIsLoading(true)
      setTokenList([])
      console.log("data", data)
      axios.post(`${process.env.REACT_APP_BACKEND_API_URL2}/getAllPresaleInfo`, { data }).then(async (response) => {
        if (response.data) {
          let pages = 1
          if(response.data.length > 0)
           pages = Math.ceil(parseInt(response.data[0].count) / LAUNCHPAD_NUM_PER_PAGE)
          setPageCount(pages)
          try {
            const list = await Promise.all(
              response.data.map(async (cell) => {
                const item = {
                  saleId: cell.sale_id,
                  ownerAddress: cell.owner_address,
                  tokenName: cell.token_name,
                  tokenSymbole: cell.token_symbol,
                  tokenLogo: cell.logo_link,
                  activeSale: 0,
                  totalCap: 0,
                  softCap: cell.soft_cap,
                  hardCap: cell.hard_cap,
                  minContribution: cell.min_buy,
                  maxContribution: cell.max_buy,
                  startTime: cell.start_time,
                  endTime: cell.end_time,
                  tokenState: 'active',
                  level: cell.token_level
                }
                let temp = (await presaleContract.totalContributionBNB(cell.sale_id)).toString()
                const value = parseFloat(ethers.utils.formatUnits(temp, cell.decimal))
                item.totalCap = value
                item.activeSale = value / cell.hard_cap

                temp = await presaleContract.isDeposited(cell.sale_id.toString())
                temp = true
                if (temp) {
                  /* is deposited */
                  const now = Math.floor(new Date().getTime() / 1000)
                  if (parseInt(cell.start_time) < now && parseInt(cell.end_time) > now) {
                    item.tokenState = 'active'
                  } else if (now > parseInt(cell.end_time)) {
                    if (item.totalCap < item.softCap) {
                      item.tokenState = 'failed'
                    } else {
                      item.tokenState = 'ended'
                    }
                  } else if (now < parseInt(cell.start_time)) {
                    item.tokenState = 'pending'
                  }
                }
                return item
              }),
            )
            setTokenList(list)
            setIsLoading(false)
          } catch (error) {
            console.log('error', error)
            setIsLoading(false)
          }
        } else {
          setIsLoading(false)
        }
      })
    }

    if (chainId && searchOption !== undefined) fetchData()
  }, [chainId, searchOption, searchKey, pageIndex, presaleContract])

  const handlePageIndex = (e, page) => {
    setPageIndex(page - 1)
  }

  return (
    <Wrapper>
      <HeaderWrapper>
        <TitleWrapper>
          <img src={ListIcon} alt="listIcon" />
          <Title>
            <LogoTitle>Presale Directory</LogoTitle>
          </Title>
        </TitleWrapper>
      </HeaderWrapper>
      <SearchPannel setSearchOption={setSearchOption} setSearchKey={setSearchKey} setPageIndex={setPageIndex}/>
      {isLoading && (
        <LoadingWrapper>
          <Spinner />
        </LoadingWrapper>
      )}
      <TokenListContainder toggled={menuToggled}>
        {tokenList &&
          tokenList.map((item) => (
            <TokenCard
              saleId={item.saleId}
              ownerAddress={item.ownerAddress}
              tokenName={item.tokenName}
              tokenSymbole={item.tokenSymbole}
              tokenLogo={item.tokenLogo}
              activeSale={item.activeSale * 100}
              totalCap={item.totalCap}
              softCap={item.softCap}
              hardCap={item.hardCap}
              minContribution={item.minContribution}
              maxContribution={item.maxContribution}
              startTime={item.startTime}
              endTime={item.endTime}
              tokenState={item.tokenState}
              level={item.level}
            >
              <img src={item.tokenLogo} alt="token icon" />
            </TokenCard>
          ))}
      </TokenListContainder>
      <PaginationWrapper>
        <Pagination 
        count={pageCount} 
        siblingCount={0} 
        onChange={handlePageIndex}
        />
      </PaginationWrapper>
    </Wrapper>
  )
}

export default Presale
