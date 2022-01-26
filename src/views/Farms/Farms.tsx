import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Route, useRouteMatch, useLocation } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { useMatchBreakpoints, Heading, RowType, Toggle, Text, Flex } from '@sphynxdex/uikit'
import { ChainId } from '@sphynxdex/sdk-multichain'
import styled, { useTheme } from 'styled-components'
import FlexLayout from 'components/Layout/Flex'
import Page from 'components/Layout/Page'
import { ethers } from 'ethers'
import { simpleRpcProvider } from 'utils/providers'
import { ERC20_ABI } from 'config/abi/erc20'
import { getBNBPrice, getTokenPrice } from 'utils/priceProvider'
import { useFarms, usePollFarmsData, usePriceCakeBusd } from 'state/farms/hooks'
import usePersistState from 'hooks/usePersistState'
import { Farm } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { getBalanceNumber } from 'utils/formatBalance'
import { getFarmApr } from 'utils/apr'
import { orderBy } from 'lodash'
import isArchivedPid from 'utils/farmHelpers'
import { latinise } from 'utils/latinise'
import { useUserFarmStakedOnly } from 'state/user/hooks'
import PageHeader from 'components/PageHeader'
import { getSphynxAddress, getMasterChefAddress, getWbnbAddress } from 'utils/addressHelpers'
import SearchInput from 'components/SearchInput'
import Select, { OptionProps } from 'components/Select/Select'
import Loading from 'components/Loading'
import { ReactComponent as FarmLogo } from 'assets/svg/icon/FarmIcon2.svg'
import FarmCard, { FarmWithStakedValue } from './components/FarmCard/FarmCard'
import { SwapTabs, SwapTabList, SwapTab, SwapTabPanel } from '../../components/Tab/tab'
import SearchPannel from './components/SearchPannel'
import Table from './components/FarmTable/FarmTable'
import { RowProps } from './components/FarmTable/Row'
import { DesktopColumnSchema, ViewMode } from './components/types'
import Card from '../../components/Card'
import Bond from './components/FarmTabPages/Bond'

const NUMBER_OF_FARMS_VISIBLE = 12

const getDisplayApr = (cakeRewardsApr?: number, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return null
}

