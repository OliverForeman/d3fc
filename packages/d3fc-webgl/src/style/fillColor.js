import * as fragmentShaderSnippets from '../shaders/fragmentShaderSnippets';
import * as vertexShaderSnippets from '../shaders/vertexShaderSnippets';
import constantAttribute from '../buffer/constantAttribute';
import elementAttribute from '../buffer/elementAttribute';
import { rebind } from '@d3fc/d3fc-rebind';

export default (initialValue = [0, 0, 0, 1]) => {
    const attribute = elementAttribute().size(4);

    let value = initialValue;
    let dirty = true;

    const fillColor = programBuilder => {
        programBuilder
            .vertexShader()
            .appendHeaderIfNotExists(vertexShaderSnippets.fillColor.header)
            .appendBodyIfNotExists(vertexShaderSnippets.fillColor.body);
        programBuilder
            .fragmentShader()
            .appendHeaderIfNotExists(fragmentShaderSnippets.fillColor.header)
            .appendBodyIfNotExists(fragmentShaderSnippets.fillColor.body);

        if (!dirty) {
            return;
        }

        if (Array.isArray(value)) {
            programBuilder
                .buffers()
                .attribute('aFillColor', constantAttribute(value).size(4));
        } else if (typeof value === 'function') {
            attribute.value(value);
            programBuilder.buffers().attribute('aFillColor', attribute);
        } else {
            throw new Error(
                `Expected value to be an array or function, received ${value}`
            );
        }

        dirty = false;
    };

    fillColor.value = (...args) => {
        if (!args.length) {
            return value;
        }
        if (value !== args[0]) {
            value = args[0];
            dirty = true;
        }
        return fillColor;
    };

    rebind(fillColor, attribute, 'data');

    return fillColor;
};
