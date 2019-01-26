/*eslint-disable no-magic-numbers */

import React from "react";
import { VictoryChart } from "../../packages/victory-chart/src/index";
import { VictoryAxis } from "../../packages/victory-axis/src/index";
import { VictoryBar } from "../../packages/victory-bar/src/index";
import { VictoryBrushLine } from "../../packages/victory-brush-line/src/index";
import { VictoryScatter } from "../../packages/victory-scatter/src/index";
import { VictoryClipContainer } from "../../packages/victory-core/src/index";
import { VictoryZoomContainer } from "../../packages/victory-zoom-container/src/index";
import { VictoryBrushContainer } from "../../packages/victory-brush-container/src/index";

const height = 400;
const width = 800;
const padding = { top: 50, left: 50, right: 0, bottom: 50 };


class App extends React.Component {
  constructor() {
    super();
    this.state = {
      bars: [
        { name: "SEA", range: [new Date(2013, 1, 1), new Date(2019, 1, 1)] },
        { name: "HKG", range: [new Date(2015, 1, 1), new Date(2015, 5, 1)] },
        { name: "LHR", range: [new Date(2016, 5, 1), new Date(2019, 1, 1)] },
        { name: "DEN", range: [new Date(2018, 8, 1), new Date(2019, 1, 1)] }
      ],
      points: [
        { name: "SEA", date: new Date(2012, 9, 1) },
        { name: "HKG", date: new Date(2014, 3, 1) },
        { name: "LHR", date: new Date(2015, 6, 1) },
        { name: "DEN", date: new Date(2018, 3, 1) }
      ]
    };
  }

  getAxisOffset(index) {
    const step = (height - padding.top - padding.bottom) / (this.state.bars.length - 1);
    return step * index + padding.bottom;
  }

  handleZoom(domain) {
    this.setState({ zoomDomain: domain });
  }

  onDomainChange(domain, props) {
    const { name } = props;
    const bars = this.state.bars.map((bar) => bar.name === name ? { name, range: domain } : bar);
    this.setState({ bars });
  }

  render() {
    const containerStyle = {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center"
    };
    return (
      <div style={containerStyle}>
        <VictoryChart
          scale={{ x: "time" }}
          domain={{ x: [new Date(2012, 1, 1), new Date(2019, 1, 1)], y: [1, 4] }}
          height={height}
          width={width}
          padding={padding}
          containerComponent={
            <VictoryZoomContainer
              responsive={false}
              allowPan={false}
              zoomDomain={this.state.zoomDomain}
              zoomDimension="x"
              onZoomDomainChange={this.handleZoom.bind(this)}
              clipContainerComponent={
                <VictoryClipContainer clipPadding={{ top: 15, bottom: 15 }} />
              }
            />
          }
        >
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: "none" }
            }}
            tickValues={this.state.bars.map((b) => b.name)}
          />

          {this.state.bars.map((bar, index) => (
            <VictoryAxis
              name={bar.name}
              key={index}
              axisComponent={
                <VictoryBrushLine
                  name={bar.name}
                  width={20}
                  brushDomain={bar.range}
                  onBrushDomainChange={this.onDomainChange.bind(this)}
                />
              }
              offsetY={this.getAxisOffset(index)}
              tickFormat={() => ""}
            />
          ))}
          <VictoryScatter
            data={this.state.points}
            x="date"
            y="name"
          />
        </VictoryChart>
        <VictoryChart
          padding={{ top: 10, left: 50, right: 0, bottom: 30 }}
          width={800}
          height={100}
          scale={{ x: "time" }}
          domain={{ x: [new Date(2012, 1, 1), new Date(2019, 1, 1)], y: [1, 4] }}
          containerComponent={
            <VictoryBrushContainer
              responsive={false}
              brushDomain={this.state.zoomDomain}
              brushDimension="x"
              onBrushDomainChange={this.handleZoom.bind(this)}
            />
          }
        >
          <VictoryAxis dependentAxis
            tickValues={this.state.bars.map((b) => b.name)}
          />
          <VictoryScatter
            data={this.state.points}
            x="date"
            y="name"
          />
          <VictoryBar horizontal
            data={this.state.bars}
            x="name"
            y={(d) => d.range[0]}
            y0={(d) => d.range[1]}
          />
        </VictoryChart>
      </div>
    );
  }
}

export default App;
