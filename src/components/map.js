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
      let width = 1000;
      let height = 500;
      let projection = d3.geoEqualEarth();
      projection.fitSize([width, height], bb);
      let geoGenerator = d3.geoPath().projection(projection);

      let svg = d3
        .select("#map")
        .append("svg")
        .style("width", width + "px")
        .style("height", height + "px");

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
        .attr("stroke", "#666");
    });
};

const colorCountry = function (code) {
  d3.select(`#${code}`).classed("no-fill", false);
};

const clearColors = function () {
  d3.selectAll("#map svg g path").classed("no-fill", true);
};

export default getMap;
export { colorCountry, clearColors };