const Farms: React.FC = () => {
  const [totalLiquidityUSD, setTotalLiquidity] = useState('')
  const [farmApr, setFarmApr] = useState(null)

  useEffect(() => {
    const lpAddress = '0x93561354a5a4687c54a64cf0aba56a0a392ae882'
    const masterChef = getMasterChefAddress()
    const sphynxToken = getSphynxAddress()
    const wBNBAddr = getWbnbAddress()

    const parseData = async () => {
      try {
        const lpToken = new ethers.Contract(lpAddress, ERC20_ABI, simpleRpcProvider)
        const wBNB = new ethers.Contract(wBNBAddr, ERC20_ABI, simpleRpcProvider)
        const bnbBalance = await wBNB.balanceOf(lpAddress)
        const bnbPrice = await getBNBPrice()
        const totalSupply = await lpToken.totalSupply()
        const masterChefBalance = await lpToken.balanceOf(masterChef)
        const tokenPrice = await getTokenPrice(sphynxToken)
        const totalLiquidity = (((bnbBalance * 2) / 10 ** 18) * bnbPrice * masterChefBalance) / totalSupply
        const apr = ((tokenPrice * 112.5) / totalLiquidity) * 1000 * 365 * 100 * 24
        setTotalLiquidity(totalLiquidity.toFixed(2))
        setFarmApr(apr.toFixed(2))
      } catch (err) {
        console.log('error', err)
      }
    }

    parseData()
  }, [])

  const { path } = useRouteMatch()
  const location = useLocation()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const { isXl } = useMatchBreakpoints()
  const isMobile = !isXl
  const theme = useTheme()
  const { data: farmsLP, userDataLoaded } = useFarms()
  const cakePrice = usePriceCakeBusd()
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = usePersistState(ViewMode.TABLE, { localStorageKey: 'pancake_farm_view' })
  const { account } = useWeb3React()
  const [sortOption, setSortOption] = useState('hot')
  const chosenFarmsLength = useRef(0)

  const isArchived = pathname.includes('archived')
  const isInactive = pathname.includes('history')
  const isActive = !isInactive && !isArchived

  usePollFarmsData(isArchived)

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !account || (!!account && userDataLoaded)

  const [stakedOnly, setStakedOnly] = useUserFarmStakedOnly(isActive)

  const activeFarms = farmsLP.filter((farm) => farm.pid !== 0 && farm.multiplier !== '0X' && !isArchivedPid(farm.pid))
  const inactiveFarms = farmsLP.filter((farm) => farm.pid !== 0 && farm.multiplier === '0X' && !isArchivedPid(farm.pid))
  const archivedFarms = farmsLP.filter((farm) => isArchivedPid(farm.pid))

  const stakedOnlyFarms = activeFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const stakedInactiveFarms = inactiveFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const stakedArchivedFarms = archivedFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const farmsList = useCallback(
    (farmsToDisplay: Farm[]): FarmWithStakedValue[] => {
      let farmsToDisplayWithAPR: FarmWithStakedValue[] = farmsToDisplay.map((farm) => {
        if (!farm.lpTotalInQuoteToken || !farm.quoteToken.busdPrice) {
          return farm
        }
        const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteToken.busdPrice)
        const { cakeRewardsApr, lpRewardsApr } = isActive
          ? getFarmApr(new BigNumber(farm.poolWeight), cakePrice, totalLiquidity, farm.lpAddresses[ChainId.MAINNET])
          : { cakeRewardsApr: 0, lpRewardsApr: 0 }

        const temp = new BigNumber(totalLiquidityUSD)
        // return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: new BigNumber(totalLiquidityUSD) }
        return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
      })

      if (query) {
        const lowercaseQuery = latinise(query.toLowerCase())
        farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm: FarmWithStakedValue) => {
          return latinise(farm.lpSymbol.toLowerCase()).includes(lowercaseQuery)
        })
      }
      return farmsToDisplayWithAPR
    },
    [cakePrice, query, isActive, totalLiquidityUSD],
  )

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const [numberOfFarmsVisible, setNumberOfFarmsVisible] = useState(NUMBER_OF_FARMS_VISIBLE)
  const [observerIsSet, setObserverIsSet] = useState(false)

  const chosenFarmsMemoized = useMemo(() => {
    let chosenFarms = []

    const sortFarms = (farms: FarmWithStakedValue[]): FarmWithStakedValue[] => {
      switch (sortOption) {
        case 'apr':
          return orderBy(farms, (farm: FarmWithStakedValue) => farm.apr + farm.lpRewardsApr, 'desc')
        case 'multiplier':
          return orderBy(
            farms,
            (farm: FarmWithStakedValue) => (farm.multiplier ? Number(farm.multiplier.slice(0, -1)) : 0),
            'desc',
          )
        case 'earned':
          return orderBy(
            farms,
            (farm: FarmWithStakedValue) => (farm.userData ? Number(farm.userData.earnings) : 0),
            'desc',
          )
        case 'liquidity':
          return orderBy(farms, (farm: FarmWithStakedValue) => Number(farm.liquidity), 'desc')
        default:
          return farms
      }
    }

    if (isActive) {
      chosenFarms = stakedOnly ? farmsList(stakedOnlyFarms) : farmsList(activeFarms)
    }
    if (isInactive) {
      chosenFarms = stakedOnly ? farmsList(stakedInactiveFarms) : farmsList(inactiveFarms)
    }
    if (isArchived) {
      chosenFarms = stakedOnly ? farmsList(stakedArchivedFarms) : farmsList(archivedFarms)
    }

    return sortFarms(chosenFarms).slice(0, numberOfFarmsVisible)
  }, [
    sortOption,
    activeFarms,
    farmsList,
    inactiveFarms,
    archivedFarms,
    isActive,
    isInactive,
    isArchived,
    stakedArchivedFarms,
    stakedInactiveFarms,
    stakedOnly,
    stakedOnlyFarms,
    numberOfFarmsVisible,
  ])

  chosenFarmsLength.current = chosenFarmsMemoized.length

  useEffect(() => {
    const ac = new AbortController()
    const showMoreFarms = (entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        setNumberOfFarmsVisible((farmsCurrentlyVisible) => {
          if (farmsCurrentlyVisible <= chosenFarmsLength.current) {
            return farmsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE
          }
          return farmsCurrentlyVisible
        })
      }
    }

    if (!observerIsSet) {
      const loadMoreObserver = new IntersectionObserver(showMoreFarms, {
        rootMargin: '0px',
        threshold: 1,
      })
      loadMoreObserver.observe(loadMoreRef.current)
      setObserverIsSet(true)
    }

    return () => ac.abort()
  }, [chosenFarmsMemoized, observerIsSet])

  const rowData = chosenFarmsMemoized.map((farm) => {
    const { token, quoteToken } = farm
    const tokenAddress = token.address
    const quoteTokenAddress = quoteToken.address
    const lpLabel = farm.lpSymbol && farm.lpSymbol.split(' ')[0].toUpperCase().replace('PANCAKE', '')

    const row: RowProps = {
      apr: {
        // value: farm.apr.toString(),
        value: getDisplayApr(farm.apr, farm.lpRewardsApr),
        // value: farmApr,
        multiplier: farm.multiplier,
        lpLabel,
        tokenAddress,
        quoteTokenAddress,
        cakePrice,
        originalValue: farm.apr,
        // originalValue: farmApr
      },
      farm: {
        label: lpLabel,
        pid: farm.pid,
        token: farm.token,
        quoteToken: farm.quoteToken,
      },
      earned: {
        earnings: getBalanceNumber(new BigNumber(farm.userData.earnings)),
        pid: farm.pid,
      },
      liquidity: {
        liquidity: farm.liquidity,
        // liquidity: new BigNumber(totalLiquidityUSD),
      },
      multiplier: {
        multiplier: farm.multiplier,
        // multiplier: '100x',
      },
      details: farm,
    }

    return row
  })

  const renderContent = (): JSX.Element => {
    if (viewMode === ViewMode.TABLE && rowData.length) {
      const columnSchema = DesktopColumnSchema

      const columns = columnSchema.map((column) => ({
        id: column.id,
        name: column.name,
        label: column.label,
        sort: (a: RowType<RowProps>, b: RowType<RowProps>) => {
          switch (column.name) {
            case 'farm':
              return b.id - a.id
            case 'apr':
              if (a.original.apr.value && b.original.apr.value) {
                return Number(a.original.apr.value) - Number(b.original.apr.value)
              }

              return 0
            case 'earned':
              return a.original.earned.earnings - b.original.earned.earnings
            default:
              return 1
          }
        },
        sortable: column.sortable,
      }))

      return <Table data={rowData} columns={columns} userDataReady={userDataReady} />
    }

    return (
      <FlexLayout>
        <Route exact path={`${path}`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed={false}
            />
          ))}
        </Route>
        <Route exact path={`${path}/history`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed
            />
          ))}
        </Route>
        <Route exact path={`${path}/archived`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed
            />
          ))}
        </Route>
      </FlexLayout>
    )
  }

  const handleSortOptionChange = (option: OptionProps): void => {
    setSortOption(option.value)
  }

  const selectedTab = (tabIndex: number): void => {
    if (tabIndex === 0) {
      location.pathname = '/farms'
    } else {
      location.pathname = '/farms/history'
    }
  }

  return (
    <>
      <div style={{ height: 24 }} />
      <PageHeader>
        <Flex>
          <FarmLogo width="80" height="60" />
          <Flex flexDirection="column" ml="10px">
            <Text fontSize="26px" color="white" bold>
              {t('Farms')}
            </Text>
            <Text fontSize="15px">{t('Stake LP tokens to earn.')}</Text>
          </Flex>
        </Flex>
      </PageHeader>
      <Page>
        <SearchPannel
          stakedOnly={stakedOnly}
          setStakedOnly={setStakedOnly}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setSortOption={setSortOption}
          setQuery={setQuery}
        />
        {/* <ControlContainer>
          <ViewControls>
            <ToggleView viewMode={viewMode} onToggle={(mode: ViewMode) => setViewMode(mode)} />
            <ToggleWrapper>
              <Toggle checked={stakedOnly} onChange={() => setStakedOnly(!stakedOnly)} scale="sm" />
              <Text> {t('Staked only')}</Text>
            </ToggleWrapper>
            <FarmTabButtons hasStakeInFinishedFarms={stakedInactiveFarms.length > 0} />
          </ViewControls>
          <FilterContainer>
            <LabelWrapper>
              <Text textTransform="uppercase">{t('Sort by')}</Text>
              <Select
                options={[
                  {
                    label: t('Hot'),
                    value: 'hot',
                  },
                  {
                    label: t('APR'),
                    value: 'apr',
                  },
                  {
                    label: t('Multiplier'),
                    value: 'multiplier',
                  },
                  {
                    label: t('Earned'),
                    value: 'earned',
                  },
                  {
                    label: t('Liquidity'),
                    value: 'liquidity',
                  },
                ]}
                onChange={handleSortOptionChange}
              />
            </LabelWrapper>
            <LabelWrapper style={{ marginLeft: 16 }}>
              <Text textTransform="uppercase">{t('Search')}</Text>
              <SearchInput onChange={handleChangeQuery} placeholder="Search Farms" />
            </LabelWrapper>
          </FilterContainer>
        </ControlContainer> */}
        <SwapTabs
          selectedTabClassName="is-selected"
          selectedTabPanelClassName="is-selected"
          onSelect={(tabIndex) => selectedTab(tabIndex)}
        >
          <SwapTabList>
            <SwapTab>
              <Text>{t('Live')}</Text>
            </SwapTab>
            <SwapTab>
              <Text>{t('Finished')}</Text>
            </SwapTab>
            <SwapTab>
              <Text>{t('Bond')}</Text>
            </SwapTab>
          </SwapTabList>
          <Card bgColor={theme.isDark ? '#0E0E26' : '#2A2E60'} borderRadius="0 0 3px 3px" padding="20px 10px">
            <SwapTabPanel>
              {renderContent()}
              {account && !userDataLoaded && stakedOnly && (
                <Flex justifyContent="center">
                  <Loading />
                </Flex>
              )}
              <div ref={loadMoreRef} />
            </SwapTabPanel>
            <SwapTabPanel>
              {renderContent()}
              {account && !userDataLoaded && stakedOnly && (
                <Flex justifyContent="center">
                  <Loading />
                </Flex>
              )}
              <div ref={loadMoreRef} />
            </SwapTabPanel>
            <SwapTabPanel>
              <Bond />
            </SwapTabPanel>
          </Card>
        </SwapTabs>
      </Page>
    </>
  )
}

export default Farms
