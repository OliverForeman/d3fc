import attributeBuilder from '../buffers/attributeBuilder';
import glScaleBase from '../scale/glScaleBase';
import programBuilder from '../program/programBuilder';
import ohlcShader from '../shaders/ohlc/shader';
import drawModes from '../program/drawModes';
import { rebind } from '@d3fc/d3fc-rebind';

export default () => {
  let program = programBuilder();
  let xScale = glScaleBase();
  let yScale = glScaleBase();
  let decorate = () => {};
  let x = null;
  let open = null;
  let high = null;
  let low = null;
  let close = null;
  let bandwidth = null;
  let lineWidth = null;

  const xValueAttrib = 'aXValue';
  const yValueAttrib = 'aYValue';
  const xLineWidthAttrib = 'aXLineWidth';
  const yLineWidthAttrib = 'aYLineWidth';
  const bandwidthAttrib = 'aBandwidth';
  const colorAttrib = 'aColor';

  const draw = (numElements) => {
    const shaderBuilder = ohlcShader();
    program.vertexShader(shaderBuilder.vertex())
      .fragmentShader(shaderBuilder.fragment())
      .mode(drawModes.TRIANGLES);

    xScale.coordinate(0);
    xScale(program);
    yScale.coordinate(1);
    yScale(program);

    decorate(program);

    const buffers = buildBuffers(x, open, high, low, close, bandwidth, lineWidth, numElements);
    console.log('buffers:', buffers);
    bindBuffers(program, buffers);

    program(numElements * 18);
  };

  draw.x = (...args) => {
    if (!args.length) {
      return x;
    }
    x = args[0];
    return draw;
  };

  draw.open = (...args) => {
    if (!args.length) {
      return open;
    }
    open = args[0];
    return draw;
  };

  draw.high = (...args) => {
    if (!args.length) {
      return high;
    }
    high = args[0];
    return draw;
  };

  draw.low = (...args) => {
    if (!args.length) {
      return low;
    }
    low = args[0];
    return draw;
  };

  draw.close = (...args) => {
    if (!args.length) {
      return close;
    }
    close = args[0];
    return draw;
  };

  draw.bandwidth = (...args) => {
    if (!args.length) {
      return bandwidth;
    }
    bandwidth = args[0];
    return draw;
  };

  draw.lineWidth = (...args) => {
    if (!args.length) {
      return lineWidth;
    }
    lineWidth = args[0];
    return draw;
  };

  draw.decorate = (...args) => {
    if (!args.length) {
      return decorate;
    }
    decorate = args[0];
    return draw;
  };

  draw.xScale = (...args) => {
    if (!args.length) {
      return xScale;
    }
    xScale = args[0];
    return draw;
  };

  draw.yScale = (...args) => {
    if (!args.length) {
      return yScale;
    }
    yScale = args[0];
    return draw;
  };

  const buildBuffers = (x, open, high, low, close, bandwidth, lineWidth, numElements) => {
    const buffers = {
      x: [],
      y: [],
      xLineWidth: [],
      yLineWidth: [],
      bandwidth: [],
      color: []
    };

    const addToBuffers = (xBuf, yBuf, xLineWidthBuf, yLineWidthBuf, bandwidthBuf) => {
      buffers.x.push(xBuf);
      buffers.y.push(yBuf);
      buffers.xLineWidth.push(xLineWidthBuf);
      buffers.yLineWidth.push(yLineWidthBuf);
      buffers.bandwidth.push(bandwidthBuf);
    };

    const red = [1, 0, 0, 1];
    const green = [0, 1, 0, 1];
    const redArray = [];
    const greenArray = [];
    for (let i = 0; i < 18; i += 1) {
      redArray.push(...red);
      greenArray.push(...green);
    }

    for (let i = 0; i < numElements; i += 1) {
      const xi = x[i];
      const openi = open[i];
      const highi = high[i];
      const lowi = low[i];
      const closei = close[i];
      const bandwidthi = bandwidth[i];
      const lineWidthi = lineWidth[i];

      // Low to High bar
      addToBuffers(xi, lowi, lineWidthi, 0, 0);
      addToBuffers(xi, lowi, -lineWidthi, 0, 0);
      addToBuffers(xi, highi, -lineWidthi, 0, 0);

      addToBuffers(xi, lowi, lineWidthi, 0, 0);
      addToBuffers(xi, highi, lineWidthi, 0, 0);
      addToBuffers(xi, highi, -lineWidthi, 0, 0);

      // Open bar
      addToBuffers(xi, openi, -lineWidthi, lineWidthi, 0);
      addToBuffers(xi, openi, -lineWidthi, -lineWidthi, 0);
      addToBuffers(xi, openi, -lineWidthi, -lineWidthi, -bandwidthi);

      addToBuffers(xi, openi, -lineWidthi, lineWidthi, 0);
      addToBuffers(xi, openi, -lineWidthi, lineWidthi, -bandwidthi);
      addToBuffers(xi, openi, -lineWidthi, -lineWidthi, -bandwidthi);

      // Close bar
      addToBuffers(xi, closei, lineWidthi, -lineWidthi, 0);
      addToBuffers(xi, closei, lineWidthi, lineWidthi, 0);
      addToBuffers(xi, closei, lineWidthi, lineWidthi, bandwidthi);

      addToBuffers(xi, closei, lineWidthi, -lineWidthi, 0);
      addToBuffers(xi, closei, lineWidthi, -lineWidthi, bandwidthi);
      addToBuffers(xi, closei, lineWidthi, lineWidthi, bandwidthi);

      // Set color
      const barColor = openi < closei ? greenArray : redArray;
      buffers.color.push(...barColor);
    }

    return buffers;
  };

  const bindBuffers = (program, buffers) => {
    const xBuffer = program.buffers().attribute(xValueAttrib);
    const yBuffer = program.buffers().attribute(yValueAttrib);
    const xLineWidthBuffer = program.buffers().attribute(xLineWidthAttrib);
    const yLineWidthBuffer = program.buffers().attribute(yLineWidthAttrib);
    const bandwidthBuffer = program.buffers().attribute(bandwidthAttrib);
    const colorBuffer = program.buffers().attribute(colorAttrib);

    const xArray = new Float32Array(buffers.x);
    const yArray = new Float32Array(buffers.y);
    const xLineWidthArray = new Float32Array(buffers.xLineWidth);
    const yLineWidthArray = new Float32Array(buffers.yLineWidth);
    const bandwidthArray = new Float32Array(buffers.bandwidth);
    const colorArray = new Float32Array(buffers.color);

    if (xBuffer) {
      xBuffer.data(xArray);
      yBuffer.data(yArray);
      xLineWidthBuffer.data(xLineWidthArray);
      yLineWidthBuffer.data(yLineWidthArray);
      bandwidthBuffer.data(bandwidthArray);
      colorBuffer.data(colorArray);
    } else {
      program.buffers().attribute(xValueAttrib, attributeBuilder(xArray).components(1));
      program.buffers().attribute(yValueAttrib, attributeBuilder(yArray).components(1));
      program.buffers().attribute(xLineWidthAttrib, attributeBuilder(xLineWidthArray).components(1));
      program.buffers().attribute(yLineWidthAttrib, attributeBuilder(yLineWidthArray).components(1));
      program.buffers().attribute(bandwidthAttrib, attributeBuilder(bandwidthArray).components(1));
      program.buffers().attribute(colorAttrib, attributeBuilder(colorArray).components(4));
    }
  };

  rebind(draw, program, 'context');

  return draw;
};
