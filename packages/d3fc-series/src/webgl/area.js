import xyBase from '../xyBase';
import isIdentityScale from '../isIdentityScale';
import { glArea, scaleMapper, elementConstantAttributeBuilder } from '@d3fc/d3fc-webgl';
import { rebindAll, exclude, rebind } from '@d3fc/d3fc-rebind';

export default () => {
    const base = xyBase();

    const draw = glArea();

    let equals = (previousData, data) => false;
    let previousData = [];

    const area = (data) => {
        const xScale = scaleMapper(base.xScale());
        const yScale = scaleMapper(base.yScale());

        if (isIdentityScale(xScale.scale) && isIdentityScale(yScale.scale) && !equals(previousData, data)) {
            previousData = data;

            const xValues = new Float32Array(data.length);
            const yValues = new Float32Array(data.length);
            const y0Values = new Float32Array(data.length);
            const defined = new Float32Array(data.length);

            data.forEach((d, i) => {
                xValues[i] = xScale.scale(base.crossValue()(d, i));
                yValues[i] = yScale.scale(base.mainValue()(d, i));
                y0Values[i] = yScale.scale(base.baseValue()(d, i));
                defined[i] = base.defined()(d, i);
            });

            const xAttribute = elementConstantAttributeBuilder()
                .data(data)
                .value((d, i) => xScale.scale(base.crossValue()(d, Math.min(i + 1, data.length - 1))));

            draw.xValues(xAttribute)
                .yValues(data, (d, i) => yScale.scale(base.mainValue()(d, Math.min(i + 1, data.length - 1))))
                .y0Values(data, (d, i) => yScale.scale(base.baseValue()(d, Math.min(i + 1, data.length - 1))))
                .defined(data, (d, i) => {
                    const value = base.defined()(d, i);
                    const nextValue = i === data.length - 1 ? 0 : base.defined()(d, i + 1);
                    return value ? nextValue : value;
                });
        }

        draw.xScale(xScale.glScale)
            .yScale(yScale.glScale)
            .decorate((program) => base.decorate()(program, data, 0));

        draw(data.length);
    };

    area.equals = (...args) => {
        if (!args.length) {
            return equals;
        }
        equals = args[0];
        return area;
    };

    rebindAll(area, base, exclude('bandwidth', 'align'));
    rebind(area, draw, 'context');

    return area;
};
