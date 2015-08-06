/**
 * TextureCube 底层封装
 * @param renderer
 * @param texture
 * @constructor
 */
L5.GLTextureCube = function (
    renderer, texture
) {
    var gl              = renderer.gl;
    var _format         = texture.format;
    this.internalFormat = L5.Webgl.TextureFormat[ _format ];

    this.format = L5.Webgl.TextureFormat[ _format ];
    this.type   = L5.Webgl.TextureType[ _format ];

    // Create pixel buffer objects to store the texture data.
    var level, levels = texture.numLevels;
    this.numLevels    = levels;

    for (level = 0; level < levels; ++level) {
        this.numLevelBytes[ level ]  = texture.numLevelBytes[ level ];
        this.dimension[ 0 ][ level ] = texture.getDimension (0, level);
        this.dimension[ 1 ][ level ] = texture.getDimension (1, level);
    }

    // Create a texture structure.
    this.texture         = gl.createTexture ();
    this.previousTexture = gl.getTexParameter (gl.TEXTURE_BINDING_CUBE_MAP);
    gl.bindTexture (gl.TEXTURE_CUBE_MAP, this.texture);

    var face;
    // Create the mipmap level structures.  No image initialization occurs.
    this.isCompressed = texture.isCompressed ();
    if (this.isCompressed) {
        for (face = 0; face < 6; ++face) {
            for (level = 0; level < levels; ++level) {
                gl.compressedTexImage2D (
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
                    level,
                    this.internalFormat,
                    this.dimension[ 0 ][ level ],
                    this.dimension[ 1 ][ level ],
                    0,
                    this.numLevelBytes[ level ],
                    0);
            }
        }
    } else {
        for (face = 0; face < 6; ++face) {
            for (level = 0; level < mNumLevels; ++level) {
                gl.texImage2D (
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
                    level,
                    this.internalFormat,
                    this.dimension[ 0 ][ level ],
                    this.dimension[ 1 ][ level ],
                    0,
                    this.format,
                    this.type,
                    texture.getData (level)
                );
            }
        }
    }

    gl.bindTexture (gl.TEXTURE_CUBE_MAP, previousBind);
};

/**
 * @param renderer {L5.Renderer}
 * @param textureUnit {number}
 */
L5.GLTextureCube.prototype.enable  = function (
    renderer, textureUnit
) {
    var gl               = renderer.gl;
    gl.activeTexture (gl.TEXTURE0 + textureUnit);
    this.previousTexture = gl.getTexParameter (gl.TEXTURE_BINDING_CUBE_MAP);
    gl.bindTexture (gl.TEXTURE_CUBE_MAP, this.texture);
};
/**
 * @param renderer {L5.Renderer}
 * @param textureUnit {number}
 */
L5.GLTextureCube.prototype.disable = function (
    renderer, textureUnit
) {
    var gl = renderer.gl;
    gl.activeTexture (gl.TEXTURE0 + textureUnit);
    gl.bindTexture (gl.TEXTURE_CUBE_MAP, this.previousTexture);
};