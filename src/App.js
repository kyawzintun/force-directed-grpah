import React, { Component } from 'react';
import logo from './logo.svg';
import blankgif from './blank.gif';
import './App.css';
import './flags.min.css';

import * as d3 from 'd3';

const jsonUrl = "https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json";

class App extends Component {
  componentDidMount() {
    fetch(jsonUrl)
    .then(res => { return res.json() })
    .then(res => {
      this.drawGraph(res);
    })
  }

  drawGraph(data) {
    const flagNodes = d3.select(".flag-wrapper");

    const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = 4;


    const div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    const color = d3.scaleOrdinal(d3.schemeCategory20);
    const linkForce =  d3.forceLink().distance(50).strength(1);

    const simulation = d3.forceSimulation()
        .force('link', linkForce)
        .force("charge", d3.forceManyBody().strength(-10))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const node = flagNodes.selectAll(".node")
      .data(data.nodes)
      .enter().append("img")
      .attr("class", d => { return "flag flag-" + d.code})
      .on("mouseover", function(d) {
        div.transition()
          .duration(100)
          .style("opacity", .9);
        div.html(
          "<div class='info'>"+ d.country +
              "</div>")     
          .style("left", (d3.event.pageX + 7) + "px")             
          .style("top", (d3.event.pageY - 20) + "px");
      })
      .on("mouseout", function(d) {
        div.transition()
          .duration(100)
          .style("opacity", 0);
      })
      .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

    const link = svg.selectAll("line")
      .data(data.links)
      .enter()
        .append("line")

    simulation.nodes(data.nodes).on('tick', () => {
      node
        .style("left", function(d) { return Math.max(radius, Math.min(width - radius, d.x)) - 8 + 'px' })
        .style("top", function(d) { return Math.max(radius, Math.min(height - radius, d.y)) - 8 + 'px' })

      link
        .attr('x1', link => link.source.x)
        .attr('y1', link => link.source.y)
        .attr('x2', link => link.target.x)
        .attr('y2', link => link.target.y)
    })

    simulation.force('link').links(data.links)

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">National Contiguity with a Force Directed Graph</h1>
        </header>
        <div className="svg-wrapper">
          <div className="flag-wrapper"></div>
          <svg width='1000' height='800'></svg>
        </div>
      </div>
    );
  }
}

export default App;
