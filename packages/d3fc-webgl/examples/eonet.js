const width = 1000;
const height = 500;

const reduceByTitle = (data, title) =>
    data.events.reduce((acc, curr) => {
        if (curr.categories[0].title === title) {
            curr = curr.geometries.map(val => {
                val = val.coordinates;
                return {
                    id: +curr.id.split('_')[1],
                    x: val[0],
                    y: val[1]
                };
            });
            return [...acc, ...curr];
        }
        return acc;
    }, []);

const generatePointChart = data => {
    const color = d3
        .scaleLinear()
        .domain(fc.extentLinear().accessors([d => d.id])(data))
        .range(['#d1e2f3', '#023858']);

    const colors = new Float32Array(data.length * 4);
    data.forEach((d, i) => {
        const index = i * 4;
        const rgb = color(d.id).split(/[(),]+/);
        colors[index] = rgb[1] / 255;
        colors[index + 1] = rgb[2] / 255;
        colors[index + 2] = rgb[3] / 255;
        colors[index + 3] = 1;
    });

    const xScale = d3
        .scaleLinear()
        .domain(
            fc
                .extentLinear()
                .accessors([d => d.x])
                .pad([0.1, 0.1])(data)
        )
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain(
            fc
                .extentLinear()
                .accessors([d => d.y])
                .pad([0.1, 0.1])(data)
        )
        .range([height, 0]);

    const pointSeries = fc
        .seriesWebglPoint()
        .crossValue(d => d.x)
        .mainValue(d => d.y)
        .size(32)
        .decorate(program => {
            program
                .vertexShader()
                .appendHeader(fc.vertexShaderSnippets.multiColor.header)
                .appendBody(fc.vertexShaderSnippets.multiColor.body);

            program
                .fragmentShader()
                .appendHeader(fc.fragmentShaderSnippets.multiColor.header)
                .appendBody(fc.fragmentShaderSnippets.multiColor.body);

            program.buffers().attribute('aColor', fc.attributeBuilder(colors));

            fc.pointStroke()(program);
            fc.pointAntiAlias()(program);
        });

    return fc
        .chartCartesian(xScale, yScale)
        .webglPlotArea(pointSeries)
        .xLabel('Longitude')
        .yLabel('Latitude')
        .yOrient('left');
};

d3.json('https://eonet.sci.gsfc.nasa.gov/api/v2.1/events?days=365', data => {
    console.log('Data:', data);
    const overviewData = data.events.reduce((acc, curr) => {
        for (let i = 0; i < acc.length; i += 1) {
            const val = acc[i];
            if (val.title === curr.categories[0].title) {
                val.count += 1;
                return acc;
            }
        }
        return [...acc, { title: curr.categories[0].title, count: 1 }];
    }, []);

    const xScale = d3
        .scaleBand()
        .domain(overviewData.map(d => d.title))
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(overviewData, d => d.count)])
        .range([height, 0]);

    const overviewBarSeries = fc
        .seriesWebglBar()
        .crossValue(d => d.title)
        .mainValue(d => d.count)
        .bandwidth(25)
        .decorate(program => {
            program
                .fragmentShader()
                .appendHeader(fc.fragmentShaderSnippets.seriesColor.header)
                .appendBody(fc.fragmentShaderSnippets.seriesColor.body);

            program
                .buffers()
                .uniform('uColor', fc.uniformBuilder([0.86, 0.86, 0.86, 1]));
        });

    const overviewChart = fc
        .chartCartesian(xScale, yScale)
        .chartLabel(
            'Total number of natural events from the last year considered still active'
        )
        .xLabel('Type of natural event')
        .yLabel('Total occurences')
        .xPadding(1)
        .yOrient('left')
        .webglPlotArea(overviewBarSeries);

    d3.select('#eonet-totals')
        .datum(overviewData)
        .call(overviewChart);

    const stormData = reduceByTitle(data, 'Severe Storms');
    console.log('Storm Data:', stormData);

    const stormChart = generatePointChart(stormData).chartLabel(
        'Storm Locations'
    );

    d3.select('#eonet-storms')
        .datum(stormData)
        .call(stormChart);

    const wildfireData = reduceByTitle(data, 'Wildfires');
    console.log('Wildfire Data:', wildfireData);

    const wildfireChart = generatePointChart(wildfireData).chartLabel(
        'Wildfire Locations'
    );

    d3.select('#eonet-wildfires')
        .datum(wildfireData)
        .call(wildfireChart);

    const volcanoData = reduceByTitle(data, 'Volcanoes');
    console.log('Volcano Data:', volcanoData);

    const volcanoChart = generatePointChart(volcanoData).chartLabel(
        'Volcano Locations'
    );

    d3.select('#eonet-volcanoes')
        .datum(volcanoData)
        .call(volcanoChart);

    const iceData = reduceByTitle(data, 'Sea and Lake Ice');
    console.log('Ice Data:', iceData);

    const iceChart = generatePointChart(iceData).chartLabel(
        'Sea and Lake Ice Locations'
    );

    d3.select('#eonet-ice')
        .datum(iceData)
        .call(iceChart);
});
