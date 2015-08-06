/**
 * VisualEffectInstance
 *
 * @param effect {L5.VisualEffect}
 * @param techniqueIndex {number}
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VisualEffectInstance = function (
    effect, techniqueIndex
) {
    L5.assert (effect !== null, 'Effect must be specified.');
    L5.assert (
        0 <= techniqueIndex && techniqueIndex < effect.getNumTechniques (),
        'Invalid technique index.');

    /**
     * @type {L5.VisualEffect}
     */
    this.effect         = effect;
    this.techniqueIndex = techniqueIndex;

    var technique = effect.getTechnique (techniqueIndex);
    var numPasses = technique.getNumPasses ();

    this.numPasses        = numPasses;
    this.vertexParameters = new Array (numPasses);
    this.fragParameters   = new Array (numPasses);

    for (var p = 0; p < numPasses; ++p) {
        var pass                   = technique.getPass (p);
        this.vertexParameters[ p ] = new L5.ShaderParameters (pass.vertexShader);
        this.fragParameters[ p ]   = new L5.ShaderParameters (pass.fragShader);
    }
};

L5.nameFix (L5.VisualEffectInstance, 'VisualEffectInstance');
L5.extendFix (L5.VisualEffectInstance, L5.D3Object);

L5.VisualEffectInstance.prototype.getNumPasses            = function () {
    return this.effect.getTechnique (this.techniqueIndex).getNumPasses ();
};
/**
 * @param pass {number}
 * @returns {L5.VisualPass}
 */
L5.VisualEffectInstance.prototype.getPass                 = function (
    pass
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.effect.getTechnique (this.techniqueIndex).getPass (pass);
    }

    L5.assert (false, 'Invalid pass index.');
    return null;
};
/**
 * @param pass {number}
 * @returns {L5.ShaderParameters}
 */
L5.VisualEffectInstance.prototype.getVertexParameters     = function (
    pass
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[ pass ];
    }
    L5.assert (false, 'Invalid pass index.');
    return null;
};
/**
 * @param pass {number}
 * @returns {L5.ShaderParameters}
 */
L5.VisualEffectInstance.prototype.getFragParameters       = function (
    pass
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[ pass ];
    }
    L5.assert (false, 'Invalid pass index.');
    return null;
};
/**
 * @param pass {number}
 * @param name {string}
 * @param sfloat {L5.ShaderFloat}
 * @returns {number}
 */
L5.VisualEffectInstance.prototype.setVertexConstantByName = function (
    pass, name, sfloat
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[ pass ].setConstantByName (name, sfloat);
    }
    L5.assert (false, 'Invalid pass index.');
    return -1;
};
/**
 * @param pass {number}
 * @param name {string}
 * @param sfloat {L5.ShaderFloat}
 * @returns {number}
 */
L5.VisualEffectInstance.prototype.setFragConstantByName   = function (
    pass, name, sfloat
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[ pass ].setConstantByName (name, sfloat);
    }

    L5.assert (false, 'Invalid pass index.\n');
    return -1;
};
/**
 * @param pass {number}
 * @param name {string}
 * @param texture {L5.Texture}
 * @returns {number}
 */
L5.VisualEffectInstance.prototype.setVertexTextureByName  = function (
    pass, name, texture
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[ pass ].setTextureByName (name, texture);
    }
    L5.assert (false, 'Invalid pass index.');
    return -1;
};
/**
 * @param pass {number}
 * @param name {string}
 * @param texture {L5.Texture}
 * @returns {number}
 */
L5.VisualEffectInstance.prototype.setFragTextureByName    = function (
    pass, name, texture
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[ pass ].setTextureByName (name, texture);
    }
    L5.assert (false, 'Invalid pass index.');
    return -1;
};
/**
 *
 * @param pass {number}
 * @param handle {number}
 * @param sfloat {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.setVertexConstant       = function (
    pass, handle, sfloat
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[ pass ].setConstant (handle, sfloat);
    }

    L5.assert (false, 'Invalid pass index.');
};
/**
 *
 * @param pass {number}
 * @param handle {number}
 * @param sfloat {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.setFragConstant         = function (
    pass, handle, sfloat
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[ pass ].setConstant (handle, sfloat);
    }

    L5.assert (false, 'Invalid pass index.');
};
/**
 *
 * @param pass {number}
 * @param handle {number}
 * @param texture {L5.Texture}
 */
L5.VisualEffectInstance.prototype.setVertexTexture        = function (
    pass, handle, texture
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[ pass ].setTexture (handle, texture);
    }

    L5.assert (false, 'Invalid pass index.');
};
/**
 *
 * @param pass {number}
 * @param handle {number}
 * @param texture {L5.Texture}
 */
L5.VisualEffectInstance.prototype.setFragTexture          = function (
    pass, handle, texture
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[ pass ].setTexture (handle, texture);
    }

    L5.assert (false, 'Invalid pass index.');
};

/**
 * @param pass {number}
 * @param name {string}
 * @returns {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.getVertexConstantByName = function (
    pass, name
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[ pass ].getConstantByName (name);
    }

    L5.assert (false, 'Invalid pass index.');
    return null;
};
/**
 * @param pass {number}
 * @param name {string}
 * @returns {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.getFragConstantByName   = function (
    pass, name
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[ pass ].getConstantByName (name);
    }

    L5.assert (false, 'Invalid pass index.\n');
    return 0;
};
/**
 * @param pass {number}
 * @param name {string}
 * @returns {L5.Texture}
 */
L5.VisualEffectInstance.prototype.getVertexTextureByName  = function (
    pass, name
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[ pass ].getTextureByName (name);
    }

    L5.assert (false, 'Invalid pass index.');
    return 0;
};
/**
 * @param pass {number}
 * @param name {string}
 * @returns {L5.Texture}
 */
L5.VisualEffectInstance.prototype.getFragTextureByName    = function (
    pass, name
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[ pass ].getTextureByName (name);
    }

    L5.assert (false, 'Invalid pass index.');
    return 0;
};

/**
 * @param pass {number}
 * @param handle {number}
 * @returns {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.getVertexConstant = function (
    pass, handle
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[ pass ].getConstant (handle);
    }

    L5.assert (false, 'Invalid pass index.');
    return 0;
};
/**
 * @param pass {number}
 * @param handle {number}
 * @returns {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.getFragConstant   = function (
    pass, handle
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[ pass ].getConstant (handle);
    }
    L5.assert (false, 'Invalid pass index.');
    return 0;
};
/**
 * @param pass {number}
 * @param handle {number}
 * @returns {L5.Texture}
 */

L5.VisualEffectInstance.prototype.getVertexTexture  = function (
    pass, handle
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[ pass ].getTexture (handle);
    }
    L5.assert (false, 'Invalid pass index.');
    return 0;
};
/**
 * @param pass {number}
 * @param handle {number}
 * @returns {L5.Texture}
 */
L5.VisualEffectInstance.prototype.getFragTexture    = function (
    pass, handle
) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[ pass ].getTexture (handle);
    }

    L5.assert (false, 'Invalid pass index.');
    return 0;
};