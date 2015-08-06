/**
 * TriMesh
 *
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexBuffer {L5.IndexBuffer}
 *
 * @class
 * @extends {L5.Triangles}
 *
 * @author lonphy
 * @version 1.0
 */
L5.TriMesh = function (
    format, vertexBuffer, indexBuffer
) {
    L5.Triangles.call (this, L5.Visual.PT_TRIMESH, format, vertexBuffer, indexBuffer);
};

L5.nameFix (L5.TriMesh, 'TriMesh');
L5.extendFix (L5.TriMesh, L5.Triangles);

/**
 * 获取网格中的三角形数量
 * @returns {number}
 */
L5.TriMesh.prototype.getNumTriangles = function () {
    return this.indexBuffer.numElements / 3;
};
/**
 * 获取位置I处的三角形索引
 * @param i {number}
 * @param output {Array} 3 elements
 * @returns {boolean}
 */
L5.TriMesh.prototype.getTriangle = function(
    i, output
) {
    if (0 <= i && i < this.getNumTriangles()) {
        var data = this.indexBuffer.getData();
        data = data.subarray(3*i);
        output[0] = data[0];
        output[1] = data[1];
        output[2] = data[2];
        return true;
    }
    return false;
};