import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { useMatchBreakpoints } from '@sphynxdex/uikit'
import styled from 'styled-components'

const ChartWrapper = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 700px;
  .chart-header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
    align-items: center;
    font-size: ${({ isMobile }) => (isMobile ? '20px' : '30px')};
    .header-card {
      display: flex;
      justify-content: center;
      align-items: center;
      width: ${({ isMobile }) => (isMobile ? '40px' : '60px')};
      height: ${({ isMobile }) => (isMobile ? '40px' : '60px')};
      border-radius: 3px;
      border: #aaa 1px solid;
      margin-right: 20px;
    }
  }
  .chart-content {
    display: flex;
    flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
    justify-content: center;
    align-items: center;
    width: 100%;
    .doughnut {
      padding: 20px;
      width: fit-content;
    }
    .chart-label {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: fit-content;
      padding: 20px;
      .distribute-label {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 10px;
      }
    }
  }
`

const LabelColor = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  height: 20px;
  width: 20px;
  border: 1px #aaa solid;
  border-radius: 3px;
  margin-right: 20px;
`

const chartColors = ['#336699', '#99CCFF', '#999933', '#666699', '#CC9933']

const options: any = {
  legend: {
    display: false,
    position: 'right',
  },
  responsive: false,
  maintainAspectRatio: true,
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
  cutoutPercentage: 80,
}

const distributeData = [22, 14, 0, 0, 64]
const distributeLabel = ['Burn', 'DxLock', 'Presale', 'Liquidity', 'Unlocked']

const data = {
  labels: distributeLabel,
  datasets: [
    {
      data: distributeData,
      backgroundColor: chartColors,
      hoverBackgroundColor: chartColors,
    },
  ],
}

const DistributeChart: React.FC = () => {
  const { isXl } = useMatchBreakpoints()
  const isMobile = !isXl
  // useEffect(() => {
  //   const legend = chartInstance.chartInstance.generateLegend();
  //   console.log(chartInstance, "textinput");
  //   console.log(legend);
  //   document.getElementById("legend").innerHTML = legend;
  // }, [chartInstance]);

  const plugins: any = [
    {
      beforeDraw: (chart) => {
        const width = chart.width
        const height = chart.height
        const ctx = chart.ctx
        ctx.restore()

        const fontSize = Number((height / 100).toFixed(2))
        ctx.font = `30px sans-serif`
        ctx.fillStyle = '#fff'
        ctx.textBaseline = 'top'
        let text = 'MSA'
        let textX = Math.round((width - ctx.measureText(text).width) / 2)
        let textY = height / 2 - 16 * fontSize
        ctx.fillText(text, textX, textY)

        ctx.font = `20px sans-serif`
        ctx.textBaseline = 'top'
        text = 'Distribution'
        textX = Math.round((width - ctx.measureText(text).width) / 2)
        textY = height / 2
        ctx.fillStyle = '#aaa'
        ctx.fillText(text, textX, textY)

        ctx.save()
      },
    },
  ]

  const renderLegend = () => {
    const labels = distributeLabel.map((label, index) => (
      <div className="distribute-label" key={label}>
        <LabelColor color={chartColors[index]} />
        <div className="distribute-name">{`${distributeLabel[index]} ${distributeData[index]}%`}</div>
      </div>
    ))
    return labels
  }

  return (
    <ChartWrapper isMobile={isMobile}>
      <div className="chart-header">
        <div className="header-card">Dx</div>
        <div className="header-str">DYOR Area</div>
      </div>
      <div className="chart-content">
        <div className="doughnut">
          <Doughnut
            data={data}
            width={isMobile ? 150 : 300}
            height={isMobile ? 150 : 300}
            options={options}
            plugins={plugins}
          />
        </div>
        <div className="chart-label">{renderLegend()}</div>
      </div>
    </ChartWrapper>
  )
}

export default DistributeChart
