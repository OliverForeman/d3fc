import errorBarBase from '../errorBarBase';
import isIdentityScale from '../isIdentityScale';
import {
    glErrorBar,
    webglElementAttribute,
    webglScaleMapper,
    webglTypes
} from '@d3fc/d3fc-webgl';
import { rebindAll, exclude, rebind } from '@d3fc/d3fc-rebind';

export default () => {
    const base = errorBarBase();

    const crossValueAttribute = webglElementAttribute();
    const highValueAttribute = webglElementAttribute();
    const lowValueAttribute = webglElementAttribute();
    const bandwidthAttribute = webglElementAttribute().type(webglTypes.UNSIGNED_SHORT);
    const definedAttribute = webglElementAttribute().type(webglTypes.UNSIGNED_BYTE);

    const draw = glErrorBar()
        .crossValueAttribute(crossValueAttribute)
        .highValueAttribute(highValueAttribute)
        .lowValueAttribute(lowValueAttribute)
        .bandwidthAttribute(bandwidthAttribute)
        .definedAttribute(definedAttribute);

    let equals = (previousData, data) => false;
    let previousData = [];

    const errorBar = (data) => {
        if (base.orient() !== 'vertical') {
            throw new Error(`Unsupported orientation ${base.orient()}`);
        }

        const xScale = webglScaleMapper(base.xScale());
        const yScale = webglScaleMapper(base.yScale());

        if (!isIdentityScale(xScale.scale) || !isIdentityScale(yScale.scale) || !equals(previousData, data)) {
            previousData = data;

            crossValueAttribute.value((data, i) => xScale.scale(base.crossValue()(data[i], i))).data(data);
            highValueAttribute.value((data, i) => yScale.scale(base.highValue()(data[i], i))).data(data);
            lowValueAttribute.value((data, i) => yScale.scale(base.lowValue()(data[i], i))).data(data);
            bandwidthAttribute.value((data, i) => base.bandwidth()(data[i], i)).data(data);
            definedAttribute.value((data, i) => base.defined()(data[i], i)).data(data);
        }

        draw.xScale(xScale.glScale)
            .yScale(yScale.glScale)
            .decorate((program) => base.decorate()(program, data, 0));

        draw(data.length);
    };

    errorBar.equals = (...args) => {
        if (!args.length) {
            return equals;
        }
        equals = args[0];
        return errorBar;
    };

    rebindAll(errorBar, base,  exclude('align'));
    rebind(errorBar, draw, 'context', 'lineWidth');

    return errorBar;
};
