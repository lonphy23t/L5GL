/**
 * 材质漫反射系数
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class MaterialDiffuseConstant extends ShaderFloat {

    /**
     * @param material {Material} 材质
     */
    constructor(material) {
        super(1);
        this.allowUpdater = true;
        this.material = material;
    }

    /**
     * 更新材质漫反射系数
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update(visual, camera) {
        this.copy(this.material.diffuse);
    }

    load(inStream) {
        super.load(inStream);
        this.material = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.material = inStream.resolveLink(this.material);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.material);
    }
};

D3Object.Register('L5.MaterialDiffuseConstant', MaterialDiffuseConstant.factory);