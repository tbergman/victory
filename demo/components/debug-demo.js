/*eslint-disable no-magic-numbers */

import React from "react";
import { VictoryChart } from "../../packages/victory-chart/src/index";
import { VictoryAxis } from "../../packages/victory-axis/src/index";
import { VictoryBar } from "../../packages/victory-bar/src/index";
import { VictoryBrushLine } from "../../packages/victory-brush-line/src/index";
import { VictoryLine } from "../../packages/victory-line/src/index";
import { VictoryScatter } from "../../packages/victory-scatter/src/index";
import { VictoryLabel } from "../../packages/victory-core/src/index";
import { VictoryZoomContainer } from "../../packages/victory-zoom-container/src/index";
import { VictoryBrushContainer } from "../../packages/victory-brush-container/src/index";
import _ from "lodash";

const data = [
  { name: "Adrien", strength: 5, intelligence: 30, speed: 500, luck: 3 },
  { name: "Brice", strength: 1, intelligence: 13, speed: 550, luck: 2 },
  { name: "Casey", strength: 4, intelligence: 15, speed: 80, luck: 1 },
  { name: "Drew", strength: 3, intelligence: 25, speed: 600, luck: 5 },
  { name: "Erin", strength: 9, intelligence: 50, speed: 350, luck: 4 },
  { name: "Francis", strength: 2, intelligence: 40, speed: 200, luck: 2 }
];

const attributes = ["cat", "dog", "bird"];
const height = 400;
const width = 800;
const padding = { top: 50, left: 50, right: 50, bottom: 50 };

class App extends React.Component {
  constructor() {
    super();
    const maximumValues = this.getMaximumValues();
    const datasets = this.normalizeData(maximumValues);
    this.state = {
      maximumValues,
      datasets,
      filters: {},
      activeDatasets: [],
      isFiltered: false,
      externalMutation: undefined
    };
  }

  getMaximumValues() {
    return attributes.map((attribute) => {
      return data.reduce((memo, datum) => {
        return datum[attribute] > memo ? datum[attribute] : memo;
      }, -Infinity);
    });
  }

  normalizeData(maximumValues) {
    // construct normalized datasets by dividing the value for each attribute by the maximum value
    return data.map((datum) => ({
      name: datum.name,
      data: attributes.map((attribute, i) => ({
        y: attribute,
        x: datum[attribute] / maximumValues[i]
      }))
    }));
  }

  addNewFilters(domain, props) {
    const filters = this.state.filters || {};
    const extent = domain && Math.abs(domain[1] - domain[0]);
    const minVal = 1 / Number.MAX_SAFE_INTEGER;
    filters[props.name] = extent <= minVal ? undefined : domain;
    return filters;
  }

  getActiveDatasets(filters) {
    // Return the names from all datasets that have values within all filters
    const isActive = (dataset) => {
      return _.keys(filters).reduce((memo, name) => {
        if (!memo || !Array.isArray(filters[name])) {
          return memo;
        }
        const point = _.find(dataset.data, (d) => d.y === name);
        return (
          point && Math.max(...filters[name]) >= point.x && Math.min(...filters[name]) <= point.x
        );
      }, true);
    };

    return this.state.datasets
      .map((dataset) => {
        return isActive(dataset, filters) ? dataset.name : null;
      })
      .filter(Boolean);
  }

  onDomainChange(domain, props) {
    const filters = this.addNewFilters(domain, props);
    const isFiltered = !_.isEmpty(_.values(filters).filter(Boolean));
    const activeDatasets = isFiltered ? this.getActiveDatasets(filters) : this.state.datasets;
    this.setState({ activeDatasets, filters, isFiltered });
  }

  isActive(dataset) {
    // Determine whether a given dataset is active
    return !this.state.isFiltered ? true : _.includes(this.state.activeDatasets, dataset.name);
  }

  getAxisOffset(index) {
    const step = (height - padding.top - padding.bottom) / (attributes.length - 1);
    return step * index + padding.bottom;
  }

  removeMutation() {
    this.setState({
      externalMutation: undefined
    });
  }

  clearMutation() {
    const callback = this.removeMutation.bind(this);
    this.setState({
      filters: {},
      activeDatasets: [],
      isFiltered: false,
      externalMutation: [
        {
          childName: attributes,
          target: "axis",
          eventKey: "all",
          mutation: () => {
            return { brushDomain: [0, 1 / Number.MAX_SAFE_INTEGER] };
          },
          callback
        }
      ]
    });
  }

  handleZoom(domain) {
    this.setState({ zoomDomain: domain });
  }

  render() {
    const containerStyle = {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center"
    };
    const chartStyle = { parent: { border: "1px solid #ccc", margin: "2%", maxWidth: "40%" } };
    return (
        <div style={containerStyle}>
          <VictoryChart
            domain={{ x: [0, 1.1], y: [0.5, 3.5] }}
            height={height}
            width={width}
            padding={padding}
            containerComponent={
              <VictoryZoomContainer
                responsive={false}
                zoomDomain={this.state.zoomDomain}
                zoomDimension="x"
                onZoomDomainChange={this.handleZoom.bind(this)}
              />
            }
          >
            <VictoryAxis
              dependentAxis
              style={{
                tickLabels: { fontSize: 10 },
                axis: { stroke: "none" }
              }}
              tickValues={[1, 2, 3]}
            />

            {attributes.map((attribute, index) => (
              <VictoryAxis
                name={attribute}
                key={index}
                externalEventMutations={this.state.externalMutation}
                axisComponent={
                  <VictoryBrushLine
                    name={attribute}
                    width={20}
                    onBrushDomainChange={this.onDomainChange.bind(this)}
                  />
                }
                offsetY={this.getAxisOffset(index)}
                tickFormat={() => ""}
              />
            ))}
            <VictoryScatter
              data={[
                { x: 0.2, y: "bird" },
                { x: 0.3, y: "cat" },
                { x: 0.1, y: "bird" },
                { x: 0.5, y: "dog" },
                { x: 0.9, y: "cat" },
                { x: 0.1, y: "cat" },
                { x: 0.4, y: "bird" },
                { x: 0.8, y: "dog" }
              ]}
            />
          </VictoryChart>
          <VictoryChart
            padding={{ top: 0, left: 50, right: 50, bottom: 30 }}
            width={800}
            height={100}
            domain={{ x: [0, 1.1], y: [0.5, 3.5] }}
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
              tickValues={["cat", "dog", "bird"]}
            />
            <VictoryScatter
              data={[
                { x: 0.2, y: "bird" },
                { x: 0.3, y: "cat" },
                { x: 0.1, y: "bird" },
                { x: 0.5, y: "dog" },
                { x: 0.9, y: "cat" },
                { x: 0.1, y: "cat" },
                { x: 0.4, y: "bird" },
                { x: 0.8, y: "dog" }
              ]}
            />
          </VictoryChart>
      </div>
    );
  }
}

export default App;
