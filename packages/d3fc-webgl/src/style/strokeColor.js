import * as fragmentShaderSnippets from '../shaders/fragmentShaderSnippets';
import * as vertexShaderSnippets from '../shaders/vertexShaderSnippets';
import constantAttribute from '../buffer/constantAttribute';
import elementAttribute from '../buffer/elementAttribute';
import { rebind } from '@d3fc/d3fc-rebind';

export default (initialValue = [0, 0, 0, 1]) => {
    const attribute = elementAttribute().size(4);

    let value = initialValue;
    let dirty = true;

    const strokeColor = programBuilder => {
        programBuilder
            .vertexShader()
            .appendHeaderIfNotExists(vertexShaderSnippets.strokeColor.header)
            .appendBodyIfNotExists(vertexShaderSnippets.strokeColor.body);
        programBuilder
            .fragmentShader()
            .appendHeaderIfNotExists(fragmentShaderSnippets.strokeColor.header)
            .appendBodyIfNotExists(fragmentShaderSnippets.strokeColor.body);

        if (!dirty) {
            return;
        }

        if (Array.isArray(value)) {
            programBuilder
                .buffers()
                .attribute('aStrokeColor', constantAttribute(value).size(4));
        } else if (typeof value === 'function') {
            attribute.value(value);
            programBuilder.buffers().attribute('aStrokeColor', attribute);
        } else {
            throw new Error(
                `Expected value to be an array or function, received ${value}`
            );
        }

        dirty = false;
    };

    strokeColor.value = (...args) => {
        if (!args.length) {
            return value;
        }
        if (value !== args[0]) {
            value = args[0];
            dirty = true;
        }
        return strokeColor;
    };

    rebind(strokeColor, attribute, 'data');

    return strokeColor;
};
