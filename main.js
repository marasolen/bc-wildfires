let wildfires, provinces, groupedFires;
const tooltipPadding = 15;

const setupMapVisualization = () => {
    const containerWidth = document.getElementById("map-visualization").clientWidth;
    const containerHeight = document.getElementById("map-visualization").clientHeight;

    const margin = {
        top: 0.00 * containerHeight,
        right: 0.025 * containerWidth,
        bottom: 0.05 * containerHeight,
        left: 0.025 * containerWidth
    };

    const width = containerWidth - (margin.right + margin.left);
    const height = containerHeight - (margin.top + margin.bottom);

    const svg = d3.select("#map-visualization");
    const chartArea = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([-139, -113])
        .range([0, width]);
    const yScale = d3.scaleLinear()
        .domain([48.2, 60.5])
        .range([height, 0]);

    const colourScheme = year => d3.interpolateTurbo((year - 1998) / 26);

    const makePath = coordinates => {
        const points = coordinates[0].map(point => [xScale(point[0]), yScale(point[1])]);
        const path = d3.path();
        path.moveTo(...points[0]);
        points.slice(1).forEach(point => path.lineTo(...point));
        path.closePath();
        return path;
    }
    
    chartArea.selectAll(".province")
        .data(provinces[0].geometry.coordinates)
        .join("path")
        .attr("class", "province")
        .attr("fill", "white")
        .attr("d", makePath);
    
    chartArea.selectAll(".fire")
        .data(wildfires)
        .join("path")
        .attr("class", "fire")
        .attr("fill", d => colourScheme(d.properties.FIRE_YEAR))
        .attr("fill-opacity", 0.5)
        .attr("d", d => makePath(d.geometry.coordinates))
        .attr("stroke", "grey")
        .attr('stroke-width', 1);

    const swatchCount = 300;
    chartArea.selectAll(".legend-swatches")
        .data([...Array(swatchCount).keys()].map(n => n / swatchCount))
        .join("rect")
        .attr("width", width / swatchCount)
        .attr("height", margin.bottom / 2)
        .attr("x", d => d * width)
        .attr("y", height)
        .attr("fill", d => d3.interpolateTurbo(d));

    chartArea.selectAll(".legend-labels")
        .data([1998, 2011, 2024])
        .join("text")
        .attr("transform", d => `translate(${(d - 1998 + 0.5) * width / 27}, ${height + margin.bottom * 4 / 5})`)
        .attr("text-multiplier", 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#EEEEEE")
        .text(d => d);

};

const setupTemporalVisualization = () => {
    const containerWidth = document.getElementById("temporal-visualization").clientWidth;
    const containerHeight = document.getElementById("temporal-visualization").clientHeight;

    const margin = {
        top: 0.0 * containerHeight,
        right: 0.05 * containerWidth,
        bottom: 0.0 * containerHeight,
        left: 0.05 * containerWidth
    };

    const width = containerWidth - (margin.right + margin.left);
    const height = containerHeight - (margin.top + margin.bottom);

    const svg = d3.select("#temporal-visualization");
    const chartArea = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    let fireCounts = groupedFires.map(d => [d[0], d[1].length]);
    fireCounts.sort((a, b) => a[0] - b[0]);

    let fireSizes = groupedFires.map(d => [d[0], d[1].reduce((a, c) => a + c.properties.FEATURE_AREA_SQM, 0)]);
    fireSizes.sort((a, b) => a[0] - b[0]);

    const xScale = d3.scaleLinear()
        .domain([1998, 2024])
        .range([0, width]);
    const yScaleCount = d3.scaleLinear()
        .domain([0, d3.max(fireCounts.map(d => d[1]))])
        .range([height * 0.47, 0]);
    const yScaleSize = d3.scaleLinear()
        .domain([0, d3.max(fireSizes.map(d => d[1]))])
        .range([height * 0.53, height]);

    const countArea = d3.area()
        .x(d => xScale(d[0]))
        .y0(height * 0.47)
        .y1(d => yScaleCount(d[1]))
        .curve(d3.curveBumpX);

    const sizeArea = d3.area()
        .x(d => xScale(d[0]))
        .y0(height * 0.53)
        .y1(d => yScaleSize(d[1]))
        .curve(d3.curveBumpX);

    const topGradient = svg.append("defs").append("linearGradient")
        .attr("id", "top")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");
    topGradient.append("stop")
        .attr("offset", "0%")
        .style("stop-color", "#900c00")
        .style("stop-opacity", 1);
    topGradient.append("stop")
        .attr("offset", "100%")
        .style("stop-color", "#f1cb2c")
        .style("stop-opacity", 1);

    const botGradient = svg.append("defs").append("linearGradient")
        .attr("id", "bot")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");
    botGradient.append("stop")
        .attr("offset", "0%")
        .style("stop-color", "#f1cb2c")
        .style("stop-opacity", 1);
    botGradient.append("stop")
        .attr("offset", "100%")
        .style("stop-color", "#900c00")
        .style("stop-opacity", 1);
    
    chartArea.selectAll(".curve-count")
        .data([fireCounts])
        .join("path")
        .attr("class", "curve-count")
        .attr("fill", "url(#top)")
        .attr("d", countArea);
    
    chartArea.selectAll(".curve-size")
        .data([fireSizes])
        .join("path")
        .attr("class", "curve-size")
        .attr("fill", "url(#bot)")
        .attr("d", sizeArea);

    chartArea.selectAll(".legend-labels")
        .data([1998, 2009, 2015, 2018, 2021, 2023])
        .join("text")
        .attr("transform", d => `translate(${xScale(d)}, ${height / 2})`)
        .attr("text-multiplier", 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#EEEEEE")
        .text(d => d);
};

const renderVisualization = () => {
    setupMapVisualization();
    setupTemporalVisualization();
};

const resizeAndRender = () => {
    d3.selectAll("svg > *").remove();

    d3.selectAll("#map-visualization")
        .attr("height", "70vh");

    const ratio = 15 / 11;
    if (document.getElementById("map-visualization").clientHeight * ratio > document.getElementById("map-visualization-container").clientWidth) {
        d3.selectAll("#map-visualization")
            .attr("width", document.getElementById("map-visualization-container").clientWidth)
            .attr("height", document.getElementById("map-visualization-container").clientWidth / ratio);
    } else {
        d3.selectAll("#map-visualization")
            .attr("width", document.getElementById("map-visualization").clientHeight * ratio);
    }

    d3.selectAll("#temporal-visualization")
        .attr("height", "40vh")
        .attr("width", "100%");

    renderVisualization();

    d3.selectAll("text")
        .attr("font-size", function() { return d3.select(this).attr("text-multiplier") * 0.03 * document.getElementById("temporal-visualization").clientHeight });
};

window.onresize = resizeAndRender;

Promise.all([d3.json('data/historical_fire_data.geojson'), d3.json('data/canada_provinces.geojson')]).then(([_fires, _provinces]) => {
    wildfires = _fires.features.filter(d => d.properties.FIRE_YEAR >= 1998);
    provinces = _provinces.features.filter(d => d.properties.NAME === "British Columbia");
    groupedFires = d3.groups(wildfires, d => d.properties.FIRE_YEAR);

    resizeAndRender();
});