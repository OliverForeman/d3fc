import types from './types';

export default () => {
    let location = -1;
    let buffer = null;
    let size = 1; // per vertex
    let type = types.FLOAT;
    let normalized = false;
    let stride = 0;
    let offset = 0;
    let divisor = 0;

    const baseAttribute = programBuilder => {
        const gl = programBuilder.context();

        if (buffer == null || !gl.isBuffer(buffer)) {
            buffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(
            location,
            size,
            type,
            normalized,
            stride,
            offset
        );
        gl.enableVertexAttribArray(location);

        const ext = gl.getExtension('ANGLE_instanced_arrays');
        ext.vertexAttribDivisorANGLE(location, divisor);
    };

    baseAttribute.location = (...args) => {
        if (!args.length) {
            return location;
        }
        location = args[0];
        return baseAttribute;
    };

    baseAttribute.buffer = (...args) => {
        if (!args.length) {
            return buffer;
        }
        buffer = args[0];
        return baseAttribute;
    };

    baseAttribute.size = (...args) => {
        if (!args.length) {
            return size;
        }
        size = args[0];
        return baseAttribute;
    };

    baseAttribute.type = (...args) => {
        if (!args.length) {
            return type;
        }
        type = args[0];
        return baseAttribute;
    };

    baseAttribute.normalized = (...args) => {
        if (!args.length) {
            return normalized;
        }
        normalized = args[0];
        return baseAttribute;
    };

    baseAttribute.stride = (...args) => {
        if (!args.length) {
            return stride;
        }
        stride = args[0];
        return baseAttribute;
    };

    baseAttribute.offset = (...args) => {
        if (!args.length) {
            return offset;
        }
        offset = args[0];
        return baseAttribute;
    };

    baseAttribute.divisor = (...args) => {
        if (!args.length) {
            return divisor;
        }
        divisor = args[0];
        return baseAttribute;
    };

    return baseAttribute;
};
