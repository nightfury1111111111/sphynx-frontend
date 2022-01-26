
import styled from 'styled-components'
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';

export const SwapTabs = styled(Tabs)`
  font-family: BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 12px;
`;

export const SwapTabList = styled(TabList)`
  list-style-type: none;
  display: flex;
  margin: 0;
`;

SwapTabList.tabsRole = 'TabList';

export const SwapTab = styled(Tab)<{borderBottom?: boolean}>`
  margin-top: 12px;
  padding: 10px;
  user-select: none;
  cursor: arrow;
  width: 100%;
  max-width: 195px;
  div {
    font-weight: 600;
    font-size: 14px;
    color: white;
    text-align: center;
    text-transform: capitalize;
  }

  &.is-selected {
    background: ${({ theme }) => theme.isDark ? "#0E0E26" : "#2A2E60"};  
    border-top: ${(props) => (props.borderBottom ? "unset" : "3px solid #C32BB4")};
    border-bottom: ${(props) => (props.borderBottom ? "3px solid #C32BB4" : "unset")};
    div {
      color: #C32BB4;
    }
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 0, 255, .5)
  }
`;
SwapTab.tabsRole = 'Tab';

export const SwapTabPanel = styled(TabPanel)`
  display: none;
  width: 100%;

  &.is-selected {
    display: block;
  }
`;

SwapTabPanel.tabsRole = 'TabPanel';

// const STab = () => {
//   return <div></div>
// }

// export default STab;