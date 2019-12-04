const width = 1000;
const height = 500;

const webglAreaMin = fc
    .seriesWebglArea()
    .crossValue(d => d.sol)
    .mainValue(d => d.AT.mn)
    .decorate(program => {
        program
            .fragmentShader()
            .appendHeader(fc.fragmentShaderSnippets.seriesColor.header)
            .appendBody(fc.fragmentShaderSnippets.seriesColor.body);

        program
            .buffers()
            .uniform('uColor', fc.uniformBuilder([0.69, 0.88, 0.9, 0.5]));

        const gl = program.context();
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE_MINUS_SRC_ALPHA
        );
    });

const webglAreaMax = fc
    .seriesWebglArea()
    .crossValue(d => d.sol)
    .mainValue(d => d.AT.mx)
    .decorate(program => {
        program
            .fragmentShader()
            .appendHeader(fc.fragmentShaderSnippets.seriesColor.header)
            .appendBody(fc.fragmentShaderSnippets.seriesColor.body);

        program
            .buffers()
            .uniform('uColor', fc.uniformBuilder([0.53, 0.81, 0.98, 0.5]));

        const gl = program.context();
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE_MINUS_SRC_ALPHA
        );
    });

const webglLineAvg = fc
    .seriesWebglLine()
    .crossValue(d => d.sol)
    .mainValue(d => d.AT.av)
    .lineWidth(1);

d3.json(
    'https://api.nasa.gov/insight_weather/?api_key=PjTqywfKyXe14MZxBlfObMV9GON2zjzzqZrjuxB1&feedtype=json&ver=1.0',
    data => {
        data = data.sol_keys.map(key => ({
            sol: +key,
            ...data[key]
        }));

        const xScale = d3
            .scaleLinear()
            .domain(fc.extentLinear().accessors([d => d.sol])(data))
            .range([0, width]);

        const yScale = d3
            .scaleLinear()
            .domain(
                fc
                    .extentLinear()
                    .accessors([d => d.AT.mn, d => d.AT.mx])
                    .pad([0.05, 0.1])(data)
            )
            .range([height, 0]);

        const webglMulti = fc
            .seriesWebglMulti()
            .xScale(xScale)
            .yScale(yScale)
            .series([webglAreaMin, webglAreaMax, webglLineAvg]);

        const chart = fc
            .chartCartesian(xScale, yScale)
            .chartLabel(
                'Maximum, Minimum and Average atmospheric temperatures of Mars'
            )
            .webglPlotArea(webglMulti)
            .xLabel('Day (Sols)')
            .xTicks(data.length)
            .xTickFormat(d3.format('.3s'))
            .yLabel('Atmospheric temperature (degrees Celcius)')
            .yOrient('left');

        d3.select('#mars-webgl')
            .datum(data)
            .call(chart);
    }
);
