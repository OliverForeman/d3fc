const width = 1000;
const height = 500;

const generateAreaSeries = (mainValueAccessor, color) =>
    fc
        .seriesWebglArea()
        .crossValue(d => d.sol)
        .mainValue(mainValueAccessor)
        .decorate(program => {
            program
                .fragmentShader()
                .appendHeader(fc.fragmentShaderSnippets.seriesColor.header)
                .appendBody(fc.fragmentShaderSnippets.seriesColor.body);

            program.buffers().uniform('uColor', fc.uniformBuilder(color));

            const gl = program.context();
            gl.enable(gl.BLEND);
            gl.blendFuncSeparate(
                gl.SRC_ALPHA,
                gl.ONE_MINUS_SRC_ALPHA,
                gl.ONE,
                gl.ONE_MINUS_SRC_ALPHA
            );
        });

const generateLineSeries = (
    mainValueAccessor,
    lineWidth = 1.5,
    color = [0, 0, 0, 1]
) =>
    fc
        .seriesWebglLine()
        .crossValue(d => d.sol)
        .mainValue(mainValueAccessor)
        .lineWidth(lineWidth)
        .decorate(program => {
            program
                .fragmentShader()
                .appendHeader(fc.fragmentShaderSnippets.seriesColor.header)
                .appendBody(fc.fragmentShaderSnippets.seriesColor.body);

            program.buffers().uniform('uColor', fc.uniformBuilder(color));
        });

const generateYScale = (accessors, pad, data) =>
    d3
        .scaleLinear()
        .domain(
            fc
                .extentLinear()
                .accessors(accessors)
                .pad(pad)(data)
        )
        .range([height, 0]);

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

        const temperatureYScale = generateYScale(
            [d => d.AT.mn, d => d.AT.mx],
            [0.05, 0.1],
            data
        );

        const temperatureAreaMin = generateAreaSeries(d => d.AT.mn, [
            0.69,
            0.88,
            0.9,
            0.5
        ]);
        const temperatureLineMin = generateLineSeries(d => d.AT.mn, 3, [
            0.69,
            0.88,
            0.9,
            1
        ]);

        const temperatureAreaMax = generateAreaSeries(d => d.AT.mx, [
            0.53,
            0.81,
            0.98,
            0.5
        ]);
        const temperatureLineMax = generateLineSeries(d => d.AT.mx, 3, [
            0.53,
            0.81,
            0.98,
            1
        ]);

        const temperatureLine = generateLineSeries(d => d.AT.av);

        const temperatureMulti = fc
            .seriesWebglMulti()
            .xScale(xScale)
            .yScale(temperatureYScale)
            .series([
                temperatureAreaMin,
                temperatureLineMin,
                temperatureAreaMax,
                temperatureLineMax,
                temperatureLine
            ]);

        const temperatureChart = fc
            .chartCartesian(xScale, temperatureYScale)
            .chartLabel(
                'Maximum, Minimum and Average atmospheric temperatures of Mars'
            )
            .webglPlotArea(temperatureMulti)
            .xLabel('Day (Sols)')
            .xOrient('top')
            .xTicks(data.length)
            .xTickFormat(d3.format('.3s'))
            .yLabel('Atmospheric temperature (degrees Celcius)')
            .yOrient('left');

        d3.select('#mars-temperature')
            .datum(data)
            .call(temperatureChart);

        const windSpeedYScale = generateYScale(
            [d => d.HWS.mn, d => d.HWS.mx],
            [0, 0.1],
            data
        );

        const windSpeedAreaMin = generateAreaSeries(d => d.HWS.mn, [
            0.53,
            0.81,
            0.98,
            0.5
        ]);
        const windSpeedLineMin = generateLineSeries(d => d.HWS.mn, 3, [
            0.53,
            0.81,
            0.98,
            1
        ]);

        const windSpeedAreaMax = generateAreaSeries(d => d.HWS.mx, [
            0.69,
            0.88,
            0.9,
            0.5
        ]);
        const windSpeedLineMax = generateLineSeries(d => d.HWS.mx, 3, [
            0.69,
            0.88,
            0.9,
            1
        ]);

        const windSpeedLine = generateLineSeries(d => d.HWS.av);

        const windSpeedMulti = fc
            .seriesWebglMulti()
            .xScale(xScale)
            .yScale(windSpeedYScale)
            .series([
                windSpeedAreaMax,
                windSpeedLineMax,
                windSpeedAreaMin,
                windSpeedLineMin,
                windSpeedLine
            ]);

        const windSpeedChart = fc
            .chartCartesian(xScale, windSpeedYScale)
            .chartLabel(
                'Maximum, Minimum and Average horizontal wind speed of Mars'
            )
            .webglPlotArea(windSpeedMulti)
            .xLabel('Day (Sols)')
            .xTicks(data.length)
            .xTickFormat(d3.format('.3s'))
            .yLabel('Horizontal wind speed (m/s)')
            .yOrient('left');

        d3.select('#mars-wind-speed')
            .datum(data)
            .call(windSpeedChart);

        const pressureYScale = generateYScale(
            [d => d.PRE.mn, d => d.PRE.mx],
            [0.05, 0.1],
            data
        );

        const pressureAreaMin = generateAreaSeries(d => d.PRE.mn, [
            0.53,
            0.81,
            0.98,
            0.5
        ]);
        const pressureLineMin = generateLineSeries(d => d.PRE.mn, 3, [
            0.53,
            0.81,
            0.98,
            1
        ]);

        const pressureAreaMax = generateAreaSeries(d => d.PRE.mx, [
            0.69,
            0.88,
            0.9,
            0.5
        ]);
        const pressureLineMax = generateLineSeries(d => d.PRE.mx, 3, [
            0.69,
            0.88,
            0.9,
            1
        ]);

        const pressureLine = generateLineSeries(d => d.PRE.av);

        const pressureMulti = fc
            .seriesWebglMulti()
            .xScale(xScale)
            .yScale(pressureYScale)
            .series([
                pressureAreaMax,
                pressureLineMax,
                pressureAreaMin,
                pressureLineMin,
                pressureLine
            ]);

        const pressureChart = fc
            .chartCartesian(xScale, pressureYScale)
            .chartLabel(
                'Maximum, Minimum and Average atmospheric pressure of Mars'
            )
            .webglPlotArea(pressureMulti)
            .xLabel('Day (Sols)')
            .xTicks(data.length)
            .xTickFormat(d3.format('.3s'))
            .yLabel('Atmospheric pressure (Pascals)')
            .yOrient('left');

        d3.select('#mars-pressure')
            .datum(data)
            .call(pressureChart);
    }
);
