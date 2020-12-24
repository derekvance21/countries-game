import * as d3 from "d3";
var _ = require("lodash");

const getMap = () => {
  fetch("custom.geo.json", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((bb) => {
      const width = parseInt(d3.select("#map").style("width"));
      // const height = 600
      const height = window.innerHeight * 0.7;
      const aspectRatio = width / height;
      let projection = d3.geoEqualEarth()
        .fitSize([width, height], bb)
        .scale(aspectRatio * 45 + 140)
      let geoGenerator = d3.geoPath().pointRadius(2).projection(projection);

      let svg = d3
        .select("#map")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]) // prolly dont need this
        // .style("width", width + "px")
        // .style("height", height + "px")
        .attr("preserveAspectRatio", "xMinYMin")
        .call(d3.zoom()
        .scaleExtent([0.9,8])
          .extent([[0, 0], [width, height]])
          .on("zoom", ({transform}) => {d3.select("#map svg g").attr("transform", transform)}))

      svg
        .append("g")
        .selectAll("path")
        .data(bb.features)
        .join("path")
        .attr("id", function (d) {
          return d.properties.iso_a3;
        })
        .attr("class", function (d) {
          return _.kebabCase(d.properties.continent);
        })
        .classed("no-fill", true)
        .attr("d", geoGenerator)
        .attr("fill", "#fff")
        .attr("stroke", "#333")
        .attr("stroke-width", "0.5")
    })
    .catch((err) => {
      console.log(err);
    });
};

const colorPath = function (iso3) {
  d3.select(`#${iso3}`).classed("no-fill", false);
}

const colorCountry = function (code) {
  colorPath(code)
  switch(code) {
    case 'DNK':
      colorPath('GRL')
      break;
    case 'FRA':
      colorPath('NCL')
      break;
    case 'SOM':
      colorPath('SML')
      break;
    case 'CYP':
      colorPath('NCY')
      break;
    case 'MAR':
      colorPath('ESH')
      break;
    case 'USA':
      colorPath('PRI')
      break;
    case 'GBR':
      colorPath('FLK')
      break;
    default:
  }
};

const clearColors = function () {
  d3.selectAll("#map svg g path").classed("no-fill", true);
};

export default getMap;
export { colorCountry, clearColors };
