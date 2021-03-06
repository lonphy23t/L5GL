(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

let buf = new Uint32Array(1);
let dv = new DataView(buf.buffer);
dv.setUint32(0, 0x12345678, true); // little endian

const WebGL_VERSION = 'webgl2';

function runApplication(Klass) {
    if (!document.querySelector('.l5-nodes-info')) {
        let nodesInfo = document.createElement('div');
        nodesInfo.className = 'l5-nodes-info';
        document.body.appendChild(nodesInfo);
    }
    let l5Instance = new Klass();
    l5Instance.run();
    window.x = l5Instance;
}

/**
 * 类枚举定义
 * @param {Object} tar    枚举承载体
 * @param {Object<String, *>} val 枚举变量键值
 * @param {boolean} lock 是否锁定类
 */
function DECLARE_ENUM(tar, val, lock = true) {
    for (let k in val) {
        if (val.hasOwnProperty(k)) {
            Object.defineProperty(tar, k, { value: val[k] });
        }
    }
    if (lock) Object.seal(tar);
}

/**
 * Math - 通用工具类
 * @version 2.0
 * @author lonphy
 */

const _Math = {
    // 一些通用常量.
    EPSILON: 1e-07,
    ZERO_TOLERANCE: 1e-07,
    MAX_REAL: window.Infinity,
    PI: 3.14159265358979323846,
    TWO_PI: 2 * 3.14159265358979323846,
    HALF_PI: 0.5 * 3.14159265358979323846,
    INV_PI: 1 / 3.14159265358979323846,
    INV_TWO_PI: 1 / (3.14159265358979323846 * 2),
    DEG_TO_RAD: 3.14159265358979323846 / 180,
    RAD_TO_DEG: 180 / 3.14159265358979323846,
    LN_2: Math.log(2),
    LN_10: Math.log(10),
    INV_LN_2: 1 / Math.log(2),
    INV_LN_10: 1 / Math.log(10),
    SQRT_2: Math.sqrt(2),
    INV_SQRT_2: 1 / Math.sqrt(2),
    SQRT_3: Math.sqrt(3),
    INV_SQRT_3: 1 / Math.sqrt(3),

    // native function
    random: Math.random,
    floor: Math.floor,
    ceil: Math.ceil,
    abs: Math.abs,
    atan: Math.atan,
    atan2: Math.atan2,
    exp: Math.exp,
    cos: Math.cos,
    sin: Math.sin,
    tan: Math.tan,

    /**
     * 开平方
     * @param {number} value 
     * @returns {number}
     */
    sqrt(value) {
        if (value >= 0) {
            return Math.sqrt(value);
        }
        console.warn('Negative input to Sqrt');
        return 0;
    },
    /**
     * 是否是2的整次幂
     * @param {number} value 需要判断的整数
     * @returns {boolean}
     */
    isPowerOfTwo(value) {
        return (value > 0) && ((value & (value - 1)) === 0);
    },
    /**
     * 判断2个浮点数是否相等
     * @param a {number}
     * @param b {number}
     * @returns {boolean}
     */
    floatEqual(a, b) {
        if (Math.abs(a - b) < 0.000001) {
            return true;
        }
        return false;
    },

    /**
     * 获取以2为底的对数
     * @param powerOfTwo {number}
     * @returns {number}
     */
    log2OfPowerOfTwo(powerOfTwo) {
        let log2 = (powerOfTwo & 0xaaaaaaaa) !== 0;
        log2 |= ((powerOfTwo & 0xffff0000) !== 0) << 4;
        log2 |= ((powerOfTwo & 0xff00ff00) !== 0) << 3;
        log2 |= ((powerOfTwo & 0xf0f0f0f0) !== 0) << 2;
        log2 |= ((powerOfTwo & 0xcccccccc) !== 0) << 1;
        return log2;
    },

    /**
     * 转换IEEE 32位浮点数value[0,1]到32位整数[0,2^power-1]
     */
    scaledFloatToInt: (function () {
        let da = new Float32Array([0]);
        let dv = new DataView(da.buffer);

        /**
         * @param {number} value 需要转换的浮点数 [0,1]
         * @param power {number}
         * @returns {number}
         */
        return function (value, power) {
            da[0] = value;
            let result = 0;
            let shift = 150 - power - (dv.getUint8(3) << 1) + (dv.getUint8(2) >> 7);
            if (shift < 24) {
                result = ((dv.getUint32(0) & 0x007fffff) | 0x00800000) >> shift;
                if (result === (1 << power)) {
                    --result;
                }
            }
            return result;
        };
    })(),

    /**
     * @param {number} value
     * @returns {number}
     */
    acos(value) {
        if (-1 < value) {
            return value < 1 ? Math.acos(value) : 0;
        }
        return this.PI;
    },


    /**
     * @param {number} value
     * @returns {number}
     */

    asin(value) {
        if (-1 < value) {
            return value < 1 ? Math.asin(value) : this.HALF_PI;
        }
        return -HALF_PI;
    },

    /**
     * @param {number} value
     * @returns {number}
     */
    invSqrt(value) {
        if (value !== 0) {
            return 1 / Math.sqrt(value);
        }
        console.warn('Division by zero in invSqr');
        return 0;
    },
    /**
     * @param {number} value
     * @returns {number}
     */
    log(value) {
        if (value > 0) {
            return Math.log(value);
        }
        console.warn('Nonpositive input to log');
        return 0;
    },

    /**
     * @param {number} value
     * @returns {number}
     */
    log2(value) {
        if (value > 0) {
            return this.INV_LN_2 * Math.log(value);
        }
        console.warn('Nonpositive input to log2');
        return 0;
    },

    /**
     * @param {number} value
     * @returns {number}
     */
    log10(value) {
        if (value > 0) {
            return this.INV_LN_10 * Math.log(value);
        }
        console.warn('Nonpositive input to log10');
        return 0;
    },

    /**
     * @param {number} base
     * @param {number} exponent
     * @returns {number}
     */
    pow(base, exponent) {
        if (base >= 0) {
            return Math.pow(base, exponent);
        }
        console.warn('Negative base not allowed in Pow');
        return this.MAX_REAL;
    },

    /**
     * 求平方
     * @param {number} value
     * @returns {number}
     */
    sqr(value) {
        return value * value;
    },

    /**
     * 获取值的符号
     * -1 负 1 正 0 零值
     * @param {number} value
     * @returns {number}
     */
    sign(value) {
        if (value > 0) {
            return 1;
        }
        if (value < 0) {
            return -1;
        }
        return 0;
    },

    /**
     * 生成[-1,1]随机数
     * @returns {number}
     */
    symmetricRandom() {
        return 2 * Math.random() - 1;
    },

    /**
     * 生成[0,1]随机数
     * @returns {number}
     */
    unitRandom() {
        return Math.random();
    },

    /**
     * 生成[min,max]随机数
     * @param {number} min 随机数的最小值
     * @param {number} max 随机数的最大值
     * @returns {number}
     */
    intervalRandom(min, max) {
        return min + (max - min) * Math.random();
    },

    intervalIntRandom(min, max) {
        return Math.floor(min + (max - min) * Math.random());
    },

    /**
     * Clamp the input to the specified interval [min,max].
     * @param {number} value 夹取的值
     * @param {number} min 区间开始
     * @param {number} max 区间结束
     * @returns {number}
     */
    clamp(value, min, max) {
        if (value <= min) {
            return min;
        }
        if (value >= max) {
            return max;
        }
        return value;
    },

    /**
     * Clamp the input to [0,1].
     * @param {number} value
     * @returns {number}
     */
    saturate(value) {
        if (value <= 0) {
            return 0;
        }
        if (value >= 1) {
            return 1;
        }
        return value;
    },

    // ================= 快速版本的三角/反三角函数,使用多项式逼近，提升计算性能 ====================
    /**
     * @param {number} angle 必须在[0,pi/2]
     * @returns {number}
     */
    fastSin0(angle) {
        const angleSqr = angle * angle;
        let result = 7.61e-03;
        result *= angleSqr;
        result -= 1.6605e-01;
        result *= angleSqr;
        result += 1;
        return result * angle;
    },

    /**
     * @param {number} angle 必须在[0,pi/2]
     * @returns {number}
     */
    fastSin1(angle) {
        const angleSqr = angle * angle;
        let result = -2.39e-08;
        result *= angleSqr;
        result += 2.7526e-06;
        result *= angleSqr;
        result -= 1.98409e-04;
        result *= angleSqr;
        result += 8.3333315e-03;
        result *= angleSqr;
        result -= 1.666666664e-01;
        result *= angleSqr;
        result += 1;
        return result * angle;
    },

    /**
     * @param {number} angle 必须在[0,pi/2]
     * @returns {number}
     */
    fastCos0(angle) {
        const angleSqr = angle * angle;
        let result = 3.705e-02;
        result *= angleSqr;
        result -= 4.967e-01;
        return result * angleSqr + 1;
    },

    /**
     * @param {number} angle 必须在[0,pi/2]
     * @returns {number}
     */
    fastCos1(angle) {
        const angleSqr = angle * angle;
        let result = -2.605e-07;
        result *= angleSqr;
        result += 2.47609e-05;
        result *= angleSqr;
        result -= 1.3888397e-03;
        result *= angleSqr;
        result += 4.16666418e-02;
        result *= angleSqr;
        result -= 4.999999963e-01;
        return result * angleSqr + 1;
    },

    /**
     * @param {number} angle 必须在[0,pi/4]
     * @returns {number}
     */
    fastTan0(angle) {
        const angleSqr = angle * angle;
        let result = 2.033e-01;
        result *= angleSqr;
        result += 3.1755e-01;
        result *= angleSqr;
        result += 1;
        return result * angle;
    },

    /**
     * @param {number} angle 必须在[0,pi/4]
     * @returns {number}
     */
    fastTan1(angle) {
        const angleSqr = angle * angle;
        let result = 9.5168091e-03;
        result *= angleSqr;
        result += 2.900525e-03;
        result *= angleSqr;
        result += 2.45650893e-02;
        result *= angleSqr;
        result += 5.33740603e-02;
        result *= angleSqr;
        result += 1.333923995e-01;
        result *= angleSqr;
        result += 3.333314036e-01;
        result *= angleSqr;
        result += 1;
        return result * angle;
    },

    /**
     * @param {number} value 必须在[0,1]
     * @returns {number}
     */
    fastInvSin0(value) {
        let root = Math.sqrt(Math.abs(1 - value));
        let result = -0.0187293;
        result *= value;
        result += 0.0742610;
        result *= value;
        result -= 0.2121144;
        result *= value;
        result += 1.5707288;
        result = this.HALF_PI - root * result;
        return result;
    },

    /**
     * @param {number} value 必须在[0,1]
     * @returns {number}
     */
    fastInvSin1(value) {
        let root = Math.sqrt(Math.abs(1 - value));
        let result = -0.0012624911;
        result *= value;
        result += 0.0066700901;
        result *= value;
        result -= 0.0170881256;
        result *= value;
        result += 0.0308918810;
        result *= value;
        result -= 0.0501743046;
        result *= value;
        result += 0.0889789874;
        result *= value;
        result -= 0.2145988016;
        result *= value;
        result += 1.5707963050;
        result = this.HALF_PI - root * result;
        return result;
    },

    /**
     * @param {number} value 必须在[0,1]
     * @returns {number}
     */
    fastInvCos0(value) {
        const root = Math.sqrt(Math.abs(1 - value));
        let result = -0.0187293;
        result *= value;
        result += 0.0742610;
        result *= value;
        result -= 0.2121144;
        result *= value;
        result += 1.5707288;
        return result * root;
    },

    /**
     * @param {number} value 必须在[0,1]
     * @returns {number}
     */
    fastInvCos1(value) {
        let root = Math.sqrt(Math.abs(1 - value));
        let result = -0.0012624911;
        result *= value;
        result += 0.0066700901;
        result *= value;
        result -= 0.0170881256;
        result *= value;
        result += 0.0308918810;
        result *= value;
        result -= 0.0501743046;
        result *= value;
        result += 0.0889789874;
        result *= value;
        result -= 0.2145988016;
        result *= value;
        result += 1.5707963050;
        return result * root;
    },

    /**
     * @param {number} value 必须在[-1,1]
     * @returns {number}
     */
    fastInvTan0(value) {
        const valueSqr = value * value;
        let result = 0.0208351;
        result *= valueSqr;
        result -= 0.085133;
        result *= valueSqr;
        result += 0.180141;
        result *= valueSqr;
        result -= 0.3302995;
        result *= valueSqr;
        result += 0.999866;
        return result * value;
    },

    /**
     * @param {number} value 必须在[-1,1]
     * @returns {number}
     */
    fastInvTan1(value) {
        const valueSqr = value * value;
        let result = 0.0028662257;
        result *= valueSqr;
        result -= 0.0161657367;
        result *= valueSqr;
        result += 0.0429096138;
        result *= valueSqr;
        result -= 0.0752896400;
        result *= valueSqr;
        result += 0.1065626393;
        result *= valueSqr;
        result -= 0.1420889944;
        result *= valueSqr;
        result += 0.1999355085;
        result *= valueSqr;
        result -= 0.3333314528;
        result *= valueSqr;
        result += 1;
        return result * value;
    },

    // ============= exp(-x)快速逼近版本 =============================
    /**
     * @param {number} value 值必须在[0, Infinity)
     * @returns {number}
     */
    fastNegExp0(value) {
        let result = 0.0038278;
        result *= value;
        result += 0.0292732;
        result *= value;
        result += 0.2507213;
        result *= value;
        result += 1;
        result *= result;
        result *= result;
        return 1 / result;
    },

    /**
     * @param {number} value 值必须在[0, Infinity)
     * @returns {number}
     */
    fastNegExp1(value) {
        let result = 0.00026695;
        result *= value;
        result += 0.00227723;
        result *= value;
        result += 0.03158565;
        result *= value;
        result += 0.24991035;
        result *= value;
        result += 1;
        result *= result;
        result *= result;
        return 1 / result;
    },

    /**
     * @param {number} value 值必须在[0, Infinity)
     * @returns {number}
     */
    fastNegExp2(value) {
        let result = 0.000014876;
        result *= value;
        result += 0.000127992;
        result *= value;
        result += 0.002673255;
        result *= value;
        result += 0.031198056;
        result *= value;
        result += 0.250010936;
        result *= value;
        result += 1;
        result *= result;
        result *= result;
        return 1 / result;
    },

    /**
     * @param {number} value 值必须在[0, Infinity)
     * @returns {number}
     */
    fastNegExp3(value) {
        let result = 0.0000006906;
        result *= value;
        result += 0.0000054302;
        result *= value;
        result += 0.0001715620;
        result *= value;
        result += 0.0025913712;
        result *= value;
        result += 0.0312575832;
        result *= value;
        result += 0.2499986842;
        result *= value;
        result += 1;
        result *= result;
        result *= result;
        return 1 / result;
    }
};

/**
 * Vector
 *
 * @author lonphy
 * @version 2.0
 */
class Vector$1 extends Float32Array {

    constructor(x = 0, y = 0, z = 0) {
        super(4);
        if (x instanceof Float32Array) {
            this.set(x.slice(0, 3));
        } else {
            this[0] = x;
            this[1] = y;
            this[2] = z;
        }
        // this[3] = 0;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    get w() {
        return this[3];
    }

    set x(n) {
        this[0] = n;
    }

    set y(n) {
        this[1] = n;
    }

    set z(n) {
        this[2] = n;
    }

    set w(n) {
        this[3] = n;
    }

    /**
     * 复制
     * @param {Vector} vec
     * @returns {Vector}
     */
    copy(vec) {
        this.set(vec);
        return this;
    }

    /**
     * 赋值
     * @param {float} x
     * @param {float} y
     * @param {float} z
     */
    assign(x, y, z) {
        this[0] = x;
        this[1] = y;
        this[2] = z;
    }

    /**
     * 求向量长度
     * none side-effect
     * @returns {number}
     */
    get length() {
        let x = this[0];
        let y = this[1];
        let z = this[2];
        return _Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * 长度平方
     * none side-effect
     * @returns {number}
     */
    squaredLength() {
        let x = this[0];
        let y = this[1];
        let z = this[2];
        return x * x + y * y + z * z;
    }

    /**
     * 是否相等
     * @param {Vector} v
     */
    equals(v) {
        return this[0] === v[0] && this[1] === v[1] && this[2] === v[2];
    }

    /**
     * 规格化向量
     */
    normalize() {
        let length = this.length;
        if (length === 1) {
            return length;
        } else if (length > 0) {
            let invLength = 1 / length;
            this[0] *= invLength;
            this[1] *= invLength;
            this[2] *= invLength;
        } else {
            length = 0;
            this[0] = 0;
            this[1] = 0;
            this[2] = 0;
        }
        return length;
    }

    /**
     * calc cross to vec
     * 
     * none side-effect
     * @param {Vector} vec
     */
    cross(vec) {
        return new Vector$1(
            this[1] * vec[2] - this[2] * vec[1],
            this[2] * vec[0] - this[0] * vec[2],
            this[0] * vec[1] - this[1] * vec[0]
        );
    }

    /**
     * calc unitCross to vec
     * 
     * none side-effect
     * @param {Vector} vec
     */
    unitCross(vec) {
        let x = this[0], y = this[1], z = this[2],
            bx = vec[0], by = vec[1], bz = vec[2];
        let cross = new Vector$1(
            y * bz - z * by,
            z * bx - x * bz,
            x * by - y * bx
        );
        cross.normalize();
        return cross;
    }

    /**
     * add two Vector
     * 
     * none side-effect
     * @param {Vector} v
     */
    add(v) {
        return new Vector$1(
            this[0] + v[0],
            this[1] + v[1],
            this[2] + v[2]
        );
    }

    /**
     * sub two Vector
     * 
     * none side-effect
     * @param {Vector} v
     */
    sub(v) {
        return new Vector$1(
            this[0] - v[0],
            this[1] - v[1],
            this[2] - v[2]
        );
    }

    /**
     * scalar Vector
     * 
     * none side-effect
     * @param {number} scalar
     */
    scalar(scalar) {
        return new Vector$1(
            this[0] * scalar,
            this[1] * scalar,
            this[2] * scalar
        );
    }

    /**
     * div Vector
     * 
     * none side-effect
     * @param {number} scalar
     */
    div(scalar) {
        if (scalar !== 0) {
            scalar = 1 / scalar;

            return new Vector$1(
                this[0] * scalar,
                this[1] * scalar,
                this[2] * scalar
            );
        }
        return Vector$1.ZERO;
    }

    /**
     * negative Vector  
     * none side-effect
     */
    negative () {
        return new Vector$1(-this[0], -this[1], -this[2]);
    }

    /**
     * dot two Vector  
     * none side-effect
     * @param v {Vector}
     */
    dot(v) {
        return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
    }

    static get ZERO() {
        return new Vector$1();
    }

    static get UNIT_X() {
        return new Vector$1(1);
    }

    static get UNIT_Y() {
        return new Vector$1(0, 1);
    }

    static get UNIT_Z() {
        return new Vector$1(0, 0, 1);
    }

    /**
     * 正交化给定的3个向量
     *
     * u0 = normalize(v0)  
     * u1 = normalize(v1 - dot(u0,v1)u0)  
     * u2 = normalize(v2 - dot(u0,v2)u0 - dot(u1,v2)u1)  
     *
     * @param {Vector} vec0
     * @param {Vector} vec1
     * @param {Vector} vec2
     */
    static orthoNormalize(vec0, vec1, vec2) {
        vec0.normalize();

        let dot0 = vec0.dot(vec1);
        let t = vec0.scalar(dot0);
        vec1.copy(vec1.sub(t));
        vec1.normalize();

        let dot1 = vec1.dot(vec2);
        dot0 = vec0.dot(vec2);
        t = vec0.scalar(dot0);
        let t1 = vec1.scalar(dot1);
        vec2.copy(vec2.sub(t.add(t1)));
        vec2.normalize();
    }


    /**
     * Input vec2 must be a nonzero vector. The output is an orthonormal
     * basis {vec0,vec1,vec2}.  The input vec2 is normalized by this function.
     * If you know that vec2 is already unit length, use the function
     * generateComplementBasis to compute vec0 and vec1.
     * Input vec0 must be a unit-length vector.  The output vectors
     * {vec0,vec1} are unit length and mutually perpendicular, and
     * {vec0,vec1,vec2} is an orthonormal basis.
     *
     * @param {Vector} vec0
     * @param {Vector} vec1
     * @param {Vector} vec2
     */
    static generateComplementBasis(vec0, vec1, vec2) {
        vec2.normalize();
        let invLength;

        if (_Math.abs(vec2.x) >= _Math.abs(vec2.y)) {
            // vec2.x or vec2.z is the largest magnitude component, swap them
            invLength = 1 / _Math.sqrt(vec2.x * vec2.x + vec2.z * vec2.z);
            vec0.x = -vec2.z * invLength;
            vec0.y = 0;
            vec0.z = +vec2.x * invLength;
            vec1.x = vec2.y * vec0.z;
            vec1.y = vec2.z * vec0.x - vec2.x * vec0.z;
            vec1.z = -vec2.y * vec0.x;
        }
        else {
            // vec2.y or vec2.z is the largest magnitude component, swap them
            invLength = 1 / _Math.sqrt(vec2.y * vec2.y + vec2.z * vec2.z);
            vec0.x = 0;
            vec0.y = +vec2.z * invLength;
            vec0.z = -vec2.y * invLength;
            vec1.x = vec2.y * vec0.z - vec2.z * vec0.y;
            vec1.y = -vec2.x * vec0.z;
            vec1.z = vec2.x * vec0.y;
        }
    }
}

/**
 * Point - 3D点
 *
 * @author lonphy
 * @version 2.0
 */

class Point$1 extends Float32Array {

    constructor(x = 0, y = 0, z = 0) {
        super(4);
        if (x instanceof Float32Array) {
            this.set(x.slice(0, 3));
        } else {
            this[0] = x;
            this[1] = y;
            this[2] = z;
        }
        this[3] = 1;
    }

    //////////////////// 辅助读写器 ////////////////////////////////////////////
    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    get w() {
        return this[3];
    }

    set x(n) {
        this[0] = n;
    }

    set y(n) {
        this[1] = n;
    }

    set z(n) {
        this[2] = n;
    }

    set w(n) {
        this[3] = n;
    }

    /**
     * 判断是否为同一点
     * @param {Point} p
     * @returns {boolean}
     */
    equals(p) {
        return this[0] === p[0] && this[1] === p[1] && this[2] === p[2] && this[3] === p[3];
    }

    /**
     * 复制
     * @param {Point} p
     * @returns {Point}
     */
    copy(p) {
        this.set(p);
        return this;
    }

    /**
     * 赋值
     * @param {float} x
     * @param {float} y
     * @param {float} z
     */
    assign(x, y, z) {
        this[0] = x;
        this[1] = y;
        this[2] = z;
    }

    /**
     * 2个点相减，结果为向量
     * @param {Point} p
     * @returns {Vector}
     */
    subAsVector(p) {
        return new Vector$1(
            this[0] - p[0],
            this[1] - p[1],
            this[2] - p[2]
        );
    }

    /**
     * 点减向量，结果为点
     * @param {Vector} v
     */
    sub(v) {
        return new Point$1(
            this[0] - v.x,
            this[1] - v.y,
            this[2] - v.z
        );
    }


    /**
     * 点加向量，结果为点
     * @param {Vector} v
     */
    add(v) {
        return new Point$1(
            this[0] + v.x,
            this[1] + v.y,
            this[2] + v.z
        );
    }

    /**
     * 点乘标量
     * @param {number} scalar
     */
    scalar(scalar) {
        return new Point$1(
            scalar * this[0],
            scalar * this[1],
            scalar * this[2]
        );
    }

    /**
     * 标量除
     * @param {number} scalar
     */
    div(scalar) {
        if (scalar !== 0) {
            scalar = 1 / scalar;

            return new Point$1(
                this[0] * scalar,
                this[1] * scalar,
                this[2] * scalar
            );
        }
        return new Point$1(MAX_REAL, MAX_REAL, MAX_REAL);
    }

    /**
     * 填充固定值
     * @param {number} val
     */
    fill(val) {
        super.fill(val, 0, 3);
    }

    /**
     * 求中心对称点
     */
    negative() {
        return new Point$1(
            -this[0],
            -this[1],
            -this[2]
        );
    }

    /**
     * 点与向量求点积
     * @param {Vector} vec
     * @returns {number}
     */
    dot(vec) {
        return this[0] * vec.x + this[1] * vec.y + this[2] * vec.z;
    }

    static get ORIGIN() {
        return new Point$1();
    }
}

/**
 * Plane - 平面
 *
 * @author lonphy
 * @version 2.0
 */

class Plane$1 extends Float32Array {

    /**
     * @param {Vector} normal 平面单位法向量
     * @param {number} constant 平面常量
     */
    constructor(normal, constant) {
        super(4);
        this.set(normal, 0, 3);
        this[3] = -constant;
    }

    /**
     *  `c = dot(normal, point)`
     * @param {Vector} normal specified
     * @param {Point} point 平面上的点
     */
    static fromPoint1(normal, point) {
        return new Plane$1(
            normal,
            point.dot(normal)
        );
    }

    /**
     * @param {number} n0
     * @param {number} n1
     * @param {number} n2
     * @param {number} constant
     */
    static fromNumber(n0, n1, n2, constant) {
        return new Plane$1(new Vector$1(n0, n1, n2), constant);
    }

    /**
     * 通过3个点创建一个平面
     *
     * - `normal = normalize(cross(point1-point0,point2-point0))`
     * - `c = dot(normal,point0)`
     *
     * @param {Point} point0 平面上的点
     * @param {Point} point1 平面上的点
     * @param {Point} point2 平面上的点
     */
    static fromPoint3(point0, point1, point2) {
        var edge1 = point1.subAsVector(point0);
        var edge2 = point2.subAsVector(point0);
        var normal = edge1.unitCross(edge2);
        return new Plane$1(normal, point0.dot(normal));
    }

    get normal() {
        return new Vector$1(this[0], this[1], this[2]);
    }

    set normal(n) {
        this.set(n, 0, 3);
    }

    get constant() {
        return -this[3];
    }

    set constant(c) {
        this[3] = -c;
    }

    /**
     * 复制
     * @param {Plane} plane
     * @return {Plane}
     */
    copy(plane) {
        this[0] = plane[0];
        this[1] = plane[1];
        this[2] = plane[2];
        this[3] = plane[3];
        return this;
    }

    /**
     * 计算平面法向量的长度，并返回，同时规格化法向量和平面常量
     * @returns {number}
     */
    normalize() {
        var length = sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);

        if (length > 0) {
            var invLength = 1 / length;
            this[0] *= invLength;
            this[1] *= invLength;
            this[2] *= invLength;
            this[3] *= invLength;
        }

        return length;
    }


    /**
     * 计算点到平面的距离[有符号]  
     * > `d = dot(normal, point) - c`
     *  - normal 是平面的法向量
     *  - c 是平面常量  
     * 结果说明
     *  - 如果返回值是正值则点在平面的正坐标一边，
     *  - 如果是负值，则在负坐标一边
     *  - 否则在平面上
     * @param {Point} p
     * @returns {number}
     */
    distanceTo(p) {
        return this[0] * p.x + this[1] * p.y + this[2] * p.z + this[3];
    }

    /**
     * @param {Point} p
     */
    whichSide(p) {
        let distance = this.distanceTo(p);

        if (distance < 0) {
            return -1;
        }
        else if (distance > 0) {
            return +1;
        }

        return 0;
    }
}

/**
 * 4阶矩阵
 *
 * @author lonphy
 * @version 2.0
 **/
class Matrix$1 extends Float32Array {
    constructor(m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33) {
        super(16);
        this[0] = m00;
        this[1] = m01;
        this[2] = m02;
        this[3] = m03;

        this[4] = m10;
        this[5] = m11;
        this[6] = m12;
        this[7] = m13;

        this[8] = m20;
        this[9] = m21;
        this[10] = m22;
        this[11] = m23;

        this[12] = m30;
        this[13] = m31;
        this[14] = m32;
        this[15] = m33;
    }

    /**
     * 复制
     * @param {Matrix} m
     * @returns {Matrix}
     */
    copy(m) {
        this[0] = m[0];
        this[1] = m[1];
        this[2] = m[2];
        this[3] = m[3];
        this[4] = m[4];
        this[5] = m[5];
        this[6] = m[6];
        this[7] = m[7];
        this[8] = m[8];
        this[9] = m[9];
        this[10] = m[10];
        this[11] = m[11];
        this[12] = m[12];
        this[13] = m[13];
        this[14] = m[14];
        this[15] = m[15];
        return this;
    }

    /**
     * 判断2个矩阵是否相等
     * @param {Matrix} m
     * @returns {boolean}
     */
    equals(m) {
        let floatEqual = _Math.floatEqual;
        for (let i = 0; i < 16; ++i) {
            if (!floatEqual(this[i], m[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * 判断2个矩阵是否不等
     * @param {Matrix} m
     * @returns {boolean}
     */
    notEquals(m) {
        let floatEqual = _Math.floatEqual;
        for (let i = 0; i < 16; ++i) {
            if (!floatEqual(this[i], m[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * 置零矩阵
     * @returns {Matrix}
     */
    zero() {
        return this.fill(0);
    }

    /**
     * 置单位矩阵
     * @returns {Matrix}
     */
    identity() {
        this.fill(0);
        this[0] = this[5] = this[10] = this[15] = 1;
        return this;
    }

    /**
     * 转置
     */
    transpose() {
        let m = this;
        return new Matrix$1(
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        );
    }

    /**
     * 计算逆矩阵
     * @returns {Matrix}
     */
    inverse() {
        let m = this;
        let a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
        let a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
        let a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
        let a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;

        let invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
        return new Matrix$1(
            (a11 * b11 - a12 * b10 + a13 * b09) * invDet,
            (-a01 * b11 + a02 * b10 - a03 * b09) * invDet,
            (a31 * b05 - a32 * b04 + a33 * b03) * invDet,
            (-a21 * b05 + a22 * b04 - a23 * b03) * invDet,
            (-a10 * b11 + a12 * b08 - a13 * b07) * invDet,
            (a00 * b11 - a02 * b08 + a03 * b07) * invDet,
            (-a30 * b05 + a32 * b02 - a33 * b01) * invDet,
            (a20 * b05 - a22 * b02 + a23 * b01) * invDet,
            (a10 * b10 - a11 * b08 + a13 * b06) * invDet,
            (-a00 * b10 + a01 * b08 - a03 * b06) * invDet,
            (a30 * b04 - a31 * b02 + a33 * b00) * invDet,
            (-a20 * b04 + a21 * b02 - a23 * b00) * invDet,
            (-a10 * b09 + a11 * b07 - a12 * b06) * invDet,
            (a00 * b09 - a01 * b07 + a02 * b06) * invDet,
            (-a30 * b03 + a31 * b01 - a32 * b00) * invDet,
            (a20 * b03 - a21 * b01 + a22 * b00) * invDet
            );
    }


    /**
     * 伴随矩阵
     * @returns {Matrix}
     */
    adjoint() {
        let m00 = this[0], m01 = this[1], m02 = this[2], m03 = this[3];
        let m10 = this[4], m11 = this[5], m12 = this[6], m13 = this[7];
        let m20 = this[8], m21 = this[9], m22 = this[10], m23 = this[11];
        let m30 = this[12], m31 = this[13], m32 = this[14], m33 = this[15];


        let a0 = m00 * m11 - m01 * m10;
        let a1 = m00 * m12 - m02 * m10;
        let a2 = m00 * m13 - m03 * m10;
        let a3 = m01 * m12 - m02 * m11;
        let a4 = m01 * m13 - m03 * m11;
        let a5 = m02 * m13 - m03 * m12;
        let b0 = m20 * m31 - m21 * m30;
        let b1 = m20 * m32 - m22 * m30;
        let b2 = m20 * m33 - m23 * m30;
        let b3 = m21 * m32 - m22 * m31;
        let b4 = m21 * m33 - m23 * m31;
        let b5 = m22 * m33 - m23 * m32;

        return Matrix$1(
            +m11 * b5 - m12 * b4 + m13 * b3,
            -m01 * b5 + m02 * b4 - m03 * b3,
            +m31 * a5 - m32 * a4 + m33 * a3,
            -m21 * a5 + m22 * a4 - m23 * a3,

            -m10 * b5 + m12 * b2 - m13 * b1,
            +m00 * b5 - m02 * b2 + m03 * b1,
            -m30 * a5 + m32 * a2 - m33 * a1,
            +m20 * a5 - m22 * a2 + m23 * a1,

            +m10 * b4 - m11 * b2 + m13 * b0,
            -m00 * b4 + m01 * b2 - m03 * b0,
            +m30 * a4 - m31 * a2 + m33 * a0,
            -m20 * a4 + m21 * a2 - m23 * a0,

            -m10 * b3 + m11 * b1 - m12 * b0,
            +m00 * b3 - m01 * b1 + m02 * b0,
            -m30 * a3 + m31 * a1 - m32 * a0,
            +m20 * a3 - m21 * a1 + m22 * a0
            );
    }

    /**
     * 计算行列式
     * @returns {number}
     */
    det() {
        let m = this;
        let a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
        let a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
        let a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
        let a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

        return a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
            a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
            a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
            a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
            a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
            a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33;
    }

    /**
     * 对点或向量应用矩阵
     * @param {Point|Vector} p
     * @return {Point|Vector}
     */
    mulPoint(p) {
        let c = this,
            x = p.x, y = p.y, z = p.z, w = p.w;

        return new p.constructor(
            c[0] * x + c[4] * y + c[8] * z + c[12] * w,
            c[1] * x + c[5] * y + c[9] * z + c[13] * w,
            c[2] * x + c[6] * y + c[10] * z + c[14] * w,
            c[3] * x + c[7] * y + c[11] * z + c[15] * w
        );
    }

    /**
     * 矩阵相乘
     * @param {Matrix} b
     */
    mul(b) {
        let a = this,

            a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

            b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3],
            b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7],
            b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11],
            b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

        return new Matrix$1(
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
            );
    }

    /**
     * @param {number} s 
     * @return {Matrix}
     */
    scalar(s) {
        for (let i = 0; i < 16; ++i)
            this[i] *= s;
        return this;
    }

    /**
     * @param {Matrix} m
     * @return {Matrix}
     */
    add(m) {
        for (let i = 0; i < 16; ++i)
            this[i] += m[i];
        return this;
    }

    /**
     * 对点数组应用矩阵
     * @param {number} num
     * @param {Array<Point>} points
     * @return {Array<Point>}
     */
    batchMul(num, points) {
        let ret = new Array(points.length);
        for (let i = 0; i < num; ++i) {
            ret[i] = this.mulPoint(points[i]);
        }
        return ret;
    }

    /**
     * 正交化矩阵旋转部分
     * @return {Matrix}
     */
    orthoNormalize() {
        // Algorithm uses Gram-Schmidt orthogonalization.  If 'this' matrix has
        // upper-left 3x3 block M = [m0|m1|m2], then the orthonormal output matrix
        // is Q = [q0|q1|q2],
        //
        //   q0 = m0/|m0|
        //   q1 = (m1-(q0*m1)q0)/|m1-(q0*m1)q0|
        //   q2 = (m2-(q0*m2)q0-(q1*m2)q1)/|m2-(q0*m2)q0-(q1*m2)q1|
        //
        // where |V| indicates length of vector V and A*B indicates dot
        // product of vectors A and B.

        // Compute q0.
        let invLength = _Math.invSqrt(this[0] * this[0] + this[4] * this[4] + this[8] * this[8]);

        this[0] *= invLength;
        this[4] *= invLength;
        this[8] *= invLength;

        // Compute q1.
        let dot0 = this[0] * this[1] + this[4] * this[5] + this[8] * this[9];

        this[1] -= dot0 * this[0];
        this[5] -= dot0 * this[4];
        this[9] -= dot0 * this[8];

        invLength = _Math.invSqrt(this[1] * this[1] + this[5] * this[5] + this[9] * this[9]);

        this[1] *= invLength;
        this[5] *= invLength;
        this[9] *= invLength;

        // Compute q2.
        let dot1 = this[1] * this[2] + this[5] * this[6] + this[9] * this[10];

        dot0 = this[0] * this[2] + this[4] * this[6] + this[8] * this[10];

        this[2] -= dot0 * this[0] + dot1 * this[1];
        this[6] -= dot0 * this[4] + dot1 * this[5];
        this[10] -= dot0 * this[8] + dot1 * this[9];

        invLength = _Math.invSqrt(this[2] * this[2] + this[6] * this[6] + this[10] * this[10]);

        this[2] *= invLength;
        this[6] *= invLength;
        this[10] *= invLength;
        return this;
    }

    /**
     * 获取矩阵R行N列的值
     * @param {number} r  行
     * @param {number} c  列
     */
    item(r, c) {
        return this[r + 4 * c];
    }

    /**
     * 设置矩阵R行N列的值
     * @param {number} r 行
     * @param {number} c 列
     * @param {number} value 值
     */
    setItem(r, c, value) {
        this[r + 4 * c] = value;
    }

    /**
     * @param {Point} p
     */
    timesDiagonal(p) {
        let c = this;
        return new Matrix$1(
            c[0] * p[0], c[1] * p[1], c[2] * p[2], c[3],
            c[4] * p[0], c[5] * p[1], c[6] * p[2], c[7],
            c[8] * p[0], c[9] * p[1], c[10] * p[2], c[11],
            c[12] * p[0], c[13] * p[1], c[14] * p[2], c[15]
        );
    }

    /**
     * @param {number} row
     * @param {Point} p
     */
    setRow(row, p) {
        let i = 4 * row;
        this[i] = p[0];
        this[i + 1] = p[1];
        this[i + 2] = p[2];
        this[i + 3] = p[3];
    }

    /**
     * @param {number} row
     */
    getRow(row) {
        let i = 4 * row;
        let ret = new Point$1(this[i], this[i + 1], this[i + 2]);
        ret[3] = this[i + 3];
        return ret;
    }

    /**
     * @param {number} col
     * @param {Vector} p
     */
    setColumn(col, p) {
        let s = col * 4;
        this[s] = p[0];
        this[s + 1] = p[1];
        this[s + 2] = p[2];
        this[s + 3] = p[3];
    }

    /**
     * @param {number} col in
     * @param {Vector} v out
     */
    getColumn(col, v) {
        let s = col * 4;
        v[0] = this[s];
        v[1] = this[s + 1];
        v[2] = this[s + 2];
        v[3] = this[s + 3];
    }

    debug() {
        let str = '------------- matrix info ----------------\n';
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                if (j !== 0) {
                    str += "\t\t";
                }
                str += this[i * 4 + j].toFixed(10);
            }
            str += "\n";
        }
        console.log(str);
    }

    static get IDENTITY() {
        return (new Matrix$1()).identity();
    }

    static get ZERO() {
        return (new Matrix$1()).zero();
    }

    /**
     * @param {Vector} p0
     * @param {Vector} p1
     * @param {Vector} p2
     * @param {Point} p3
     * @returns {Matrix}
     */
    static IPMake(p0, p1, p2, p3) {
        return new Matrix$1(
            p0.x, p1.x, p2.x, p3.x,
            p0.y, p1.y, p2.y, p3.y,
            p0.z, p1.z, p2.z, p3.z,
            p0.w, p1.w, p2.w, p3.w
        );
    }

    /**
     * Set the transformation to a perspective projection matrix onto a specified plane.
     *
     * @param {Point} origin plane's origin
     * @param {Vector} normal unit-length normal for plane
     * @param {Point} eye the origin of projection
     */
    makePerspectiveProjection(origin, normal, eye) {
        //     +-                                                 -+
        // M = | Dot(N,E-P)*I - E*N^T    -(Dot(N,E-P)*I - E*N^T)*E |
        //     |        -N^t                      Dot(N,E)         |
        //     +-                                                 -+
        //
        // where E is the eye point, P is a point on the plane, and N is a
        // unit-length plane normal.

        let dotND = normal.dot(eye.sub(origin)); // normal * (eye -origin)

        let nx = normal.x, ny = normal.y, nz = normal.z;
        let ex = eye.x, ey = eye.y, ez = eye.z;
        let t = this;

        t[0] = dotND - ex * nx;
        t[1] = -ey * nx;
        t[2] = -ez * nx;
        t[3] = -nx;

        t[4] = -ex * ny;
        t[5] = dotND - ey * ny;
        t[6] = -ez * ny;
        t[7] = -ny;
        t[8] = -ex * nz;
        t[9] = -ey * nz;
        t[10] = dotND - ez * nz;
        t[11] = -nz;

        t[12] = -(t[0] * ex + t[1] * ey + t[2] * ez);
        t[13] = -(t[4] * ex + t[5] * ey + t[6] * ez);
        t[14] = -(t[8] * ex + t[9] * ey + t[10] * ez);
        t[15] = eye.dot(normal);
    }


    /**
     * 设置为在一个有效平面上的斜投影矩阵
     *
     * @param {Point} origin 平面上任意一点
     * @param {Vector} normal 平面法向量
     * @param {Vector} dir 光源方向
     */
    makeObliqueProjection(origin, normal, dir) {
        // 平面方程 origin * normal + d = 0
        // n = (nx, ny, nz)  平面法向量
        // l = (lx, ly, lz) 光源方向(单位向量)
        //
        // | nl-nx*lx    -nx*ly   -nx*lz  -nx  |
        // |   -ny*lx  nl-ny*ly   -ny*lz  -ny  |
        // |   -nz*lx    -nz*ly nl-nz*lz  -nz  |
        // |    -d*lx     -d*ly    -d*lz   nl  |

        let nl = normal.dot(dir);
        let c = origin.dot(normal);

        let m = this;
        let lx = dir.x, ly = dir.y, lz = dir.z,
            nx = normal.x, ny = normal.y, nz = normal.z;

        m[0] = lx * nx - nl;
        m[1] = ly * nx;
        m[2] = lz * nx;
        m[3] = 0;
        m[4] = lx * ny;
        m[5] = ly * ny - nl;
        m[6] = lz * ny;
        m[7] = 0;
        m[8] = lx * nz;
        m[9] = ly * nz;
        m[10] = lz * nz - nl;
        m[11] = 0;
        m[12] = -c * lx;
        m[13] = -c * ly;
        m[14] = -c * lz;
        m[15] = -nl;
    }

    /**
     * Set the transformation to a reflection matrix through a specified plane.
     *
     * @param {Point} origin plane's origin
     * @param {Vector} normal unit-length normal for plane
     */
    makeReflection(origin, normal) {
        let d = 2 * origin.dot(normal);
        let x = normal.x, y = normal.y, z = normal.z;
        let xy = x * y, xz = x * z, yz = y * z;
        this.fill(0);
        this[0] = 1 - 2 * x * x;
        this[1] = -2 * xy;
        this[2] = -2 * xz;

        this[4] = -2 * xy;
        this[5] = 1 - 2 * y * y;
        this[6] = -2 * yz;

        this[8] = -2 * xz;
        this[9] = -2 * yz;
        this[10] = 1 - 2 * z * z;


        this[12] = d * x;
        this[13] = d * y;
        this[14] = d * z;
        this[15] = 1;
    }

    /**
     * @param {Vector} v0
     * @param {Vector} v1
     * @param {Vector} v2
     * @param {Point} p
     */
    static fromVectorAndPoint(v0, v1, v2, p) {
        return new Matrix$1(
            v0.x, v0.y, v0.z, v0.w,
            v1.x, v1.y, v1.z, v1.w,
            v2.x, v2.y, v2.z, v2.w,
            p.x, p.y, p.z, p.w
        );
    }

    /**
     * 生成旋转矩阵
     * @param {Vector} axis 旋转轴
     * @param {number} angle 旋转角度
     */
    static makeRotation(axis, angle) {
        let c = _Math.cos(angle),
            s = _Math.sin(angle),
            x = axis.x, y = axis.y, z = axis.z,
            oc = 1 - c,
            xx = x * x,
            yy = y * y,
            zz = z * z,
            xym = x * y * oc,
            xzm = x * z * oc,
            yzm = y * z * oc,
            xs = x * s,
            ys = y * s,
            zs = z * s;

        return new Matrix$1(
            oc * xx + c, xym + zs, xzm - ys, 0,
            xym - zs, yy * oc + c, yzm + xs, 0,
            xzm + ys, yzm - xs, zz * oc + c, 0,
            0, 0, 0, 1
        );
    }

    /**
     * 从数组创建矩阵
     * @param  {ArrayBuffer|Array<number>} arr
     */
    static fromArray(arr) {
        console.assert(arr.length >= 16, 'invalid array for Matrix.fromArray');

        return new Matrix$1(
            arr[0], arr[1], arr[2], arr[3],
            arr[4], arr[5], arr[6], arr[7],
            arr[8], arr[9], arr[10], arr[11],
            arr[12], arr[13], arr[14], arr[15]
        );
    }

    /**
     * 生成旋转矩阵
     * @param {number} angle 旋转角度
     */
    static makeRotateX(angle) {
        let c = _Math.cos(angle), s = _Math.sin(angle);

        return new Matrix$1(
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        );
    }

    /**
     * @param {number} angle
     */
    static makeRotateY(angle) {
        let c = _Math.cos(angle), s = _Math.sin(angle);
        return new Matrix$1(
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        );
    }


    /**
     * 生成缩放矩阵
     * @param {number} scaleX
     * @param {number} scaleY
     * @param {number} scaleZ
     */
    static makeScale(scaleX, scaleY, scaleZ) {
        return new Matrix$1(
            scaleX, 0, 0, 0,
            0, scaleY, 0, 0,
            0, 0, scaleZ, 0,
            0, 0, 0, 1
        );
    }

    /**
     * 平移快捷函数
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    static makeTranslate(x, y, z) {
        return new Matrix$1(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        );
    }

    /**
     * 是否是单位矩阵
     * @param {Matrix} dst
     * @returns {boolean}
     */
    static isIdentity(dst) {
        for (let i = 0, l = 16; i < l; ++i) {
            if (i % 5) {
                if (dst[i] !== 0) return false;
            } else {
                if (dst[i] !== 1) return false;
            }
        }
        return true;
    }
}

/**
 * Quaternion 四元数
 * @author lonphy
 * @version 2.0
 */

class Quaternion$1 extends Float32Array {

    constructor(w = 0, x = 0, y = 0, z = 0) {
        super(4);
        this[0] = w;
        this[1] = x;
        this[2] = y;
        this[3] = z;
    }

    get w() {
        return this[0];
    }

    get x() {
        return this[1];
    }

    get y() {
        return this[2];
    }

    get z() {
        return this[3];
    }

    set w(n) {
        this[0] = n;
    }

    set x(n) {
        this[1] = n;
    }

    set y(n) {
        this[2] = n;
    }

    set z(n) {
        this[3] = n;
    }

    /**
     * 复制
     * @param {Quaternion} q
     * @returns {Quaternion}
     */
    copy(q) {
        this.set(q);
        return this;
    }

    /**
     * 克隆四元素
     */
    clone() {
        return new Quaternion$1(this[0], this[1], this[2], this[3]);
    }

    /**
     * 判断是否相等
     * @param {Quaternion} q
     */
    equals(q) {
        return this[0] === q[0] && this[1] === q[1] && this[2] === q[2] && this[3] === q[3];
    }

    /**
     * 加法
     * @param {Quaternion} q
     */
    add(q) {
        return new Quaternion$1(this[0] + q[0], this[1] + q[1], this[2] + q[2], this[3] + q[3]);
    }

    /**
     * 减法
     * @param {Quaternion} q
     */
    sub(q) {
        return new Quaternion$1(this[0] - q[0], this[1] - q[1], this[2] - q[2], this[3] - q[3]);
    }

    /**
     * 乘标量
     * @param {number} scalar
     */
    scalar(scalar) {
        return new Quaternion$1(this[0] * scalar, this[1] * scalar, this[2] * scalar, this[3] * scalar);
    }

    /**
     * 除标量
     * @param {Quaternion} scalar
     */
    div(scalar) {
        if (q !== 0) {
            let invScalar = 1 / scalar;
            return new Quaternion$1(this[0] * invScalar, this[1] * invScalar, this[2] * invScalar, this[3] * invScalar);
        }
        return new Quaternion$1(_Math.MAX_REAL, _Math.MAX_REAL, _Math.MAX_REAL, _Math.MAX_REAL);
    }

    /**
     * 乘四元数
     * @param {Quaternion} q
     */
    mul(q) {
        let tw = this[0], tx = this[1], ty = this[2], tz = this[3];
        let qw = q[0], qx = q[1], qy = q[2], qz = q[3];

        return new Quaternion$1(
            tw * qw - tx * qx - ty * qy - tz * qz,
            tw * qx + tx * qw + ty * qz - tz * qy,
            tw * qy + ty * qw + tz * qx - tx * qz,
            tw * qz + tz * qw + tx * qy - ty * qx
        );
    }

    /**
     * 求负
     */
    negative() {
        return new Quaternion$1(-this[0], -this[1], -this[2], -this[3]);
    }

    /**
     * 提取旋转矩阵
     */
    toRotateMatrix() {
        let w = this[0], x = this[1], y = this[2], z = this[3],
            x2 = 2 * x, y2 = 2 * y, z2 = 2 * z,
            wx2 = x2 * w, wy2 = y2 * w, wz2 = z2 * w,
            xx2 = x2 * x, xy2 = y2 * x, xz2 = z2 * x,
            yy2 = y2 * y, yz2 = z2 * y, zz2 = z2 * z;

        return new Matrix$1(
            1 - yy2 - zz2, xy2 - wz2, xz2 + wy2, 0,
            xy2 + wz2, 1 - xx2 - zz2, yz2 - wx2, 0,
            xz2 - wy2, yz2 + wx2, 1 - xx2 - yy2, 0,
            0, 0, 0, 1
        );
    }

    /**
     * 提取旋转矩阵
     * - 0: axis
     * - 1: angle
     * @returns {Array<number|Vector>}
     */
    toAxisAngle() {
        // The quaternion representing the rotation is
        //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

        let ret = [];
        let sqrLength = this[1] * this[1] + this[2] * this[2] + this[3] * this[3];

        if (sqrLength > 0) {
            ret[1] = 2 * _Math.acos(this[0]);
            let invLength = 1 / _Math.sqrt(sqrLength);
            ret[0] = new Vector(this[1] * invLength, this[2] * invLength, this[3] * invLength);
        }
        else {
            // Angle is 0 (mod 2*pi), so any axis will do.
            ret[1] = 0;
            ret[0] = new Vector(1);
        }
        return ret;
    }

    /**
     * 求当前四元数的模
     */
    get length() {
        return _Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3]);
    }

    /**
     * 模的平方
     */
    squaredLength() {
        return this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3];
    }

    /**
     * 规格化
     */
    normalize() {
        let length = this.length;

        if (length > 0) {
            let invLength = 1 / length;
            this[0] *= invLength;
            this[1] *= invLength;
            this[2] *= invLength;
            this[3] *= invLength;
        }
        else {
            length = 0;
            super.fill(0);
        }

        return length;
    }

    /**
     * apply to non-zero quaternion
     * @returns {Quaternion}
     */
    inverse() {
        let norm = this.squaredLength();
        if (norm > 0) {
            let invNorm = 1 / norm;
            return new Quaternion$1(this[0] * invNorm, -this[1] * invNorm, -this[2] * invNorm, -this[3] * invNorm);
        }
        return Quaternion$1.ZERO;
    }

    /**
     * negate x, y, and z terms
     * @returns {Quaternion}
     */
    conjugate() {
        return new Quaternion$1(this[0], -this[1], -this[2], -this[3]);
    }

    /**
     * apply to quaternion with w = 0
     */
    exp() {
        // If q = A*(x*i+y*j+z*k) where (x,y,z) is unit length, then
        // exp(q) = cos(A)+sin(A)*(x*i+y*j+z*k).  If sin(A) is near zero,
        // use exp(q) = cos(A)+A*(x*i+y*j+z*k) since A/sin(A) has limit 1.

        let angle = _Math.sqrt(this[1] * this[1] + this[2] * this[2] + this[3] * this[3]);
        let sn = _Math.in(angle);
        let w = _Math.cos(angle);
        if (_Math.abs(sn) > 0) {
            let coeff = sn / angle;
            return new Quaternion$1(w, coeff * this[1], coeff * this[2], coeff * this[3]);
        }
        return new Quaternion$1(w, this[1], this[2], this[3]);
    }

    /**
     * apply to unit-length quaternion
     */
    log() {
        // If q = cos(A)+sin(A)*(x*i+y*j+z*k) where (x,y,z) is unit length, then
        // log(q) = A*(x*i+y*j+z*k).  If sin(A) is near zero, use log(q) =
        // sin(A)*(x*i+y*j+z*k) since sin(A)/A has limit 1.

        if (_Math.abs(this[0]) < 1) {
            let angle = _Math.acos(this[0]);
            let sn = _Math.sin(angle);
            if (_Math.abs(sn) > 0) {
                let coeff = angle / sn;
                return new Quaternion$1(0, coeff * this[1], coeff * this[2], coeff * this[3]);
            }
        }
        return new Quaternion$1(0, this[1], this[2], this[3]);
    }

    /**
     * 使用四元数旋转向量
     * >内部转为矩阵后旋转
     * @param {Vector} vec
     * @returns {Vector}
     */
    rotate(vec) {
        // Given a vector u = (x0,y0,z0) and a unit length quaternion
        // q = <w,x,y,z>, the vector v = (x1,y1,z1) which represents the
        // rotation of u by q is v = q*u*q^{-1} where * indicates quaternion
        // multiplication and where u is treated as the quaternion <0,x0,y0,z0>.
        // Note that q^{-1} = <w,-x,-y,-z>, so no real work is required to
        // invert q.  Now
        //
        //   q*u*q^{-1} = q*<0,x0,y0,z0>*q^{-1}
        //     = q*(x0*i+y0*j+z0*k)*q^{-1}
        //     = x0*(q*i*q^{-1})+y0*(q*j*q^{-1})+z0*(q*k*q^{-1})
        //
        // As 3-vectors, q*i*q^{-1}, q*j*q^{-1}, and 2*k*q^{-1} are the columns
        // of the rotation matrix computed in Quaternion::ToRotationMatrix.
        // The vector v is obtained as the product of that rotation matrix with
        // vector u.  As such, the quaternion representation of a rotation
        // matrix requires less space than the matrix and more time to compute
        // the rotated vector.  Typical space-time tradeoff...

        return this.toRotateMatrix().mulPoint(vec);
    }

    /**
     * 球面插值
     * @param {number} t
     * @param {Quaternion} p
     * @param {Quaternion} q
     * @returns {Quaternion}
     */
    slerp(t, p, q) {
        let cs = p.dot(q);
        let angle = _Math.acos(cs);

        if (_Math.abs(angle) > 0) {
            let sn = _Math.sin(angle);
            let invSn = 1 / sn;
            let tAngle = t * angle;
            let coeff0 = _Math.sin(angle - tAngle) * invSn;
            let coeff1 = _Math.sin(tAngle) * invSn;

            this[0] = coeff0 * p[0] + coeff1 * q[0];
            this[1] = coeff0 * p[1] + coeff1 * q[1];
            this[2] = coeff0 * p[2] + coeff1 * q[2];
            this[3] = coeff0 * p[3] + coeff1 * q[3];
        }
        else {
            this.copy(p);
        }
        return this;
    }

    /**
     * 球面插值
     * @param {number} t
     * @param {Quaternion} p
     * @param {Quaternion} q
     * @param {number} extraSpins
     * @returns {Quaternion}
     */
    slerpExtraSpins(t, p, q, extraSpins) {
        let cs = p.dot(q);
        let angle = _Math.acos(cs);

        if (_Math.abs(angle) >= _Math.ZERO_TOLERANCE) {
            let sn = _Math.sin(angle);
            let phase = _Math.PI * extraSpins * t;
            let invSin = 1 / sn;
            let coeff0 = _Math.sin((1 - t) * angle - phase) * invSin;
            let coeff1 = _Math.sin(t * angle + phase) * invSin;

            this[0] = coeff0 * p[0] + coeff1 * q[0];
            this[1] = coeff0 * p[1] + coeff1 * q[1];
            this[2] = coeff0 * p[2] + coeff1 * q[2];
            this[3] = coeff0 * p[3] + coeff1 * q[3];
        }
        else {
            this.copy(p);
        }

        return this;
    }

    /**
     * 球面2次插值中间项
     * @param {Quaternion} q0
     * @param {Quaternion} q1
     * @param {Quaternion} q2
     * @returns {Quaternion}
     */
    intermediate(q0, q1, q2) {
        let q1Inv = q1.conjugate();
        let p0 = q1Inv.mul(q0).log();
        let p2 = q1Inv.mul(q2).log();
        let arg = p0.add(p2).scalar(-0.25).exp();
        this.copy(q1.mul(arg));

        return this;
    }

    /**
     * 球面2次插值
     * @param {number} t
     * @param {Quaternion} q0
     * @param {Quaternion} a0
     * @param {Quaternion} a1
     * @param {Quaternion} q1
     * @returns {Quaternion}
     */
    squad(t, q0, a0, a1, q1) {
        let slerpT = 2 * t * (1 - t);

        let slerpP = this.slerp(t, q0, q1);
        let slerpQ = this.slerp(t, a0, a1);
        return this.slerp(slerpT, slerpP, slerpQ);
    }

    static get ZERO() {
        return new Quaternion$1();
    }

    static get IDENTIRY() {
        return new Quaternion$1(1);
    }

    /**
     * 从矩阵的旋转部分创建四元数
     * @param {Matrix} rot
     */
    static fromRotateMatrix(rot) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".

        let trace = rot.item(0, 0) + rot.item(1, 1) + rot.item(2, 2);
        let root;

        if (trace > 0) {
            // |w| > 1/2, may as well choose w > 1/2
            root = _Math.sqrt(trace + 1);  // 2w
            let root1 = 0.5 / root;  // 1/(4w)

            return new Quaternion$1(
                0.5 * root,
                (rot.item(2, 1) - rot.item(1, 2)) * root1,
                (rot.item(0, 2) - rot.item(2, 0)) * root1,
                (rot.item(1, 0) - rot.item(0, 1)) * root1
            );
        }

        let next = [1, 2, 0];

        // |w| <= 1/2
        let i = 0;
        if (rot.item(1, 1) > rot.item(0, 0)) {
            i = 1;
        }
        if (rot.item(2, 2) > rot.item(i, i)) {
            i = 2;
        }

        let j = next[i];
        let k = next[j];
        root = _Math.sqrt(rot.item(i, i) - rot.item(j, j) - rot.item(k, k) + 1);
        let ret = new Array(4);
        ret[i + 1] = 0.5 * root;
        root = 0.5 / root;
        ret[0] = (rot.item(k, j) - rot.item(j, k)) * root;
        ret[j] = (rot.item(j, i) + rot.item(i, j)) * root;
        ret[k] = (rot.item(k, i) + rot.item(i, k)) * root;

        return new Quaternion$1(ret[0], ret[1], ret[2], ret[3]);
    }

    /**
     * 使用旋转轴和旋转角度创建四元数
     * @param {Vector} axis
     * @param {number} angle
     */
    static fromAxisAngle(axis, angle) {
        // assert:  axis[] is unit length
        //
        // The quaternion representing the rotation is
        //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

        let halfAngle = 0.5 * angle;
        let sn = _Math.sin(halfAngle);
        return new Quaternion$1(_Math.cos(halfAngle), sn * axis.x, sn * axis.y, sn * axis.z);
    }


    /**
     * 计算V1 到 V2 的旋转四元数， 旋转轴同时垂直于V1&V1
     * @param {Vector} v1 单位向量
     * @param {Vector} v2 单位向量
     */
    static align(v1, v2) {
        // If V1 and V2 are not parallel, the axis of rotation is the unit-length
        // vector U = Cross(V1,V2)/Length(Cross(V1,V2)).  The angle of rotation,
        // A, is the angle between V1 and V2.  The quaternion for the rotation is
        // q = cos(A/2) + sin(A/2)*(ux*i+uy*j+uz*k) where U = (ux,uy,uz).
        //
        // (1) Rather than extract A = acos(Dot(V1,V2)), multiply by 1/2, then
        //     compute sin(A/2) and cos(A/2), we reduce the computational costs by
        //     computing the bisector B = (V1+V2)/Length(V1+V2), so cos(A/2) =
        //     Dot(V1,B).
        //
        // (2) The rotation axis is U = Cross(V1,B)/Length(Cross(V1,B)), but
        //     Length(Cross(V1,B)) = Length(V1)*Length(B)*sin(A/2) = sin(A/2), in
        //     which case sin(A/2)*(ux*i+uy*j+uz*k) = (cx*i+cy*j+cz*k) where
        //     C = Cross(V1,B).
        //
        // If V1 = V2, then B = V1, cos(A/2) = 1, and U = (0,0,0).  If V1 = -V2,
        // then B = 0.  This can happen even if V1 is approximately -V2 using
        // floating point arithmetic, since Vector3::Normalize checks for
        // closeness to zero and returns the zero vector accordingly.  The test
        // for exactly zero is usually not recommend for floating point
        // arithmetic, but the implementation of Vector3::Normalize guarantees
        // the comparison is robust.  In this case, the A = pi and any axis
        // perpendicular to V1 may be used as the rotation axis.

        let bisector = v1.add(v2).normalize();
        let cosHalfAngle = v1.dot(bisector);
        let w, x, y, z;

        w = cosHalfAngle;

        if (cosHalfAngle !== 0) {
            let cross = v1.cross(bisector);
            x = cross.x;
            y = cross.y;
            z = cross.z;
        }
        else {
            let invLength;
            if (_Math.abs(v1.x) >= _Math.abs(v1.y)) {
                // V1.x or V1.z is the largest magnitude component.
                invLength = _Math.invSqrt(v1.x * v1.x + v1.z * v1.z);
                x = -v1.z * invLength;
                y = 0;
                z = +v1.x * invLength;
            }
            else {
                // V1.y or V1.z is the largest magnitude component.
                invLength = _Math.invSqrt(v1.y * v1.y + v1.z * v1.z);
                x = 0;
                y = +v1.z * invLength;
                z = -v1.y * invLength;
            }
        }

        return new Quaternion$1(w, x, y, z);
    }

    /**
     * @param {Quaternion} q 
     */
    dot(q) {
        return this[0] * q[0] + this[1] * q[1] + this[2] * q[2] + this[3] * q[3];
    }
}

/**
 * Polynomial1
 *
 * @author lonphy
 * @version 2.0
 */

class D3Object {
    /**
     * @param name {String} 对象名称
     */
    constructor(name = '') {
        this.name = (name === '') ? (this.constructor.name) : name;
    }

    /**
     * @param name {String} 对象名称
     * @returns {D3Object}
     */
    getObjectByName(name) {
        return name === this.name ? this : null;
    }

    /**
     * @param name {String} 对象名称
     * @returns {[D3Object]}
     */
    getAllObjectsByName(name) {
        return name === this.name ? [this] : null;
    }

//============================== 文件流支持 ==============================
    /**
     * @param inStream {InStream}
     */
    load(inStream) {
        inStream.readUniqueID(this);
        this.name = inStream.readString();
    }

    /**
     * @param inStream {InStream}
     */
    link(inStream) {
    }

    postLink() {
    }

    /**
     * @param tar {OutStream}
     */
    save(tar) {
        tar.writeString(this.constructor.name);
        tar.writeUniqueID(this);
        tar.writeString(this.name);
    }

//============================== 类静态方法 ==============================
    /**
     * 工厂类注册map, k => string v =>class
     * @returns {Map}
     */
    static get factories() {
        return (D3Object._factories || (D3Object._factories = new Map()));
    }

    /**
     *
     * @param name {String} 已注册类名
     * @returns {D3Object}
     */
    static find(name) {
        return D3Object.factories.get(name);
    }

    /**
     * @param inStream
     * @returns {D3Object}
     */
    static factory(inStream) {
        let obj = new this();
        obj.load(inStream);
        return obj;
    }

    /**
     * 注册类构建方法
     * @param name {String} 类名
     * @param factory {Function<L5.InStream>}
     */
    static Register(name, factory) {
        D3Object.factories.set(name, factory);
    }
}

/**
 * 输入流处理 - InStream
 * 
 * @author lonphy
 * @version 2.0
 **/

class BinDataView {

    /**
     * @param buf {ArrayBuffer}
     * @param offset {number}
     * @param size {number}
     */
    constructor(buf, offset=0, size=0) {
        if (size === 0) {
            size = buf.byteLength - offset;
        }
        this.dv = new DataView(buf, offset, size);
        this.offset = 0;
    }

    int8() {
        return this.dv.getInt8(this.offset++);
    }
    setInt8(val) {
        this.dv.setInt8(this.offset++, val);
    }

    uint8() {
        return this.dv.getUint8(this.offset++);
    }
    setUint8(val) {
        this.dv.setUint8(this.offset++, val);
    }

    uint16() {
        let val = this.dv.getUint16(this.offset, true);
        this.offset +=2;
        return val;
    }

    setUint16(val) {
        this.dv.setUint16(this.offset, val, true);
        this.offset +=2;
    }

    int16() {
        let val = this.dv.getInt16(this.offset, true);
        this.offset += 2;
        return val;
    }
    setInt16(val) {
        this.dv.setInt16(this.offset, val, true);
        this.offset +=2;
    }

    int32() {
        let val = this.dv.getInt32(this.offset, true);
        this.offset += 4;
        return val;
    }
    setInt32(val) {
        this.dv.setInt32(this.offset, val, true);
        this.offset +=4;
    }

    uint32() {
        let val = this.dv.getUint32(this.offset, true);
        this.offset += 4;
        return val;
    }

    setUint32(val) {
        this.dv.setUint32(this.offset, val, true);
        this.offset +=4;
    }

    float32() {
        let val = this.dv.getFloat32(this.offset, true);
        this.offset += 4;
        return val;
    }

    setFloat32(val) {
        this.dv.setFloat32(this.offset, val, true);
        this.offset +=4;
    }

    float64() {
        let val = this.dv.getFloat64(this.offset, true);
        this.offset += 8;
        return val;
    }

    setFloat64(val) {
        this.dv.setFloat64(this.offset, val, true);
        this.offset +=8;
    }

    string() {
        let size = this.uint16(), ret='';
        for (let i=0; i<size;++i) {
            ret += String.fromCharCode(this.uint8());
        }
        return ret;
    }
    setString(val) {
        let size = val.length;
        this.setUint16(size);
        for( let i=0; i<size; ++i ) {
            this.setUint8(val[i].charCodeAt(i));
        }
        this.offset += size;
    }

    bytes(size) {
        let val = this.dv.buffer.slice(this.offset, size);
        this.offset += size;
        return new Uint8Array(val);
    }

    setBytes(val) {
        (new Uint8Array(this.dv.buffer, this.offset)).set(val);
        this.offset += val.byteLength;
    }
}

/**
 * Controller - 控制基类
 * 
 * @author lonphy
 * @version 2.0
 */
class Controller extends D3Object {

    constructor() {
        super();
        this.repeat = Controller.RT_CLAMP;
        this.minTime = 0;                      // default = 0
        this.maxTime = 0;                      // default = 0
        this.phase = 0;                        // default = 0
        this.frequency = 1;                    // default = 1
        this.active = true;                    // default = true
        this.object = null;                    // ControlledObject.
        this.applicationTime = -_Math.MAX_REAL;              // 应用程序时间 毫秒.
    }
    /**
     * 从应用程序时间转换为控制器时间
     * @param {number} applicationTime
     * @returns {number}
     */
    getControlTime(applicationTime) {
        let controlTime = this.frequency * applicationTime + this.phase;

        if (this.repeat === Controller.RT_CLAMP) {
            // Clamp the time to the [min,max] interval.
            if (controlTime < this.minTime) {
                return this.minTime;
            }
            if (controlTime > this.maxTime) {
                return this.maxTime;
            }
            return controlTime;
        }

        const timeRange = this.maxTime - this.minTime;
        if (timeRange > 0) {
            let multiples = (controlTime - this.minTime) / timeRange;
            let integerTime = _Math.floor(multiples);
            let fractionTime = multiples - integerTime;
            if (this.repeat === Controller.RT_WRAP) {
                return this.minTime + fractionTime * timeRange;
            }

            // Repeat == RT_CYCLE
            if (integerTime & 1) {
                // Go backward in time.
                return this.maxTime - fractionTime * timeRange;
            }
            else {
                // Go forward in time.
                return this.minTime + fractionTime * timeRange;
            }
        }

        // minTime, maxTime 是一样的
        return this.minTime;
    }

    /**
     * 动画更新
     * @param {number} applicationTime 毫秒
     * @returns {boolean}
     */
    update(applicationTime) {
        if (this.active) {
            this.applicationTime = applicationTime;
            return true;
        }
        return false;
    }

    load(inStream) {
        super.load(inStream);
        this.repeat = inStream.readEnum();
        this.minTime = inStream.readFloat64();
        this.maxTime = inStream.readFloat64();
        this.phase = inStream.readFloat64();
        this.frequency = inStream.readFloat64();
        this.active = inStream.readBool();
        this.object = inStream.readPointer();
        this.applicationTime = -_Math.MAX_REAL;
    }

    link(inStream) {
        super.link(inStream);
        this.object = inStream.resolveLink(this.object);
    }
}

DECLARE_ENUM(Controller, {
    RT_CLAMP: 0,
    RT_WRAP:  1,
    RT_CYCLE: 2
});

/**
 * TransformController - 变换控制基类
 *
 * @version 2.0
 * @author lonphy
 */

class TransformController extends Controller {

    /**
     * @param {Transform} localTransform
     */
    constructor(localTransform) {
        super();
        this.localTransform = localTransform;
    }

    /**
     * @param {number} applicationTime 毫秒
     */
    update(applicationTime) {
        if (super.update(applicationTime)) {
            this.object.localTransform = this.localTransform;
            return true;
        }
        return false;
    }

    /**
     * 文件载入支持
     * @param {InStream} inStream
     */
    load(inStream) {
        super.load(inStream);
        this.localTransform = inStream.readTransform();
    }
}

/**
 * BlendTransformController - 混合变换控制器
 *
 * @author lonphy
 * @version 2.0
 */
class BlendTransformController extends TransformController {

    /**
     *  ####Construction
     *  
     *  Set 'rsMatrices' to 'true' when theinput controllers manage
     *  transformations of the form Y = R*S*X + T, where R is a rotation, S is
     *  a diagonal scale matrix of positive scales, and T is a translation;
     *  that is, each transform has mIsRSMatrix equal to 'true'.  In this case,
     *  the rotation and scale blending is either geometric or arithmetic, as
     *  specified in the other constructor inputs.  Translation blending is
     *  always arithmetic.  Let {R0,S0,T0} and {R1,S1,T1} be the transformation
     *  channels, and let weight w be in [0,1].  Let {R,S,T} be the blended
     *  result.  Let q0, q1, and q be quaternions corresponding to R0, R1, and
     *  R with Dot(q0,q1) >= 0 and A = angle(q0,q1) = acos(Dot(q0,q1)).
     *  
     *  Translation:  `T = (1-w)*T0 + w*T1`
     *  
     *  Arithmetic rotation:  `q = Normalize((1-w)*q0 + w*q1)`  
     *  Geometric rotation:
     *  q = `Slerp(w, q0, q1)`
     *    = `(sin((1-w)*A)*q0 + sin(w*A)*q1)/sin(A)`
     *
     * Arithmetic scale:  s = `(1-w)*s0 + w*s1` for each channel s0, s1, s  
     * Geometric scale:  s = `sign(s0)*sign(s1)*pow(|s0|,1-w)*pow(|s1|,w)`  
     * If either of s0 or s1 is zero, then s is zero.
     *
     * Set 'rsMatrices' to 'false' when mIsRMatrix is 'false' for either
     * transformation.  In this case, a weighted average of the full
     * transforms is computed.  This is not recommended, because the visual
     * results are difficult to predict.
     * @param {TransformController} controller0
     * @param {TransformController} controller1
     * @param {boolean} rsMatrices
     * @param {boolean} geometricRotation
     * @param {boolean} geometricScale
     */
    constructor(controller0, controller1, rsMatrices, geometricRotation = false, geometricScale = false) {
        super(Transform.IDENTITY);

        this.controller0 = controller0;
        this.controller1 = controller1;

        this.weight = 0.0;
        this.rsMatrices = rsMatrices;
        this.geometricRotation = geometricRotation;
        this.geometricScale = geometricScale;
    }

    /**
     * @param {ControlledObject} obj
     */
    setObject(obj) {
        this.object = obj;
        this.controller0.object = obj;
        this.controller1.object = obj;
    }

    /**
     * 动画更新
     * @param {number} applicationTime  毫秒
     */
    update(applicationTime) {
        if (!super.update(applicationTime)) {
            return false;
        }

        this.controller0.update(applicationTime);
        this.controller1.update(applicationTime);

        let weight = this.weight;
        let oneMinusWeight = 1 - weight;
        const xfrm0 = this.controller0.localTransform;
        const xfrm1 = this.controller1.localTransform;

        // Arithmetic blend of translations.
        const trn0 = xfrm0.getTranslate();
        const trn1 = xfrm1.getTranslate();

        this.localTransform.setTranslate(trn0.scalar(oneMinusWeight).add(trn1.scalar(weight)));

        if (this.rsMatrices) {
            const rot0 = xfrm0.getRotate();
            const rot1 = xfrm1.getRotate();

            let quat0 = Quaternion$1.fromRotateMatrix(rot0);
            let quat1 = Quaternion$1.fromRotateMatrix(rot1);
            if (quat0.dot(quat1) < 0) {
                quat1 = quat1.negative();
            }

            let sca0 = xfrm0.getScale();
            let sca1 = xfrm1.getScale();
            let blendQuat = Quaternion$1.ZERO.clone();

            if (this.geometricRotation) {
                blendQuat.slerp(weight, quat0, quat1);
            }
            else {
                blendQuat = quat0.scalar(oneMinusWeight).add(quat1.scalar(weight));
                blendQuat.normalize();
            }
            this.localTransform.setRotate(blendQuat.toRotateMatrix());

            let pow = _Math.pow;
            let sign = _Math.sign;
            let abs = _Math.abs;
            let blendSca;

            if (this.geometricScale) {
                let s0, s1;
                blendSca = Point.ORIGIN;
                for (let i = 0; i < 3; ++i) {
                    s0 = sca0[i];
                    s1 = sca1[i];
                    if (s0 !== 0 && s1 !== 0) {
                        let sign0 = sign(s0);
                        let sign1 = sign(s1);
                        let pow0 = pow(abs(s0), oneMinusWeight);
                        let pow1 = pow(abs(s1), weight);
                        blendSca[i] = sign0 * sign1 * pow0 * pow1;
                    }
                    // else
                    // {
                    //    blendSca[i] = 0;
                    // }
                }
            }
            else {
                blendSca = sca0.scalar(oneMinusWeight).add(sca1.scalar(weight));
            }
            this.localTransform.setScale(blendSca);
        }
        else {
            let m0 = xfrm0.getMatrix();
            let m1 = xfrm1.getMatrix();
            let blendMat = m0.scalar(oneMinusWeight).add(m1.scalar(weight));

            this.localTransform.setMatrix(blendMat);
        }
        this.object.localTransform = this.localTransform;
        return true;
    }

    load(inStream) {
        super.load(inStream);
        this.controller0 = inStream.readPointer();
        this.controller1 = inStream.readPointer();
        this.weight = inStream.readFloat32();
        this.rsMatrices = inStream.readBool();
        this.geometricRotation = inStream.readBool();
        this.geometricScale = inStream.readBool();
    }
    link(inStream) {
        super.link(inStream);
        this.controller0 = inStream.resolveLink(this.controller0);
        this.controller1 = inStream.resolveLink(this.controller1);
    }
}

D3Object.Register('L5.BlendTransformController', BlendTransformController.factory);

/**
 * ControlledObject - 控制基类
 *
 * @version 2.0
 * @author lonphy
 */

class ControlledObject extends D3Object {
    constructor() {
        super();
        this.numControllers = 0;
        this.controllers = [];
    }
    /**
     * @param {number} i
     * @returns {Controller|null}
     */
    getController(i) {
        if (0 <= i && i < this.numControllers) {
            return this.controllers[i];
        }

        console.assert(false, 'Invalid index in getController.');
        return null;
    }

    /**
     * @param {Controller} controller
     */
    attachController(controller) {
        // By design, controllers may not be controlled.  This avoids arbitrarily
        // complex graphs of controllers.  TODO:  Consider allowing this?
        if (!(controller instanceof Controller)) {
            console.assert(false, 'Controllers may not be controlled');
            return;
        }

        // The controller must exist.
        if (!controller) {
            console.assert(false, 'Cannot attach a null controller');
            return;
        }

        // Test whether the controller is already in the array.
        let i, l = this.numControllers;
        for (i = 0; i < l; ++i) {
            if (controller === this.controllers[i]) {
                return;
            }
        }

        // Bind the controller to the object.
        controller.object = this;

        this.controllers[(this.numControllers)++] = controller;
    }

    /**
     * @param {Controller} controller
     */
    detachController(controller) {
        let l = this.numControllersl;
        for (let i = 0; i < l; ++i) {
            if (controller === this.controllers[i]) {
                // Unbind the controller from the object.
                controller.object = null;

                // Remove the controller from the array, keeping the array
                // compact.
                for (let j = i + 1; j < l; ++j, ++i) {
                    this.controllers[i] = this.controllers[j];
                }
                this.controllers[--(this.numControllers)] = null;
                return;
            }
        }
    }

    detachAllControllers() {
        let i, l = this.numControllers;
        for (i = 0; i < l; ++i) {
            // Unbind the controller from the object.
            this.controllers[i].object = null;
            this.controllers[i] = null;
        }
        this.numControllers = 0;
    }

    /**
     * @param {number} applicationTime 
     * @return {boolean}
     */
    updateControllers(applicationTime) {
        let someoneUpdated = false, l = this.numControllers;
        for (let i = 0; i < l; ++i) {
            if (this.controllers[i].update(applicationTime)) {
                someoneUpdated = true;
            }
        }
        return someoneUpdated;
    }

    /**
     * @param inStream {InStream}
     */
    load(inStream) {
        super.load(inStream);
        let r = inStream.readPointerArray();
        if (r !== false) {
            this.numControllers = r.length;
            this.controllers = r.slice();
        }
        this.capacity = this.numControllers;
    }

    link(inStream) {
        super.link(inStream);
        this.controllers = inStream.resolveArrayLink(this.numControllers, this.controllers);
    }
}

class KeyframeController extends TransformController {

    /**
     * @param {number} numCommonTimes
     * @param {number} numTranslations
     * @param {number} numRotations
     * @param {number} numScales
     * @param {Transform} localTransform
     */
    constructor(numCommonTimes, numTranslations, numRotations, numScales, localTransform) {
        super(localTransform);
        if (numCommonTimes > 0) {
            this.numCommonTimes = numCommonTimes;
            this.commonTimes = new Array(numCommonTimes);

            if (numTranslations > 0) {
                this.numTranslations = numTranslations;
                this.translationTimes = this.commonTimes;
                this.translations = new Array(numTranslations);
            }
            else {
                this.numTranslations = 0;
                this.translationTimes = null;
                this.translations = null;
            }

            if (numRotations > 0) {
                this.numRotations = numRotations;
                this.rotationTimes = this.commonTimes;
                this.rotations = new Array(numRotations);
            }
            else {
                this.numRotations = 0;
                this.rotationTimes = null;
                this.rotations = null;
            }

            if (numScales > 0) {
                this.numScales = numScales;
                this.scaleTimes = this.commonTimes;
                this.scales = new Array(numScales);
            }
            else {
                this.numScales = 0;
                this.scaleTimes = null;
                this.scales = null;
            }
        }
        else {
            this.numCommonTimes = 0;
            this.commonTimes = null;

            if (numTranslations > 0) {
                this.numTranslations = numTranslations;
                this.translationTimes = new Array(numTranslations);
                this.translations = new Array(numTranslations);
            }
            else {
                this.numTranslations = 0;
                this.translationTimes = null;
                this.translations = null;
            }

            if (numRotations > 0) {
                this.numRotations = numRotations;
                this.rotationTimes = new Array(numRotations);
                this.rotations = new Array(numRotations);
            }
            else {
                this.numRotations = 0;
                this.rotationTimes = null;
                this.rotations = null;
            }

            if (numScales > 0) {
                this.numScales = numScales;
                this.scaleTimes = new Array(numScales);
                this.scales = new Array(numScales);
            }
            else {
                this.numScales = 0;
                this.scaleTimes = null;
                this.scales = null;
            }
        }

        this.tLastIndex = 0;
        this.rLastIndex = 0;
        this.sLastIndex = 0;
        this.cLastIndex = 0;
    }
    /**
     * 动画更新
     * @param {number} applicationTime
     */
    update(applicationTime) {
        if (!super.update(applicationTime)) {
            return false;
        }

        let ctrlTime = this.getControlTime(applicationTime);
        let trn = new Point$1();
        let rot = new Matrix$1();
        let scale = 0;
        let t;

        // The logic here checks for equal-time arrays to minimize the number of
        // times GetKeyInfo is called.
        if (this.numCommonTimes > 0) {
            t = KeyframeController.getKeyInfo(ctrlTime, this.numCommonTimes, this.commonTimes, this.cLastIndex);
            this.cLastIndex = t[0];
            let normTime = t[1], i0 = t[2], i1 = t[3];
            t = null;

            if (this.numTranslations > 0) {
                trn = this.getTranslate(normTime, i0, i1);
                this.localTransform.setTranslate(trn);
            }

            if (this.numRotations > 0) {
                rot = this.getRotate(normTime, i0, i1);
                this.localTransform.setRotate(rot);
            }

            if (this.numScales > 0) {
                scale = this.getScale(normTime, i0, i1);
                this.localTransform.setUniformScale(scale);
            }
        }
        else {
            if (this.numTranslations > 0) {
                t = KeyframeController.getKeyInfo(ctrlTime, this.numTranslations, this.translationTimes, this.tLastIndex);
                this.tLastIndex = t[0];
                trn = this.getTranslate(t[1], t[2], t[3]);
                this.localTransform.setTranslate(trn);
            }

            if (this.numRotations > 0) {
                t = KeyframeController.getKeyInfo(ctrlTime, this.numRotations, this.rotationTimes, this.rLastIndex);
                this.rLastIndex = t[0];
                rot = this.getRotate(t[1], t[2], t[3]);
                this.localTransform.setRotate(rot);
            }

            if (this.numScales > 0) {
                t = KeyframeController.getKeyInfo(ctrlTime, this.numScales, this.scaleTimes, this.sLastIndex);
                this.sLastIndex = t[0];
                scale = this.getScale(t[1], t[2], t[3]);
                this.localTransform.setUniformScale(scale);
            }
        }

        this.object.localTransform = this.localTransform;
        return true;
    }

    // Support for looking up keyframes given the specified time.
    static getKeyInfo(ctrlTime, numTimes, times, lIndex) {
        if (ctrlTime <= times[0]) {
            return [0, 0, 0, 0];
        }

        if (ctrlTime >= times[numTimes - 1]) {
            let l = numTimes - 1;
            return [0, l, l, l];
        }

        let nextIndex;
        if (ctrlTime > times[lIndex]) {
            nextIndex = lIndex + 1;
            while (ctrlTime >= times[nextIndex]) {
                lIndex = nextIndex;
                ++nextIndex;
            }

            return [
                lIndex,
                (ctrlTime - times[lIndex]) / (times[nextIndex] - times[lIndex]),
                lIndex,
                nextIndex
            ];
        }
        else if (ctrlTime < times[lIndex]) {
            nextIndex = lIndex - 1;
            while (ctrlTime <= times[nextIndex]) {
                lIndex = nextIndex;
                --nextIndex;
            }
            return [
                lIndex,
                (ctrlTime - times[nextIndex]) / (times[lIndex] - times[nextIndex]),
                nextIndex,
                lIndex
            ];
        }

        return [lIndex, 0, lIndex, lIndex];
    }

    /**
     *
     * @param normTime
     * @param i0
     * @param i1
     * @returns {Point}
     */
    getTranslate(normTime, i0, i1) {
        let t0 = this.translations[i0];
        let t1 = this.translations[i1];
        return t0.add(t1.sub(t0).scalar(normTime));
    }

    /**
     *
     * @param normTime
     * @param i0
     * @param i1
     * @returns {Matrix}
     */
    getRotate(normTime, i0, i1) {
        let q = new L5.Quaternion();
        q.slerp(normTime, this.rotations[i0], this.rotations[i1]);
        return q.toRotateMatrix();
    }

    /**
     *
     * @param normTime
     * @param i0
     * @param i1
     * @returns {number}
     */
    getScale(normTime, i0, i1) {
        return this.scales[i0] + normTime * (this.scales[i1] - this.scales[i0]);
    }

    /**
     * @param inStream {InStream}
     */
    load(inStream) {

        super.load(inStream);
        this.numCommonTimes = inStream.readUint32();
        if (this.numCommonTimes > 0) {
            this.commonTimes = inStream.readArray(this.numCommonTimes);

            this.translations = inStream.readPointArray();
            this.numTranslations = this.translations.length;

            this.rotations = inStream.readQuaternionArray();
            this.numRotations = this.rotations.length;

            this.scales = inStream.readFloatArray();
            this.numScales = this.scales.length;
        }
        else {
            this.translationTimes = inStream.readFloatArray();
            this.numTranslations = this.translationTimes.length;
            this.translations = inStream.readSizedPointArray(this.numTranslations);

            this.rotationTimes = inStream.readFloatArray();
            this.numRotations = this.rotationTimes.length;
            this.rotations = inStream.readSizedQuaternionArray(this.numRotations);

            this.scaleTimes = inStream.readFloatArray();
            this.numScales = this.scaleTimes.length;
            this.scales = inStream.readArray(this.numScales);
        }
    }

    /**
     * 文件解析工厂方法
     * @param inStream {InStream}
     * @returns {KeyframeController}
     */
    static factory(inStream) {
        let obj = new KeyframeController(0, 0, 0, 0, 0);
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('L5.KeyframeController', KeyframeController.factory);

class Camera extends D3Object {

    constructor(isPerspective = false) {
        super();

        this.isPerspective = isPerspective;

        this.position = Point$1.ORIGIN;
        this.direction = Vector$1.UNIT_Z.negative(); //-z
        this.up = Vector$1.UNIT_Y;
        this.right = Vector$1.UNIT_X;

        // 摄像机视图矩阵
        this.viewMatrix = Matrix$1.IDENTITY;

        // 视截体存储结构, 存储顺序 NEAR-FAR-BOTTOM-TOP-LEFT-RIGHT
        this.frustum = new Float32Array(6);

        // 摄像机投影矩阵
        this.projectionMatrix = Matrix$1.IDENTITY;

        // 投影视图矩阵， 即投影矩阵和视图矩阵的乘积
        // 当视图前置/后置矩阵不为空时会包含它们
        this.projectionViewMatrix = Matrix$1.IDENTITY;

        // 视图前置矩阵，位置在模型矩阵之后，但在视图矩阵之前
        // 用于对物体的变换， 例如反射等，默认为单位矩阵
        this.preViewMatrix = Matrix$1.IDENTITY;
        this.preViewIsIdentity = true;

        // 视图后置矩阵，用于屏幕空间转换，例如反射渲染后的图像等，默认为单位矩阵
        this.postProjectionMatrix = Matrix$1.IDENTITY;
        this.postProjectionIsIdentity = true;

        // 初始化
        this.setFrame(this.position, this.direction, this.up, this.right);
        this.setPerspective(90, 1, 1, 1000);
    }


    /**
     * 所有参数均为世界坐标系
     *
     * @param eye {Point} 相机位置
     * @param center {Point} 场景中心
     * @param up {Vector} 相机上方向
     */
    lookAt(eye, center, up) {

        if (eye.equals(center)) {
            this.position.copy(Point$1.ORIGIN);
            this.up.copy(up);
            this.direction.copy(Vector$1.UNIT_Z.negative());
            this.right.copy(Vector$1.UNIT_X);
            return;
        }

        this.position.copy(eye);

        // 这里可直接计算正-Z方向, 上面已经做过判断
        var z = eye.subAsVector(center);
        z.normalize();

        // 计算右方向
        var x = up.cross(z);
        x.normalize();

        // 计算右方向
        var y = z.cross(x);
        y.normalize();

        this.direction.copy(z);
        this.up.copy(y);
        this.right.copy(x);

        this.onFrameChange();
    }

    /**
     * 摄像机的向量使用世界坐标系.
     *
     * @param position  {Point } 位置 default (0, 0,  0; 1)
     * @param direction {Vector} 观察方向 default (0, 0, -1; 0)
     * @param up        {Vector} 上方向 default default (0, 1, 0; 0)
     * @returns {void}
     */
    setFrame(position, direction, up) {
        this.position.copy(position);
        var right = direction.cross(up);
        this.setAxes(direction, up, right);
    }

    /**
     * 设置摄像机位置
     * @param position {Point}
     * @returns {void}
     */
    setPosition(position) {
        this.position.copy(position);
        this.onFrameChange();
    }

    /**
     * 设置摄像机坐标系的3个轴
     *
     * @param direction {Vector} 观察方向
     * @param up        {Vector} 上方向
     * @param right     {Vector} 右方向
     * @returns {void}
     */
    setAxes(direction, up, right) {
        this.direction.copy(direction);
        this.up.copy(up);
        this.right.copy(right);

        // 判断3个轴是否正交, 否则需要校正
        var det = direction.dot(up.cross(right));
        if (_Math.abs(1 - det) > 0.00001) {
            Vector$1.orthoNormalize(this.direction, this.up, this.right);
        }
        this.onFrameChange();
    }

    /**
     * 设置透视矩阵参数
     * @param fov {float} 垂直视角, 单位: 度
     * @param aspect {float} 高宽比
     * @param near {float} 近平面
     * @param far {float} 远平面
     */
    setPerspective(fov, aspect, near, far) {
        var top = near * _Math.tan(fov * _Math.PI / 360);
        var right = top * aspect;

        this.frustum[Camera.VF_TOP] = top;
        this.frustum[Camera.VF_BOTTOM] = -top;
        this.frustum[Camera.VF_RIGHT] = right;
        this.frustum[Camera.VF_LEFT] = -right;
        this.frustum[Camera.VF_NEAR] = near;
        this.frustum[Camera.VF_FAR] = far;

        this.onFrustumChange();
    }

    /**
     * 返回透视图的4个参数
     * returns {Float32Array} [fov, aspect, near, far]
     */
    getPerspective() {
        var ret = new Float32Array(4);

        if (
            this.frustum[Camera.VF_LEFT] == -this.frustum[Camera.VF_RIGHT] &&
            this.frustum[Camera.VF_BOTTOM] == -this.frustum[Camera.VF_TOP]
        ) {
            var tmp = this.frustum[Camera.VF_TOP] / this.frustum[Camera.VF_NEAR];
            ret[0] = _Math.atan(tmp) * 360 / _Math.PI;
            ret[1] = this.frustum[Camera.VF_RIGHT] / this.frustum[Camera.VF_TOP];
            ret[2] = this.frustum[Camera.VF_NEAR];
            ret[3] = this.frustum[Camera.VF_FAR];
        }
        return ret;
    }

    /**
     * 通过6个面的参数设置视截体
     * @param near   {number} 近平面
     * @param far    {number} 远平面
     * @param bottom {number} 底面
     * @param top    {number} 顶面
     * @param left   {number} 左面
     * @param right  {number} 右面
     * @returns {void}
     */
    setFrustum(near, far, bottom, top, left, right) {
        this.frustum[Camera.VF_NEAR] = near;
        this.frustum[Camera.VF_FAR] = far;
        this.frustum[Camera.VF_BOTTOM] = bottom;
        this.frustum[Camera.VF_TOP] = top;
        this.frustum[Camera.VF_LEFT] = left;
        this.frustum[Camera.VF_RIGHT] = right;

        this.onFrustumChange();
    }

    /**
     * p00 {Point}
     * p10 {Point}
     * p11 {Point}
     * p01 {Point}
     * nearExtrude {number}
     * farExtrude {number}
     *
     */
    setProjectionMatrix(p00, p10, p11, p01,
        nearExtrude, farExtrude) {

        var // 计算近平面
            q000 = p00.scalar(nearExtrude),
            q100 = p01.scalar(nearExtrude),
            q110 = p11.scalar(nearExtrude),
            q010 = p01.scalar(nearExtrude),

            // 计算远平面
            q001 = p00.scalar(farExtrude),
            q101 = p10.scalar(farExtrude),
            q111 = p11.scalar(farExtrude),
            q011 = p01.scalar(farExtrude);

        // Compute the representation of q111.
        var u0 = q100.sub(q000),
            u1 = q010.sub(q000),
            u2 = q001.sub(q000);

        var m = Matrix$1.IPMake(u0, u1, u2, q000);
        var invM = m.inverse(0.001);
        var a = invM.mulPoint(q111);

        // Compute the coeffients in the fractional linear transformation.
        //   y[i] = n[i]*x[i]/(d[0]*x[0] + d[1]*x[1] + d[2]*x[2] + d[3])
        var n0 = 2 * a.x;
        var n1 = 2 * a.y;
        var n2 = 2 * a.z;
        var d0 = +a.x - a.y - a.z + 1;
        var d1 = -a.x + a.y - a.z + 1;
        var d2 = -a.x - a.y + a.z + 1;
        var d3 = +a.x + a.y + a.z - 1;

        // 从规范正方体[-1,1]^2 x [0,1]计算透视投影
        var n20 = n2 / n0,
            n21 = n2 / n1,
            n20d0 = n20 * d0,
            n21d1 = n21 * d1,
            d32 = 2 * d3,
            project = new Matrix$1(
                n20 * d32 + n20d0, n21d1, d2, -n2,
                n20d0, n21 * d32 + n21d1, d2, -n2,
                n20d0, n21d1, d2, -n2,
                -n20d0, -n21d1, -d2, n2
            );

        this.postProjectionMatrix.copy(project.mul(invM));
        this.postProjectionIsIdentity = Matrix$1.isIdentity(this.postProjectionMatrix);
        this.updatePVMatrix();
    }

    /**
     * 设置视图前置矩阵
     *
     * @param mat {Matrix}
     * @returns {void}
     */
    setPreViewMatrix(mat) {
        this.preViewMatrix.copy(mat);
        this.preViewIsIdentity = Matrix$1.isIdentity(mat);
        this.updatePVMatrix();
    }

    /**
     * 设置视图后置矩阵
     *
     * @param mat {Matrix}
     * @returns {void}
     */
    setPostProjectionMatrix(mat) {
        this.postProjectionMatrix.copy(mat);
        this.postProjectionIsIdentity = Matrix$1.isIdentity(mat);
        this.updatePVMatrix();
    }

    /**
     * 在归一化后的显示空间[-1,1]x[-1,1]计算物体轴对齐包围盒
     *
     * @param numVertices  {number}       顶点数量
     * @param vertices     {Float32Array} 顶点数组
     * @param stride       {number}       步幅
     * @param worldMatrix  {Matrix}   物体变换矩阵
     * @returns {object}
     */
    computeBoundingAABB(numVertices, vertices, stride, worldMatrix) {
        // 计算当前物体，世界视图投影矩阵.
        var vpMatrix = this.projectionMatrix.mul(this.viewMatrix);
        if (!this.postProjectionIsIdentity) {
            vpMatrix.copy(this.postProjectionMatrix.mul(vpMatrix));
        }
        var wvpMatrix = vpMatrix.mul(worldMatrix);
        var xmin, xmax, ymin, ymax;
        // 计算规范化后的显示坐标包围盒
        xmin = ymin = Infinity;
        xmax = ymax = -Infinity;

        for (var i = 0; i < numVertices; ++i) {
            var pos = new Point$1(vertices[i + stride], vertices[i + stride + 1], vertices[i + stride + 2]);
            var hpos = wvpMatrix.mulPoint(pos);
            var invW = 1 / hpos.w;
            var xNDC = hpos.x * invW;
            var yNDC = hpos.y * invW;
            if (xNDC < xmin) {
                xmin = xNDC;
            }
            if (xNDC > xmax) {
                xmax = xNDC;
            }
            if (yNDC < ymin) {
                ymin = yNDC;
            }
            if (yNDC > ymax) {
                ymax = yNDC;
            }
        }
        return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
    }

    /**
     * 计算变更后的视图矩阵
     * @returns {void}
     */
    onFrameChange() {
        var nPos = this.position;
        var x = this.right, y = this.up, z = this.direction;

        this.viewMatrix[0] = x[0];
        this.viewMatrix[1] = y[0];
        this.viewMatrix[2] = z[0];
        this.viewMatrix[3] = 0;

        this.viewMatrix[4] = x[1];
        this.viewMatrix[5] = y[1];
        this.viewMatrix[6] = z[1];
        this.viewMatrix[7] = 0;

        this.viewMatrix[8] = x[2];
        this.viewMatrix[9] = y[2];
        this.viewMatrix[10] = z[2];
        this.viewMatrix[11] = 0;

        this.viewMatrix[12] = -nPos.dot(x);
        this.viewMatrix[13] = -nPos.dot(y);
        this.viewMatrix[14] = -nPos.dot(z);
        this.viewMatrix[15] = 1;

        this.updatePVMatrix();
    }

    /**
     * 视截体变化后计算投影矩阵
     * @returns {void}
     */
    onFrustumChange() {
        var f = this.frustum;
        var near = f[Camera.VF_NEAR],
            far = f[Camera.VF_FAR],
            bottom = f[Camera.VF_BOTTOM],
            top = f[Camera.VF_TOP],
            left = f[Camera.VF_LEFT],
            right = f[Camera.VF_RIGHT],

            rl = right - left,
            tb = top - bottom,
            fn = far - near;

        this.projectionMatrix.zero();

        if (this.isPerspective) {
            var near2 = 2 * near;
            this.projectionMatrix[0] = near2 / rl;
            this.projectionMatrix[5] = near2 / tb;
            this.projectionMatrix[8] = (right + left) / rl;
            this.projectionMatrix[9] = (top + bottom) / tb;
            this.projectionMatrix[10] = -(far + near) / fn;
            this.projectionMatrix[11] = -1;
            this.projectionMatrix[14] = -(far * near2) / fn;
        }
        else {
            this.projectionMatrix[0] = 2 / rl;
            this.projectionMatrix[5] = 2 / tb;
            this.projectionMatrix[10] = -2 / fn;
            this.projectionMatrix[12] = -(left + right) / rl;
            this.projectionMatrix[13] = -(top + bottom) / tb;
            this.projectionMatrix[14] = -(far + near) / fn;
            this.projectionMatrix[15] = 1;
        }

        this.updatePVMatrix();
    }

    /**
     * 计算postproj-proj-view-preview的乘积
     * @returns {void}
     */
    updatePVMatrix() {

        this.projectionViewMatrix.copy(this.projectionMatrix.mul(this.viewMatrix));


        if (!this.postProjectionIsIdentity) {
            this.projectionViewMatrix.copy(this.postProjectionMatrix.mul(this.projectionViewMatrix));
        }

        if (!this.preViewIsIdentity) {
            this.projectionViewMatrix.copy(this.projectionViewMatrix.mul(this.preViewMatrix));
        }
    }

    debug() {
        if (!this.output) {
            this.output = document.createElement('div');
            document.querySelector('.nodes-info').appendChild(this.output);
        }
        let pos = this.position;
        let dir = this.direction;
        this.output.innerHTML = `pos:[${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)}]<br/>
                        dir:[${dir.x.toFixed(4)}, ${dir.y.toFixed(4)}, ${dir.z.toFixed(4)}]<br/>`;
    }
}

////////////////////// const 视截体常量定义 //////////////////////
DECLARE_ENUM(Camera, {
    VF_NEAR: 0,
    VF_FAR: 1,
    VF_BOTTOM: 2,
    VF_TOP: 3,
    VF_LEFT: 4,
    VF_RIGHT: 5,
    VF_QUANTITY: 6
});

/**
 * Transform
 *
 * @author lonphy
 * @version 2.0
 */
class Transform$1 {
    constructor() {
        // The full 4x4 homogeneous matrix H = {{M,T},{0,1}} and its inverse
        // H^{-1} = {M^{-1},-M^{-1}*T},{0,1}}.  The inverse is computed only
        // on demand.

        // 变换矩阵
        this.__matrix = Matrix$1.IDENTITY;
        // 变换矩阵的逆矩阵
        this._invMatrix = Matrix$1.IDENTITY;

        this._matrix = Matrix$1.IDENTITY;     // M (general) or R (rotation)


        this._scale = new Point$1(1, 1, 1);        // S
        this._translate = Point$1.ORIGIN;          // T

        this._isIdentity = true;
        this._isRSMatrix = true;
        this._isUniformScale = true;
        this._inverseNeedsUpdate = false;
    }

    /**
     * 置单位变换
     */
    makeIdentity() {
        this._matrix = Matrix$1.IDENTITY;
        this._translate.fill(0);
        this._scale.fill(1);
        this._isIdentity = true;
        this._isRSMatrix = true;
        this._isUniformScale = true;
        this._updateMatrix();
        return this;
    }

    /**
     * 缩放置1
     */
    makeUnitScale() {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
        this._scale.fill(1);
        this._isUniformScale = true;
        this._updateMatrix();
        return this;
    }

    /**
     * I
     * @returns {boolean}
     */
    isIdentity() {
        return this._isIdentity;
    }

    /**
     * R*S
     * @returns {boolean}
     */
    isRSMatrix() {
        return this._isRSMatrix;
    }

    /**
     * R*S, S = c*I
     * @returns {boolean}
     */
    isUniformScale() {
        return this._isRSMatrix && this._isUniformScale;
    }


    // Member access.
    // (1) The Set* functions set the is-identity hint to false.
    // (2) The SetRotate function sets the is-rsmatrix hint to true.  If this
    //     hint is false,  GetRotate fires an "assert" in debug mode.
    // (3) The SetMatrix function sets the is-rsmatrix and is-uniform-scale
    //     hints to false.
    // (4) The SetScale function sets the is-uniform-scale hint to false.
    //     The SetUniformScale function sets the is-uniform-scale hint to
    //     true.  If this hint is false, GetUniformScale fires an "assert" in
    //     debug mode.
    // (5) All Set* functions set the inverse-needs-update to true.  When
    //     GetInverse is called, the inverse must be computed in this case and
    //     the inverse-needs-update is reset to false.
    /**
     * @param rotate {Matrix}
     */
    setRotate(rotate) {
        this._matrix.copy(rotate);
        this._isIdentity = false;
        this._isRSMatrix = true;
        this._updateMatrix();
        return this;
    }

    /**
     * @param matrix {Matrix}
     */
    setMatrix(matrix) {
        this._matrix.copy(matrix);
        this._isIdentity = false;
        this._isRSMatrix = false;
        this._isUniformScale = false;
        this._updateMatrix();
        return this;
    }

    /**
     * @param translate {Point}
     */
    setTranslate(translate) {
        this._translate.copy(translate);
        this._isIdentity = false;
        this._updateMatrix();
        return this;
    }

    /**
     * @param scale {Point}
     */
    setScale(scale) {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
        console.assert(!this._scale.equals(Point$1.ORIGIN), 'Scales must be nonzero');
        this._scale.copy(scale);
        this._isIdentity = false;
        this._isUniformScale = false;
        this._updateMatrix();
        return this;
    }

    /**
     * @param scale {number}
     */
    setUniformScale(scale) {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
        console.assert(scale !== 0, 'Scale must be nonzero');

        this._scale.fill(scale);
        this._isIdentity = false;
        this._isUniformScale = true;
        this._updateMatrix();
        return this;
    }

    /**
     * @returns {Matrix}
     */
    getRotate() {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
        return this._matrix;
    }

    /**
     * @returns {Matrix}
     */
    getMatrix() {
        return this._matrix;
    }

    /**
     * @returns {Point}
     */
    getTranslate() {
        return this._translate;
    }

    /**
     * @returns {Point}
     */
    getScale() {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation-scale');
        return this._scale;
    }

    /**
     * @returns {number}
     */
    getUniformScale() {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation-scale');
        console.assert(this._isUniformScale, 'Matrix is not uniform scale');
        return this._scale[0];
    }


    /**
     * For M = R*S, the largest value of S in absolute value is returned.
     * For general M, the max-row-sum norm is returned, which is a reasonable
     * measure of maximum scale of the transformation.
     * @returns {number}
     */
    getNorm() {
        const abs = _Math.abs;
        if (this._isRSMatrix) {
            var maxValue = abs(this._scale[0]);
            if (abs(this._scale[1]) > maxValue) {
                maxValue = abs(this._scale[1]);
            }
            if (abs(this._scale[2]) > maxValue) {
                maxValue = abs(this._scale[2]);
            }
            return maxValue;
        }

        // A general matrix.  Use the max-row-sum matrix norm.  The spectral
        // norm (the maximum absolute value of the eigenvalues) is smaller or
        // equal to this norm.  Therefore, this function returns an approximation
        // to the maximum scale.
        var m = this._matrix;
        var maxRowSum = abs(m.item(0, 0)) + abs(m.item(0, 1)) + abs(m.item(0, 2));
        var rowSum = abs(m.item(1, 0)) + abs(m.item(1, 1)) + abs(m.item(1, 2));

        if (rowSum > maxRowSum) {
            maxRowSum = rowSum;
        }
        rowSum = abs(m.item(2, 0)) + abs(m.item(2, 1)) + abs(m.item(2, 2));
        if (rowSum > maxRowSum) {
            maxRowSum = rowSum;
        }

        return maxRowSum;
    }

    /**
     * @param p {Point|Vector}
     * Matrix-point/vector 乘法, M*p.
     */
    mulPoint(p) {
        return this.__matrix.mulPoint(p);
    }

    /**
     * Matrix-matrix multiplication.
     * @param transform {Transform}
     * @returns {Transform}
     */
    mul(transform) {
        if (this._isIdentity) {
            return transform;
        }

        if (transform.isIdentity()) {
            return this;
        }
        const IsRS = this._isRSMatrix;
        var product = new Transform$1();

        if (IsRS && transform.isRSMatrix()) {
            if (this._isUniformScale) {
                var scale0 = this._scale[0];
                product.setRotate(this._matrix.mul(transform.getMatrix()));

                product.setTranslate(
                    this._matrix.mulPoint(transform.getTranslate())
                        .scalar(scale0)
                        .add(this._translate)
                );

                if (transform.isUniformScale()) {
                    product.setUniformScale(scale0 * transform.getUniformScale());
                } else {
                    product.setScale(transform.getScale().scalar(scale0));
                }

                return product;
            }
        }

        // In all remaining cases, the matrix cannot be written as R*S*X+T.
        var matMA = (IsRS ? this._matrix.timesDiagonal(this._scale) : this._matrix);
        var matMB = (
            transform.isRSMatrix() ?
                transform.getMatrix().timesDiagonal(transform.getScale()) :
                transform.getMatrix()
        );

        product.setMatrix(matMA.mul(matMB));
        product.setTranslate(matMA.mulPoint(transform.getTranslate()).add(this._translate));
        return product;
    }

    /**
     * Get the homogeneous matrix.
     */
    toMatrix() {
        return this.__matrix;
    }


    /**
     * Get the inverse homogeneous matrix, recomputing it when necessary.
     * If H = {{M,T},{0,1}}, then H^{-1} = {{M^{-1},-M^{-1}*T},{0,1}}.
     * @returns {Matrix}
     */
    inverse() {
        if (!this._inverseNeedsUpdate) {
            return this._invMatrix;
        }
        if (this._isIdentity) {
            this._invMatrix.copy(Matrix$1.IDENTITY);
            this._inverseNeedsUpdate = false;
            return this._invMatrix;
        }

        var im = this._invMatrix,
            m = this._matrix;

        if (this._isRSMatrix) {
            var s0 = this._scale[0],
                s1 = this._scale[1],
                s2 = this._scale[2];

            if (this._isUniformScale) {
                var invScale = 1 / s0;
                im.setItem(0, 0, invScale * m.item(0, 0));
                im.setItem(0, 1, invScale * m.item(1, 0));
                im.setItem(0, 2, invScale * m.item(2, 0));
                im.setItem(1, 0, invScale * m.item(0, 1));
                im.setItem(1, 1, invScale * m.item(1, 1));
                im.setItem(1, 2, invScale * m.item(2, 1));
                im.setItem(2, 0, invScale * m.item(0, 2));
                im.setItem(2, 1, invScale * m.item(1, 2));
                im.setItem(2, 2, invScale * m.item(2, 2));
            } else {
                // Replace 3 reciprocals by 6 multiplies and 1 reciprocal.
                var s01 = s0 * s1;
                var s02 = s0 * s2;
                var s12 = s1 * s2;
                var invs012 = 1 / (s01 * s2);
                var invS0 = s12 * invs012;
                var invS1 = s02 * invs012;
                var invS2 = s01 * invs012;
                im.setItem(0, 0, invS0 * m.item(0, 0));
                im.setItem(0, 1, invS0 * m.item(1, 0));
                im.setItem(0, 2, invS0 * m.item(2, 0));
                im.setItem(1, 0, invS1 * m.item(0, 1));
                im.setItem(1, 1, invS1 * m.item(1, 1));
                im.setItem(1, 2, invS1 * m.item(2, 1));
                im.setItem(2, 0, invS2 * m.item(0, 2));
                im.setItem(2, 1, invS2 * m.item(1, 2));
                im.setItem(2, 2, invS2 * m.item(2, 2));
            }
        } else {
            Transform$1.invert3x3(this.__matrix, im);
        }

        var t0 = this._translate[0],
            t1 = this._translate[1],
            t2 = this._translate[2];
        im.setItem(0, 3, -(im.item(0, 0) * t0 + im.item(0, 1) * t1 + im.item(0, 2) * t2));
        im.setItem(1, 3, -(im.item(1, 0) * t0 + im.item(1, 1) * t1 + im.item(1, 2) * t2));
        im.setItem(2, 3, -(im.item(2, 0) * t0 + im.item(2, 1) * t1 + im.item(2, 2) * t2));

        this._inverseNeedsUpdate = false;
        return this._invMatrix;
    }


    /**
     * Get the inversion transform.  No test is performed to determine whether
     * the caller transform is invertible.
     * @returns {Transform}
     */
    inverseTransform() {
        if (this._isIdentity) {
            return Transform$1.IDENTITY;
        }

        var inverse = new Transform$1();
        var invTrn = Point$1.ORIGIN;

        if (this._isRSMatrix) {
            var invRot = this._matrix.transpose();
            var invScale;
            inverse.setRotate(invRot);
            if (this._isUniformScale) {
                invScale = 1 / this._scale[0];
                inverse.setUniformScale(invScale);
                invTrn = invRot.mulPoint(this._translate).scalar(-invScale);
            }
            else {
                invScale = new Point$1(1 / this._scale[0], 1 / this._scale[1], 1 / this._scale[2]);
                inverse.setScale(invScale);
                invTrn = invRot.mulPoint(this._translate);
                invTrn[0] *= -invScale[0];
                invTrn[1] *= -invScale[1];
                invTrn[2] *= -invScale[2];
            }
        }
        else {
            var invMat = new Matrix$1();
            Transform$1.invert3x3(this._matrix, invMat);
            inverse.setMatrix(invMat);
            invTrn = invMat.mulPoint(this._translate).negative();
        }
        inverse.setTranslate(invTrn);

        return inverse;
    }

    /**
     * Fill in the entries of mm whenever one of the components
     * m, mTranslate, or mScale changes.
     * @private
     */
    _updateMatrix() {
        if (this._isIdentity) {
            this.__matrix = Matrix$1.IDENTITY;
        }
        else {
            var mm = this.__matrix;
            var m = this._matrix;

            if (this._isRSMatrix) {
                var s0 = this._scale[0],
                    s1 = this._scale[1],
                    s2 = this._scale[2];

                mm.setItem(0, 0, m.item(0, 0) * s0);
                mm.setItem(0, 1, m.item(0, 1) * s1);
                mm.setItem(0, 2, m.item(0, 2) * s2);
                mm.setItem(1, 0, m.item(1, 0) * s0);
                mm.setItem(1, 1, m.item(1, 1) * s1);
                mm.setItem(1, 2, m.item(1, 2) * s2);
                mm.setItem(2, 0, m.item(2, 0) * s0);
                mm.setItem(2, 1, m.item(2, 1) * s1);
                mm.setItem(2, 2, m.item(2, 2) * s2);
            }
            else {
                mm.setItem(0, 0, m.item(0, 0));
                mm.setItem(0, 1, m.item(0, 1));
                mm.setItem(0, 2, m.item(0, 2));
                mm.setItem(1, 0, m.item(1, 0));
                mm.setItem(1, 1, m.item(1, 1));
                mm.setItem(1, 2, m.item(1, 2));
                mm.setItem(2, 0, m.item(2, 0));
                mm.setItem(2, 1, m.item(2, 1));
                mm.setItem(2, 2, m.item(2, 2));
            }

            mm.setItem(0, 3, this._translate[0]);
            mm.setItem(1, 3, this._translate[1]);
            mm.setItem(2, 3, this._translate[2]);

            // The last row of mm is always (0,0,0,1) for an affine
            // transformation, so it is set once in the constructor.  It is not
            // necessary to reset it here.
        }

        this._inverseNeedsUpdate = true;
    }

    /**
     * Invert the 3x3 upper-left block of the input matrix.
     * @param mat {Matrix}
     * @param invMat {Matrix}
     * @private
     */
    static invert3x3(mat, invMat) {
        // Compute the adjoint of M (3x3).
        invMat.setItem(0, 0, mat.item(1, 1) * mat.item(2, 2) - mat.item(1, 2) * mat.item(2, 1));
        invMat.setItem(0, 1, mat.item(0, 2) * mat.item(2, 1) - mat.item(0, 1) * mat.item(2, 2));
        invMat.setItem(0, 2, mat.item(0, 1) * mat.item(1, 2) - mat.item(0, 2) * mat.item(1, 1));
        invMat.setItem(1, 0, mat.item(1, 2) * mat.item(2, 0) - mat.item(1, 0) * mat.item(2, 2));
        invMat.setItem(1, 1, mat.item(0, 0) * mat.item(2, 2) - mat.item(0, 2) * mat.item(2, 0));
        invMat.setItem(1, 2, mat.item(0, 2) * mat.item(1, 0) - mat.item(0, 0) * mat.item(1, 2));
        invMat.setItem(2, 0, mat.item(1, 0) * mat.item(2, 1) - mat.item(1, 1) * mat.item(2, 0));
        invMat.setItem(2, 1, mat.item(0, 1) * mat.item(2, 0) - mat.item(0, 0) * mat.item(2, 1));
        invMat.setItem(2, 2, mat.item(0, 0) * mat.item(1, 1) - mat.item(0, 1) * mat.item(1, 0));

        // Compute the reciprocal of the determinant of M.
        var invDet = 1 / (
                mat.item(0, 0) * invMat.item(0, 0) +
                mat.item(0, 1) * invMat.item(1, 0) +
                mat.item(0, 2) * invMat.item(2, 0)
            );

        // inverse(M) = adjoint(M)/determinant(M).
        invMat.setItem(0, 0, invMat.item(0, 0) * invDet);
        invMat.setItem(0, 1, invMat.item(0, 1) * invDet);
        invMat.setItem(0, 2, invMat.item(0, 2) * invDet);
        invMat.setItem(1, 0, invMat.item(1, 0) * invDet);
        invMat.setItem(1, 1, invMat.item(1, 1) * invDet);
        invMat.setItem(1, 2, invMat.item(1, 2) * invDet);
        invMat.setItem(2, 0, invMat.item(2, 0) * invDet);
        invMat.setItem(2, 1, invMat.item(2, 1) * invDet);
        invMat.setItem(2, 2, invMat.item(2, 2) * invDet);
    }

    static get IDENTITY() {
        return new Transform$1().makeIdentity();
    }
}

class Bound$1 {
    constructor() {
        this.center = Point$1.ORIGIN;
        this.radius = 0;
    }
    /**
     * 复制
     * @param {Bound} bound
     * @returns {Bound}
     */
    copy(bound) {
        this.center.copy(bound.center);
        this.radius = bound.radius;
        return this;
    }
    /**
     * @param {Plane} plane
     */
    whichSide(plane) {
        let signedDistance = plane.distanceTo(this.center);
        if (signedDistance <= -this.radius) return -1;
        if (signedDistance >= this.radius) return +1;
        return 0;
    }
    /**
     * @param {Bound} bound
     */
    growToContain(bound) {
        if (bound.radius === 0) {
            // The incoming bound is invalid and cannot affect growth.
            return;
        }

        if (this.radius === 0) {
            // The current bound is invalid, so just assign the incoming bound.
            this.copy(bound);
            return;
        }

        let centerDiff = bound.center.subAsVector(this.center);
        let lengthSqr = centerDiff.squaredLength();
        let radiusDiff = bound.radius - this.radius;
        let radiusDiffSqr = radiusDiff * radiusDiff;

        if (radiusDiffSqr >= lengthSqr) {
            if (radiusDiff >= 0) {
                this.center = bound.center;
                this.radius = bound.radius;
            }
            return;
        }

        let length = _Math.sqrt(lengthSqr);
        if (length > _Math.ZERO_TOLERANCE) {
            let coeff = (length + radiusDiff) / (2 * length);
            this.center = this.center.add(centerDiff.scalar(coeff));
        }
        this.radius = 0.5 * (length + this.radius + bound.radius);
    }

    /**
     * @param {Transform} transform
     * @param {Bound} bound
     */
    transformBy(transform, bound) {
        bound.center = transform.mulPoint(this.center);
        bound.radius = transform.getNorm() * this.radius;
    }

    /**
     * 计算物体的球形包围盒
     *
     * @param {number} numElements 顶点数量
     * @param {number} stride 坐标偏移
     * @param {ArrayBuffer} data 顶点数据
     */
    computeFromData(numElements, stride, data) {

        let pos = new Float32Array(3);
        let t = 0, cx, cy, cz;
        let i, radiusSqr, dv = new DataView(data);

        // 包围盒的中心是所有坐标的平均值
        for (i = 0; i < numElements; ++i) {
            t = i * stride;
            pos[0] += dv.getFloat32(t, true);
            pos[1] += dv.getFloat32(t + 4, true);
            pos[2] += dv.getFloat32(t + 8, true);
        }
        t = 1 / numElements;
        cx = pos[0] * t;
        cy = pos[1] * t;
        cz = pos[2] * t;
        this.center.assign(cx, cy, cz);

        // 半径是到中心点距离最大的物体坐标
        this.radius = 0;
        for (i = 0; i < numElements; ++i) {
            t = i * stride;
            pos[0] = dv.getFloat32(t, true) - cx;
            pos[1] = dv.getFloat32(t + 4, true) - cy;
            pos[2] = dv.getFloat32(t + 8, true) - cz;

            radiusSqr = pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2];
            if (radiusSqr > this.radius) {
                this.radius = radiusSqr;
            }
        }

        this.radius = _Math.sqrt(this.radius);
    }

    /**
     * Test for intersection of linear component and bound (points of
     * intersection not computed).   
     * > The linear component is parameterized by
     *  `P + t*D`
     * -  P is a point on the component (the origin)
     * -  D is a unit-length direction vector
     * 
     * > The interval `[tmin,tmax]` is
     *   - line      tmin = -MAX_REAL, tmax = MAX_REAL
     *   - ray:      tmin = 0.0, tmax = MAX_REAL
     *   - segment:  tmin >= 0.0, tmax > tmin
     *
     * @param {Point} origin
     * @param {Vector} direction
     * @param {number} tmin
     * @param {number} tmax
     * @returns {boolean}
     */
    testIntersection(origin, direction, tmin, tmax) {
        // 无效的包围盒, 不能计算相交
        if (this.radius === 0) {
            return false;
        }

        let diff;
        let a0, a1, discr;

        if (tmin === -_Math.MAX_REAL) {
            console.assert(tmax === _Math.MAX_REAL, 'tmax must be infinity for a line.');

            // Test for sphere-line intersection.
            diff = origin.sub(this.center);
            a0 = diff.dot(diff) - this.radius * this.radius;
            a1 = direction.dot(diff);
            discr = a1 * a1 - a0;
            return discr >= 0;
        }

        if (tmax === _Math.MAX_REAL) {
            console.assert(tmin === 0, 'tmin must be zero for a ray.');

            // Test for sphere-ray intersection.
            diff = origin.sub(this.center);
            a0 = diff.dot(diff) - this.radius * this.radius;
            if (a0 <= 0) {
                // The ray origin is inside the sphere.
                return true;
            }
            // else: The ray origin is outside the sphere.

            a1 = direction.dot(diff);
            if (a1 >= 0) {
                // The ray forms an acute angle with diff, and so the ray is
                // directed from the sphere.  Thus, the ray origin is outside
                // the sphere, and points P+t*D for t >= 0 are even farther
                // away from the sphere.
                return false;
            }

            discr = a1 * a1 - a0;
            return discr >= 0;
        }

        console.assert(tmax > tmin, 'tmin < tmax is required for a segment.');

        // Test for sphere-segment intersection.
        let segExtent = 0.5 * (tmin + tmax);
        let segOrigin = origin.add(segExtent * direction);

        diff = segOrigin.sub(this.center);
        a0 = diff.dot(diff) - this.radius * this.radius;
        a1 = direction.dot(diff);
        discr = a1 * a1 - a0;
        if (discr < 0) {
            return false;
        }

        let tmp0 = segExtent * segExtent + a0;
        let tmp1 = 2 * a1 * segExtent;
        let qm = tmp0 - tmp1;
        let qp = tmp0 + tmp1;
        if (qm * qp <= 0) {
            return true;
        }
        return qm > 0 && _Math.abs(a1) < segExtent;
    }
    /**
     * Test for intersection of the two stationary bounds.
     * @param {Bound} bound
     * @returns {boolean}
     */
    testIntersection1(bound) {
        // 无效的包围盒, 不能计算相交
        if (bound.radius === 0 || this.radius === 0) {
            return false;
        }

        // Test for staticSphere-staticSphere intersection.
        let diff = this.center.subAsVector(bound.center);
        let rSum = this.radius + bound.radius;
        return diff.squaredLength() <= rSum * rSum;
    }

    /**
     * Test for intersection of the two moving bounds.
     * - Velocity0 is that of the calling Bound
     * - velocity1 is that of the input bound.
     *
     * @param {Bound} bound
     * @param {number} tmax
     * @param {Vector} velocity0
     * @param {Vector} velocity1
     * @returns {boolean}
     */
    testIntersection2(bound, tmax, velocity0, velocity1) {
        // 无效的包围盒, 不能计算相交
        if (bound.radius === 0 || this.radius === 0) {
            return false;
        }

        // Test for movingSphere-movingSphere intersection.
        let relVelocity = velocity1.sub(velocity0);
        let cenDiff = bound.center.subAsVector(this.center);
        let a = relVelocity.squaredLength();
        let c = cenDiff.squaredLength();
        let rSum = bound.radius + this.radius;
        let rSumSqr = rSum * rSum;

        if (a > 0) {
            let b = cenDiff.dot(relVelocity);
            if (b <= 0) {
                if (-tmax * a <= b) {
                    return a * c - b * b <= a * rSumSqr;
                }
                else {
                    return tmax * (tmax * a + 2 * b) + c <= rSumSqr;
                }
            }
        }

        return c <= rSumSqr;
    }
}

/**
 * Spatial - 场景空间
 */
class Spatial$1 extends ControlledObject {
    constructor() {
        super();
        /**
         * @type {Transform}
         */
        this.localTransform = Transform$1.IDENTITY;

        /**
         * @type {Transform}
         */
        this.worldTransform = Transform$1.IDENTITY;

        // 在一些情况下直接更新worldTransform而跳过Spatial.update()
        // 在这种情况下必须将this.worldTransformIsCurrent设置为true
        this.worldTransformIsCurrent = false;

        /**
         * @type {Bound}
         */
        this.worldBound = new Bound$1();
        // 在一些情况下直接更新worldBound而跳过Spatial.update()
        // 在这种情况下必须将this.worldBoundIsCurrent设置为true
        this.worldBoundIsCurrent = false;

        this.culling = Spatial$1.CULLING_DYNAMIC;

        /**
         * @type {Spatial}
         */
        this.parent = null;
    }
    /**
     * 在向下遍历场景树或向上遍历世界包围盒时，计算世界变换，
     *
     * 更新几何体的状态和控制器
     *
     * @param applicationTime {number}
     * @param initiator {boolean}
     */
    update(applicationTime, initiator) {
        applicationTime = applicationTime || -_Math.MAX_REAL;
        this.updateWorldData(applicationTime);
        this.updateWorldBound();

        if (initiator === undefined || initiator === true) {
            this.propagateBoundToRoot();
        }
    }
    /**
     *
     * @param applicationTime {number}
     */
    updateWorldData(applicationTime) {
        // 更新当前空间的所有控制器
        this.updateControllers(applicationTime);

        // 更新世界变换
        if (!this.worldTransformIsCurrent) {
            if (this.parent) {
                this.worldTransform = this.parent.worldTransform.mul(this.localTransform);
            }
            else {
                this.worldTransform = this.localTransform;
            }
        }
    }

    propagateBoundToRoot() {
        if (this.parent) {
            this.parent.updateWorldBound();
            this.parent.propagateBoundToRoot();
        }
    }

    /**
     * 裁剪支持
     * @param {Culler} culler
     * @param {boolean} noCull
     */
    onGetVisibleSet(culler, noCull) {
        if (this.culling === Spatial$1.CULLING_ALWAYS) {
            return;
        }

        if (this.culling == Spatial$1.CULLING_NEVER) {
            noCull = true;
        }

        var savePlaneState = culler.planeState;
        if (noCull || culler.isVisible(this.worldBound)) {
            this.getVisibleSet(culler, noCull);
        }
        culler.planeState = savePlaneState;
    }

    // 子类实现， 用于更新世界包围盒
    updateWorldBound() {
    }

    load(inStream) {
        super.load(inStream);
        this.localTransform = inStream.readTransform();
        this.worldTransform = inStream.readTransform();
        this.worldTransformIsCurrent = inStream.readBool();
        this.worldBound = inStream.readBound();
        this.worldBoundIsCurrent = inStream.readBool();
        this.culling = inStream.readEnum();
    }
}

DECLARE_ENUM(Spatial$1, {
    CULLING_DYNAMIC: 0, // 通过比较世界包围盒裁剪平面确定可见状态
    CULLING_ALWAYS: 1, // 强制裁剪对象, 如果节点被裁剪，那么它的整个子树也被裁剪
    CULLING_NEVER: 2  // 不裁剪对象， 如果一个节点是不裁剪对象，那么它的整个子树也不被裁剪。
});

/**
 * @author lonphy
 * @version 2.0
 */
class Node extends Spatial$1{
    constructor() {
        super();
        this.childs = [];
    }

    /**
     * 获取子节点数量
     * @returns {number}
     */
    getChildsNumber() {
        return this.childs.length;
    }

    /**
     * 加载子节点.
     * 如果执行成功，则返回子节点存储的索引i, 0 <= i < getNumChildren()
     * 数组中第一个空槽将被用来存储子节点. 如果所有的槽都不为空，则添加到数组末尾[js底层可能需要重新分配空间]
     *
     * 以下情况会失败,并返回-1
     * child === null or child.parent !== null
     *
     * @param child {Spatial}
     * @returns {number}
     */
    attachChild(child) {
        if (child === null) {
            console.assert(false, 'You cannot attach null children to a node.');
            return -1;
        }
        if (child.parent !== null) {
            console.assert(false, 'The child already has a parent.');
            return -1;
        }

        child.parent = this;

        var nodes = this.childs.slice(),
            max = nodes.length;
        for (var idx = 0; idx < max; ++idx) {
            if (nodes[idx] === null) {
                this.childs[idx] = child;
                return idx;
            }
        }
        this.childs[max] = child;
        return max;
    }

    /**
     * 从当前节点卸载子节点
     * 如果child不为null且在数组中， 则返回存储的索引， 否则返回-1
     * @param child {Spatial}
     * @returns {number}
     */
    detachChild(child) {
                if (child !== null) {
                    var nodes = this.childs.slice(),
                        max = nodes.length;
                    for (var idx = 0; idx < max; ++idx) {
                        if (nodes[idx] === child) {
                            this.childs[idx] = null;
                            child.parent = null;
                            return idx;
                        }
                    }
                }
                return -1;
            }

            /**
             * 从当前节点卸载子节点
             * 如果 0 <= index < getNumChildren(), 则返回存储在index位置的子节点，否则返回null
             *
             * @param index {number}
             * @returns {Spatial|null}
             */
            detachChildAt(index) {
                var child = null;
                if (index >= 0 && index < this.childs.length) {
                    child = this.childs[index];
                    if (child !== null) {
                        child.parent = null;
                this.childs[index] = null;
            }
        }
        return child;
    }

    /**
     * 在index位置放入child,并返回被替换的元素
     * @param index {number}
     * @param child {Spatial}
     * @returns {Spatial|null}
     */
    setChild(index, child) {
        if (child && child.parent !== null) return null;

        if (index >= 0 && index < this.childs.length) {
            var prev = this.childs[index];
            if (prev !== null) {
                prev.parent = null;
            }
            if (child) {
                child.parent = this;
            }
            this.childs[index] = child;
            return prev;
        }

        if (child) {
            child.parent = this;
        }
        this.childs.push(child);
        return null;
    }

    /**
     * 通过索引获取子节点
     * @param index {number}
     * @returns {Spatial|null}
     */
    getChild(index) {
        var child = null;
        if (index >= 0 && index < this.childs.length) {
            child = this.childs[index];
        }
        return child;
    }

    /**
     * @param applicationTime {number}
     */
    updateWorldData(applicationTime) {
        super.updateWorldData(applicationTime);
        var nodes = this.childs.slice(),
            max = nodes.length;
        for (var idx = 0; idx < max; ++idx) {
            if (nodes[idx]) {
                nodes[idx].update(applicationTime, false);
            }
        }
    }

    updateWorldBound() {
        if (!this.worldBoundIsCurrent) {
            // Start with an invalid bound.
            this.worldBound.center = Point$1.ORIGIN;
            this.worldBound.radius = 0;
            var nodes = this.childs.slice(),
                max = nodes.length;
            for (var idx = 0; idx < max; ++idx) {
                if (nodes[idx]) {
                    this.worldBound.growToContain(nodes[idx].worldBound);
                }
            }
        }
    }

    /**
     *
     * @param culler {Culler}
     * @param noCull {boolean}
     */
    getVisibleSet(culler, noCull) {
        var nodes = this.childs.slice(),
            max = nodes.length;
        for (var idx = 0; idx < max; ++idx) {
            if (nodes[idx]) {
                nodes[idx].onGetVisibleSet(culler, noCull);
            }
        }
    }
    /**
     * @param inStream {InStream}
     */
    load(inStream) {
        super.load(inStream);
        var numChildren = inStream.readUint32();
        if (numChildren > 0) {
            this.childs = inStream.readSizedPointerArray(numChildren);
        }
    }
    /**
     * @param inStream {InStream}
     */
    link(inStream) {
        super.link(inStream);
        this.childs.forEach(function (c, i) {
            this.childs[i] = inStream.resolveLink(c);
            this.setChild(i, this.childs[i]);
        }, this);
    }
}

D3Object.Register('L5.Node', Node.factory);

/**
 * CameraNode - 相机节点
 *
 * @param camera {L5.Camera}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
class VisibleSet {
    constructor() {
        this.numVisible = 0;
        this.visibles = [];
    }

    getNumVisible() {
        return this.numVisible;
    }

    getAllVisible() {
        return this.visibles;
    }

    getVisible(index) {
        console.assert(0 <= index && index < this.numVisible, 'Invalid index to getVisible');
        return this.visibles[index];
    }

    insert(visible) {
        var size = this.visibles.length;
        if (this.numVisible < size) {
            this.visibles[this.numVisible] = visible;
        }
        else {
            this.visibles.push(visible);
        }
        ++this.numVisible;
    }

    clear() {
        this.numVisible = 0;
    }
}

/**
 * Culler - 裁剪
 *
 * @version 2.0
 * @author lonphy
 */
class Culler {

    /**
     * @param {Camera} camera 
     */
    constructor(camera) {
        // The data members mFrustum, mPlane, and mPlaneState are
        // uninitialized.  They are initialized in the GetVisibleSet call.

        // The input camera has information that might be needed during the
        // culling pass over the scene.
        this._camera = camera || null;

        /**
         * The potentially visible set for a call to GetVisibleSet.
         * @type {VisibleSet}
         * @private
         */
        this._visibleSet = new VisibleSet();

        // The world culling planes corresponding to the view frustum plus any
        // additional user-defined culling planes.  The member m_uiPlaneState
        // represents bit flags to store whether or not a plane is active in the
        // culling system.  A bit of 1 means the plane is active, otherwise the
        // plane is inactive.  An active plane is compared to bounding volumes,
        // whereas an inactive plane is not.  This supports an efficient culling
        // of a hierarchy.  For example, if a node's bounding volume is inside
        // the left plane of the view frustum, then the left plane is set to
        // inactive because the children of the node are automatically all inside
        // the left plane.
        this._planeQuantity = 6;
        this._plane = new Array(Culler.MAX_PLANE_QUANTITY);
        for (var i = 0, l = this._plane.length; i < l; ++i) {
            this._plane[i] = new Plane$1(Vector$1.ZERO, 0);
        }
        this._planeState = 0;

        // 传入摄像机的视截体副本
        // 主要用于在裁剪时供各种子系统修改视截体参数, 而不影响摄像机
        // 这些内部状态在渲染器中需要
        this._frustum = new Array(Camera.VF_QUANTITY);
    }

    get camera() {
        return this._camera;
    }

    set camera(camera) {
        this._camera = camera;
    }

    set frustum(frustum) {
        if (!this._camera) {
            console.assert(false, 'set frustum requires the existence of a camera');
            return;
        }

        const VF_NEAR = Camera.VF_NEAR,
            VF_FAR = Camera.VF_FAR,
            VF_BOTTOM = Camera.VF_BOTTOM,
            VF_TOP = Camera.VF_TOP,
            VF_LEFT = Camera.VF_LEFT,
            VF_RIGHT = Camera.VF_RIGHT;

        let near, far, bottom, top, left, right;

        // 赋值到当前实例.
        this._frustum[VF_NEAR] = near = frustum[VF_NEAR];
        this._frustum[VF_FAR] = far = frustum[VF_FAR];
        this._frustum[VF_BOTTOM] = bottom = frustum[VF_BOTTOM];
        this._frustum[VF_TOP] = top = frustum[VF_TOP];
        this._frustum[VF_LEFT] = left = frustum[VF_LEFT];
        this._frustum[VF_RIGHT] = right = frustum[VF_RIGHT];

        var near2 = near * near;
        var bottom2 = bottom * bottom;
        var top2 = top * top;
        var left2 = left * left;
        var right2 = right * right;

        // 获取相机坐标结构
        var position = this._camera.position;
        var directionVec = this._camera.direction;
        var upVec = this._camera.up;
        var rightVec = this._camera.right;
        var dirDotEye = position.dot(directionVec);

        // 更新近平面
        this._plane[VF_NEAR].normal = directionVec;
        this._plane[VF_NEAR].constant = dirDotEye + near;

        // 更新远平面
        this._plane[VF_FAR].normal = directionVec.negative();
        this._plane[VF_FAR].constant = -(dirDotEye + far);

        // 更新下平面
        var invLength = _Math.invSqrt(near2 + bottom2);
        var c0 = bottom * -invLength;
        var c1 = near * invLength;
        var normal = directionVec.scalar(c0).add(upVec.scalar(c1));
        var constant = position.dot(normal);
        this._plane[VF_BOTTOM].normal = normal;
        this._plane[VF_BOTTOM].constant = constant;

        // 更新上平面
        invLength = _Math.invSqrt(near2 + top2);
        c0 = top * invLength;
        c1 = near * -invLength;
        normal = directionVec.scalar(c0).add(upVec.scalar(c1));
        constant = position.dot(normal);
        this._plane[VF_TOP].normal = normal;
        this._plane[VF_TOP].constant = constant;

        // 更新左平面
        invLength = _Math.invSqrt(near2 + left2);
        c0 = left * -invLength;
        c1 = near * invLength;
        normal = directionVec.scalar(c0).add(rightVec.scalar(c1));
        constant = position.dot(normal);
        this._plane[VF_LEFT].normal = normal;
        this._plane[VF_LEFT].constant = constant;

        // 更新右平面
        invLength = _Math.invSqrt(near2 + right2);
        c0 = right * invLength;
        c1 = near * -invLength;
        normal = directionVec.scalar(c0).add(rightVec.scalar(c1));
        constant = position.dot(normal);
        this._plane[VF_RIGHT].normal = normal;
        this._plane[VF_RIGHT].constant = constant;

        // 所有的平面已经初始化
        this._planeState = 0xFFFFFFFF;
    }

    get frustum() {
        return this._frustum;
    }

    get visibleSet() {
        return this._visibleSet;
    }

    get planeState() {
        return this._planeState;
    }

    set planeState(val) {
        this._planeState = val;
    }

    get planes() {
        return this._plane;
    }

    get planeQuantity() {
        return this._planeQuantity;
    }

    pushPlan(plane) {
        if (this._planeQuantity < Culler.MAX_PLANE_QUANTITY) {
            // The number of user-defined planes is limited.
            this._plane[this._planeQuantity] = plane;
            ++this._planeQuantity;
        }
    }

    popPlane() {
        if (this._planeQuantity > Camera.VF_QUANTITY) {
            // Frustum planes may not be removed from the stack.
            --this._planeQuantity;
        }
    }

    /**
     * The base class behavior is to append the visible object to the end of
     * the visible set (stored as an array).  Derived classes may override
     * this behavior; for example, the array might be maintained as a sorted
     * array for minimizing render state changes or it might be/ maintained
     * as a unique list of objects for a portal system.
     * @param visible {Spatial}
     */
    insert(visible) {
        this._visibleSet.insert(visible);
    }

    /**
     * Compare the object's world bound against the culling planes.
     * Only Spatial calls this function.
     *
     * @param bound {Bound}
     * @returns {boolean}
     */
    isVisible(bound) {
        if (bound.radius === 0) {
            // 该节点是虚拟节点，不可见
            return false;
        }

        // Start with the last pushed plane, which is potentially the most
        // restrictive plane.
        var index = this._planeQuantity - 1;
        var mask = (1 << index);

        for (var i = 0; i < this._planeQuantity; ++i, --index, mask >>= 1) {
            if (this._planeState & mask) {
                var side = bound.whichSide(this._plane[index]);

                if (side < 0) {
                    // 对象在平面的反面, 剔除掉
                    return false;
                }

                if (side > 0) {
                    // 对象在平面的正面
                    // There is no need to compare subobjects against this plane
                    // so mark it as inactive.
                    this._planeState &= ~mask;
                }
            }
        }

        return true;
    }

    /**
     * Support for Portal.getVisibleSet.
     * @param numVertices {number}
     * @param vertices {Array<Point>}
     * @param ignoreNearPlane {boolean}
     */
    isVisible1(numVertices, vertices, ignoreNearPlane) {
        // The Boolean variable ignoreNearPlane should be set to 'true' when
        // the test polygon is a portal.  This avoids the situation when the
        // portal is in the view pyramid (eye+left/right/top/bottom), but is
        // between the eye and near plane.  In such a situation you do not want
        // the portal system to cull the portal.  This situation typically occurs
        // when the camera moves through the portal from current region to
        // adjacent region.

        // Start with the last pushed plane, which is potentially the most
        // restrictive plane.
        var index = this._planeQuantity - 1;
        for (var i = 0; i < this._planeQuantity; ++i, --index) {
            var plane = this._plane[index];
            if (ignoreNearPlane && index == Camera.VF_NEAR) {
                continue;
            }

            var j;
            for (j = 0; j < numVertices; ++j) {
                var side = plane.whichSide(vertices[j]);
                if (side >= 0) {
                    // The polygon is not totally outside this plane.
                    break;
                }
            }

            if (j == numVertices) {
                // The polygon is totally outside this plane.
                return false;
            }
        }

        return true;
    }


    // Support for BspNode::GetVisibleSet.  Determine whether the view frustum
    // is fully on one side of a plane.  The "positive side" of the plane is
    // the half space to which the plane normal points.  The "negative side"
    // is the other half space.  The function returns +1 if the view frustum
    // is fully on the positive side of the plane, -1 if the view frustum is
    // fully on the negative side of the plane, or 0 if the view frustum
    // straddles the plane.  The input plane is in world coordinates and the
    // world camera coordinate system is used for the test.
    /**
     * @param plane {Plane}
     * @returns {number}
     */
    whichSide(plane) {
        // The plane is N*(X-C) = 0 where the * indicates dot product.  The signed
        // distance from the camera location E to the plane is N*(E-C).
        var NdEmC = plane.distanceTo(this._camera.position);

        var normal = plane.normal;
        var NdD = normal.dot(this._camera.direction);
        var NdU = normal.dot(this._camera.up);
        var NdR = normal.dot(this._camera.right);
        var FdN = this._frustum[Camera.VF_FAR] / this._frustum[Camera.VF_NEAR];

        var positive = 0, negative = 0, sgnDist;

        // Check near-plane vertices.
        var PDMin = this._frustum[Camera.VF_NEAR] * NdD;
        var NUMin = this._frustum[Camera.VF_BOTTOM] * NdU;
        var NUMax = this._frustum[Camera.VF_TOP] * NdU;
        var NRMin = this._frustum[Camera.VF_LEFT] * NdR;
        var NRMax = this._frustum[Camera.VF_RIGHT] * NdR;

        // V = E + dmin*D + umin*U + rmin*R
        // N*(V-C) = N*(E-C) + dmin*(N*D) + umin*(N*U) + rmin*(N*R)
        sgnDist = NdEmC + PDMin + NUMin + NRMin;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmin*D + umin*U + rmax*R
        // N*(V-C) = N*(E-C) + dmin*(N*D) + umin*(N*U) + rmax*(N*R)
        sgnDist = NdEmC + PDMin + NUMin + NRMax;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmin*D + umax*U + rmin*R
        // N*(V-C) = N*(E-C) + dmin*(N*D) + umax*(N*U) + rmin*(N*R)
        sgnDist = NdEmC + PDMin + NUMax + NRMin;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmin*D + umax*U + rmax*R
        // N*(V-C) = N*(E-C) + dmin*(N*D) + umax*(N*U) + rmax*(N*R)
        sgnDist = NdEmC + PDMin + NUMax + NRMax;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // check far-plane vertices (s = dmax/dmin)
        var PDMax = this._frustum[Camera.VF_FAR] * NdD;
        var FUMin = FdN * NUMin;
        var FUMax = FdN * NUMax;
        var FRMin = FdN * NRMin;
        var FRMax = FdN * NRMax;

        // V = E + dmax*D + umin*U + rmin*R
        // N*(V-C) = N*(E-C) + dmax*(N*D) + s*umin*(N*U) + s*rmin*(N*R)
        sgnDist = NdEmC + PDMax + FUMin + FRMin;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmax*D + umin*U + rmax*R
        // N*(V-C) = N*(E-C) + dmax*(N*D) + s*umin*(N*U) + s*rmax*(N*R)
        sgnDist = NdEmC + PDMax + FUMin + FRMax;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmax*D + umax*U + rmin*R
        // N*(V-C) = N*(E-C) + dmax*(N*D) + s*umax*(N*U) + s*rmin*(N*R)
        sgnDist = NdEmC + PDMax + FUMax + FRMin;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmax*D + umax*U + rmax*R
        // N*(V-C) = N*(E-C) + dmax*(N*D) + s*umax*(N*U) + s*rmax*(N*R)
        sgnDist = NdEmC + PDMax + FUMax + FRMax;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        if (positive > 0) {
            if (negative > 0) {
                // Frustum straddles the plane.
                return 0;
            }

            // Frustum is fully on the positive side.
            return +1;
        }

        // Frustum is fully on the negative side.
        return -1;
    }

    /**
     * 计算裁剪后的可见物体
     * @param scene {Spatial}
     */
    computeVisibleSet(scene) {
        if (this._camera && scene) {
            this.frustum = this.camera.frustum;
            this._visibleSet.clear();
            scene.onGetVisibleSet(this, false);
            return;
        }
        console.assert(false, 'A camera and a scene are required for culling');
    }

}

DECLARE_ENUM(Culler, {
    MAX_PLANE_QUANTITY: 32
});

/**
 * 灯光 - Light
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {Light}
 * @extends {D3Object}
 */
class Light$1 extends D3Object {

    /**
     * @param type {number} 灯光类型
     */
    constructor(type) {
        super();
        this.type = type;

        // 灯光颜色属性
        this.ambient = new Float32Array([0, 0, 0, 1]);
        this.diffuse = new Float32Array([0, 0, 0, 1]);
        this.specular = new Float32Array([0, 0, 0, 1]);

        // 衰减系数
        //     m = 1/(C + L*d + Q*d*d)
        // C : 常量系数
        // L : 线性系数
        // Q : 2次系数
        // d : 从光源位置到顶点的距离
        // 使用线性衰减光强,可用:m = I/(C + L*d + Q*d*d)替代, I是强度系数
        this.constant = 1.0;
        this.linear = 0.0;
        this.quadratic = 0.0;
        this.intensity = 1.0;

        // 聚光灯参数
        // 椎体夹角为弧度制, 范围为: 0 < angle <= Math.PI.
        this.angle = _Math.PI;
        this.cosAngle = -1.0;
        this.sinAngle = 0.0;
        this.exponent = 1.0;

        this.position = Point$1.ORIGIN;
        this.direction = Vector$1.UNIT_Z.negative();
        this.up = Vector$1.UNIT_Y;
        this.right = Vector$1.UNIT_X;
    }

    /**
     * 设置光源[聚光灯]角度
     * @param angle {number} 弧度有效值 0< angle <= PI
     */
    setAngle(angle) {
        console.assert(0 < angle && angle <= _Math.PI, 'Angle out of range in SetAngle');
        this.angle = angle;
        this.cosAngle = _Math.cos(angle);
        this.sinAngle = _Math.sin(angle);
    }

    /**
     * 设置光源方向
     * @param dir{Vector} 方向向量
     */
    setDirection(dir) {
        dir.normalize();
        this.direction.copy(dir);
        Vector$1.generateComplementBasis(this.up, this.right, this.direction);
    }

    /**
     * 设置光源位置
     *
     * 只对点光源以及聚光灯有效
     * @param pos {Point} 位置
     */
    setPosition(pos) {
        this.position.copy(pos);
    }

    load(inStream) {
        super.load(inStream);
        this.type = inStream.readEnum();
        this.ambient.set(inStream.readFloat32Range(4));
        this.diffuse.set(inStream.readFloat32Range(4));
        this.specular.set(inStream.readFloat32Range(4));
        this.constant = inStream.readFloat32();
        this.linear = inStream.readFloat32();
        this.quadratic = inStream.readFloat32();
        this.intensity = inStream.readFloat32();
        this.angle = inStream.readFloat32();
        this.cosAngle = inStream.readFloat32();
        this.sinAngle = inStream.readFloat32();
        this.exponent = inStream.readFloat32();
        this.position = inStream.readPoint();
        this.direction.copy(inStream.readFloat32Range(4));
        this.up.copy(inStream.readFloat32Range(4));
        this.right.copy(inStream.readFloat32Range(4));
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeEnum(this.type);
        outStream.writeFloat32Array(4, this.ambient);
        outStream.writeFloat32Array(4, this.diffuse);
        outStream.writeFloat32Array(4, this.specular);
        outStream.writeFloat32(this.constant);
        outStream.writeFloat32(this.linear);
        outStream.writeFloat32(this.quadratic);
        outStream.writeFloat32(this.intensity);
        outStream.writeFloat32(this.angle);
        outStream.writeFloat32(this.cosAngle);
        outStream.writeFloat32(this.sinAngle);
        outStream.writeFloat32(this.exponent);
        outStream.writeFloat32Array(4, this.position);
        outStream.writeFloat32Array(4, this.direction);
        outStream.writeFloat32Array(4, this.up);
        outStream.writeFloat32Array(4, this.right);
    }

    /**
     * 文件解析工厂方法
     * @param inStream {InStream}
     * @returns {Light}
     */
    static factory(inStream) {
        var l = new Light$1(Light$1.LT_INVALID);
        l.load(inStream);
        return l;
    }
}

DECLARE_ENUM(Light$1, {
    LT_AMBIENT:     0,  // 环境光
    LT_DIRECTIONAL: 1, // 方向光
    LT_POINT:       2, // 点光源
    LT_SPOT:        3, // 聚光等
    LT_INVALID:     4 // 无效光源
});

D3Object.Register('Light', Light$1.factory);

/**
 * 光源节点
 *
 * 该节点的worldTransform(世界变换)平移,使用光源position(位置)
 * 该节点的worldTransform(世界变换)旋转,使用光源的坐标系(up, right, direction)
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {L5.LightNode}
 * @extends {L5.Node}
 */

class Material$1 extends D3Object {

    constructor(opts={}) {
        super();
        opts = Material$1.parseOption(opts);

        let val = opts.emissive;
        this.emissive = new Float32Array([val[0], val[1], val[2], 1]);
        val = opts.ambient;
        this.ambient = new Float32Array([val[0], val[1], val[2], 1]);

        val = opts.diffuse;
        // 材质透明度在反射颜色的alpha通道
        this.diffuse = new Float32Array([val[0], val[1], val[2], opts.alpha]);

        val = opts.specular;
        // 镜面高光指数存储在alpha通道
        this.specular = new Float32Array([val[0], val[1], val[2], opts.exponent]);
    }

    static get defaultOptions() {
        return {
            alpha: 1,
            exponent: 32,
            ambient: new Float32Array([0,0,0]),
            emissive: new Float32Array([0,0,0]),
            diffuse: new Float32Array([0,0,0]),
            specular: new Float32Array([0,0,0])
        };
    }

    static parseOption(opts) {
        let defOption = Material$1.defaultOptions;
        if (opts.alpha && opts.alpha >= 0 && opts.alpha <= 1) {
            defOption.alpha = opts.alpha;
        }
        if (opts.exponent) {
            defOption.exponent = opts.exponent;
        }
        if (opts.ambient) {
            defOption.ambient.set(opts.ambient);
        }
        if (opts.emissive) {
            defOption.emissive.set(opts.emissive);
        }
        if (opts.diffuse) {
            defOption.diffuse.set(opts.diffuse);
        }
        if (opts.specular) {
            defOption.specular.set(opts.specular);
        }
        return defOption;
    }


    static factory(inStream) {
        var obj = new Material$1();
        obj.emissive[3] = 0;
        obj.ambient[3] = 0;
        obj.diffuse[3] = 0;
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('L5.Material', Material$1.factory);

/**
 * Buffer 缓冲基类
 *
 * @author lonphy
 * @version 1.0
 *
 * @type {Buffer}
 * @extends {D3Object}
 */
class Buffer$1 extends D3Object {

    /**
     * @param numElements {number} 元素数量
     * @param elementSize {number} 一个元素的尺寸，单位比特
     * @param usage {number} 缓冲用途， 参照L5.BU_XXX
     */
    constructor(numElements, elementSize, usage) {
        super();
        this.numElements = numElements;
        this.elementSize = elementSize;
        this.usage = usage;
        this.numBytes = numElements * elementSize;
        if (this.numBytes > 0) {
            this._data = new Uint8Array(this.numBytes);
        }
    }

    /**
     * @returns {Uint8Array|null}
     */
    getData() {
        return this._data;
    }

    /**
     * @param inStream {InStream}
     */
    load(inStream) {
        super.load(inStream);
        this.numElements = inStream.readUint32();
        this.elementSize = inStream.readUint32();
        this.usage = inStream.readEnum();
        this._data = new Uint8Array(inStream.readBinary(this.numBytes));
        this.numBytes = this._data.length;
    }
}

/////////////////////// 缓冲用途定义 ///////////////////////////
DECLARE_ENUM(Buffer$1, {
    BU_STATIC:        0,
    BU_DYNAMIC:       1,
    BU_RENDER_TARGET: 2,
    BU_DEPTH_STENCIL: 3
});

/**
 * IndexBuffer 索引缓冲
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {IndexBuffer}
 * @extends {Buffer}
 */
class IndexBuffer$1 extends Buffer$1 {

    /**
     * @param numElements {number}
     * @param elementSize {number}
     * @param usage {number} 缓冲用途， 参照L5.BU_XXX
     */
    constructor(numElements = 0, elementSize = 0, usage = Buffer$1.BU_STATIC) {
        super(numElements, elementSize, usage);
        this.offset = 0;
    }

    /**
     * @param inStream {InStream}
     */
    load(inStream) {
        super.load(inStream);
        this.offset = inStream.readUint32();
    }
}
D3Object.Register('L5.IndexBuffer', IndexBuffer$1.factory);

/**
 * VertexBuffer 顶点缓冲
 *
 * @author lonphy
 * @version 1.0
 *
 * @type VertexBuffer
 * @extends {Buffer}
 */
class VertexBuffer extends Buffer$1 {

    /**
     * @param numElements
     * @param elementSize
     * @param usage {number} 缓冲用途， 参照Buffer.BU_XXX
     */
    constructor(numElements, elementSize, usage = Buffer$1.BU_STATIC) {
        super(numElements, elementSize, usage);
    }

    /**
     * 文件解析工厂方法
     * @param inStream {InStream}
     * @returns {VertexBuffer}
     */
    static factory(inStream) {
        var obj = new VertexBuffer(0, 0);
        obj.load(inStream);
        return obj;
    }
}
D3Object.Register('L5.VertexBuffer', VertexBuffer.factory);

/**
 * 渲染对象
 *
 * @param numTargets {number}
 * @param format {number}
 * @param width {number}
 * @param height {number}
 * @param hasMipmaps {boolean}
 * @param hasDepthStencil {boolean}
 * @type {RenderTarget}
 */
class Texture extends D3Object {

    /**
     * @param {number} format 纹理格式， 参考Texture.TF_XXX
     * @param {number} type 纹理类型, 参考Texture.TT_XXX
     */
    constructor(format, type) {
        super();
        this.format = format;                          // 纹理元素格式
        this.type = type;                              // 纹理类型， 例如 2d, 3d...
        this.hasMipmaps = false;                       // 是否生成MipMaps
        this.numDimensions = Texture.DIMENSIONS[type]; // 纹理拥有的维度
        this.numTotalBytes = 0;
        this.width = 0;
        this.height = 0;
        this.depth = 0;
        this.data = null;
    }

    /**
     * 判断是否是压缩格式
     * @returns {boolean}
     */
    isCompressed() {
        return this.format === Texture.TF_DXT1 || this.format === Texture.TF_DXT3 || this.format === Texture.TF_DXT5;
    }

    /**
     * 判断是否可以生成MipMaps纹理
     * @returns {boolean}
     */
    isMipMapsAble() {
        return Texture.MIPMAPABLE[this.format];
    }

    /**
     * 在系统内存中管理纹理的一个拷贝
     *
     * 字节数通过getNumTotalBytes查询
     * 获取到的数据不能修改，因为渲染器并不会知道
     * @returns {Uint8Array}
     * @abstract
     */
    getData() {
    }

    /**
     * 获取数据流大小
     * @returns {number}
     */
    getFileSize() {
        let size = 0;
        size += 1;                // format
        size += 1;                // type
        size += 1;                // hasMipmaps
        size += 1;                // numDimension
        size += 2 * 3;            // width, height, depth
        size += 4;                // numTotalBytes
        size += this.numTotalBytes;
        return size;
    }

    /**
     *
     * @param buffer {ArrayBuffer}
     * @returns {Promise}
     */
    static unpack(buffer) {

        var io = new BinDataView(buffer);
        let format = io.int8();
        let type = io.int8();
        let hasMipMaps = (io.int8() == 1);
        let numDimensions = io.int8();
        let width = io.int16();
        let height = io.int16();
        let depth = io.int16();
        let numTotalBytes = io.int32();

        let texture;
        switch (type) {
            case Texture.TT_2D:
                texture = new Texture2D(format, width, height, hasMipMaps);
                break;
            case Texture.TT_CUBE:
                texture = new TextureCube(format, width, hasMipMaps);
                break;
            default:
                console.assert(false, 'Unknown texture type.');
                return Promise.reject(null);
        }
        texture.data.set(io.bytes(numTotalBytes));
        texture.numDimensions = numDimensions;
        texture.depth = depth;
        io = null;
        return Promise.resolve(texture);
    }

    /**
     * 将纹理对象处理成文件形式
     * @param texture {Texture}
     * @returns {ArrayBuffer}
     */
    static pack(texture) {
        let size = texture.getFileSize();
        let buffer = new ArrayBuffer(size);
        var io = new L5.Util.DataView(buffer);

        io.setInt8(texture.format);
        io.setInt8(texture.type);
        io.setInt8(texture.hasMipmaps ? 1 : 0);
        io.setInt8(texture.numDimensions);
        io.setInt16(texture.width);
        io.setInt16(texture.height);
        io.setInt16(texture.depth);
        io.setInt32(texture.numTotalBytes);
        io.setBytes(texture.getData());
        return buffer;
    }
}

//////////////////////////////// 纹理格式定义 /////////////////////////////////
DECLARE_ENUM(Texture, {
    TF_NONE:          0,
    TF_R5G6B5:        1,
    TF_A1R5G5B5:      2,
    TF_A4R4G4B4:      3,
    TF_A8:            4,
    TF_L8:            5,
    TF_A8L8:          6,
    TF_R8G8B8:        7,
    TF_A8R8G8B8:      8,
    TF_A8B8G8R8:      9,
    TF_L16:           10,
    TF_G16R16:        11,
    TF_A16B16G16R16:  12,
    TF_R16F:          13,  // not support
    TF_G16R16F:       14,  // not support
    TF_A16B16G16R16F: 15,  // not support
    TF_R32F:          16,
    TF_G32R32F:       17,
    TF_A32B32G32R32F: 18,
    TF_DXT1:          19,
    TF_DXT3:          20,
    TF_DXT5:          21,
    TF_D24S8:         22,
    TF_QUANTITY:      23
}, false);

////////////////////////// 每种格式纹理是否支持生成MipMaps /////////////////////
DECLARE_ENUM(Texture, {
    TT_2D:      1,
    TT_CUBE:    3,
    MIPMAPABLE: [
        false,  // L5.Texture.TF_NONE
        true,   // L5.Texture.TF_R5G6B5
        true,   // L5.Texture.TF_A1R5G5B5
        true,   // L5.Texture.TF_A4R4G4B4
        true,   // L5.Texture.TF_A8
        true,   // L5.Texture.TF_L8
        true,   // L5.Texture.TF_A8L8
        true,   // L5.Texture.TF_R8G8B8
        true,   // L5.Texture.TF_A8R8G8B8
        true,   // L5.Texture.TF_A8B8G8R8
        true,   // L5.Texture.TF_L16
        true,   // L5.Texture.TF_G16R16
        true,   // L5.Texture.TF_A16B16G16R16
        false,   // L5.Texture.TF_R16F
        false,   // L5.Texture.TF_G16R16F
        false,   // L5.Texture.TF_A16B16G16R16F
        false,  // L5.Texture.TF_R32F
        false,  // L5.Texture.TF_G32R32F
        false,  // L5.Texture.TF_A32B32G32R32F,
        true,   // L5.Texture.TF_DXT1 (special handling)
        true,   // L5.Texture.TF_DXT3 (special handling)
        true,   // L5.Texture.TF_DXT5 (special handling)
        false   // L5.Texture.TF_D24S8
    ],

    /////////////////////////    纹理类型维度    //////////////////////////////////
    DIMENSIONS: [
        2,  // TT_2D
        2  // TT_CUBE
    ]
}, false);

////////////////// 每种像素格式单个像素占用的尺寸单位，字节  //////////////////////
DECLARE_ENUM(Texture, {
    PIXEL_SIZE: [
        0,              // L5.Texture.TF_NONE
        2,              // L5.Texture.TF_R5G6B5
        2,              // L5.Texture.TF_A1R5G5B5
        2,              // L5.Texture.TF_A4R4G4B4
        1,              // L5.Texture.TF_A8
        1,              // L5.Texture.TF_L8
        2,              // L5.Texture.TF_A8L8
        3,              // L5.Texture.TF_R8G8B8
        4,              // L5.Texture.TF_A8R8G8B8
        4,              // L5.Texture.TF_A8B8G8R8
        2,              // L5.Texture.TF_L16
        4,              // L5.Texture.TF_G16R16
        8,              // L5.Texture.TF_A16B16G16R16
        2,              // L5.Texture.TF_R16F
        4,              // L5.Texture.TF_G16R16F
        8,              // L5.Texture.TF_A16B16G16R16F
        4,              // L5.Texture.TF_R32F
        8,              // L5.Texture.TF_G32R32F
        16,             // L5.Texture.TF_A32B32G32R32F,
        0,              // L5.Texture.TF_DXT1 (special handling)
        0,              // L5.Texture.TF_DXT3 (special handling)
        0,              // L5.Texture.TF_DXT5 (special handling)
        4               // L5.Texture.TF_D24S8
    ]
});

let mapping = {};

/* ClearBufferMask */
mapping.DEPTH_BUFFER_BIT = 0x00000100;
mapping.STENCIL_BUFFER_BIT = 0x00000400;
mapping.COLOR_BUFFER_BIT = 0x00004000;

/* BeginMode */
mapping.POINTS = 0x0000;
mapping.LINES = 0x0001;
mapping.LINE_LOOP = 0x0002;
mapping.LINE_STRIP = 0x0003;
mapping.TRIANGLES = 0x0004;
mapping.TRIANGLE_STRIP = 0x0005;
mapping.TRIANGLE_FAN = 0x0006;

/* AlphaFunction (not supported in ES20) */
/*      NEVER */
/*      LESS */
/*      EQUAL */
/*      LEQUAL */
/*      GREATER */
/*      NOTEQUAL */
/*      GEQUAL */
/*      ALWAYS */

/* BlendingFactorDest */
mapping.ZERO = 0;
mapping.ONE = 1;
mapping.SRC_COLOR = 0x0300;
mapping.ONE_MINUS_SRC_COLOR = 0x0301;
mapping.SRC_ALPHA = 0x0302;
mapping.ONE_MINUS_SRC_ALPHA = 0x0303;
mapping.DST_ALPHA = 0x0304;
mapping.ONE_MINUS_DST_ALPHA = 0x0305;

/* BlendingFactorSrc */
/*      ZERO */
/*      ONE */
mapping.DST_COLOR = 0x0306;
mapping.ONE_MINUS_DST_COLOR = 0x0307;
mapping.SRC_ALPHA_SATURATE = 0x0308;
/*      SRC_ALPHA */
/*      ONE_MINUS_SRC_ALPHA */
/*      DST_ALPHA */
/*      ONE_MINUS_DST_ALPHA */

/* BlendEquationSeparate */
mapping.FUNC_ADD = 0x8006;
mapping.BLEND_EQUATION = 0x8009;
mapping.BLEND_EQUATION_RGB = 0x8009;
/* same as BLEND_EQUATION */
mapping.BLEND_EQUATION_ALPHA = 0x883D;

/* BlendSubtract */
mapping.FUNC_SUBTRACT = 0x800A;
mapping.FUNC_REVERSE_SUBTRACT = 0x800B;

/* Separate Blend Functions */
mapping.BLEND_DST_RGB = 0x80C8;
mapping.BLEND_SRC_RGB = 0x80C9;
mapping.BLEND_DST_ALPHA = 0x80CA;
mapping.BLEND_SRC_ALPHA = 0x80CB;
mapping.CONSTANT_COLOR = 0x8001;
mapping.ONE_MINUS_CONSTANT_COLOR = 0x8002;
mapping.CONSTANT_ALPHA = 0x8003;
mapping.ONE_MINUS_CONSTANT_ALPHA = 0x8004;
mapping.BLEND_COLOR = 0x8005;

/* Buffer Objects */
mapping.ARRAY_BUFFER = 0x8892;
mapping.ELEMENT_ARRAY_BUFFER = 0x8893;
mapping.ARRAY_BUFFER_BINDING = 0x8894;
mapping.ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;

mapping.STREAM_DRAW = 0x88E0;
mapping.STATIC_DRAW = 0x88E4;
mapping.DYNAMIC_DRAW = 0x88E8;

mapping.BUFFER_SIZE = 0x8764;
mapping.BUFFER_USAGE = 0x8765;

mapping.CURRENT_VERTEX_ATTRIB = 0x8626;

/* CullFaceMode */
mapping.FRONT = 0x0404;
mapping.BACK = 0x0405;
mapping.FRONT_AND_BACK = 0x0408;

/* DepthFunction */
/*      NEVER */
/*      LESS */
/*      EQUAL */
/*      LEQUAL */
/*      GREATER */
/*      NOTEQUAL */
/*      GEQUAL */
/*      ALWAYS */

/* EnableCap */
/* TEXTURE_2D */
mapping.CULL_FACE = 0x0B44;
mapping.BLEND = 0x0BE2;
mapping.DITHER = 0x0BD0;
mapping.STENCIL_TEST = 0x0B90;
mapping.DEPTH_TEST = 0x0B71;
mapping.SCISSOR_TEST = 0x0C11;
mapping.POLYGON_OFFSET_FILL = 0x8037;
mapping.SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
mapping.SAMPLE_COVERAGE = 0x80A0;

/* ErrorCode */
mapping.NO_ERROR = 0;
mapping.INVALID_ENUM = 0x0500;
mapping.INVALID_VALUE = 0x0501;
mapping.INVALID_OPERATION = 0x0502;
mapping.OUT_OF_MEMORY = 0x0505;

/* FrontFaceDirection */
mapping.CW = 0x0900;
mapping.CCW = 0x0901;

/* GetPName */
mapping.LINE_WIDTH = 0x0B21;
mapping.ALIASED_POINT_SIZE_RANGE = 0x846D;
mapping.ALIASED_LINE_WIDTH_RANGE = 0x846E;
mapping.CULL_FACE_MODE = 0x0B45;
mapping.FRONT_FACE = 0x0B46;
mapping.DEPTH_RANGE = 0x0B70;
mapping.DEPTH_WRITEMASK = 0x0B72;
mapping.DEPTH_CLEAR_VALUE = 0x0B73;
mapping.DEPTH_FUNC = 0x0B74;
mapping.STENCIL_CLEAR_VALUE = 0x0B91;
mapping.STENCIL_FUNC = 0x0B92;
mapping.STENCIL_FAIL = 0x0B94;
mapping.STENCIL_PASS_DEPTH_FAIL = 0x0B95;
mapping.STENCIL_PASS_DEPTH_PASS = 0x0B96;
mapping.STENCIL_REF = 0x0B97;
mapping.STENCIL_VALUE_MASK = 0x0B93;
mapping.STENCIL_WRITEMASK = 0x0B98;
mapping.STENCIL_BACK_FUNC = 0x8800;
mapping.STENCIL_BACK_FAIL = 0x8801;
mapping.STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;
mapping.STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;
mapping.STENCIL_BACK_REF = 0x8CA3;
mapping.STENCIL_BACK_VALUE_MASK = 0x8CA4;
mapping.STENCIL_BACK_WRITEMASK = 0x8CA5;
mapping.VIEWPORT = 0x0BA2;
mapping.SCISSOR_BOX = 0x0C10;
/*      SCISSOR_TEST */
mapping.COLOR_CLEAR_VALUE = 0x0C22;
mapping.COLOR_WRITEMASK = 0x0C23;
mapping.UNPACK_ALIGNMENT = 0x0CF5;
mapping.PACK_ALIGNMENT = 0x0D05;
mapping.MAX_TEXTURE_SIZE = 0x0D33;
mapping.MAX_VIEWPORT_DIMS = 0x0D3A;
mapping.SUBPIXEL_BITS = 0x0D50;
mapping.RED_BITS = 0x0D52;
mapping.GREEN_BITS = 0x0D53;
mapping.BLUE_BITS = 0x0D54;
mapping.ALPHA_BITS = 0x0D55;
mapping.DEPTH_BITS = 0x0D56;
mapping.STENCIL_BITS = 0x0D57;
mapping.POLYGON_OFFSET_UNITS = 0x2A00;
/*      POLYGON_OFFSET_FILL */
mapping.POLYGON_OFFSET_FACTOR = 0x8038;
mapping.TEXTURE_BINDING_2D = 0x8069;
mapping.SAMPLE_BUFFERS = 0x80A8;
mapping.SAMPLES = 0x80A9;
mapping.SAMPLE_COVERAGE_VALUE = 0x80AA;
mapping.SAMPLE_COVERAGE_INVERT = 0x80AB;

/* GetTextureParameter */
/*      TEXTURE_MAG_FILTER */
/*      TEXTURE_MIN_FILTER */
/*      TEXTURE_WRAP_S */
/*      TEXTURE_WRAP_T */

mapping.COMPRESSED_TEXTURE_FORMATS = 0x86A3;

/* HintMode */
mapping.DONT_CARE = 0x1100;
mapping.FASTEST = 0x1101;
mapping.NICEST = 0x1102;

/* HintTarget */
mapping.GENERATE_MIPMAP_HINT = 0x8192;

/* DataType */
mapping.BYTE = 0x1400;
mapping.UNSIGNED_BYTE = 0x1401;
mapping.SHORT = 0x1402;
mapping.UNSIGNED_SHORT = 0x1403;
mapping.INT = 0x1404;
mapping.UNSIGNED_INT = 0x1405;
mapping.FLOAT = 0x1406;

/* PixelFormat */
mapping.DEPTH_COMPONENT = 0x1902;
mapping.ALPHA = 0x1906;
mapping.RGB = 0x1907;
mapping.RGBA = 0x1908;
mapping.LUMINANCE = 0x1909;
mapping.LUMINANCE_ALPHA = 0x190A;

/* PixelType */
/*      UNSIGNED_BYTE */
mapping.UNSIGNED_SHORT_4_4_4_4 = 0x8033;
mapping.UNSIGNED_SHORT_5_5_5_1 = 0x8034;
mapping.UNSIGNED_SHORT_5_6_5 = 0x8363;

/* Shaders */
mapping.FRAGMENT_SHADER = 0x8B30;
mapping.VERTEX_SHADER = 0x8B31;
mapping.MAX_VERTEX_ATTRIBS = 0x8869;
mapping.MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;
mapping.MAX_VARYING_VECTORS = 0x8DFC;
mapping.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
mapping.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;
mapping.MAX_TEXTURE_IMAGE_UNITS = 0x8872;
mapping.MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;
mapping.SHADER_TYPE = 0x8B4F;
mapping.DELETE_STATUS = 0x8B80;
mapping.LINK_STATUS = 0x8B82;
mapping.VALIDATE_STATUS = 0x8B83;
mapping.ATTACHED_SHADERS = 0x8B85;
mapping.ACTIVE_UNIFORMS = 0x8B86;
mapping.ACTIVE_ATTRIBUTES = 0x8B89;
mapping.SHADING_LANGUAGE_VERSION = 0x8B8C;
mapping.CURRENT_PROGRAM = 0x8B8D;

/* StencilFunction */
mapping.NEVER = 0x0200;
mapping.LESS = 0x0201;
mapping.EQUAL = 0x0202;
mapping.LEQUAL = 0x0203;
mapping.GREATER = 0x0204;
mapping.NOTEQUAL = 0x0205;
mapping.GEQUAL = 0x0206;
mapping.ALWAYS = 0x0207;

/* StencilOp */
/*      ZERO */
mapping.KEEP = 0x1E00;
mapping.REPLACE = 0x1E01;
mapping.INCR = 0x1E02;
mapping.DECR = 0x1E03;
mapping.INVERT = 0x150A;
mapping.INCR_WRAP = 0x8507;
mapping.DECR_WRAP = 0x8508;

/* StringName */
mapping.VENDOR = 0x1F00;
mapping.RENDERER = 0x1F01;
mapping.VERSION = 0x1F02;

/* TextureMagFilter */
mapping.NEAREST = 0x2600;
mapping.LINEAR = 0x2601;

/* TextureMinFilter */
/*      NEAREST */
/*      LINEAR */
mapping.NEAREST_MIPMAP_NEAREST = 0x2700;
mapping.LINEAR_MIPMAP_NEAREST = 0x2701;
mapping.NEAREST_MIPMAP_LINEAR = 0x2702;
mapping.LINEAR_MIPMAP_LINEAR = 0x2703;

/* TextureParameterName */
mapping.TEXTURE_MAG_FILTER = 0x2800;
mapping.TEXTURE_MIN_FILTER = 0x2801;
mapping.TEXTURE_WRAP_S = 0x2802;
mapping.TEXTURE_WRAP_T = 0x2803;

/* TextureTarget */
mapping.TEXTURE_2D = 0x0DE1;
mapping.TEXTURE = 0x1702;
mapping.TEXTURE_CUBE_MAP = 0x8513;
mapping.TEXTURE_BINDING_CUBE_MAP = 0x8514;
mapping.TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
mapping.TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
mapping.TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
mapping.TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
mapping.TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
mapping.TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;
mapping.MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;

/* TextureUnit */
mapping.TEXTURE0 = 0x84C0;
mapping.TEXTURE1 = 0x84C1;
mapping.TEXTURE2 = 0x84C2;
mapping.TEXTURE3 = 0x84C3;
mapping.TEXTURE4 = 0x84C4;
mapping.TEXTURE5 = 0x84C5;
mapping.TEXTURE6 = 0x84C6;
mapping.TEXTURE7 = 0x84C7;
mapping.TEXTURE8 = 0x84C8;
mapping.TEXTURE9 = 0x84C9;
mapping.TEXTURE10 = 0x84CA;
mapping.TEXTURE11 = 0x84CB;
mapping.TEXTURE12 = 0x84CC;
mapping.TEXTURE13 = 0x84CD;
mapping.TEXTURE14 = 0x84CE;
mapping.TEXTURE15 = 0x84CF;
mapping.TEXTURE16 = 0x84D0;
mapping.TEXTURE17 = 0x84D1;
mapping.TEXTURE18 = 0x84D2;
mapping.TEXTURE19 = 0x84D3;
mapping.TEXTURE20 = 0x84D4;
mapping.TEXTURE21 = 0x84D5;
mapping.TEXTURE22 = 0x84D6;
mapping.TEXTURE23 = 0x84D7;
mapping.TEXTURE24 = 0x84D8;
mapping.TEXTURE25 = 0x84D9;
mapping.TEXTURE26 = 0x84DA;
mapping.TEXTURE27 = 0x84DB;
mapping.TEXTURE28 = 0x84DC;
mapping.TEXTURE29 = 0x84DD;
mapping.TEXTURE30 = 0x84DE;
mapping.TEXTURE31 = 0x84DF;
mapping.ACTIVE_TEXTURE = 0x84E0;

/* TextureWrapMode */
mapping.REPEAT = 0x2901;
mapping.CLAMP_TO_EDGE = 0x812F;
mapping.MIRRORED_REPEAT = 0x8370;

/* Uniform Types */
mapping.FLOAT_VEC2 = 0x8B50;
mapping.FLOAT_VEC3 = 0x8B51;
mapping.FLOAT_VEC4 = 0x8B52;
mapping.INT_VEC2 = 0x8B53;
mapping.INT_VEC3 = 0x8B54;
mapping.INT_VEC4 = 0x8B55;
mapping.BOOL = 0x8B56;
mapping.BOOL_VEC2 = 0x8B57;
mapping.BOOL_VEC3 = 0x8B58;
mapping.BOOL_VEC4 = 0x8B59;
mapping.FLOAT_MAT2 = 0x8B5A;
mapping.FLOAT_MAT3 = 0x8B5B;
mapping.FLOAT_MAT4 = 0x8B5C;
mapping.SAMPLER_2D = 0x8B5E;
mapping.SAMPLER_CUBE = 0x8B60;

/* Vertex Arrays */
mapping.VERTEX_ATTRIB_ARRAY_ENABLED = 0x8622;
mapping.VERTEX_ATTRIB_ARRAY_SIZE = 0x8623;
mapping.VERTEX_ATTRIB_ARRAY_STRIDE = 0x8624;
mapping.VERTEX_ATTRIB_ARRAY_TYPE = 0x8625;
mapping.VERTEX_ATTRIB_ARRAY_NORMALIZED = 0x886A;
mapping.VERTEX_ATTRIB_ARRAY_POINTER = 0x8645;
mapping.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

/* Read Format */
mapping.IMPLEMENTATION_COLOR_READ_TYPE = 0x8B9A;
mapping.IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;

/* Shader Source */
mapping.COMPILE_STATUS = 0x8B81;

/* Shader Precision-Specified Types */
mapping.LOW_FLOAT = 0x8DF0;
mapping.MEDIUM_FLOAT = 0x8DF1;
mapping.HIGH_FLOAT = 0x8DF2;
mapping.LOW_INT = 0x8DF3;
mapping.MEDIUM_INT = 0x8DF4;
mapping.HIGH_INT = 0x8DF5;

/* Framebuffer Object. */
mapping.FRAMEBUFFER = 0x8D40;
mapping.RENDERBUFFER = 0x8D41;

mapping.RGBA4 = 0x8056;
mapping.RGB5_A1 = 0x8057;
mapping.RGB565 = 0x8D62;
mapping.DEPTH_COMPONENT16 = 0x81A5;
mapping.STENCIL_INDEX = 0x1901;
mapping.STENCIL_INDEX8 = 0x8D48;
mapping.DEPTH_STENCIL = 0x84F9;

mapping.RENDERBUFFER_WIDTH = 0x8D42;
mapping.RENDERBUFFER_HEIGHT = 0x8D43;
mapping.RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;
mapping.RENDERBUFFER_RED_SIZE = 0x8D50;
mapping.RENDERBUFFER_GREEN_SIZE = 0x8D51;
mapping.RENDERBUFFER_BLUE_SIZE = 0x8D52;
mapping.RENDERBUFFER_ALPHA_SIZE = 0x8D53;
mapping.RENDERBUFFER_DEPTH_SIZE = 0x8D54;
mapping.RENDERBUFFER_STENCIL_SIZE = 0x8D55;

mapping.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 0x8CD0;
mapping.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 0x8CD1;
mapping.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 0x8CD2;
mapping.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

mapping.COLOR_ATTACHMENT0 = 0x8CE0;
mapping.DEPTH_ATTACHMENT = 0x8D00;
mapping.STENCIL_ATTACHMENT = 0x8D20;
mapping.DEPTH_STENCIL_ATTACHMENT = 0x821A;

mapping.NONE = 0;

mapping.FRAMEBUFFER_COMPLETE = 0x8CD5;
mapping.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;
mapping.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
mapping.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;
mapping.FRAMEBUFFER_UNSUPPORTED = 0x8CDD;
mapping.FRAMEBUFFER_BINDING = 0x8CA6;
mapping.RENDERBUFFER_BINDING = 0x8CA7;
mapping.MAX_RENDERBUFFER_SIZE = 0x84E8;

mapping.INVALID_FRAMEBUFFER_OPERATION = 0x0506;

/* WebGL-specific enums */
mapping.UNPACK_FLIP_Y_WEBGL = 0x9240;
mapping.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
mapping.CONTEXT_LOST_WEBGL = 0x9242;
mapping.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
mapping.BROWSER_DEFAULT_WEBGL = 0x9244;

/* webgl2 add */
mapping.READ_BUFFER = 0x0C02;
mapping.UNPACK_ROW_LENGTH = 0x0CF2;
mapping.UNPACK_SKIP_ROWS = 0x0CF3;
mapping.UNPACK_SKIP_PIXELS = 0x0CF4;
mapping.PACK_ROW_LENGTH = 0x0D02;
mapping.PACK_SKIP_ROWS = 0x0D03;
mapping.PACK_SKIP_PIXELS = 0x0D04;
mapping.COLOR = 0x1800;
mapping.DEPTH = 0x1801;
mapping.STENCIL = 0x1802;
mapping.RED = 0x1903;
mapping.RGB8 = 0x8051;
mapping.RGBA8 = 0x8058;
mapping.RGB10_A2 = 0x8059;
mapping.TEXTURE_BINDING_3D = 0x806A;
mapping.UNPACK_SKIP_IMAGES = 0x806D;
mapping.UNPACK_IMAGE_HEIGHT = 0x806E;
mapping.TEXTURE_3D = 0x806F;
mapping.TEXTURE_WRAP_R = 0x8072;
mapping.MAX_3D_TEXTURE_SIZE = 0x8073;
mapping.UNSIGNED_INT_2_10_10_10_REV = 0x8368;
mapping.MAX_ELEMENTS_VERTICES = 0x80E8;
mapping.MAX_ELEMENTS_INDICES = 0x80E9;
mapping.TEXTURE_MIN_LOD = 0x813A;
mapping.TEXTURE_MAX_LOD = 0x813B;
mapping.TEXTURE_BASE_LEVEL = 0x813C;
mapping.TEXTURE_MAX_LEVEL = 0x813D;
mapping.MIN = 0x8007;
mapping.MAX = 0x8008;
mapping.DEPTH_COMPONENT24 = 0x81A6;
mapping.MAX_TEXTURE_LOD_BIAS = 0x84FD;
mapping.TEXTURE_COMPARE_MODE = 0x884C;
mapping.TEXTURE_COMPARE_FUNC = 0x884D;
mapping.CURRENT_QUERY = 0x8865;
mapping.QUERY_RESULT = 0x8866;
mapping.QUERY_RESULT_AVAILABLE = 0x8867;
mapping.STREAM_READ = 0x88E1;
mapping.STREAM_COPY = 0x88E2;
mapping.STATIC_READ = 0x88E5;
mapping.STATIC_COPY = 0x88E6;
mapping.DYNAMIC_READ = 0x88E9;
mapping.DYNAMIC_COPY = 0x88EA;
mapping.MAX_DRAW_BUFFERS = 0x8824;
mapping.DRAW_BUFFER0 = 0x8825;
mapping.DRAW_BUFFER1 = 0x8826;
mapping.DRAW_BUFFER2 = 0x8827;
mapping.DRAW_BUFFER3 = 0x8828;
mapping.DRAW_BUFFER4 = 0x8829;
mapping.DRAW_BUFFER5 = 0x882A;
mapping.DRAW_BUFFER6 = 0x882B;
mapping.DRAW_BUFFER7 = 0x882C;
mapping.DRAW_BUFFER8 = 0x882D;
mapping.DRAW_BUFFER9 = 0x882E;
mapping.DRAW_BUFFER10 = 0x882F;
mapping.DRAW_BUFFER11 = 0x8830;
mapping.DRAW_BUFFER12 = 0x8831;
mapping.DRAW_BUFFER13 = 0x8832;
mapping.DRAW_BUFFER14 = 0x8833;
mapping.DRAW_BUFFER15 = 0x8834;
mapping.MAX_FRAGMENT_UNIFORM_COMPONENTS = 0x8B49;
mapping.MAX_VERTEX_UNIFORM_COMPONENTS = 0x8B4A;
mapping.SAMPLER_3D = 0x8B5F;
mapping.SAMPLER_2D_SHADOW = 0x8B62;
mapping.FRAGMENT_SHADER_DERIVATIVE_HINT = 0x8B8B;
mapping.PIXEL_PACK_BUFFER = 0x88EB;
mapping.PIXEL_UNPACK_BUFFER = 0x88EC;
mapping.PIXEL_PACK_BUFFER_BINDING = 0x88ED;
mapping.PIXEL_UNPACK_BUFFER_BINDING = 0x88EF;
mapping.FLOAT_MAT2x3 = 0x8B65;
mapping.FLOAT_MAT2x4 = 0x8B66;
mapping.FLOAT_MAT3x2 = 0x8B67;
mapping.FLOAT_MAT3x4 = 0x8B68;
mapping.FLOAT_MAT4x2 = 0x8B69;
mapping.FLOAT_MAT4x3 = 0x8B6A;
mapping.SRGB = 0x8C40;
mapping.SRGB8 = 0x8C41;
mapping.SRGB8_ALPHA8 = 0x8C43;
mapping.COMPARE_REF_TO_TEXTURE = 0x884E;
mapping.RGBA32F = 0x8814;
mapping.RGB32F = 0x8815;
mapping.RGBA16F = 0x881A;
mapping.RGB16F = 0x881B;
mapping.VERTEX_ATTRIB_ARRAY_INTEGER = 0x88FD;
mapping.MAX_ARRAY_TEXTURE_LAYERS = 0x88FF;
mapping.MIN_PROGRAM_TEXEL_OFFSET = 0x8904;
mapping.MAX_PROGRAM_TEXEL_OFFSET = 0x8905;
mapping.MAX_VARYING_COMPONENTS = 0x8B4B;
mapping.TEXTURE_2D_ARRAY = 0x8C1A;
mapping.TEXTURE_BINDING_2D_ARRAY = 0x8C1D;
mapping.R11F_G11F_B10F = 0x8C3A;
mapping.UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
mapping.RGB9_E5 = 0x8C3D;
mapping.UNSIGNED_INT_5_9_9_9_REV = 0x8C3E;
mapping.TRANSFORM_FEEDBACK_BUFFER_MODE = 0x8C7F;
mapping.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS = 0x8C80;
mapping.TRANSFORM_FEEDBACK_VARYINGS = 0x8C83;
mapping.TRANSFORM_FEEDBACK_BUFFER_START = 0x8C84;
mapping.TRANSFORM_FEEDBACK_BUFFER_SIZE = 0x8C85;
mapping.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = 0x8C88;
mapping.RASTERIZER_DISCARD = 0x8C89;
mapping.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS = 0x8C8A;
mapping.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS = 0x8C8B;
mapping.INTERLEAVED_ATTRIBS = 0x8C8C;
mapping.SEPARATE_ATTRIBS = 0x8C8D;
mapping.TRANSFORM_FEEDBACK_BUFFER = 0x8C8E;
mapping.TRANSFORM_FEEDBACK_BUFFER_BINDING = 0x8C8F;
mapping.RGBA32UI = 0x8D70;
mapping.RGB32UI = 0x8D71;
mapping.RGBA16UI = 0x8D76;
mapping.RGB16UI = 0x8D77;
mapping.RGBA8UI = 0x8D7C;
mapping.RGB8UI = 0x8D7D;
mapping.RGBA32I = 0x8D82;
mapping.RGB32I = 0x8D83;
mapping.RGBA16I = 0x8D88;
mapping.RGB16I = 0x8D89;
mapping.RGBA8I = 0x8D8E;
mapping.RGB8I = 0x8D8F;
mapping.RED_INTEGER = 0x8D94;
mapping.RGB_INTEGER = 0x8D98;
mapping.RGBA_INTEGER = 0x8D99;
mapping.SAMPLER_2D_ARRAY = 0x8DC1;
mapping.SAMPLER_2D_ARRAY_SHADOW = 0x8DC4;
mapping.SAMPLER_CUBE_SHADOW = 0x8DC5;
mapping.UNSIGNED_INT_VEC2 = 0x8DC6;
mapping.UNSIGNED_INT_VEC3 = 0x8DC7;
mapping.UNSIGNED_INT_VEC4 = 0x8DC8;
mapping.INT_SAMPLER_2D = 0x8DCA;
mapping.INT_SAMPLER_3D = 0x8DCB;
mapping.INT_SAMPLER_CUBE = 0x8DCC;
mapping.INT_SAMPLER_2D_ARRAY = 0x8DCF;
mapping.UNSIGNED_INT_SAMPLER_2D = 0x8DD2;
mapping.UNSIGNED_INT_SAMPLER_3D = 0x8DD3;
mapping.UNSIGNED_INT_SAMPLER_CUBE = 0x8DD4;
mapping.UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;
mapping.DEPTH_COMPONENT32F = 0x8CAC;
mapping.DEPTH32F_STENCIL8 = 0x8CAD;
mapping.FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
mapping.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING = 0x8210;
mapping.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE = 0x8211;
mapping.FRAMEBUFFER_ATTACHMENT_RED_SIZE = 0x8212;
mapping.FRAMEBUFFER_ATTACHMENT_GREEN_SIZE = 0x8213;
mapping.FRAMEBUFFER_ATTACHMENT_BLUE_SIZE = 0x8214;
mapping.FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE = 0x8215;
mapping.FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE = 0x8216;
mapping.FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE = 0x8217;
mapping.FRAMEBUFFER_DEFAULT = 0x8218;
mapping.DEPTH_STENCIL_ATTACHMENT = 0x821A;
mapping.DEPTH_STENCIL = 0x84F9;
mapping.UNSIGNED_INT_24_8 = 0x84FA;
mapping.DEPTH24_STENCIL8 = 0x88F0;
mapping.UNSIGNED_NORMALIZED = 0x8C17;
mapping.DRAW_FRAMEBUFFER_BINDING = 0x8CA6; /* Same as FRAMEBUFFER_BINDING */
mapping.READ_FRAMEBUFFER = 0x8CA8;
mapping.DRAW_FRAMEBUFFER = 0x8CA9;
mapping.READ_FRAMEBUFFER_BINDING = 0x8CAA;
mapping.RENDERBUFFER_SAMPLES = 0x8CAB;
mapping.FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER = 0x8CD4;
mapping.MAX_COLOR_ATTACHMENTS = 0x8CDF;
mapping.COLOR_ATTACHMENT1 = 0x8CE1;
mapping.COLOR_ATTACHMENT2 = 0x8CE2;
mapping.COLOR_ATTACHMENT3 = 0x8CE3;
mapping.COLOR_ATTACHMENT4 = 0x8CE4;
mapping.COLOR_ATTACHMENT5 = 0x8CE5;
mapping.COLOR_ATTACHMENT6 = 0x8CE6;
mapping.COLOR_ATTACHMENT7 = 0x8CE7;
mapping.COLOR_ATTACHMENT8 = 0x8CE8;
mapping.COLOR_ATTACHMENT9 = 0x8CE9;
mapping.COLOR_ATTACHMENT10 = 0x8CEA;
mapping.COLOR_ATTACHMENT11 = 0x8CEB;
mapping.COLOR_ATTACHMENT12 = 0x8CEC;
mapping.COLOR_ATTACHMENT13 = 0x8CED;
mapping.COLOR_ATTACHMENT14 = 0x8CEE;
mapping.COLOR_ATTACHMENT15 = 0x8CEF;
mapping.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE = 0x8D56;
mapping.MAX_SAMPLES = 0x8D57;
mapping.HALF_FLOAT = 0x140B;
mapping.RG = 0x8227;
mapping.RG_INTEGER = 0x8228;
mapping.R8 = 0x8229;
mapping.RG8 = 0x822B;
mapping.R16F = 0x822D;
mapping.R32F = 0x822E;
mapping.RG16F = 0x822F;
mapping.RG32F = 0x8230;
mapping.R8I = 0x8231;
mapping.R8UI = 0x8232;
mapping.R16I = 0x8233;
mapping.R16UI = 0x8234;
mapping.R32I = 0x8235;
mapping.R32UI = 0x8236;
mapping.RG8I = 0x8237;
mapping.RG8UI = 0x8238;
mapping.RG16I = 0x8239;
mapping.RG16UI = 0x823A;
mapping.RG32I = 0x823B;
mapping.RG32UI = 0x823C;
mapping.VERTEX_ARRAY_BINDING = 0x85B5;
mapping.R8_SNORM = 0x8F94;
mapping.RG8_SNORM = 0x8F95;
mapping.RGB8_SNORM = 0x8F96;
mapping.RGBA8_SNORM = 0x8F97;
mapping.SIGNED_NORMALIZED = 0x8F9C;
mapping.COPY_READ_BUFFER = 0x8F36;
mapping.COPY_WRITE_BUFFER = 0x8F37;
mapping.COPY_READ_BUFFER_BINDING = 0x8F36; /* Same as COPY_READ_BUFFER */
mapping.COPY_WRITE_BUFFER_BINDING = 0x8F37; /* Same as COPY_WRITE_BUFFER */
mapping.UNIFORM_BUFFER = 0x8A11;
mapping.UNIFORM_BUFFER_BINDING = 0x8A28;
mapping.UNIFORM_BUFFER_START = 0x8A29;
mapping.UNIFORM_BUFFER_SIZE = 0x8A2A;
mapping.MAX_VERTEX_UNIFORM_BLOCKS = 0x8A2B;
mapping.MAX_FRAGMENT_UNIFORM_BLOCKS = 0x8A2D;
mapping.MAX_COMBINED_UNIFORM_BLOCKS = 0x8A2E;
mapping.MAX_UNIFORM_BUFFER_BINDINGS = 0x8A2F;
mapping.MAX_UNIFORM_BLOCK_SIZE = 0x8A30;
mapping.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS = 0x8A31;
mapping.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS = 0x8A33;
mapping.UNIFORM_BUFFER_OFFSET_ALIGNMENT = 0x8A34;
mapping.ACTIVE_UNIFORM_BLOCKS = 0x8A36;
mapping.UNIFORM_TYPE = 0x8A37;
mapping.UNIFORM_SIZE = 0x8A38;
mapping.UNIFORM_BLOCK_INDEX = 0x8A3A;
mapping.UNIFORM_OFFSET = 0x8A3B;
mapping.UNIFORM_ARRAY_STRIDE = 0x8A3C;
mapping.UNIFORM_MATRIX_STRIDE = 0x8A3D;
mapping.UNIFORM_IS_ROW_MAJOR = 0x8A3E;
mapping.UNIFORM_BLOCK_BINDING = 0x8A3F;
mapping.UNIFORM_BLOCK_DATA_SIZE = 0x8A40;
mapping.UNIFORM_BLOCK_ACTIVE_UNIFORMS = 0x8A42;
mapping.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES = 0x8A43;
mapping.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER = 0x8A44;
mapping.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 0x8A46;
mapping.INVALID_INDEX = 0xFFFFFFFF;
mapping.MAX_VERTEX_OUTPUT_COMPONENTS = 0x9122;
mapping.MAX_FRAGMENT_INPUT_COMPONENTS = 0x9125;
mapping.MAX_SERVER_WAIT_TIMEOUT = 0x9111;
mapping.OBJECT_TYPE = 0x9112;
mapping.SYNC_CONDITION = 0x9113;
mapping.SYNC_STATUS = 0x9114;
mapping.SYNC_FLAGS = 0x9115;
mapping.SYNC_FENCE = 0x9116;
mapping.SYNC_GPU_COMMANDS_COMPLETE = 0x9117;
mapping.UNSIGNALED = 0x9118;
mapping.SIGNALED = 0x9119;
mapping.ALREADY_SIGNALED = 0x911A;
mapping.TIMEOUT_EXPIRED = 0x911B;
mapping.CONDITION_SATISFIED = 0x911C;
mapping.WAIT_FAILED = 0x911D;
mapping.SYNC_FLUSH_COMMANDS_BIT = 0x00000001;
mapping.VERTEX_ATTRIB_ARRAY_DIVISOR = 0x88FE;
mapping.ANY_SAMPLES_PASSED = 0x8C2F;
mapping.ANY_SAMPLES_PASSED_CONSERVATIVE = 0x8D6A;
mapping.SAMPLER_BINDING = 0x8919;
mapping.RGB10_A2UI = 0x906F;
mapping.INT_2_10_10_10_REV = 0x8D9F;
mapping.TRANSFORM_FEEDBACK = 0x8E22;
mapping.TRANSFORM_FEEDBACK_PAUSED = 0x8E23;
mapping.TRANSFORM_FEEDBACK_ACTIVE = 0x8E24;
mapping.TRANSFORM_FEEDBACK_BINDING = 0x8E25;
mapping.TEXTURE_IMMUTABLE_FORMAT = 0x912F;
mapping.MAX_ELEMENT_INDEX = 0x8D6B;
mapping.TEXTURE_IMMUTABLE_LEVELS = 0x82DF;
mapping.TIMEOUT_IGNORED = -1;
mapping.MAX_CLIENT_WAIT_TIMEOUT_WEBGL = 0x9247;


let NS = mapping;

// 属性数据类型
mapping.AttributeType = [
    0,                          // AT_NONE (unsupported)
    NS.FLOAT,                   // AT_FLOAT1
    NS.FLOAT,                   // AT_FLOAT2
    NS.FLOAT,                   // AT_FLOAT3
    NS.FLOAT,                   // AT_FLOAT4
    NS.UNSIGNED_BYTE,           // AT_UBYTE4
    NS.SHORT,                   // AT_SHORT1
    NS.SHORT,                   // AT_SHORT2
    NS.SHORT                    // AT_SHORT4
];

// 属性尺寸
mapping.AttributeChannels = [
    0,  // AT_NONE (unsupported)
    1,  // AT_FLOAT1
    2,  // AT_FLOAT2
    3,  // AT_FLOAT3
    4,  // AT_FLOAT4
    4,  // AT_UBYTE4
    1,  // AT_SHORT1
    2,  // AT_SHORT2
    4   // AT_SHORT4
];

// 缓冲使用方式
mapping.BufferUsage = [
    NS.STATIC_DRAW,     // BU_STATIC
    NS.DYNAMIC_DRAW,    // BU_DYNAMIC
    NS.DYNAMIC_DRAW,    // BU_RENDERTARGET
    NS.DYNAMIC_DRAW,    // BU_DEPTHSTENCIL
    NS.DYNAMIC_DRAW     // BU_TEXTURE
];

// 纹理目标
mapping.TextureTarget = [
    0,                   // ST_NONE
    NS.TEXTURE_2D,       // ST_2D
    NS.TEXTURE_3D,       // ST_3D
    NS.TEXTURE_CUBE_MAP, // ST_CUBE
    NS.TEXTURE_2D_ARRAY  // ST_2D_ARRAY
];

// 纹理包装方式
mapping.WrapMode = [
    NS.CLAMP_TO_EDGE,   // SC_NONE
    NS.REPEAT,          // SC_REPEAT
    NS.MIRRORED_REPEAT, // SC_MIRRORED_REPEAT
    NS.CLAMP_TO_EDGE    // SC_CLAMP_EDGE
];

mapping.DepthCompare = [
    NS.NEVER,       // CM_NEVER
    NS.LESS,        // CM_LESS
    NS.EQUAL,       // CM_EQUAL
    NS.LEQUAL,      // CM_LEQUAL
    NS.GREATER,     // CM_GREATER
    NS.NOTEQUAL,    // CM_NOTEQUAL
    NS.GEQUAL,      // CM_GEQUAL
    NS.ALWAYS       // CM_ALWAYS
];

mapping.StencilCompare = [
    NS.NEVER,       // CM_NEVER
    NS.LESS,        // CM_LESS
    NS.EQUAL,       // CM_EQUAL
    NS.LEQUAL,      // CM_LEQUAL
    NS.GREATER,     // CM_GREATER
    NS.NOTEQUAL,    // CM_NOTEQUAL
    NS.GEQUAL,      // CM_GEQUAL
    NS.ALWAYS       // CM_ALWAYS
];

mapping.StencilOperation = [
    NS.KEEP,    // OT_KEEP
    NS.ZERO,    // OT_ZERO
    NS.REPLACE, // OT_REPLACE
    NS.INCR,    // OT_INCREMENT
    NS.DECR,    // OT_DECREMENT
    NS.INVERT   // OT_INVERT
];

// 透明通道混合
mapping.AlphaBlend = [
    NS.ZERO,
    NS.ONE,
    NS.SRC_COLOR,
    NS.ONE_MINUS_SRC_COLOR,
    NS.DST_COLOR,
    NS.ONE_MINUS_DST_COLOR,
    NS.SRC_ALPHA,
    NS.ONE_MINUS_SRC_ALPHA,
    NS.DST_ALPHA,
    NS.ONE_MINUS_DST_ALPHA,
    NS.SRC_ALPHA_SATURATE,
    NS.CONSTANT_COLOR,
    NS.ONE_MINUS_CONSTANT_COLOR,
    NS.CONSTANT_ALPHA,
    NS.ONE_MINUS_CONSTANT_ALPHA
];

mapping.TextureFilter = [
    0,                          // SF_NONE
    NS.NEAREST,                 // SF_NEAREST
    NS.LINEAR,                  // SF_LINEAR
    NS.NEAREST_MIPMAP_NEAREST,  // SF_NEAREST_MIPMAP_NEAREST
    NS.NEAREST_MIPMAP_LINEAR,   // SF_NEAREST_MIPMAP_LINEAR
    NS.LINEAR_MIPMAP_NEAREST,   // SF_LINEAR_MIPMAP_NEAREST
    NS.LINEAR_MIPMAP_LINEAR     // SF_LINEAR_MIPMAP_LINEAR
];

mapping.TextureFormat = [
    0,                                  // TF_NONE
    NS.RGB,                             // TF_R5G6B5
    NS.RGBA,                            // TF_A1R5G5B5
    NS.RGBA,                            // TF_A4R4G4B4
    NS.ALPHA,                           // TF_A8
    NS.LUMINANCE,                       // TF_L8
    NS.LUMINANCE_ALPHA,                 // TF_A8L8
    NS.RGB,                             // TF_R8G8B8
    NS.RGBA,                            // TF_A8R8G8B8
    NS.RGBA,                            // TF_A8B8G8R8
    NS.LUMINANCE,                       // TF_L16
    0,                                  // TF_G16R16
    NS.RGBA,                            // TF_A16B16G16R16
    0,                                  // TF_R16F
    0,                                  // TF_G16R16F
    NS.RGBA,                            // TF_A16B16G16R16F
    0,                                  // TF_R32F
    0,                                  // TF_G32R32F
    NS.RGBA,                            // TF_A32B32G32R32F
    NS.COMPRESSED_RGBA_S3TC_DXT1_EXT,   // TF_DXT1
    NS.COMPRESSED_RGBA_S3TC_DXT3_EXT,   // TF_DXT3
    NS.COMPRESSED_RGBA_S3TC_DXT5_EXT,   // TF_DXT5
    NS.UNSIGNED_INT_24_8_WEBGL          // TF_D24S8
];

mapping.TextureType = [
    0,                              // TF_NONE
    NS.UNSIGNED_SHORT_5_6_5,        // TF_R5G6B5
    NS.UNSIGNED_SHORT_1_5_5_5,      // TF_A1R5G5B5
    NS.UNSIGNED_SHORT_4_4_4_4,      // TF_A4R4G4B4
    NS.UNSIGNED_BYTE,               // TF_A8
    NS.UNSIGNED_BYTE,               // TF_L8
    NS.UNSIGNED_BYTE,               // TF_A8L8
    NS.UNSIGNED_BYTE,               // TF_R8G8B8
    NS.UNSIGNED_BYTE,               // TF_A8R8G8B8
    NS.UNSIGNED_BYTE,               // TF_A8B8G8R8
    NS.UNSIGNED_SHORT,              // TF_L16
    NS.UNSIGNED_SHORT,              // TF_G16R16
    NS.UNSIGNED_SHORT,              // TF_A16B16G16R16
    NS.HALF_FLOAT_OES,              // TF_R16F
    NS.HALF_FLOAT_OES,              // TF_G16R16F
    NS.HALF_FLOAT_OES,              // TF_A16B16G16R16F
    NS.FLOAT,                       // TF_R32F
    NS.FLOAT,                       // TF_G32R32F
    NS.FLOAT,                       // TF_A32B32G32R32F
    NS.NONE,                        // TF_DXT1 (not needed)
    NS.NONE,                        // TF_DXT3 (not needed)
    NS.NONE,                        // TF_DXT5 (not needed)
    NS.UNSIGNED_INT_24_8_WEBGL      // TF_D24S8
];

mapping.PrimitiveType = [
    0,                  // PT_NONE (not used)
    NS.POINTS,          // PT_POLYPOINT
    NS.LINES,           // PT_POLYSEGMENTS_DISJOINT
    NS.LINE_STRIP,      // PT_POLYSEGMENTS_CONTIGUOUS
    0,                  // PT_TRIANGLES (not used)
    NS.TRIANGLES,       // PT_TRIMESH
    NS.TRIANGLE_STRIP,  // PT_TRISTRIP
    NS.TRIANGLE_FAN     // PT_TRIFAN
];

class Shader extends D3Object {

    /**
     * @param name {string} 着色器名称
     * @param numInputs {number} 输入属性数量
     * @param numConstants {number} uniform 数量
     * @param numSamplers {number} 采样器数量
     */
    constructor(name, numInputs = 0, numConstants = 0, numSamplers = 0) {
        super(name);

        if (numInputs > 0) {
            this.inputName = new Array(numInputs);
            this.inputType = new Array(numInputs);
            this.inputSemantic = new Array(numInputs);
        } else {
            this.inputName = null;
            this.inputType = null;
            this.inputSemantic = null;
        }
        this.numInputs = numInputs;
        let i, dim;
        this.numConstants = numConstants;
        if (numConstants > 0) {
            this.constantName = new Array(numConstants);
            this.constantType = new Array(numConstants);
            this.constantFuncName = new Array(numConstants);
            this.constantSize = new Array(numConstants);
        } else {
            this.constantName = null;
            this.constantType = null;
            this.constantFuncName = null;
            this.constantSize = null;
        }

        this.numSamplers = numSamplers;
        this.coordinate = new Array(3);
        this.textureUnit = [];
        if (numSamplers > 0) {
            this.samplerName = new Array(numSamplers);
            this.samplerType = new Array(numSamplers);

            this.filter = new Array(numSamplers);
            this.coordinate[0] = new Array(numSamplers);
            this.coordinate[1] = new Array(numSamplers);
            this.coordinate[2] = new Array(numSamplers);
            this.lodBias = new Float32Array(numSamplers);
            this.anisotropy = new Float32Array(numSamplers);
            this.borderColor = new Float32Array(numSamplers * 4);

            for (i = 0; i < numSamplers; ++i) {
                this.filter[i] = Shader.SF_NEAREST;
                this.coordinate[0][i] = Shader.SC_CLAMP_EDGE;
                this.coordinate[1][i] = Shader.SC_CLAMP_EDGE;
                this.coordinate[2][i] = Shader.SC_CLAMP_EDGE;
                this.lodBias[i] = 0;
                this.anisotropy[i] = 1;

                this.borderColor[i * 4] = 0;
                this.borderColor[i * 4 + 1] = 0;
                this.borderColor[i * 4 + 2] = 0;
                this.borderColor[i * 4 + 3] = 0;
            }
            this.textureUnit = new Array(numSamplers);
        } else {
            this.samplerName = null;
            this.samplerType = null;
            this.filter = null;
            for (dim = 0; dim < 3; ++dim) {
                this.coordinate[dim] = null;
            }
            this.lodBias = null;
            this.anisotropy = null;
            this.borderColor = null;
            this.textureUnit = null;
        }

        this.program = '';
    }
    /**
     * 着色器属性变量声明
     * @param i {number} 属性变量索引
     * @param name {string} 属性变量名称
     * @param type {number} Shader.VT_XXX 属性变量类型
     * @param semantic {number} Shader.VS_XXX 属性变量语义
     */
    setInput(i, name, type, semantic) {
        if (0 <= i && i < this.numInputs) {
            this.inputName[i] = name;
            this.inputType[i] = type;
            this.inputSemantic[i] = semantic;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param i {number}
     * @param name {string}
     * @param type {number} Shader.VT_XXX uniform类型
     */
    setConstant(i, name, type) {
        if (0 <= i && i < this.numConstants) {
            this.constantName[i] = name;
            this.constantType[i] = type;
            var f = '', s = 0;
            switch (type) {
                case Shader.VT_MAT4:
                    f = 'uniformMatrix4fv';
                    s = 16;
                    break;
                case Shader.VT_BOOL:
                case Shader.VT_INT:
                    f = 'uniform1i';
                    s = 1;
                    break;
                case Shader.VT_BVEC2:
                case Shader.VT_IVEC2:
                    f = 'uniform2iv';
                    s = 2;
                    break;
                case Shader.VT_BVEC3:
                case Shader.VT_IVEC3:
                    f = 'uniform3iv';
                    s = 3;
                    break;
                case Shader.VT_BVEC4:
                case Shader.VT_IVEC4:
                    f = 'uniform4iv';
                    s = 4;
                    break;
                case Shader.VT_FLOAT:
                    f = 'uniform1f';
                    s = 1;
                    break;
                case Shader.VT_VEC2:
                    f = 'uniform2fv';
                    s = 2;
                    break;
                case Shader.VT_VEC3:
                    f = 'uniform3fv';
                    s = 3;
                    break;
                case Shader.VT_VEC4:
                    f = 'uniform4fv';
                    s = 4;
                    break;
                case Shader.VT_MAT2:
                    f = 'uniformMatrix2fv';
                    s = 4;
                    break;
                case Shader.VT_MAT3:
                    f = 'uniformMatrix3fv';
                    s = 9;
                    break;
            }
            this.constantSize[i] = s;
            this.constantFuncName[i] = f;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param i {number}
     * @param name {string} 采样器名称
     * @param type {number} Shader.ST_XXX 采样器类型
     */
    setSampler(i, name, type) {
        if (0 <= i && i < this.numSamplers) {
            this.samplerName[i] = name;
            this.samplerType[i] = type;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param i {number}
     * @param filter {number} Shader.SF_XXX 过滤器类型
     */
    setFilter(i, filter) {
        if (0 <= i && i < this.numSamplers) {
            this.filter[i] = filter;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param i {number}
     * @param dim {number}
     * @param coordinate {number} Shader.SC_XXX
     */
    setCoordinate(i, dim, coordinate) {
        if (0 <= i && i < this.numSamplers) {
            if (0 <= dim && dim < 3) {
                this.coordinate[dim][i] = coordinate;
                return;
            }
            console.assert(false, 'Invalid dimension.');
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param i {number}
     * @param lodBias {number}
     */
    setLodBias(i, lodBias) {
        if (0 <= i && i < this.numSamplers) {
            this.lodBias[i] = lodBias;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param i {number}
     * @param anisotropy {number}
     */
    setAnisotropy(i, anisotropy) {
        if (0 <= i && i < this.numSamplers) {
            this.anisotropy[i] = anisotropy;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     *
     * @param i {number}
     * @param borderColor {Float32Array} 4 length
     */
    setBorderColor(i, borderColor) {
        if (0 <= i && i < this.numSamplers) {
            this.borderColor[i].set(borderColor.subarray(0, 4), 0);
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    setTextureUnit(i, textureUnit) {
        if (0 <= i && i < this.numSamplers) {
            this.textureUnit[i] = textureUnit;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * 着色器源码赋值
     * @param program {string}
     */
    setProgram(program) {
        this.program = program;
    }

    setTextureUnits(textureUnits) {
        this.textureUnit = textureUnits.slice();
    }

    getInputName(i) {
        if (0 <= i && i < this.numInputs) {
            return this.inputName[i];
        }

        console.assert(false, 'Invalid index.');
        return '';
    }

    getInputType(i) {
        if (0 <= i && i < this.numInputs) {
            return this.inputType[i];
        }

        console.assert(false, 'Invalid index.');
        return Shader.VT_NONE;
    }

    /**
     * 获取属性语义
     * @param i {number}
     * @returns {number} Shader.VS_XXX
     */
    getInputSemantic(i) {
        if (0 <= i && i < this.numInputs) {
            return this.inputSemantic[i];
        }

        console.assert(false, 'Invalid index.');
        return Shader.VS_NONE;
    }

    getConstantFuncName(i) {
        if (0 <= i && i < this.numConstants) {
            return this.constantFuncName[i];
        }

        console.assert(false, 'Invalid index.');
        return '';
    }

    getConstantName(i) {
        if (0 <= i && i < this.numConstants) {
            return this.constantName[i];
        }

        console.assert(false, 'Invalid index.');
        return '';
    }

    getConstantType(i) {
        if (0 <= i && i < this.numConstants) {
            return this.constantType[i];
        }

        console.assert(false, 'Invalid index.');
        return 0;
    }

    getConstantSize(i) {
        if (0 <= i && i < this.numConstants) {
            return this.constantSize[i];
        }

        console.assert(false, 'Invalid index.');
        return 0;
    }

    getSamplerName(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.samplerName[i];
        }

        console.assert(false, 'Invalid index.');
        return '';
    }

    getSamplerType(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.samplerType[i];
        }

        console.assert(false, 'Invalid index.');
        return Shader.ST_NONE;
    }

    getFilter(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.filter[i];
        }

        console.assert(false, 'Invalid index.');
        return Shader.SF_NONE;
    }

    getCoordinate(i, dim) {
        if (0 <= i && i < this.numSamplers) {
            if (0 <= dim && dim < 3) {
                return this.coordinate[dim][i];
            }
            console.assert(false, 'Invalid dimension.');
            return Shader.SC_NONE;
        }

        console.assert(false, 'Invalid index.');
        return Shader.SC_NONE;
    }

    getLodBias(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.lodBias[i];
        }

        console.assert(false, 'Invalid index.');
        return 0;
    }

    getAnisotropy(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.anisotropy[i];
        }

        console.assert(false, 'Invalid index.');
        return 1;
    }

    getBorderColor(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.borderColor[i];
        }

        console.assert(false, 'Invalid index.');
        return new Float32Array(4);
    }

    getTextureUnit(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.textureUnit[i];
        }
        console.assert(false, 'Invalid index.');
        return 0;
    }

    getProgram() {
        return this.program;
    }

    load(inStream) {
        super.load(inStream);

        this.inputName = inStream.readStringArray();
        this.numInputs = this.inputName.length;
        this.inputType = inStream.readSizedEnumArray(this.numInputs);
        this.inputSemantic = inStream.readSizedEnumArray(this.numInputs);
        this.constantName = inStream.readStringArray();
        this.numConstants = this.constantName.length;
        this.numRegistersUsed = inStream.readSizedInt32Array(this.numConstants);

        this.samplerName = inStream.readStringArray();
        this.numSamplers = this.samplerName.length;
        this.samplerType = inStream.readSizedEnumArray(this.numSamplers);
        this.filter = inStream.readSizedEnumArray(this.numSamplers);
        this.coordinate[0] = inStream.readSizedEnumArray(this.numSamplers);
        this.coordinate[1] = inStream.readSizedEnumArray(this.numSamplers);
        this.coordinate[2] = inStream.readSizedEnumArray(this.numSamplers);
        this.lodBias = inStream.readSizedInt32Array(this.numSamplers);
        this.anisotropy = inStream.readSizedInt32Array(this.numSamplers);
        this.borderColor = inStream.readSizedFFloatArray(this.numSamplers);
        var maxProfiles = inStream.readUint32();

        this.profileOwner = inStream.readBool();
    }

    static factory(inStream) {
        var obj = new this();
        obj.load(inStream);
        return obj;
    }
}

// Maximum value for anisotropic filtering.
DECLARE_ENUM(Shader, {
    MAX_ANISOTROPY: 16
}, false);

// Types for the input and output variables of the shader program.
DECLARE_ENUM(Shader, {
    VT_NONE: 0,
    VT_BOOL: 1,
    VT_BVEC2: 2,
    VT_BVEC3: 3,
    VT_BVEC4: 4,
    VT_FLOAT: 5,
    VT_VEC2: 6,
    VT_VEC3: 7,
    VT_VEC4: 8,
    VT_MAT2: 9,
    VT_MAT3: 10,
    VT_MAT4: 11,
    VT_INT: 12,
    VT_IVEC2: 13,
    VT_IVEC3: 14,
    VT_IVEC4: 15
}, false);

// Semantics for the input and output variables of the shader program.
DECLARE_ENUM(Shader, {
    VS_NONE: 0,
    VS_POSITION: 1,        // ATTR0
    VS_BLENDWEIGHT: 2,        // ATTR1
    VS_NORMAL: 3,        // ATTR2
    VS_COLOR0: 4,        // ATTR3 (and for render targets)
    VS_COLOR1: 5,        // ATTR4 (and for render targets)
    VS_FOGCOORD: 6,        // ATTR5
    VS_PSIZE: 7,        // ATTR6
    VS_BLENDINDICES: 8,        // ATTR7
    VS_TEXCOORD0: 9,        // ATTR8
    VS_TEXCOORD1: 10,       // ATTR9
    VS_TEXCOORD2: 11,       // ATTR10
    VS_TEXCOORD3: 12,       // ATTR11
    VS_TEXCOORD4: 13,       // ATTR12
    VS_TEXCOORD5: 14,       // ATTR13
    VS_TEXCOORD6: 15,       // ATTR14
    VS_TEXCOORD7: 16,       // ATTR15
    VS_FOG: 17,       // same as L5.Shader.VS_FOGCOORD (ATTR5)
    VS_TANGENT: 18,       // same as L5.Shader.VS_TEXCOORD6 (ATTR14)
    VS_BINORMAL: 19,       // same as L5.Shader.VS_TEXCOORD7 (ATTR15)
    VS_COLOR2: 20,       // support for multiple render targets
    VS_COLOR3: 21,       // support for multiple render targets
    VS_DEPTH0: 22,       // support for multiple render targets
    VS_QUANTITY: 23
}, false);

// The sampler type for interpreting the texture assigned to the sampler.
DECLARE_ENUM(Shader, {
    ST_NONE: 0,
    ST_2D: 1,
    ST_3D: 2,
    ST_CUBE: 3,
    ST_2D_ARRAY: 4
}, false);


// Texture coordinate modes for the samplers.
DECLARE_ENUM(Shader, {
    SC_NONE: 0,
    SC_REPEAT: 1,
    SC_MIRRORED_REPEAT: 2,
    SC_CLAMP_EDGE: 3
}, false);


// Filtering modes for the samplers.
DECLARE_ENUM(Shader, {
    SF_NONE: 0,
    SF_NEAREST: 1,
    SF_LINEAR: 2,
    SF_NEAREST_MIPMAP_NEAREST: 3,
    SF_NEAREST_MIPMAP_LINEAR: 4,
    SF_LINEAR_MIPMAP_NEAREST: 5,
    SF_LINEAR_MIPMAP_LINEAR: 6
});

/**
 * Shader 底层包装
 * @author lonphy
 * @version 2.0
 */
class GLShader {
    /**
     * @param {Shader} shader
     * @param {ShaderParameters} parameters
     * @param {number} maxSamplers
     * @param {Renderer} renderer
     * @param {number} currentSS RendererData::SamplerState
     */
    setSamplerState(renderer, shader, parameters, maxSamplers, currentSS) {
        let gl = renderer.gl;

        let numSamplers = shader.numSamplers;
        if (numSamplers > maxSamplers) {
            numSamplers = maxSamplers;
        }

        for (let i = 0; i < numSamplers; ++i) {
            let type = shader.getSamplerType(i);
            let target = mapping.TextureTarget[type];
            let textureUnit = shader.getTextureUnit(i);
            const texture = parameters.getTexture(i);
            let current = currentSS[textureUnit];
            let wrap0, wrap1;

            switch (type) {
                case Shader.ST_2D:
                    {
                        renderer._enableTexture2D(texture, textureUnit);
                        current.getCurrent(renderer, target);

                        wrap0 = mapping.WrapMode[shader.getCoordinate(i, 0)];
                        if (wrap0 != current.wrap[0]) {
                            current.wrap[0] = wrap0;
                            gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap0);
                        }

                        wrap1 = mapping.WrapMode[shader.getCoordinate(i, 1)];
                        if (wrap1 != current.wrap[1]) {
                            current.wrap[1] = wrap1;
                            gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap1);
                        }
                        break;
                    }
                case Shader.ST_CUBE:
                    {
                        renderer._enableTextureCube(texture, textureUnit);
                        current.getCurrent(renderer, target);

                        wrap0 = mapping.WrapMode[shader.getCoordinate(i, 0)];
                        if (wrap0 != current.wrap[0]) {
                            current.wrap[0] = wrap0;
                            gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap0);
                        }

                        wrap1 = mapping.WrapMode[shader.getCoordinate(i, 1)];
                        if (wrap1 != current.wrap[1]) {
                            current.wrap[1] = wrap1;
                            gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap1);
                        }
                        break;
                    }
                default:
                    console.assert(false, 'Invalid sampler type');
                    break;
            }

            // Set the anisotropic filtering value.
            const maxAnisotropy = Shader.MAX_ANISOTROPY;
            let anisotropy = shader.getAnisotropy(i);
            if (anisotropy < 1 || anisotropy > maxAnisotropy) {
                anisotropy = 1;
            }
            if (anisotropy != current.anisotropy) {
                current.anisotropy = anisotropy;
                gl.texParameterf(target, mapping.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
            }

            // Set the magfilter mode.
            let filter = shader.getFilter(i);
            if (filter === Shader.SF_NEAREST) {
                if (gl.NEAREST !== current.magFilter) {
                    current.magFilter = gl.NEAREST;
                    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                }
            } else {
                if (gl.LINEAR != current.magFilter) {
                    current.magFilter = gl.LINEAR;
                    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                }
            }

            // Set the minfilter mode.
            let minFilter = mapping.TextureFilter[filter];
            if (minFilter != current.minFilter) {
                current.minFilter = minFilter;
                gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minFilter);
            }
        }
    }

    /**
     * @param {Shader} shader
     * @param {ShaderParameters} parameters
     * @param {Renderer} renderer
     * @param {number} maxSamplers
     */
    disableTexture(renderer, shader, parameters, maxSamplers) {
        let numSamplers = shader.numSamplers;
        if (numSamplers > maxSamplers) {
            numSamplers = maxSamplers;
        }

        let type, textureUnit, texture;

        for (let i = 0; i < numSamplers; ++i) {
            type = shader.getSamplerType(i);
            textureUnit = shader.getTextureUnit(i);
            texture = parameters.getTexture(i);

            switch (type) {
                case Shader.ST_2D:
                    {
                        renderer._disableTexture2D(texture, textureUnit);
                        break;
                    }
                case Shader.ST_CUBE:
                    {
                        renderer._disableTextureCube(texture, textureUnit);
                        break;
                    }
                default:
                    console.assert(false, "Invalid sampler type\n");
                    break;
            }
        }
    }
}

/**
 * VertexShader 底层包装
 *
 * @author lonphy
 * @version 2.0
 */
class GLVertexShader extends GLShader {

    /**
     * @param {Renderer} renderer 
     * @param {Shader} shader 
     */
    constructor(renderer, shader) {
        super();
        var gl = renderer.gl;
        this.shader = gl.createShader(gl.VERTEX_SHADER);

        var programText = shader.getProgram();

        gl.shaderSource(this.shader, programText);
        gl.compileShader(this.shader);

        console.assert(
            gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
            gl.getShaderInfoLog(this.shader)
        );
    }
    /**
     * @param shader {VertexShader}
     * @param mapping {Map}
     * @param parameters {ShaderParameters}
     * @param renderer {Renderer}
     */
    enable (renderer, mapping, shader, parameters) {
        var gl = renderer.gl;

        // 更新uniform 变量

        // step1. 遍历顶点着色器常量
        var numConstants = shader.numConstants;
        for (var i = 0; i < numConstants; ++i) {
            var locating = mapping.get(shader.getConstantName(i));
            var funcName = shader.getConstantFuncName(i);
            var size = shader.getConstantSize(i);
            var data = parameters.getConstant(i).data;
            if (size > 4) {
                gl[funcName](locating, false, data);
            } else {
                gl[funcName](locating, data.subarray(0, size));
            }
        }

        this.setSamplerState(renderer, shader, parameters, renderer.data.maxVShaderImages, renderer.data.currentSS);
    }
    /**
     * @param shader {VertexShader}
     * @param parameters {ShaderParameters}
     * @param renderer {Renderer}
     */
    disable (renderer, shader, parameters) {
        this.disableTexture(renderer, shader, parameters, renderer.data.maxVShaderImages);
    }
}

/**
 * FragShader 底层包装
 * 
 * @author lonphy
 * @version 2.0
 */
class GLFragShader extends GLShader {

    /**
     * @param {Renderer} renderer 
     * @param {VertexShader} shader 
     */
    constructor(renderer, shader) {
        super();
        let gl = renderer.gl;
        this.shader = gl.createShader(gl.FRAGMENT_SHADER);

        let programText = shader.getProgram();

        gl.shaderSource(this.shader, programText);
        gl.compileShader(this.shader);

        console.assert(
            gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
            gl.getShaderInfoLog(this.shader)
        );
    }

    /**
     * 释放持有的GL资源
     * @param {WebGLRenderingContext} gl
     */
    free(gl) {
        gl.deleteShader(this.shader);
        delete this.shader;
    }

    /**
     * @param {Renderer} renderer
     * @param {Map} mapping
     * @param {FragShader} shader
     * @param {ShaderParameters} parameters
     */
    enable(renderer, mapping, shader, parameters) {
        let gl = renderer.gl;
        // step1. 遍历顶点着色器常量
        let numConstants = shader.numConstants;
        for (let i = 0; i < numConstants; ++i) {
            let locating = mapping.get(shader.getConstantName(i));
            let funcName = shader.getConstantFuncName(i);
            let size = shader.getConstantSize(i);
            let data = parameters.getConstant(i).data;
            if (size > 4) {
                gl[funcName](locating, false, data);
            } else {
                gl[funcName](locating, data.subarray(0, size));
            }
        }

        this.setSamplerState(renderer, shader, parameters, renderer.data.maxFShaderImages, renderer.data.currentSS);
    }

    /**
     * @param renderer {Renderer}
     * @param shader {FragShader}
     * @param parameters {ShaderParameters}
     */
    disable(renderer, shader, parameters) {
        let gl = renderer.gl;
        this.disableTexture(renderer, shader, parameters, renderer.data.maxFShaderImages);
    }
}

/**
 * VertexFormat 顶点格式
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {VertexFormat}
 * @extends {D3Object}
 */
class VertexFormat$1 extends D3Object {

    /**
     * @param numAttributes {number} 属性数量
     */
    constructor(numAttributes) {
        console.assert(numAttributes >= 0, 'Number of attributes must be positive');
        super();

        const MAX_ATTRIBUTES = VertexFormat$1.MAX_ATTRIBUTES;

        this.numAttributes = numAttributes;
        this.stride = 0;

        this.elements = new Array(MAX_ATTRIBUTES);
        for (var i = 0; i < MAX_ATTRIBUTES; ++i) {
            this.elements[i] = new VertexFormat$1.Element(0, 0, VertexFormat$1.AT_NONE, VertexFormat$1.AU_NONE, 0);
        }
    }


    /**
     * 创建顶点格式快捷函数
     * @param numAttributes {number} 顶点元素数量
     * @param args {Array}
     *
     * @returns {VertexFormat}
     */
    static create(numAttributes,    ...args/*, usage1, type1, usageIndex1, usage2,...*/) {
        var vf = new VertexFormat$1(numAttributes);

        var offset = 0;
        var start = 0;
        const TYPE_SIZE = VertexFormat$1.TYPE_SIZE;

        for (var i = 0; i < numAttributes; ++i, start += 3) {
            var usage = args[start];
            var type = args[start + 1];
            var usageIndex = args[start + 2];
            vf.setAttribute(i, 0, offset, type, usage, usageIndex);

            offset += TYPE_SIZE[type];
        }
        vf.setStride(offset);

        return vf;
    }

    /**
     * 设置指定位置顶点元素
     * @param attribute {number}
     * @param streamIndex {number}
     * @param offset {number}
     * @param type {number} AttributeType
     * @param usage {number} AttributeUsage
     * @param usageIndex {number}
     */
    setAttribute(attribute, streamIndex, offset, type, usage, usageIndex) {
        console.assert(0 <= attribute && attribute < this.numAttributes, 'Invalid index in SetAttribute');

        var element = this.elements[attribute];
        element.streamIndex = streamIndex;
        element.offset = offset;
        element.type = type;
        element.usage = usage;
        element.usageIndex = usageIndex;
    }

    /**
     * 获取指定位置顶点元素
     * @param attribute {number} 顶点元素索引
     * @returns {L5.VertexFormat.Element}
     */
    getAttribute(attribute) {
        console.assert(0 <= attribute && attribute < this.numAttributes, 'Invalid index in GetAttribute');
        return this.elements[attribute].clone();
    }

    /**
     * 获取指定位置顶点元素
     * @param stride {number} 顶点步幅
     */
    setStride(stride) {
        console.assert(0 < stride, 'Stride must be positive');
        this.stride = stride;
    }

    /**
     * 根据用途获取顶点元素位置
     * @param usage {number} 用途，参考L5.VertexFormat.AU_XXX
     * @param usageIndex {number}
     * @returns {number}
     */
    getIndex(usage, usageIndex=0) {
        usageIndex = usageIndex || 0;

        for (var i = 0; i < this.numAttributes; ++i) {
            if (this.elements[i].usage === usage &&
                this.elements[i].usageIndex === usageIndex
            ) {
                return i;
            }
        }

        return -1;
    }

    /**
     * @param attribute {number}
     * @returns {number}
     */
    getStreamIndex(attribute) {
        if (0 <= attribute && attribute < this.numAttributes) {
            return this.elements[attribute].streamIndex;
        }
        console.assert(false, 'Invalid index in getStreamIndex');
        return 0;
    }

    /**
     * 获取顶点元素偏移
     * @param attribute {number} 用途，参考L5.VertexFormat.AU_XXX
     * @returns {number}
     */
    getOffset(attribute) {
        if (0 <= attribute && attribute < this.numAttributes) {
            return this.elements[attribute].offset;
        }
        console.assert(false, 'Invalid index in getOffset');
        return 0;
    }

    /**
     * 获取顶点元素数据类型
     * @param attribute {number} 顶点索引
     * @returns {number} L5.VertexFormat.AT_XXX
     */
    getAttributeType(attribute) {
        if (0 <= attribute && attribute < this.numAttributes) {
            return this.elements[attribute].type;
        }
        console.assert(false, 'Invalid index in GetAttributeType');
        return VertexFormat$1.AT_NONE;
    }

    /**
     * 填充VBA 属性
     * @param usage {number} 用途, 参考 L5.VertexFormat.AU_XXX
     * @param attr {L5.VBAAttr}
     * @param usageIndex {number}
     */
    fillVBAttr(usage, attr, usageIndex=0) {
        let index = this.getIndex(usage);
        if (index >= 0) {
            let type = this.getAttributeType(index, usageIndex);
            attr.offset = this.getOffset(index);
            attr.eType = VertexFormat$1.TYPE_CST[type];
            attr.eNum = VertexFormat$1.NUM_COMPONENTS[type];
            attr.cSize = VertexFormat$1.TYPE_SIZE[type];
            attr.wFn = 'set'+ attr.eType.name.replace('Array', '');
            attr.rFn = 'get'+ attr.eType.name.replace('Array', '');
        }
    }

    getAttributeUsage(attribute) {
        if (0 <= attribute && attribute < this.numAttributes) {
            return this.elements[attribute].usage;
        }
        console.assert(false, 'Invalid index in GetAttributeUsage');
        return VertexFormat$1.AU_NONE;
    }

    getUsageIndex(attribute) {
        if (0 <= attribute && attribute < this.numAttributes) {
            return this.elements[attribute].usageIndex;
        }
        console.assert(false, 'Invalid index in getUsageIndex');
        return 0;
    }

    /**
     * 获取顶点元素类型单位字节
     * @param type {number} 参考L5.AT_XXX
     * @returns {number}
     */
    static getComponentSize(type) {
        return VertexFormat$1.COMPONENTS_SIZE[type];
    }

    /**
     * 获取顶点元素类型单位个数
     * @param type {number} 参考L5.AT_XXX
     * @returns {number}
     */
    static getNumComponents(type) {
        return VertexFormat$1.NUM_COMPONENTS[type];
    }

    /**
     * 获取顶点元素类型所占字节
     * @param type {number} 参考L5.AT_XXX
     * @returns {number}
     */
    static getTypeSize(type) {
        return VertexFormat$1.TYPE_SIZE[type];
    }

    static getUsageString(u) {
        return ['未使用', '顶点坐标', '法线', '切线', '双切线', '纹理坐标', '颜色', '混合索引', '混合权重', '雾坐标', '点尺寸'][(u >= 0 && u <= 10) ? u : 0];
    }

    static getTypeString(t) {
        return ['NONE', 'FLOAT1', 'FLOAT2', 'FLOAT3', 'FLOAT4', 'UBYTE4', 'SHORT1', 'SHORT2', 'SHORT4'][(t >= 0 && t <= 8) ? t : 0];
    }

    debug() {
        console.log('================ VertexFormat 类型 ===============');
        console.log('  属性个数:', this.numAttributes, '步幅:', this.stride, '字节');
        for (var i = 0, l = this.numAttributes; i < l; ++i) {
            this.elements[i].debug();
        }
        console.log('================ VertexFormat 类型 ===============');
    }

    /**
     * @param inStream {InStream}
     */
    load(inStream) {
        super.load(inStream);

        this.numAttributes = inStream.readUint32();
        const MAX_ATTRIBUTES = VertexFormat$1.MAX_ATTRIBUTES;

        for (var i = 0; i < MAX_ATTRIBUTES; ++i) {
            this.elements[i].streamIndex = inStream.readUint32();
            this.elements[i].offset = inStream.readUint32();
            this.elements[i].type = inStream.readEnum();
            this.elements[i].usage = inStream.readEnum();
            this.elements[i].usageIndex = inStream.readUint32();
        }

        this.stride = inStream.readUint32();
    }

    /**
     * 文件解析工厂方法
     * @param inStream {InStream}
     * @returns {VertexFormat}
     */
    static factory(inStream) {
        var obj = new VertexFormat$1(0);
        obj.load(inStream);
        return obj;
    }
}


D3Object.Register('L5.VertexFormat', VertexFormat$1.factory);

/**
 * 顶点元素构造
 * @class
 *
 * @param streamIndex
 * @param offset
 * @param type
 * @param usage
 * @param usageIndex
 * @type Element
 */
class Element {
    constructor(streamIndex, offset, type, usage, usageIndex) {
        this.streamIndex = streamIndex || 0;
        this.offset = offset || 0;
        this.type = type || VertexFormat$1.AT_NONE;
        this.usage = usage || VertexFormat$1.AU_NONE;
        this.usageIndex = usageIndex || 0;
    }

    clone() {
        return new Element
        (
            this.streamIndex,
            this.offset,
            this.type,
            this.usage,
            this.usageIndex
        );
    }

    debug() {
        console.log('------------ VertexFormat.Element 偏移:', this.offset, '字节 ---------------');
        console.log('  用途:', VertexFormat$1.getUsageString(this.usage));
        console.log('  类型:', VertexFormat$1.getTypeString(this.type));
    }
}
VertexFormat$1.Element =Element;

// 顶点属性最大个数
DECLARE_ENUM(VertexFormat$1, {
    MAX_ATTRIBUTES:   16,
    MAX_TCOORD_UNITS: 8,
    MAX_COLOR_UNITS:  2
}, false);

// 顶点属性数据类型
DECLARE_ENUM(VertexFormat$1, {
    AT_NONE:   0x00,
    AT_FLOAT1: 0x01,
    AT_FLOAT2: 0x02,
    AT_FLOAT3: 0x03,
    AT_FLOAT4: 0x04,
    AT_HALF1:  0x05,
    AT_HALF2:  0x06,
    AT_HALF3:  0x07,
    AT_HALF4:  0x08,
    AT_UBYTE4: 0x09,
    AT_SHORT1: 0x0a,
    AT_SHORT2: 0x0b,
    AT_SHORT4: 0x0c
}, false);

// 属性用途
DECLARE_ENUM(VertexFormat$1, {
    AU_NONE:         0,
    AU_POSITION:     1,   // 顶点     -> shader location 0
    AU_NORMAL:       2,   // 法线     -> shader location 2
    AU_TANGENT:      3,   // 切线     -> shader location 14
    AU_BINORMAL:     4,   // 双切线   -> shader location 15
    AU_TEXCOORD:     5,   // 纹理坐标  -> shader location 8-15
    AU_COLOR:        6,   // 颜色     -> shader location 3-4
    AU_BLENDINDICES: 7,   // 混合索引  -> shader location 7
    AU_BLENDWEIGHT:  8,   // 混合权重  -> shader location 1
    AU_FOGCOORD:     9,   // 雾坐标    -> shader location 5
    AU_PSIZE:        10   // 点大小    -> shader location 6
}, false);

// 属性类型的 构造, 尺寸 字节
DECLARE_ENUM(VertexFormat$1, {
    TYPE_CST: [
        null,          // AT_NONE
        Float32Array,  // AT_FLOAT1
        Float32Array,  // AT_FLOAT2
        Float32Array,  // AT_FLOAT3
        Float32Array,  // AT_FLOAT4
        Uint8Array,    // AT_UBYTE4
        Uint16Array,   // AT_SHORT1
        Uint16Array,   // AT_SHORT2
        Uint16Array    // AT_SHORT4
    ],
    TYPE_SIZE:       [
        0,  // AT_NONE
        4,  // AT_FLOAT1
        8,  // AT_FLOAT2
        12, // AT_FLOAT3
        16, // AT_FLOAT4
        4,  // AT_UBYTE4
        2,  // AT_SHORT1
        4,  // AT_SHORT2
        8   // AT_SHORT4
    ],
    NUM_COMPONENTS:  [
        0,  // AT_NONE
        1,  // AT_FLOAT1
        2,  // AT_FLOAT2
        3,  // AT_FLOAT3
        4,  // AT_FLOAT4
        4,  // AT_UBYTE4
        1,  // AT_SHORT1
        2,  // AT_SHORT2
        4   // AT_SHORT4
    ]
});

/**
 * VertexFormat 底层包装
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {GLVertexFormat}
 */
class GLVertexFormat {
    /**
     * @param {Renderer} renderer
     * @param {VertexFormat} format
     */
    constructor(renderer, format) {
        this.stride = format.stride;

        let type;

        var i = format.getIndex(VertexFormat$1.AU_POSITION);
        if (i >= 0) {
            this.hasPosition = 1;
            type = format.getAttributeType(i);
            this.positionType = mapping.AttributeType[type]; // 属性元素类型
            this.positionChannels = mapping.AttributeChannels[type]; // 属性元素数量
            this.positionOffset = format.getOffset(i);
        } else {
            this.hasPosition = 0;
            this.positionChannels = 0;  // 属性元素数量
            this.positionType = 0;  // 属性类型
            this.positionOffset = 0;  // 属性偏移量
        }

        i = format.getIndex(VertexFormat$1.AU_NORMAL);
        if (i >= 0) {
            this.hasNormal = 1;
            type = format.getAttributeType(i);
            this.normalType = mapping.AttributeType[type];
            this.normalChannels = mapping.AttributeChannels[type];
            this.normalOffset = format.getOffset(i);
        } else {
            this.hasNormal = 0;
            this.normalChannels = 0;
            this.normalType = 0;
            this.normalOffset = 0;
        }

        i = format.getIndex(VertexFormat$1.AU_TANGENT);
        if (i >= 0) {
            this.hasTangent = 1;
            type = format.getAttributeType(i);
            this.tangentType = mapping.AttributeType[type];
            this.tangentChannels = mapping.AttributeChannels[type];
            this.tangentOffset = format.getOffset(i);
        } else {
            this.hasTangent = 0;
            this.tangentChannels = 0;
            this.tangentType = 0;
            this.tangentOffset = 0;
        }

        i = format.getIndex(VertexFormat$1.AU_BINORMAL);
        if (i >= 0) {
            this.hasBinormal = 1;
            type = format.getAttributeType(i);
            this.binormalType = mapping.AttributeType[type];
            this.binormalChannels = mapping.AttributeChannels[type];
            this.binormalOffset = format.getOffset(i);
        }
        else {
            this.hasBinormal = 0;
            this.binormalType = 0;
            this.binormalChannels = 0;
            this.binormalOffset = 0;
        }

        var unit;
        const AM_MAX_TCOORD_UNITS = VertexFormat$1.MAX_TCOORD_UNITS;

        this.hasTCoord = new Array(AM_MAX_TCOORD_UNITS);
        this.tCoordChannels = new Array(AM_MAX_TCOORD_UNITS);
        this.tCoordType = new Array(AM_MAX_TCOORD_UNITS);
        this.tCoordOffset = new Array(AM_MAX_TCOORD_UNITS);

        for (unit = 0; unit < AM_MAX_TCOORD_UNITS; ++unit) {
            i = format.getIndex(VertexFormat$1.AU_TEXCOORD, unit);
            if (i >= 0) {
                this.hasTCoord[unit] = 1;
                type = format.getAttributeType(i);
                this.tCoordType[unit] = mapping.AttributeType[type];
                this.tCoordChannels[unit] = mapping.AttributeChannels[type];
                this.tCoordOffset[unit] = format.getOffset(i);
            } else {
                this.hasTCoord[unit] = 0;
                this.tCoordType[unit] = 0;
                this.tCoordChannels[unit] = 0;
                this.tCoordOffset[unit] = 0;
            }
        }

        const AM_MAX_COLOR_UNITS = VertexFormat$1.MAX_COLOR_UNITS;
        this.hasColor = new Array(AM_MAX_COLOR_UNITS);
        this.colorChannels = new Array(AM_MAX_COLOR_UNITS);
        this.colorType = new Array(AM_MAX_COLOR_UNITS);
        this.colorOffset = new Array(AM_MAX_COLOR_UNITS);
        for (unit = 0; unit < AM_MAX_COLOR_UNITS; ++unit) {
            i = format.getIndex(VertexFormat$1.AU_COLOR, unit);
            if (i >= 0) {
                this.hasColor[unit] = 1;
                type = format.getAttributeType(i);
                this.colorType[unit] = mapping.AttributeType[type];
                this.colorChannels[unit] = mapping.AttributeChannels[type];
                this.colorOffset[unit] = format.getOffset(i);
            } else {
                this.hasColor[unit] = 0;
                this.colorType[unit] = 0;
                this.colorChannels[unit] = 0;
                this.colorOffset[unit] = 0;
            }
        }

        i = format.getIndex(VertexFormat$1.AU_BLENDINDICES);
        if (i >= 0) {
            this.hasBlendIndices = 1;
            type = format.getAttributeType(i);
            this.blendIndicesChannels = mapping.AttributeChannels[type];
            this.blendIndicesType = mapping.AttributeType[type];
            this.blendIndicesOffset = format.getOffset(i);
        }
        else {
            this.hasBlendIndices = 0;
            this.blendIndicesType = 0;
            this.blendIndicesChannels = 0;
            this.blendIndicesOffset = 0;
        }

        i = format.getIndex(VertexFormat$1.AU_BLENDWEIGHT);
        if (i >= 0) {
            this.hasBlendWeight = 1;
            type = format.getAttributeType(i);
            this.blendWeightType = mapping.AttributeType[type];
            this.blendWeightChannels = mapping.AttributeChannels[type];
            this.blendWeightOffset = format.getOffset(i);
        }
        else {
            this.hasBlendWeight = 0;
            this.blendWeightType = 0;
            this.blendWeightChannels = 0;
            this.blendWeightOffset = 0;
        }

        i = format.getIndex(VertexFormat$1.AU_FOGCOORD);
        if (i >= 0) {
            this.hasFogCoord = 1;
            type = format.getAttributeType(i);
            this.fogCoordType = mapping.AttributeType[type];
            this.fogCoordChannels = mapping.AttributeChannels[type];
            this.fogCoordOffset = format.getOffset(i);
        } else {
            this.hasFogCoord = 0;
            this.fogCoordChannels = 0;
            this.fogCoordType = 0;
            this.fogCoordOffset = 0;
        }

        i = format.getIndex(VertexFormat$1.AU_PSIZE);
        if (i >= 0) {
            this.hasPSize = 1;
            type = format.getAttributeType(i);
            this.pSizeType = mapping.AttributeType[type];
            this.pSizeChannels = mapping.AttributeChannels[type];
            this.pSizeOffset = format.getOffset(i);
        } else {
            this.hasPSize = 0;
            this.pSizeType = 0;
            this.pSizeChannels = 0;
            this.pSizeOffset = 0;
        }
    }

    /**
     * @param renderer {Renderer}
     */
    enable(renderer) {
        // Use the enabled vertex buffer for data pointers.

        let stride = this.stride;
        let gl = renderer.gl;

        if (this.hasPosition) {
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, this.positionChannels, this.positionType, false, stride, this.positionOffset);
        }

        if (this.hasNormal) {
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(2, this.normalChannels, this.normalType, false, stride, this.normalOffset);
        }

        if (this.hasTangent) {
            gl.enableVertexAttribArray(14);
            gl.vertexAttribPointer(14, this.tangentChannels, this.tangentType, false, stride, this.tangentOffset);
        }

        if (this.hasBinormal) {
            gl.enableVertexAttribArray(15);
            gl.vertexAttribPointer(15, this.binormalChannels, this.binormalType, false, stride, this.normalOffset);
        }

        let unit;
        for (unit = 0; unit < VertexFormat$1.MAX_TCOORD_UNITS; ++unit) {
            if (this.hasTCoord[unit]) {
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.enableVertexAttribArray(8 + unit);
                gl.vertexAttribPointer(8 + unit, this.tCoordChannels[unit], this.tCoordType[unit], false, stride, this.tCoordOffset[unit]);
            }
        }

        if (this.hasColor[0]) {
            gl.enableVertexAttribArray(3);
            gl.vertexAttribPointer(3, this.colorChannels[0], this.colorType[0], false, stride, this.colorOffset[0]);
        }

        if (this.hasColor[1]) {
            gl.enableVertexAttribArray(4);
            gl.vertexAttribPointer(4, this.colorChannels[1], this.colorType[1], false, stride, this.colorOffset[1]);
        }

        if (this.hasBlendIndices) {
            gl.enableVertexAttribArray(7);
            gl.vertexAttribPointer(7, this.blendIndicesChannels, this.blendIndicesType, false, stride, this.blendIndicesOffset);
        }

        if (this.hasBlendWeight) {
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, this.blendWeightChannels, this.blendWeightType, false, stride, this.blendWeightOffset);
        }

        if (this.hasFogCoord) {
            gl.enableVertexAttribArray(5);
            gl.vertexAttribPointer(5, this.fogCoordChannels, this.fogCoordType, false, stride, this.fogCoordOffset);
        }

        if (this.hasPSize) {
            gl.enableVertexAttribArray(6);
            gl.vertexAttribPointer(6, this.pSizeChannels, this.pSizeType, false, stride, this.pSizeOffset);
        }
    }

    /**
     * @param {Renderer} renderer
     */
    disable(renderer) {
        var gl = renderer.gl;
        if (this.hasPosition) {
            gl.disableVertexAttribArray(0);
        }

        if (this.hasNormal) {
            gl.disableVertexAttribArray(2);
        }

        if (this.hasTangent) {
            gl.disableVertexAttribArray(14);
        }

        if (this.hasBinormal) {
            gl.disableVertexAttribArray(15);
        }

        var unit;
        for (unit = 0; unit < VertexFormat$1.MAX_TCOORD_UNITS; ++unit) {
            if (this.hasTCoord[unit]) {
                gl.disableVertexAttribArray(8 + unit);
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
        }

        if (this.hasColor[0]) {
            gl.disableVertexAttribArray(3);
        }

        if (this.hasColor[1]) {
            gl.disableVertexAttribArray(4);
        }

        if (this.hasBlendIndices) {
            gl.disableVertexAttribArray(7);
        }

        if (this.hasBlendWeight) {
            gl.disableVertexAttribArray(1);
        }

        if (this.hasFogCoord) {
            gl.disableVertexAttribArray(5);
        }

        if (this.hasPSize) {
            gl.disableVertexAttribArray(6);
        }
    }
}

/**
 * VertexBuffer 底层包装
 *
 * @author lonphy
 * @version 2.0
 */
class GLVertexBuffer {

    /**
     * @param {Renderer} renderer 
     * @param {VertexBuffer} buffer
     */
    constructor(renderer, buffer) {
        let gl      = renderer.gl;
        this.buffer = gl.createBuffer ();
        gl.bindBuffer (gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData (gl.ARRAY_BUFFER, buffer.getData (), mapping.BufferUsage[ buffer.usage ]);
        gl.bindBuffer (gl.ARRAY_BUFFER, null);
    }

    /**
     * @param {Renderer} renderer 
     */
    enable (renderer) {
        let gl = renderer.gl;
        gl.bindBuffer (gl.ARRAY_BUFFER, this.buffer);
    }

    /**
     * @param {Renderer} renderer 
     */
    disable (renderer) {
        let gl = renderer.gl;
        gl.bindBuffer (gl.ARRAY_BUFFER, null);
    }

    /**
     * @param {Renderer} renderer 
     * @param {VertexBuffer} buffer 
     */
    update (renderer, buffer) {
        let gl = renderer.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer.getData(), mapping.BufferUsage[buffer.usage]);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}

/**
 * IndexBuffer 底层包装
 *
 * @author lonphy
 * @version 2.0
 */
class GLIndexBuffer {

    /**
     * @param {Renderer} renderer 
     * @param {Buffer} buffer 
     */
    constructor(renderer, buffer) {
        let gl = renderer.gl;
        this.buffer = gl.createBuffer();
        let dataType = buffer.elementSize == 2 ? Uint16Array : Uint32Array;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new dataType(buffer.getData().buffer), mapping.BufferUsage[buffer.usage]);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    /**
     * @param {Renderer} renderer
     */
    enable(renderer) {
        let gl = renderer.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }
    /**
     * @param {Renderer} renderer
     */
    disable(renderer) {
        let gl = renderer.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}

class GLTexture2D {
    constructor(renderer, texture) {
        let gl = renderer.gl;
        let _format = texture.format;
        this.internalFormat = mapping.TextureFormat[_format];

        this.format = mapping.TextureFormat[_format];
        this.type = mapping.TextureType[_format];
        this.hasMipMap = texture.hasMipmaps;

        this.width = texture.width;
        this.height = texture.height;
        this.depth = texture.depth;

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0); // 纹理垂直翻转

        // Create a texture structure.
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        let width, height;
        // Create the mipmap level structures.  No image initialization occurs.
        // this.isCompressed = texture.isCompressed();
        // if (this.isCompressed) {
        // for (level = 0; level < levels; ++level) {
        //     width = this.dimension[0][level];
        //     height = this.dimension[1][level];
        //
        //     gl.compressedTexImage2D(
        //         gl.TEXTURE_2D,
        //         level,
        //         this.internalFormat,
        //         width,
        //         height,
        //         0,
        //         this.numLevelBytes[level],
        //         0);
        // }
        //} else {
        gl.texImage2D(
            gl.TEXTURE_2D,             // target
            0,                         // level
            this.internalFormat,       // internalformat
            this.width,      // width
            this.height,      // height
            0,                         // border
            this.format,               // format
            this.type,                 // type
            texture.getData()         // pixels
        );
        if (this.hasMipMap) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        //}
    }

    update(renderer, textureUnit, data) {
        let gl = renderer.gl;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(
            gl.TEXTURE_2D,             // target
            0,                         // level
            this.internalFormat,       // internalformat
            this.width,      // width
            this.height,      // height
            0,                         // border
            this.format,               // format
            this.type,                 // type
            data         // pixels
        );
        if (this.hasMipMap) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    }
    enable(renderer, textureUnit) {
        let gl = renderer.gl;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
    disable(renderer, textureUnit) {
        let gl = renderer.gl;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

/**
 * TextureCube 底层封装
 * @author lonphy
 * @version 2.0
 */

/**
 * 渲染目标
 * @author lonphy
 * @version 2.0
 */

class AlphaState extends D3Object {

    constructor() {
        super();
        this.blendEnabled = false;
        this.srcBlend = AlphaState.BM_SRC_ALPHA;
        this.dstBlend = AlphaState.BM_ONE_MINUS_SRC_ALPHA;
        this.constantColor = new Float32Array([0, 0, 0, 0]);
    }

    load(inStream) {
        super.load(inStream);
        this.blendEnabled = inStream.readBool();
        this.srcBlend = inStream.readEnum();
        // todo: remove unused code.
        if (this.srcBlend > 1) {
            this.srcBlend += 2;
        }

        this.dstBlend = inStream.readEnum();
        // todo: remove unused code.
        if (this.dstBlend >= 8) {
            this.dstBlend += 3;
        }
        else if (this.dstBlend >= 4) {
            this.dstBlend += 2;
        }
        this.constantColor = new Float32Array(inStream.readFloat32Range(4));
    }

    /**
     * 文件解析工厂方法
     * @param {InStream} inStream
     * @returns {AlphaState}
     */
    static factory(inStream) {
        var obj = new AlphaState();
        obj.load(inStream);
        return obj;
    }

}

/* 混合模式 */
DECLARE_ENUM(AlphaState, {
    BM_ZERO: 0,
    BM_ONE: 1,
    BM_SRC_COLOR: 2, // can be assign to AlphaState.dstBlend only
    BM_ONE_MINUS_SRC_COLOR: 3, // can be assign to AlphaState.dstBlend only
    BM_DST_COLOR: 4, // can be assign to AlphaState.srcBlend only
    BM_ONE_MINUS_DST_COLOR: 5, // can be assign to AlphaState.srcBlend only
    BM_SRC_ALPHA: 6,
    BM_ONE_MINUS_SRC_ALPHA: 7,
    BM_DST_ALPHA: 8,
    BM_ONE_MINUS_DST_ALPHA: 9,
    BM_SRC_ALPHA_SATURATE: 10, // can be assign to AlphaState.srcBlend only
    BM_CONSTANT_COLOR: 11,
    BM_ONE_MINUS_CONSTANT_COLOR: 12,
    BM_CONSTANT_ALPHA: 13,
    BM_ONE_MINUS_CONSTANT_ALPHA: 14
});

D3Object.Register('L5.AlphaState', AlphaState.factory);

/**
 * 剔除表面 状态
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {CullState}
 * @extends {D3Object}
 */
class CullState extends D3Object{

    constructor(){
        super();
        this.enabled = true;
        this.CCWOrder = true;
    }

    load(inStream) {
        super.load(inStream);
        this.enabled = inStream.readBool();
        this.CCWOrder = inStream.readBool();
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeBool(this.enabled);
        outStream.writeBool(this.CCWOrder);
    }

    /**
     * 文件解析工厂方法
     * @param inStream {InStream}
     * @returns {CullState}
     */
    static factory(inStream) {
        var obj = new CullState();
        obj.enabled = false;
        obj.CCWOrder = false;
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('L5.CullState', CullState.factory);

/**
 * DepthState - 深度测试状态
 */
class DepthState extends D3Object {
    constructor() {
        super();
        this.enabled = true;
        this.writable = true;
        this.compare = DepthState.COMPARE_MODE_LESS;
    }

    load(inStream) {
        super.load(inStream);
        this.enabled = inStream.readBool();
        this.writable = inStream.readBool();
        this.compare = inStream.readEnum();
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeBool(this.enabled);
        outStream.writeBool(this.writable);
        outStream.writeEnum(this.compare);
    }

    static factory(inStream) {
        var obj = new DepthState();
        obj.enabled = false;
        obj.writable = false;
        obj.compare = DepthState.COMPARE_MODE_NEVER;
        obj.load(inStream);
        return obj;
    }
}

// 比较模式
DECLARE_ENUM(DepthState, {
    COMPARE_MODE_NEVER: 0,
    COMPARE_MODE_LESS: 1,
    COMPARE_MODE_EQUAL: 2,
    COMPARE_MODE_LEQUAL: 3,
    COMPARE_MODE_GREATER: 4,
    COMPARE_MODE_NOTEQUAL: 5,
    COMPARE_MODE_GEQUAL: 6,
    COMPARE_MODE_ALWAYS: 7
});

D3Object.Register('L5.CullState', DepthState.factory);

/**
 * OffsetState - 偏移状态
 *
 * @author lonphy
 * @version 2.0
 *
 * @extends {L5.D3Object}
 * @type {L5.OffsetState}
 */
class OffsetState extends D3Object {

    constructor() {
        super();
        this.fillEnabled = false;
        // The offset is Scale*dZ + Bias*r where dZ is the change in depth
        // relative to the screen space area of the poly, and r is the smallest
        // resolvable depth difference.  Negative values move polygons closer to
        // the eye.
        this.scale = 0;
        this.bias = 0;
    }

    load(inStream) {
        super.load(inStream);

        this.fillEnabled = inStream.readBool();
        this.scale = inStream.readFloat32();
        this.bias = inStream.readFloat32();
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeBool(this.fillEnabled);
        outStream.writeFloat32(this.scale);
        outStream.writeFloat32(this.bias);
    }

    static factory(inStream) {
        var obj = new OffsetState();
        obj.load(inStream);
        return obj;
    }

}

D3Object.Register('L5.OffsetState', OffsetState.factory);

/**
 * StencilState - 模板状态
 *
 * @author lonphy
 * @version 1.0
 *
 * @extends {L5.D3Object}
 * @type {L5.StencilState}
 */
class StencilState extends D3Object {

    constructor() {
        super();
        this.mask = 0xffffffff;       // default: unsigned int max
        this.writeMask = 0xffffffff;  // default: unsigned int max
        this.onFail = StencilState.OP_KEEP;
        this.onZFail = StencilState.OP_KEEP;
        this.onZPass = StencilState.OP_KEEP;

        this.enabled = false;
        this.compare = StencilState.NEVER;
        this.reference = 0;     // [0,1]
    }

    load(inStream) {
        super.load(inStream);
        this.enabled = inStream.readBool();
        this.compare = inStream.readEnum();
        this.reference = inStream.readUint32();
        this.mask = inStream.readUint32();
        this.writeMask = inStream.readUint32();
        this.onFail = inStream.readEnum();
        this.onZFail = inStream.readEnum();
        this.onZPass = inStream.readEnum();
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeBool(this.enabled);
        outStream.writeEnum(this.compare);
        outStream.writeUint32(this.reference);
        outStream.writeUint32(this.mask);
        outStream.writeUint32(this.writeMask);
        outStream.writeEnum(this.onFail);
        outStream.writeEnum(this.onZFail);
        outStream.writeEnum(this.onZPass);
    }

    static factory(inStream) {
        var obj = new StencilState();
        obj.mask = 0;
        obj.writeMask = 0;
        obj.load(inStream);
        return obj;
    }
}

// 操作类型
DECLARE_ENUM(StencilState, {
    OP_KEEP:      0,
    OP_ZERO:      1,
    OP_REPLACE:   2,
    OP_INCREMENT: 3,
    OP_DECREMENT: 4,
    OP_INVERT:    5
}, false);

// 比较模式
DECLARE_ENUM(StencilState, {
    NEVER:    0,
    LESS:     1,
    EQUAL:    2,
    LEQUAL:   3,
    GREATER:  4,
    NOTEQUAL: 5,
    GEQUAL:   6,
    ALWAYS:   7
});

D3Object.Register('L5.StencilState', StencilState.factory);

/**
 * maintain current render states to avoid redundant state changes.
 *
 * @class
 *
 * @author lonphy
 * @version 2.0
 */
class GLRenderState {
	constructor() {
		// AlphaState
		this.alphaBlendEnabled = false;
		this.alphaSrcBlend = 0;
		this.alphaDstBlend = 0;
		this.blendColor = new Float32Array([0, 0, 0, 0]);

		// CullState
		this.cullEnabled = false;
		this.CCWOrder = true;

		// DepthState
		this.depthEnabled = true;
		this.depthWriteEnabled = true;
		this.depthCompareFunction = true;

		// OffsetState
		this.fillEnabled = false;
		this.offsetScale = 0;
		this.offsetBias = 0;

		// StencilState
		this.stencilEnabled = false;
		this.stencilCompareFunction = false;
		this.stencilReference = false;
		this.stencilMask = false;
		this.stencilWriteMask = false;
		this.stencilOnFail = false;
		this.stencilOnZFail = false;
		this.stencilOnZPass = false;

		// WireState
		this.wireEnabled = false;
	}

    /**
	 * @param {WebGLRenderingContext} gl
	 * @param {AlphaState} alphaState
	 * @param {CullState} cullState
	 * @param {DepthState} depthState
	 * @param {OffsetState} offsetState
	 * @param {StencilState} stencilState
 	*/
	initialize(gl, alphaState, cullState, depthState, offsetState, stencilState) {
		let op = ['disable', 'enable'];

		// AlphaState
		this.alphaBlendEnabled = alphaState.blendEnabled;
		this.alphaSrcBlend = mapping.AlphaBlend[alphaState.srcBlend];
		this.alphaDstBlend = mapping.AlphaBlend[alphaState.dstBlend];
		this.blendColor = alphaState.constantColor;
		gl[op[this.alphaBlendEnabled | 0]](gl.BLEND);
		gl.blendFunc(this.alphaSrcBlend, this.alphaDstBlend);
		gl.blendColor(this.blendColor[0], this.blendColor[1], this.blendColor[2], this.blendColor[3]);

		// CullState
		this.cullEnabled = cullState.enabled;
		this.CCWOrder = cullState.CCWOrder;

		gl[op[this.cullEnabled | 0]](gl.CULL_FACE);
		gl.frontFace(gl.CCW);
		gl.cullFace(this.CCWOrder ? gl.BACK : gl.FRONT);

		// DepthState
		this.depthEnabled = depthState.enabled;
		this.depthWriteEnabled = depthState.writable;
		this.depthCompareFunction = mapping.DepthCompare[depthState.compare];

		gl[op[this.depthEnabled | 0]](gl.DEPTH_TEST);
		gl.depthMask(this.depthWriteEnabled);
		gl.depthFunc(this.depthCompareFunction);

		// OffsetState
		this.fillEnabled = offsetState.fillEnabled;
		this.offsetScale = offsetState.scale;
		this.offsetBias = offsetState.bias;

		gl[op[this.fillEnabled | 0]](gl.POLYGON_OFFSET_FILL);
		gl.polygonOffset(this.offsetScale, this.offsetBias);

		// StencilState
		this.stencilEnabled = stencilState.enabled;
		this.stencilCompareFunction = mapping.StencilCompare[stencilState.compare];
		this.stencilReference = stencilState.reference;
		this.stencilMask = stencilState.mask;
		this.stencilWriteMask = stencilState.writeMask;
		this.stencilOnFail = mapping.StencilOperation[stencilState.onFail];
		this.stencilOnZFail = mapping.StencilOperation[stencilState.onZFail];
		this.stencilOnZPass = mapping.StencilOperation[stencilState.onZPass];

		gl[op[this.stencilEnabled | 0]](gl.STENCIL_TEST);
		gl.stencilFunc(this.stencilCompareFunction, this.stencilReference, this.stencilMask);
		gl.stencilMask(this.stencilWriteMask);
		gl.stencilOp(this.stencilOnFail, this.stencilOnZFail, this.stencilOnZPass);
	}
}

/**
 * SamplerState 采样器状态
 * 
 * @author lonphy
 * @version 2.0
 */
class GLSamplerState {
    constructor() {
        this.anisotropy = 1;
        this.magFilter = mapping.LINEAR;
        this.minFilter = mapping.NEAREST_MIPMAP_LINEAR;
        this.wrap = [mapping.REPEAT,mapping.REPEAT,mapping.REPEAT];
    }
    /**
     * Get the state of the currently enabled texture.  This state appears
     * to be associated with the OpenGL texture object.  How does this
     * relate to the sampler state?  In my opinion, OpenGL needs to have
     * the sampler state separate from the texture object state.
     *
     * @param renderer {L5.Renderer}
     * @param target
     */
    getCurrent(renderer, target) {
        let gl = renderer.gl;

        // EXT_Texture_Filter_Anisotropic
        this.anisotropy = gl.getTexParameter(target, mapping.TEXTURE_MAX_ANISOTROPY_EXT);

        this.magFilter = gl.getTexParameter(target, gl.TEXTURE_MAG_FILTER);
        this.minFilter = gl.getTexParameter(target, gl.TEXTURE_MIN_FILTER);
        this.wrap[0] = gl.getTexParameter(target, gl.TEXTURE_WRAP_S);
        this.wrap[1] = gl.getTexParameter(target, gl.TEXTURE_WRAP_T);

        // WebGL 2.0
        // this.wrap[2] = gl.getTexParameter(target, gl.TEXTURE_WRAP_R);
    }
}

/**
 * GL渲染数据包装
 * @author lonphy
 * @version 2.0
 */
class DisplayListInfo {
    constructor() {
        this.quantity = 1;  // number of display lists, input to glGenLists
        this.start = 0;     // start index, output from glGenLists
        this.base = 0;      // base index for glListBase
    }
}

class GLRenderData {
    constructor() {
        /**
         * @type {GLRenderState}
         */
        this.currentRS = new GLRenderState();

        const m = GLRenderData.MAX_NUM_PSAMPLERS;
        /**
         * @type {Array<GLSamplerState>}
         */
        this.currentSS = new Array(m);
        for (let i = 0; i < m; ++i) {
            this.currentSS[i] = new GLSamplerState();
        }

        // Capabilities (queried at run time).
        this.maxVShaderImages = 0;
        this.maxFShaderImages = 0;
        this.maxCombinedImages = 0;

        /**
         * @type {DisplayListInfo}
         */
        this.font = new DisplayListInfo();
    }

    /**
     * Bitmapped fonts/characters.
     * @param font
     * @param c {string}
     */
    drawCharacter(font, c) {
        // const BitmapFontChar* bfc = font.mCharacters[(unsigned int)c];
        //
        //const bfc = font.characters[c];
        //
        //// Save unpack state.
        //var swapBytes, lsbFirst, rowLength, skipRows, skipPixels, alignment;
        //glGetIntegerv(GL_UNPACK_SWAP_BYTES, &swapBytes);
        //glGetIntegerv(GL_UNPACK_LSB_FIRST, &lsbFirst);
        //glGetIntegerv(GL_UNPACK_ROW_LENGTH, &rowLength);
        //glGetIntegerv(GL_UNPACK_SKIP_ROWS, &skipRows);
        //glGetIntegerv(GL_UNPACK_SKIP_PIXELS, &skipPixels);
        //glGetIntegerv(GL_UNPACK_ALIGNMENT, &alignment);
        //
        //glPixelStorei(GL_UNPACK_SWAP_BYTES, false);
        //glPixelStorei(GL_UNPACK_LSB_FIRST, false);
        //glPixelStorei(GL_UNPACK_ROW_LENGTH, 0);
        //glPixelStorei(GL_UNPACK_SKIP_ROWS, 0);
        //glPixelStorei(GL_UNPACK_SKIP_PIXELS, 0);
        //glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
        //glBitmap(bfc.xSize, bfc.ySize, bfc.xOrigin, bfc.yOrigin, bfc.xSize, 0, bfc.bitmap);
        //
        //// Restore unpack state.
        //glPixelStorei(GL_UNPACK_SWAP_BYTES, swapBytes);
        //glPixelStorei(GL_UNPACK_LSB_FIRST, lsbFirst);
        //glPixelStorei(GL_UNPACK_ROW_LENGTH, rowLength);
        //glPixelStorei(GL_UNPACK_SKIP_ROWS, skipRows);
        //glPixelStorei(GL_UNPACK_SKIP_PIXELS, skipPixels);
        //glPixelStorei(GL_UNPACK_ALIGNMENT, alignment);
    };
}

GLRenderData.MAX_NUM_VSAMPLERS = 4;  // VSModel 3 has 4, VSModel 2 has 0.
GLRenderData.MAX_NUM_PSAMPLERS = 16;  // PSModel 2 and PSModel 3 have 16.

/**
 * Program 底层包装
 * @author lonphy
 * @version 2.0
 */
class GLProgram {

    /**
     * @param {Renderer} renderer
     * @param {Program} program 
     * @param {GLVertexShader} vs 
     * @param {GLFragShader} fs 
     */
    constructor(renderer, program, vs, fs) {
        let gl = renderer.gl;
        let p = gl.createProgram();
        gl.attachShader(p, vs.shader);
        gl.attachShader(p, fs.shader);
        gl.linkProgram(p);
        console.assert(
            gl.getProgramParameter(p, gl.LINK_STATUS),
            gl.getProgramInfoLog(p)
        );
        this.program = p;
        gl.useProgram(p);
        let uniformsLength = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS),
            item, name, i;

        for (i = 0; i < uniformsLength; ++i) {
            item = gl.getActiveUniform(p, i);
            name = item.name;
            program.inputMap.set(name, gl.getUniformLocation(p, name));
        }
    }
    /**
     * @param {Renderer} renderer
     */
    free(renderer) {
        renderer.gl.deleteProgram(this.program);
    }
    /**
     * @param {Renderer} renderer
     */
    enable(renderer) {
        renderer.gl.useProgram(this.program);
    }
    /**
     * @param {Renderer} renderer
     */
    disable(renderer) {
        //renderer.gl.useProgram(null);
    }
}

/**
 * WebGL 扩展处理
 * @author lonphy
 * @version 2.0
 */
let extensions = [];

class GLExtensions {
    static init(gl) {
        let exts = extensions;
        gl.getSupportedExtensions().forEach(function (name) {
            if (name.match(/^(?:WEBKIT_)|(?:MOZ_)/)) {
                return;
            }
            exts[name] = gl.getExtension(name);
        });

        if (exts.ANGLE_instanced_arrays) {
            mapping.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE = 0x88FE;
        }

        if (exts.EXT_blend_minmax) {
            mapping.MIN_EXT = 0x8007;
            mapping.MAX_EXT = 0x8008;
        }

        if (exts.EXT_sRGB) {
            mapping.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT = 0x8210;
            mapping.SRGB_EXT = 0x8C40;
            mapping.SRGB_ALPHA_EXT = 0x8C42;
            mapping.SRGB8_ALPHA8_EXT = 0x8C43;
        }

        if (exts.EXT_texture_filter_anisotropic) {
            mapping.TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE;
            mapping.MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;
        }

        if (exts.OES_standard_derivatives) {
            mapping.FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 0x8B8B;
        }

        if (exts.OES_texture_half_float) {
            mapping.HALF_FLOAT_OES = 0x8D61;
        }

        if (exts.OES_vertex_array_object) {
            mapping.VERTEX_ARRAY_BINDING_OES = 0x85B5;
        }

        if (exts.WEBGL_compressed_texture_s3tc) {
            mapping.COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
            mapping.COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
            mapping.COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
            mapping.COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
        }

        if (exts.WEBGL_depth_texture) {
            mapping.UNSIGNED_INT_24_8_WEBGL = 0x84FA;
        }

        if (exts.WEBGL_draw_buffers) {
            mapping.MAX_COLOR_ATTACHMENTS_WEBGL = 0x8CDF;
            mapping.COLOR_ATTACHMENT0_WEBGL = 0x8CE0;
            mapping.COLOR_ATTACHMENT1_WEBGL = 0x8CE1;
            mapping.COLOR_ATTACHMENT2_WEBGL = 0x8CE2;
            mapping.COLOR_ATTACHMENT3_WEBGL = 0x8CE3;
            mapping.COLOR_ATTACHMENT4_WEBGL = 0x8CE4;
            mapping.COLOR_ATTACHMENT5_WEBGL = 0x8CE5;
            mapping.COLOR_ATTACHMENT6_WEBGL = 0x8CE6;
            mapping.COLOR_ATTACHMENT7_WEBGL = 0x8CE7;
            mapping.COLOR_ATTACHMENT8_WEBGL = 0x8CE8;
            mapping.COLOR_ATTACHMENT9_WEBGL = 0x8CE9;
            mapping.COLOR_ATTACHMENT10_WEBGL = 0x8CEA;
            mapping.COLOR_ATTACHMENT11_WEBGL = 0x8CEB;
            mapping.COLOR_ATTACHMENT12_WEBGL = 0x8CEC;
            mapping.COLOR_ATTACHMENT13_WEBGL = 0x8CED;
            mapping.COLOR_ATTACHMENT14_WEBGL = 0x8CEF;
            mapping.COLOR_ATTACHMENT15_WEBGL = 0x8CF0;
            mapping.MAX_DRAW_BUFFERS_WEBGL = 0x8824;
            mapping.DRAW_BUFFER0_WEBGL = 0x8825;
            mapping.DRAW_BUFFER1_WEBGL = 0x8826;
            mapping.DRAW_BUFFER2_WEBGL = 0x8827;
            mapping.DRAW_BUFFER3_WEBGL = 0x8828;
            mapping.DRAW_BUFFER4_WEBGL = 0x8829;
            mapping.DRAW_BUFFER5_WEBGL = 0x882A;
            mapping.DRAW_BUFFER6_WEBGL = 0x882B;
            mapping.DRAW_BUFFER7_WEBGL = 0x882C;
            mapping.DRAW_BUFFER8_WEBGL = 0x882D;
            mapping.DRAW_BUFFER9_WEBGL = 0x882E;
            mapping.DRAW_BUFFER10_WEBGL = 0x882F;
            mapping.DRAW_BUFFER11_WEBGL = 0x8830;
            mapping.DRAW_BUFFER12_WEBGL = 0x8831;
            mapping.DRAW_BUFFER13_WEBGL = 0x8832;
            mapping.DRAW_BUFFER14_WEBGL = 0x8833;
            mapping.DRAW_BUFFER15_WEBGL = 0x8834;
        }
    }
}

/**
 * Program GPU程序
 *
 * @author lonphy
 * @version 2.0
 */
class Program extends D3Object {

    /**
     * @param name {string} 程序名称
     * @param vs {L5.VertexShader}
     * @param fs {L5.FragShader}
     */
    constructor(name, vs, fs) {
        super(name);
        this.vertexShader = vs;
        this.fragShader = fs;
        this.inputMap = new Map();
    }
}

/**
 * FragShader 片元着色器
 *
 * @author lonphy
 * @version 1.0
 *
 * @extends {L5.Shader}
 * @type {L5.FragShader}
 */
class FragShader extends Shader {}
D3Object.Register('L5.FragShader', FragShader.factory);

/**
 * VertexShader 顶点着色器
 *
 * @author lonphy
 * @version 2.0
 */
class VertexShader extends Shader {}
D3Object.Register('L5.VertexShader', VertexShader.factory);

/**
 * ShaderParameters 着色器参数
 *
 * @author lonphy
 * @version 2.0
 */
class ShaderParameters extends D3Object{

    /**
     * @param shader {Shader}
     * @param [__privateCreate] {boolean}
     */
    constructor(shader, __privateCreate=false) {
        super();
        if (!__privateCreate) {
            console.assert(shader !== null, 'Shader must be specified.');

            /**
             * @type {L5.Shader}
             */
            this.shader = shader;

            var nc = shader.numConstants;
            this.numConstants = nc;

            if (nc > 0) {
                /**
                 * @type {Array<ShaderFloat>}
                 */
                this.constants = new Array(nc);
            } else {
                this.constants = null;
            }

            var ns = shader.numSamplers;
            this.numTextures = ns;
            if (ns > 0) {
                this.textures = new Array(ns);
            } else {
                this.textures = null;
            }
        }
        else {
            this.shader = null;
            this.numConstants = 0;
            this.constants = null;
            this.numTextures = 0;
            this.textures = null;
        }
    }



// These functions set the constants/textures.  If successful, the return
// value is nonnegative and is the index into the appropriate array.  This
// index may passed to the Set* functions that have the paremeter
// 'handle'.  The mechanism allows you to set directly by index and avoid
// the name comparisons that occur with the Set* functions that have the
// parameter 'const std::string& name'.
    /**
     * @param name {string}
     * @param sfloat {Array}
     * @return {number}
     */
    setConstantByName(name, sfloat) {
        var i, m = this.numConstants, shader = this.shader;

        for (i = 0; i < m; ++i) {
            if (shader.getConstantName(i) === name) {
                this.constants[i] = sfloat;
                return i;
            }
        }

        console.assert(false, 'Cannot find constant.');
        return -1;
    }

    /**
     * @param handle {number}
     * @param sfloat {Array}
     * @return {number}
     */
    setConstant(handle, sfloat) {
        if (0 <= handle && handle < this.numConstants) {
            this.constants[handle] = sfloat;
            return handle;
        }
        console.assert(false, 'Invalid constant handle.');
        return -1;
    }

    /**
     * @param name {string}
     * @param texture {Texture}
     * @returns {number}
     */
    setTextureByName(name, texture) {
        var i, m = this.numTextures, shader = this.shader;

        for (i = 0; i < m; ++i) {
            if (shader.getSamplerName(i) === name) {
                this.textures[i] = texture;
                return i;
            }
        }

        console.assert(false, 'Cannot find texture.');
        return -1;
    }

    /**
     * @param handle {number}
     * @param texture {L5.Texture}
     * @returns {number}
     */
    setTexture(handle, texture) {
        if (0 <= handle && handle < this.numTextures) {
            this.textures[handle] = texture;
            return handle;
        }
        console.assert(false, 'Invalid texture handle.');
        return -1;
    }

    /**
     * @param name {string}
     * @returns {ArrayBuffer}
     */
    getConstantByName(name) {
        var i, m = this.numConstants, shader = this.shader;
        for (i = 0; i < m; ++i) {
            if (shader.getConstantName(i) === name) {
                return this.constants[i];
            }
        }

        console.assert(false, 'Cannot find constant.');
        return null;
    }

    /**
     * @param name {string}
     * @returns {Texture}
     */
    getTextureByName(name) {
        var i, m = this.numTextures, shader = this.shader;
        for (i = 0; i < m; ++i) {
            if (shader.getSamplerName(i) === name) {
                return this.textures[i];
            }
        }

        console.assert(false, 'Cannot find texture.');
        return null;
    }

    /**
     * @param index {number}
     * @returns {ArrayBuffer}
     */
    getConstant(index) {
        if (0 <= index && index < this.numConstants) {
            return this.constants[index];
        }

        console.assert(false, 'Invalid constant handle.');
        return null;
    }

    /**
     * @param index {number}
     * @returns {Texture}
     */
    getTexture(index) {
        if (0 <= index && index < this.numTextures) {
            return this.textures[index];
        }

        console.assert(false, 'Invalid texture handle.');
        return null;
    }
    
    /**
     * @param visual {Visual}
     * @param camera {Camera}
     */
    updateConstants(visual, camera) {
        var constants = this.constants,
            i, m = this.numConstants;
        for (i = 0; i < m; ++i) {
            var constant = constants[i];
            if (constant.allowUpdater) {
                constant.update(visual, camera);
            }
        }
    }

    load(inStream) {
        super.load(inStream);
        this.shader = inStream.readPointer();
        this.constants = inStream.readPointerArray();
        this.numConstants = this.constants.length;
        this.textures = inStream.readPointerArray();
        this.numTextures = this.textures.length;
    }

    link(inStream) {
        super.link(inStream);
        this.shader = inStream.resolveLink(this.shader);
        this.constants = inStream.resolveArrayLink(this.numConstants, this.constants);
        this.textures = inStream.resolveArrayLink(this.numTextures, this.textures);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.shader);
        outStream.writePointerArray(this.numConstants, this.constants);
        outStream.writePointerArray(this.numTextures, this.textures);
    }

    /**
     * 文件解析工厂方法
     * @param inStream {InStream}
     * @returns {ShaderParameters}
     */
    static factory(inStream) {
        var obj = new ShaderParameters(null, true);
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('L5.ShaderParameters', ShaderParameters.factory);

/**
 * VisualEffect
 *
 * @author lonphy
 * @version 2.0
 */
class VisualEffect extends D3Object{

    constructor() {
        super('VisualEffect');
        this.techniques = [];
    }

    /**
     * @param technique {VisualTechnique}
     */
    insertTechnique(technique) {
        if (technique) {
            this.techniques.push(technique);
        }
        else {
            console.warn('Input to insertTechnique must be nonnull.');
        }
    }

    /**
     * @returns {number}
     */
    getNumTechniques() {
        return this.techniques.length;
    }

    /**
     * @param techniqueIndex {number}
     * @returns {number}
     */
    getNumPasses(techniqueIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getNumPass();
        }
        console.warn("Invalid index in getNumPasses.\n");
        return 0;
    }

    /**
     * @param techniqueIndex {number}
     * @returns {L5.VisualTechnique}
     */
    getTechnique(techniqueIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex];
        }
        console.warn("Invalid index in getTechnique.\n");
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.VisualPass}
     */
    getPass(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getPass(passIndex);
        }
        console.warn("Invalid index in GetPass.\n");
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.VertexShader}
     */
    getVertexShader(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getVertexShader(passIndex);
        }

        console.warn('Invalid index in getVertexShader.');
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.FragShader}
     */
    getFragShader(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getFragShader(passIndex);
        }

        console.warn('Invalid index in getFragShader.');
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.AlphaState}
     */
    getAlphaState(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getAlphaState(passIndex);
        }

        console.warn('Invalid index in getAlphaState.');
        return null;
    }
    
    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.CullState}
     */
    getCullState (techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getCullState(passIndex);
        }

        console.warn('Invalid index in getCullState.');
        return null;
    }
    
    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.DepthState}
     */
    getDepthState (techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getDepthState(passIndex);
        }

        console.warn('Invalid index in getDepthState.');
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.OffsetState}
     */
    getOffsetState (techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getOffsetState(passIndex);
        }

        console.warn('Invalid index in getOffsetState.');
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.StencilState}
     */
    getStencilState  (techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getStencilState(passIndex);
        }

        console.warn('Invalid index in getStencilState.');
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.WireState}
     */
    getWireState (techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getWireState(passIndex);
        }

        console.warn('Invalid index in getWireState.');
        return null;
    }

    load (inStream) {
        super.load(inStream);

        var numTechniques = inStream.readUint32();
        this.techniques.length = numTechniques;
        this.techniques = inStream.readSizedPointerArray(numTechniques);
    }

    link (inStream) {
        super.link(inStream);
        this.techniques.forEach(function (t, i) {
            this.techniques[i] = inStream.resolveLink(t);
        }, this);
    }
}

/**
 * VisualEffectInstance
 *
 * @author lonphy
 * @version 2.0
 */
class VisualEffectInstance extends D3Object{
    /**
     * @param {VisualEffect} effect
     * @param {number} techniqueIndex
     * @param {boolean} _privateCreate
     */
    constructor(effect, techniqueIndex, _privateCreate=false) {
        super();
        if (!_privateCreate) {
            console.assert(effect !== null, 'effect must be specified.');
            console.assert(0 <= techniqueIndex && techniqueIndex < effect.getNumTechniques(),
                'Invalid technique index.');

            /**
             * @type {VisualEffect}
             */
            this.effect = effect;
            this.techniqueIndex = techniqueIndex;

            var technique = effect.getTechnique(techniqueIndex);
            var numPasses = technique.getNumPasses();

            this.numPasses = numPasses;
            this.vertexParameters = new Array(numPasses);
            this.fragParameters = new Array(numPasses);

            for (var p = 0; p < numPasses; ++p) {
                var pass = technique.getPass(p);
                this.vertexParameters[p] = new ShaderParameters(pass.getVertexShader());
                this.fragParameters[p] = new ShaderParameters(pass.getFragShader());
            }
        }
        else {
            this.effect = null;
            this.techniqueIndex = 0;
            this.numPasses = 0;
            this.vertexParameters = null;
            this.fragParameters = null;
        }
    }

    getNumPasses () {
        return this.effect.getTechnique(this.techniqueIndex).getNumPasses();
    }

    /**
     * @param {number} pass
     * @returns {VisualPass}
     */
    getPass (pass) {
        if (0 <= pass && pass < this.numPasses) {
            return this.effect.getTechnique(this.techniqueIndex).getPass(pass);
        }

        console.assert(false, 'Invalid pass index.');
        return null;
    }

    /**
     * @param {number} pass
     * @returns {ShaderParameters}
     */
    getVertexParameters (pass) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass];
        }
        console.assert(false, 'Invalid pass index.');
        return null;
    }

    /**
     * @param {number} pass
     * @returns {ShaderParameters}
     */
    getFragParameters (pass) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass];
        }
        console.assert(false, 'Invalid pass index.');
        return null;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @param {ShaderFloat} sfloat
     * @returns {number}
     */
    setVertexConstantByName (pass, name, sfloat) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].setConstantByName(name, sfloat);
        }
        console.assert(false, 'Invalid pass index.');
        return -1;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @param {ShaderFloat} sfloat
     * @returns {number}
     */
    setFragConstantByName (pass, name, sfloat) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].setConstantByName(name, sfloat);
        }

        console.assert(false, 'Invalid pass index.');
        return -1;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @param {Texture} texture
     * @returns {number}
     */
    setVertexTextureByName (pass, name, texture) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].setTextureByName(name, texture);
        }
        console.assert(false, 'Invalid pass index.');
        return -1;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @param {Texture} texture
     * @returns {number}
     */
    setFragTextureByName (pass, name, texture) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].setTextureByName(name, texture);
        }
        console.assert(false, 'Invalid pass index.');
        return -1;
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @param {ShaderFloat} sfloat
     */
    setVertexConstant (pass, handle, sfloat) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].setConstant(handle, sfloat);
        }
        console.assert(false, 'Invalid pass index.');
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @param {ShaderFloat} sfloat
     */
    setFragConstant(pass, handle, sfloat) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].setConstant(handle, sfloat);
        }
        console.assert(false, 'Invalid pass index.');
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @param {Texture} texture
     */
    setVertexTexture(pass, handle, texture) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].setTexture(handle, texture);
        }
        console.assert(false, 'Invalid pass index.');
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @param {Texture} texture
     */
    setFragTexture(pass, handle, texture) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].setTexture(handle, texture);
        }
        console.assert(false, 'Invalid pass index.');
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @returns {ShaderFloat}
     */
    getVertexConstantByName(pass, name) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].getConstantByName(name);
        }
        console.assert(false, 'Invalid pass index.');
        return null;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @returns {ShaderFloat}
     */
    getFragConstantByName(pass, name) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].getConstantByName(name);
        }
        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @returns {Texture}
     */
    getVertexTextureByName(pass, name) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].getTextureByName(name);
        }

        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @returns {Texture}
     */
    getFragTextureByName(pass, name) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].getTextureByName(name);
        }

        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @returns {ShaderFloat}
     */
    getVertexConstant(pass, handle) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].getConstant(handle);
        }
        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @returns {ShaderFloat}
     */
    getFragConstant(pass, handle) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].getConstant(handle);
        }
        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @returns {Texture}
     */
    getVertexTexture(pass, handle) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].getTexture(handle);
        }
        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @returns {Texture}
     */
    getFragTexture(pass, handle) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].getTexture(handle);
        }

        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    load(inStream) {
        super.load(inStream);
        this.techniqueIndex = inStream.readUint32();
        this.effect = inStream.readPointer();
        this.vertexParameters = inStream.readPointerArray();
        this.numPasses = this.vertexParameters.length;
        this.fragParameters = inStream.readSizedPointerArray(this.numPasses);
    }
    link(inStream) {
        super.link(inStream);
        this.effect = inStream.resolveLink(this.effect);
        this.vertexParameters = inStream.resolveArrayLink(this.numPasses, this.vertexParameters);
        this.fragParameters = inStream.resolveArrayLink(this.numPasses, this.fragParameters);
    }

    save(inStream) {
        super.save(inStream);
        // todo: implement
    }

    /**
     * 文件解析工厂方法
     * @param {InStream} inStream
     * @returns {VisualEffectInstance}
     */
    static factory(inStream) {
        var obj = new VisualEffectInstance(0, 0, true);
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('VisualEffectInstance', VisualEffectInstance.factory);

/**
 * VisualPass
 *
 * @author lonphy
 * @version 2.0
 */
class VisualPass extends D3Object {
    constructor() {
        super('VisualPass');
        /**
         * @type {Program}
         */
        this.program = null;
        /**
         * @type {AlphaState}
         */
        this.alphaState = null;
        /**
         * @type {CullState}
         */
        this.cullState = null;
        /**
         * @type {DepthState}
         */
        this.depthState = null;
        /**
         * @type {OffsetState}
         */
        this.offsetState = null;
        /**
         * @type {StencilState}
         */
        this.stencilState = null;
        /**
         * @type {WireState}
         */
        this.wireState = null;
    }

    /**
     * @returns {FragShader}
     */
    getFragShader() {
        return this.program.fragShader;
    }

    /**
     * @returns {VertexShader}
     */
    getVertexShader() {
        return this.program.vertexShader;
    }


    load(inStream) {
        super.load(inStream);
        var vertexShader = inStream.readPointer();
        var fragShader = inStream.readPointer();
        this.program = new Program('Program', vertexShader, fragShader);
        this.alphaState = inStream.readPointer();
        this.cullState = inStream.readPointer();
        this.depthState = inStream.readPointer();
        this.offsetState = inStream.readPointer();
        this.stencilState = inStream.readPointer();
        this.wireState = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);

        this.program.vertexShader = inStream.resolveLink(this.program.vertexShader);
        this.program.fragShader = inStream.resolveLink(this.program.fragShader);

        this.alphaState = inStream.resolveLink(this.alphaState);
        this.cullState = inStream.resolveLink(this.cullState);
        this.depthState = inStream.resolveLink(this.depthState);
        this.offsetState = inStream.resolveLink(this.offsetState);
        this.stencilState = inStream.resolveLink(this.stencilState);
        this.wireState = inStream.resolveLink(this.wireState);
    }

    save(inStream) {
        super.save(inStream);
        // todo: implement
    }

    static factory(inStream) {
        var obj = new VisualPass();
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('VisualPass', VisualPass.factory);

/**
 * VisualTechnique
 *
 * @author lonphy
 * @version 2.0
 */
class VisualTechnique extends D3Object {

    constructor() {
        super();

        /**
         * @type {Array<VisualPass>}
         */
        this.passes = [];
    }

    /**
     * @param {VisualPass} pass
     */
    insertPass(pass) {
        if (pass) {
            this.passes.push(pass);
        } else {
            console.assert(false, 'Input to insertPass must be nonnull.');
        }
    }

    /**
     * @returns {number}
     */
    getNumPasses() {
        return this.passes.length;
    }

    /**
     * @returns {number|null}
     */
    getPass(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex];
        }
        console.warn("Invalid index in GetPass.");
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {VertexShader}
     */
    getVertexShader(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].getVertexShader();
        }
        console.warn('Invalid index in getVertexShader.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {FragShader}
     */
    getFragShader(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].getFragShader();
        }
        console.warn('Invalid index in getFragShader.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {AlphaState}
     */
    getAlphaState(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].alphaState;
        }
        console.warn('Invalid index in getAlphaState.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {CullState}
     */
    getCullState(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].cullState;
        }
        console.warn('Invalid index in getCullState.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {DepthState}
     */
    getDepthState(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].depthState;
        }
        console.warn('Invalid index in getDepthState.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {OffsetState}
     */
    getOffsetState(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].offsetState;
        }
        console.warn('Invalid index in getOffsetState.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {StencilState}
     */
    getStencilState(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].stencilState;
        }
        console.warn('Invalid index in getStencilState.');
        return null;
    }

    load(inStream) {
        super.load(inStream);
        var numPasses = inStream.readUint32();
        this.passes.length = numPasses;
        this.passes = inStream.readSizedPointerArray(numPasses);
    }

    link(inStream) {
        super.link(inStream);
        this.passes.forEach(function (p, i) {
            this.passes[i] = inStream.resolveLink(p);
        }, this);
    }

    save(inStream) {
        super.save(inStream);
        // todo: implement
    }
}

D3Object.Register('VisualTechnique', VisualTechnique.factory.bind(VisualTechnique));

/**
 * Renderer
 * @author lonphy
 * @version 2.0
 */
class Renderer$1 {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {number} width
     * @param {number} height
     * @param clearColor
     * @param colorFormat
     * @param depthStencilFormat
     * @param {number} numMultiSamples
     */
	constructor(canvas, width, height, clearColor, colorFormat, depthStencilFormat, numMultiSamples) {
        /**
         * @type {WebGLRenderingContext}
         */
		let gl = canvas.getContext(WebGL_VERSION, {
			alpha: true,
			depth: true,
			stencil: true,
			antialias: true
		});
		this.gl = gl;
		this.clearColor = new Float32Array([0, 0, 0, 1]);
		this.clearColor.set(clearColor);
		this.initialize(width, height, colorFormat, depthStencilFormat, numMultiSamples);

		// The platform-specific data.  It is in public scope to allow the
		// renderer resource classes to access it.
		let data = new GLRenderData();
		this.data = data;

		data.maxVShaderImages = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
		data.maxFShaderImages = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
		data.maxCombinedImages = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

		// Set the default render states.
		data.currentRS.initialize(gl,
			this.defaultAlphaState,
			this.defaultCullState,
			this.defaultDepthState,
			this.defaultOffsetState,
			this.defaultStencilState
		);
		Renderer$1.renderers.add(this);
	}

    /**
     * @returns {Set<Renderer>}
     */
	static get renderers() {
		return (Renderer$1._renderers || (Renderer$1._renderers = new Set()));
	}

    /**
     * @param width {number}
     * @param height {number}
     * @param colorFormat {number} TEXTURE_FORMAT_XXX
     * @param depthStencilFormat {number} TEXTURE_FORMAT_XXX
     * @param numMultiSamples {number}
     */
	initialize(width, height, colorFormat, depthStencilFormat, numMultiSamples) {

		GLExtensions.init(this.gl);

		this.width = width;
		this.height = height;
		this.colorFormat = colorFormat;
		this.depthStencilFormat = depthStencilFormat;
		this.numMultiSamples = numMultiSamples;

		// global render state
		this.alphaState = new AlphaState();
		this.cullState = new CullState();
		this.depthState = new DepthState();
		this.offsetState = new OffsetState();
		this.stencilState = new StencilState();

		this.defaultAlphaState = new AlphaState();
		this.defaultCullState = new CullState();
		this.defaultDepthState = new DepthState();
		this.defaultOffsetState = new OffsetState();
		this.defaultStencilState = new StencilState();


		// override global state
		this.overrideAlphaState = null;
		this.overrideCullState = null;
		this.overrideDepthState = null;
		this.overrideOffsetState = null;
		this.overrideStencilState = null;


		this.reverseCullOrder = false;

		// Geometric transformation pipeline.  The camera stores the view,
		// projection, and postprojection matrices.
		this.camera = null;


		// Access to the current clearing parameters for the color, depth, and
		// stencil buffers.  The color buffer is the back buffer.
		this.clearDepth = 1.0;
		this.clearStencil = 0;

		// Channel masking for the back buffer., allow rgba,
		this._colorMask = (0x1 | 0x2 | 0x4 | 0x8);

		// 框架结构对应到底层结构
		this.vertexFormats = new Map();
		this.vertexBuffers = new Map();
		this.indexBuffers = new Map();
		this.texture2Ds = new Map();
		this.texture3Ds = new Map();
		this.textureCubes = new Map();
		this.renderTargets = new Map();
		this.vertexShaders = new Map();
		this.fragShaders = new Map();
		this.programs = new Map();

		var gl = this.gl;
		var cc = this.clearColor;
		gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
		gl.clearDepth(this.clearDepth);
		gl.clearStencil(this.clearStencil);
	}

	terminate() {
	}

    /**
     * Compute a picking ray from the specified left-handed screen
     * coordinates (x,y) and using the current camera.  The output
     * 'origin' is the camera position and the 'direction' is a
     * unit-length vector.  Both are in world coordinates.
     * The return value is 'true' iff (x,y) is in the current viewport.
     *
     * @param x {number} in
     * @param y {number} in
     * @param origin {Point} out
     * @param direction {Vector} out
     */
	getPickRay(x, y, origin, direction) {
	}

	// === 资源管理
	// 资源对象是已定义的
	//    VertexFormat
	//    VertexBuffer
	//    IndexBuffer
	//    Texture(2d, cube),
	//    RenderTarget
	//    VertexShader
	//    FragmentShader
	//
	// bind:  创建对象对应的资源
	//    渲染器维护对象和资源之间的映射，大多数情况下，显存中会分配一个资源对应对象在系统内存对应的副本
	//    如果在bind之前调用了 enable 或 lock, 渲染器会创建一个资源而不是抛出异常
	//
	// bindAll:  为所有的渲染器对象创建对应的资源
	//
	// unbind:  销毁对象对应的资源
	//    渲染器会移除对象-资源映射，和资源，但不会移除对象，所以对象可以重新绑定
	//
	// unbindAll:  销毁所有渲染器对象创建的资源和对象本身
	//
	// enable: 在drawPrimitive之前调用，激活资源，以便在本次渲染中使用
	//
	// disable: 在drawPrimitive之后调用, 取消激活资源，以便下次渲染中不使用
	//
	// lock:  获取一个显存资源位置
	//    使用这个方法更新显存, 如果要这么干，请注意更新失败的情况，因为内存和显存复制不同步;
	//    也可以锁定后只读，在这种情况下显存内容是保留的;
	//    尽可能让资源锁定状态保持最少的时间
	//
	// unlock:  释放一个显存资源位置
	//
	// update:  锁定资源占用的显存，并复制内存数据到显存。渲染器会自动调用
	//
	// updateAll:  和update类似，但它更新所有渲染器共享的资源
	//
	// readColor:  只能由RenderTarget调用, 在调用时, RenderTarget必须是未激活状态
	//    方法返回一个2D纹理对象，包含renderTarget在显存中的颜色值
	// === 资源管理

    /**
     * Access to the current color channel masks.
     * allowRed : 0x1
     * allowGreen: 0x2
     * allowBlue: 0x4
     * allowAlpha: 0x8
     * return
     */
	getColorMask() {
		return (0x1 | 0x2 | 0x4 | 0x8);
	}

	// Override the global state.  If overridden, this state is used instead
	// of the VisualPass state during a drawing call.  To undo the override,
	// pass a null pointer.
	get overrideAlphaState() {
		return this._overrideAlphaState;
	}

	set overrideAlphaState(val) {
		this._overrideAlphaState = val;
	}

	get overrideCullState() {
		return this._overrideCullState;
	}

	set overrideCullState(val) {
		this._overrideCullState = val;
	}

	get overrideDepthState() {
		return this._overrideDepthState;
	}

	set overrideDepthState(val) {
		this._overrideDepthState = val;
	}

	get overrideOffsetState() {
		return this._overrideOffsetState;
	}

	set overrideOffsetState(val) {
		this._overrideOffsetState = val;
	}

	get overrideStencilState() {
		return this._overrideStencilState;
	}

	set overrideStencilState(val) {
		this._overrideStencilState = val;
	}

    /**
     * The entry point to drawing the visible set of a scene tree.
     * @param visibleSet {VisibleSet}
     * @param globalEffect {*}
     */
	drawVisibleSet(visibleSet, globalEffect = null) {
		if (!globalEffect) {
			var numVisible = visibleSet.getNumVisible();
			for (var i = 0; i < numVisible; ++i) {
				var visual = visibleSet.getVisible(i);
				this.drawInstance(visual, visual.effect);
			}
		}
		else {
			globalEffect.draw(this, visibleSet);
		}
	}

    /**
     * @param visual {Visual}
     */
	drawVisible(visual) {
		this.drawInstance(visual, visual.effect);
	}


    /**
     * 渲染单个对象
     * @param visual {Visual}
     * @param instance {VisualEffectInstance}
     */
	drawInstance(visual, instance) {
		if (!visual) {
			console.assert(false, 'The visual object must exist.');
			return;
		}

		if (!instance) {
			console.assert(false, 'The visual object must have an effect instance.');
			return;
		}

		var vformat = visual.format;
		var vbuffer = visual.vertexBuffer;
		var ibuffer = visual.indexBuffer;

		var numPasses = instance.getNumPasses();
		for (var i = 0; i < numPasses; ++i) {
			var pass = instance.getPass(i);
			var vparams = instance.getVertexParameters(i);
			var fparams = instance.getFragParameters(i);
			var program = pass.program;

			// Update any shader constants that vary during runtime.
			vparams.updateConstants(visual, this.camera);
			fparams.updateConstants(visual, this.camera);

			// Set visual state.
			this.setAlphaState(pass.alphaState);
			this.setCullState(pass.cullState);
			this.setDepthState(pass.depthState);
			this.setOffsetState(pass.offsetState);
			this.setStencilState(pass.stencilState);
			//this.setWireState(pass.wireState);

			// enable data
			this._enableProgram(program, vparams, fparams);
			this._enableVertexBuffer(vbuffer);
			this._enableVertexFormat(vformat, program);
			if (ibuffer) {
				this._enableIndexBuffer(ibuffer);
			}

			// Draw the primitive.
			this.drawPrimitive(visual);

			// disable data
			if (ibuffer) {
				this._disableIndexBuffer(ibuffer);
			}
			this._disableVertexFormat(vformat);
			this._disableVertexBuffer(vbuffer);

			// Disable the shaders.
			this._disableProgram(program, vparams, fparams);
		}
	}

    /**
     * The entry point for drawing 3D objects, called by the single-object
     * Draw function.
     * @param visual {Visual}
     */
	_drawPrimitive(visual) {
	}

    /**
     * 设置渲染视口
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     */
	setViewport(x, y, width, height) {
		this.gl.viewport(x, y, width, height);
	}

    /**
     * 获取渲染视口参数
     * @returns {Array<number>}
     */
	getViewport() {
		let gl = this.gl;
		return gl.getParameter(gl.VIEWPORT);
	}

    /**
     * 调整渲染视口大小
     * @param width {number}
     * @param height {number}
     */
	resize(width, height) {
		this.width = width;
		this.height = height;
		var gl = this.gl;
		var p = gl.getParameter(gl.VIEWPORT);
		gl.viewport(p[0], p[1], width, height);
	}

    /**
     * 设置深度测试范围
     * @param min {number}
     * @param max {number}
     */
	setDepthRange(min, max) {
		this.gl.depthRange(min, max);
	}

    /**
     * 获取当前深度测试范围
     * @returns {Array<number>}
     */
	getDepthRange() {
		var gl = this.gl;
		return gl.getParameter(gl.DEPTH_RANGE);
	}

	// Support for clearing the color, depth, and stencil buffers.
	clearColorBuffer(x = 0, y = 0, w = 0, h = 0) {
	}

	clearDepthBuffer(x = 0, y = 0, w = 0, h = 0) {
	}

	clearStencilBuffer(x = 0, y = 0, w = 0, h = 0) {
	}

	displayColorBuffer() {
	}

	// For render target access to allow creation of color/depth textures.
	inTexture2DMap(texture) {
		return true;
	}

	insertInTexture2DMap(texture, platformTexture) {
	}


	static updateAll(obj /*, params... */) {
		switch (obj.constructor.name.split('$')[0]) {
			case 'Texture2D':
				this._updateAllTexture2D(obj, arguments[1]);
				break;
			case 'Texture3D':
				this._updateAllTexture3D(obj, arguments[1], arguments[2]);
				break;
			case 'TextureCube':
				this._updateAllTextureCube(obj, arguments[1], arguments[2]);
				break;
			case 'VertexBuffer':
				this._updateAllVertexBuffer(obj);
				break;
			case 'IndexBuffer':
				this._updateAllIndexBuffer(obj);
				break;
			default:
				console.assert(false, `${obj.constructor.name} not support [updateAll] method.`);
		}
	}

	// ------------------- VertexFormat ----------------------------------
    /**
     * @param format {VertexFormat}
     * @private
     */
	_bindVertexFormat(format) {
		if (!this.vertexFormats.has(format)) {
			this.vertexFormats.set(format, new GLVertexFormat(this, format));
		}
	}

    /**
     * @param format {VertexFormat}
     * @private
     */
	static _bindAllVertexFormat(format) { }

    /**
     * @param format {VertexFormat}
     * @private
     */
	_unbindVertexFormat(format) { }

    /**
     * @param format {VertexFormat}
     * @private
     */
	static _unbindAllVertexFormat(format) { }

    /**
     * @param format {VertexFormat}
     * @param program {Program}
     * @private
     */
	_enableVertexFormat(format, program) {
		var glFormat = this.vertexFormats.get(format);
		if (!glFormat) {
			glFormat = new GLVertexFormat(this, format, program);
			this.vertexFormats.set(format, glFormat);
		}
		glFormat.enable(this);
	}

    /**
     * @param format {VertexFormat}
     * @param vp
     * @param fp
     * @private
     */
	_disableVertexFormat(format, vp, fp) {
		var glFormat = this.vertexFormats.get(format);
		if (glFormat) {
			glFormat.disable(this);
		}
	}

	// ------------------- 着色器程序管理 ----------------------------------
    /**
     * @param program {Program}
     * @private
     */
	_bindProgram(program) {
		if (!this.programs.get(program)) {
			this.programs.set(program, new GLProgram(this, program));
		}
	}

    /**
     * @param program {Program}
     * @private
     */
	static _bindAllProgram(program) {
		Renderer$1.renderers.forEach(function (r) {
			r._bindProgram(program);
		});
	}

    /**
     * @param program {Program}
     * @private
     */
	_unbindProgram(program) {
		var glProgram = this.programs.get(program);
		if (glProgram) {
			glProgram.free(this.gl);
			this.programs.delete(program);
		}
	}
    /**
     * @param program {Program}
     * @private
     */
	static _unbindAllProgram(program) {
		Renderer$1.renderers.forEach(function (r) {
			r._unbindProgram(program);
		});
	}

    /**
     * @param program {Program}
     * @param vp {ShaderParameters}
     * @param fp {ShaderParameters}
     * @private
     */
	_enableProgram(program, vp, fp) {
		var glProgram = this.programs.get(program);
		if (!glProgram) {
			this._bindVertexShader(program.vertexShader);
			this._bindFragShader(program.fragShader);

			glProgram = new GLProgram(
				this,
				program,
				this.vertexShaders.get(program.vertexShader),
				this.fragShaders.get(program.fragShader)
			);
			this.programs.set(program, glProgram);
		}
		glProgram.enable(this);

		// Enable the shaders.
		this._enableVertexShader(program.vertexShader, program.inputMap, vp);
		this._enableFragShader(program.fragShader, program.inputMap, fp);
	}

    /**
     * @param program {Program}
     * @param vp {ShaderParameters}
     * @param fp {ShaderParameters}
     * @private
     */
	_disableProgram(program, vp, fp) {

		this._disableVertexShader(program.vertexShader, vp);
		this._disableFragShader(program.fragShader, fp);
		var glProgram = this.programs.get(program);
		if (glProgram) {
			glProgram.disable(this);
		}
	}

	//----------------------- vertexBuffer ------------------------
    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	_bindVertexBuffer(buffer) { }

    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	static _bindAllVertexBuffer(buffer) { }

    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	_unbindVertexBuffer(buffer) { }

    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	static _unbindAllVertexBuffer(buffer) { }

    /**
     * @param buffer {VertexBuffer}
     * @param streamIndex {number}
     * @param offset {number}
     * @private
     */
	_enableVertexBuffer(buffer, streamIndex, offset) {

		var glVBuffer = this.vertexBuffers.get(buffer);
		if (!glVBuffer) {
			glVBuffer = new GLVertexBuffer(this, buffer);
			this.vertexBuffers.set(buffer, glVBuffer);
		}

		glVBuffer.enable(this, buffer.elementSize);
	}

    /**
     * @param buffer {VertexBuffer}
     * @param streamIndex {number}
     * @private
     */
	_disableVertexBuffer(buffer, streamIndex) {
		var glVBuffer = this.vertexBuffers.get(buffer);
		if (glVBuffer) {
			glVBuffer.disable(this, streamIndex);
		}
	}

    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	_updateVertexBuffer(buffer) {
		var glVBuffer = this.vertexBuffers.get(buffer);
		if (!glVBuffer) {
			glVBuffer = new GLVertexBuffer(this, buffer);
			this.vertexBuffers.set(buffer, glVBuffer);
		}

		glVBuffer.update(this, buffer);
	}

    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	static _updateAllVertexBuffer(buffer) {
		Renderer$1.renderers.forEach(function (renderer) {
			renderer._updateVertexBuffer(buffer);
		});
	}

	//----------------------- indexBuffer ------------------------
    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	_bindIndexBuffer(buffer) { }

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	static _bindAllIndexBuffer(buffer) { }

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	_unbindIndexBuffer(buffer) { }

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	static _unbindAllIndexBuffer(buffer) { }

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	_enableIndexBuffer(buffer) {
		var glIBuffer = this.indexBuffers.get(buffer);
		if (!glIBuffer) {
			glIBuffer = new GLIndexBuffer(this, buffer);
			this.indexBuffers.set(buffer, glIBuffer);
		}
		glIBuffer.enable(this);
	}

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	_disableIndexBuffer(buffer) {
		var glIBuffer = this.indexBuffers.get(buffer);
		if (glIBuffer) {
			glIBuffer.disable(this);
		}
	}

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	_updateIndexBuffer(buffer) { }

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	static _updateAllIndexBuffer(buffer) { }

	//----------------------- fragShader ------------------------

    /**
     * @param shader {FragShader}
     * @private
     */
	_bindFragShader(shader) {
		if (!this.fragShaders.get(shader)) {
			this.fragShaders.set(shader, new GLFragShader(this, shader));
		}
	}

    /**
     * @param shader {FragShader}
     * @private
     */
	static _bindAllFragShader(shader) {
		Renderer$1.renderers.forEach(function (r) {
			r._bindFragShader(shader);
		});
	}

    /**
     * @param shader {FragShader}
     * @private
     */
	_unbindFragShader(shader) {
		var glFShader = this.fragShaders.get(shader);
		if (glFShader) {
			glFShader.free(this.gl);
			this.fragShaders.delete(shader);
		}
	}

    /**
     * @param shader {FragShader}
     * @private
     */
	static _unbindAllFragShader(shader) {
		Renderer$1.renderers.forEach(function (r) {
			r._unbindFragShader(shader);
		});
	}

    /**
     * @param shader {FragShader}
     * @param mapping {Map}
     * @param parameters {ShaderParameters}
     * @private
     */
	_enableFragShader(shader, mapping$$1, parameters) {
		var glFShader = this.fragShaders.get(shader);
		if (!glFShader) {
			glFShader = new GLFragShader(this, shader);
			this.fragShaders.set(shader, glFShader);
		}
		glFShader.enable(this, mapping$$1, shader, parameters);
	}

    /**
     * @param shader {FragShader}
     * @param parameters {ShaderParameters}
     * @private
     */
	_disableFragShader(shader, parameters) {
		var glFShader = this.fragShaders.get(shader);
		if (glFShader) {
			glFShader.disable(this, shader, parameters);
		}
	}

	//----------------------- vertexShader ------------------------
    /**
     * @param shader {VertexShader}
     * @private
     */
	_bindVertexShader(shader) {
		if (!this.vertexShaders.get(shader)) {
			this.vertexShaders.set(shader, new GLVertexShader(this, shader));
		}
	}

    /**
     * @param shader {VertexShader}
     * @private
     */
	static _bindAllVertexShader(shader) { }
    /**
     * @param shader {VertexShader}
     * @private
     */
	_unbindVertexShader(shader) { }

    /**
     * @param shader {VertexShader}
     * @private
     */
	static _unbindAllVertexShader(shader) { }

    /**
     * @param shader {VertexShader}
     * @param mapping {Map}
     * @param parameters {ShaderParameters}
     * @private
     */
	_enableVertexShader(shader, mapping$$1, parameters) {
		var glVShader = this.vertexShaders.get(shader);
		if (!glVShader) {
			glVShader = new GLVertexShader(this, shader);
			this.vertexShaders.set(shader, glVShader);
		}

		glVShader.enable(this, mapping$$1, shader, parameters);
	}

    /**
     * @param shader {VertexShader}
     * @param parameters {ShaderParameters}
     * @private
     */
	_disableVertexShader(shader, parameters) {
		var glVShader = this.vertexShaders.get(shader);
		if (glVShader) {
			glVShader.disable(this, shader, parameters);
		}
	}

	//----------------------- texture2d ------------------------
    /**
     * @param texture {Texture2D}
     * @private
     */
	_bindTexture2D(texture) { }

    /**
     * @param texture {Texture2D}
     * @private
     */
	static _bindAllTexture2D(texture) { }

    /**
     * @param texture {Texture2D}
     * @private
     */
	_unbindTexture2D(texture) { }

    /**
     * @param texture {Texture2D}
     * @private
     */
	static _unbindAllTexture2D(texture) { }

    /**
     * @param texture {Texture2D}
     * @param textureUnit {number}
     * @private
     */
	_enableTexture2D(texture, textureUnit) {
		var glTexture2D = this.texture2Ds.get(texture);
		if (!glTexture2D) {
			glTexture2D = new GLTexture2D(this, texture);
			this.texture2Ds.set(texture, glTexture2D);
		}
		glTexture2D.enable(this, textureUnit);
	}

    /**
     * @param texture {Texture2D}
     * @param textureUnit {number}
     * @private
     */
	_disableTexture2D(texture, textureUnit) {
		var glTexture2D = this.texture2Ds.get(texture);
		if (glTexture2D) {
			glTexture2D.disable(this, textureUnit);
		}
	}

    /**
     * @param {Texture2D} texture
     * @param {number} level
     * @private
     */
	_updateTexture2D(texture, level=0) {
		let glTexture2D = this.texture2Ds.get(texture);
		if (!glTexture2D) {
			glTexture2D = new GLTexture2D(this, texture);
			this.texture2Ds.set(texture, glTexture2D);
		} else {
			glTexture2D.update(this, level, texture.getData());
		}
	}

    /**
     * @param {Texture2D} texture
     * @param {number} level
     */
	static _updateAllTexture2D(texture, level) {
		Renderer$1.renderers.forEach(renderer => renderer._updateTexture2D(texture, level));
	}

	//----------------------- textureCube ------------------------
    /**
     * @param texture {TextureCube}
     * @private
     */
	_bindTextureCube(texture) { }

    /**
     * @param texture {TextureCube}
     * @private
     */
	static _bindAllTextureCube(texture) { }

    /**
     * @param texture {TextureCube}
     * @private
     */
	_unbindTextureCube(texture) { }

    /**
     * @param texture {TextureCube}
     * @private
     */
	static _unbindAllTextureCube(texture) { }

    /**
     * @param texture {TextureCube}
     * @param textureUnit {number}
     * @private
     */
	_enableTextureCube(texture, textureUnit) { }

    /**
     * @param texture {TextureCube}
     * @param textureUnit {number}
     * @private
     */
	_disableTextureCube(texture, textureUnit) { }

    /**
     * @param texture {TextureCube}
     * @param face {number}
     * @param level {number}
     * @private
     */
	_updateTextureCube(texture, face, level) { }

    /**
     * @param texture {TextureCube}
     * @param face {number}
     * @param level {number}
     * @private
     */
	static _updateAllTextureCube(texture, face, level) { }

	//----------------------- renderTarget ------------------------

	/**
	 * @param {Visual} visual
	 */
	drawPrimitive(visual) {
		var type = visual.primitiveType;
		var vbuffer = visual.vertexBuffer;
		var ibuffer = visual.indexBuffer;
		var gl = this.gl;
		var numPixelsDrawn;
		var numSegments;

		switch (type) {
			case Visual$1.PT_TRIMESH:
			case Visual$1.PT_TRISTRIP:
			case Visual$1.PT_TRIFAN:
				{
					var numVertices = vbuffer.numElements;
					var numIndices = ibuffer.numElements;
					if (numVertices > 0 && numIndices > 0) {
						var indexType = (ibuffer.elementSize == 2) ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
						var indexData = ibuffer.offset;
						if (visual.wire) {
							gl.drawElements(gl.LINE_STRIP, numIndices, indexType, indexData);
						} else {
							gl.drawElements(mapping.PrimitiveType[type], numIndices, indexType, indexData);
						}
					}
					break;
				}
			case Visual$1.PT_POLYSEGMENTS_CONTIGUOUS:
				{
					numSegments = visual.getNumSegments();
					if (numSegments > 0) {
						gl.drawArrays(gl.LINE_STRIP, 0, numSegments + 1);
					}
					break;
				}
			case Visual$1.PT_POLYSEGMENTS_DISJOINT:
				{
					numSegments = visual.getNumSegments();
					if (numSegments > 0) {
						gl.drawArrays(gl.LINES, 0, 2 * numSegments);
					}
					break;
				}
			case Visual$1.PT_POLYPOINT:
				{
					var numPoints = visual.numPoints;
					if (numPoints > 0) {
						gl.drawArrays(gl.POINTS, 0, numPoints);
					}
					break;
				}
			default:
				console.assert(false, 'Invalid type', type);
		}
	}

	/**
	 * draw text
	 * @param x {number}
	 * @param y {number}
	 * @param color {Float32Array}
	 * @param message {string}
	 */
	drawText(x, y, color, message) {
		var gl = this.gl;

		// Switch to orthogonal view.
		gl.matrixMode(gl.PROJECTION);
		gl.pushMatrix();
		gl.loadIdentity();
		gl.ortho(-0.5, this.width - 0.5, -0.5, this.height - 0.5, -1, 1);
		gl.matrixMode(gl.MODELVIEW);
		gl.pushMatrix();
		gl.loadIdentity();

		// Set default render states, except for depth buffering that must be
		// disabled because text is always overlayed.
		this.setAlphaState(this.defaultAlphaState);
		this.setCullState(this.defaultCullState);
		this.setOffsetState(this.defaultOffsetState);
		this.setStencilState(this.defaultStencilState);

		var CRS = this.data.currentRS;
		CRS.depthEnabled = false;
		gl.disable(gl.DEPTH_TEST);

		// Set the text color.
		gl.color4fv(color[0], color[1], color[2], color[3]);

		// Draw the text string (use right-handed coordinates).
		gl.rasterPos3i(x, this.height - 1 - y, 0);

		// Restore visual state.  Only depth buffering state varied from the
		// default state.
		CRS.depthEnabled = true;
		gl.enable(gl.DEPTH_TEST);

		// Restore matrices.
		gl.PopMatrix();
		gl.MatrixMode(gl.PROJECTION);
		gl.PopMatrix();
		gl.MatrixMode(gl.MODELVIEW);
	}

	/**
	 * @param screenBuffer {Uint8Array}
	 * @param reflectY {boolean}
	 */
	draw(screenBuffer, reflectY) {
		if (!screenBuffer) {
			console.assert(false, "Incoming screen buffer is null.\n");
			return;
		}

		var gl = this.gl;

		gl.matrixMode(gl.MODELVIEW);
		gl.pushMatrix();
		gl.loadIdentity();
		gl.matrixMode(gl.PROJECTION);
		gl.pushMatrix();
		gl.loadIdentity();
		gl.ortho(0, this.width, 0, this.height, 0, 1);
		gl.rasterPos3f(0, 0, 0);

		if (!reflectY) {
			// Set raster position to window coord (0,H-1).  The hack here avoids
			// problems with invalid raster positions which would cause
			// glDrawPixels not to execute.  OpenGL uses right-handed screen
			// coordinates, so using (0,H-1) as the raster position followed by
			// glPixelZoom(1,-1) tells OpenGL to draw the screen in left-handed
			// coordinates starting at the top row of the screen and finishing
			// at the bottom row.
			var bitmap = [0];
			gl.bitmap(0, 0, 0, 0, 0, this.height, bitmap);
		}
		gl.popMatrix();
		gl.matrixMode(gl.MODELVIEW);
		gl.popMatrix();

		if (!reflectY) {
			gl.pixelZoom(1, -1);
		}

		gl.drawPixels(this.width, this.height, gl.BGRA, gl.UNSIGNED_BYTE, screenBuffer);

		if (!reflectY) {
			gl.pixelZoom(1, 1);
		}
	}

	preDraw() { return true; }
	postDraw() { this.gl.flush(); }

	/**
	 * 混合状态设置
	 * @param {AlphaState} alphaState 
	 */
	setAlphaState(alphaState) {
		if (!this.overrideAlphaState) {
			this.alphaState = alphaState;
		}
		else {
			this.alphaState = this.overrideAlphaState;
		}

		var gl = this.gl;
		var as = this.alphaState;
		var CRS = this.data.currentRS;

		if (as.blendEnabled) {
			if (!CRS.alphaBlendEnabled) {
				CRS.alphaBlendEnabled = true;
				gl.enable(gl.BLEND);
			}
			var srcBlend = mapping.AlphaBlend[as.srcBlend];
			var dstBlend = mapping.AlphaBlend[as.dstBlend];
			if (srcBlend != CRS.alphaSrcBlend || dstBlend != CRS.alphaDstBlend) {
				CRS.alphaSrcBlend = srcBlend;
				CRS.alphaDstBlend = dstBlend;
				gl.blendFunc(srcBlend, dstBlend);
			}

			if (as.constantColor !== CRS.blendColor) {
				CRS.blendColor = as.constantColor;
				gl.blendColor(CRS.blendColor[0], CRS.blendColor[1], CRS.blendColor[2], CRS.blendColor[3]);
			}
		}
		else {
			if (CRS.alphaBlendEnabled) {
				CRS.alphaBlendEnabled = false;
				gl.disable(gl.BLEND);
			}
		}
	}

	/**
	 * 剔除状态
	 * @param cullState {CullState}
	 */
	setCullState(cullState) {
		var cs;
		var gl = this.gl;
		if (!this.overrideCullState) {
			cs = cullState;
		}
		else {
			cs = this.overrideCullState;
		}
		this.cullState = cs;
		var CRS = this.data.currentRS;

		if (cs.enabled) {
			if (!CRS.cullEnabled) {
				CRS.cullEnabled = true;
				gl.enable(gl.CULL_FACE);
				gl.frontFace(gl.CCW);
			}
			var order = cs.CCWOrder;
			if (this.reverseCullOrder) {
				order = !order;
			}
			if (order != CRS.CCWOrder) {
				CRS.CCWOrder = order;
				gl.cullFace(CRS.CCWOrder ? gl.BACK : gl.FRONT);
			}

		}
		else {
			if (CRS.cullEnabled) {
				CRS.cullEnabled = false;
				gl.disable(gl.CULL_FACE);
			}
		}
	}

	/**
	 * 设置深度测试状态
	 * @param depthState {DepthState}
	 */
	setDepthState(depthState) {
		var ds;
		var gl = this.gl;

		if (!this.overrideDepthState) {
			ds = depthState;
		} else {
			ds = this.overrideDepthState;
		}
		this.depthState = ds;
		var CRS = this.data.currentRS;

		if (ds.enabled) {
			if (!CRS.depthEnabled) {
				CRS.depthEnabled = true;
				gl.enable(gl.DEPTH_TEST);
			}

			var compare = mapping.DepthCompare[ds.compare];
			if (compare != CRS.depthCompareFunction) {
				CRS.depthCompareFunction = compare;
				gl.depthFunc(compare);
			}
		}
		else {
			if (CRS.depthEnabled) {
				CRS.depthEnabled = false;
				gl.disable(gl.DEPTH_TEST);
			}
		}

		if (ds.writable) {
			if (!CRS.depthWriteEnabled) {
				CRS.depthWriteEnabled = true;
				gl.depthMask(true);
			}
		}
		else {
			if (CRS.depthWriteEnabled) {
				CRS.depthWriteEnabled = false;
				gl.depthMask(false);
			}
		}
	}

	/**
	 * @param offsetState {OffsetState}
	 */
	setOffsetState(offsetState) {
		var os;
		var gl = this.gl;
		var CRS = this.data.currentRS;
		if (!this.overrideOffsetState) {
			os = offsetState;
		}
		else {
			os = this.overrideOffsetState;
		}

		if (os.fillEnabled) {
			if (!CRS.fillEnabled) {
				CRS.fillEnabled = true;
				gl.enable(gl.POLYGON_OFFSET_FILL);
			}
		}
		else {
			if (CRS.fillEnabled) {
				CRS.fillEnabled = false;
				gl.disable(gl.POLYGON_OFFSET_FILL);
			}
		}

		if (os.scale != CRS.offsetScale || os.bias != CRS.offsetBias) {
			CRS.offsetScale = os.scale;
			CRS.offsetBias = os.bias;
			gl.polygonOffset(os.scale, os.bias);
		}
	}

	/**
	 * 设置模板测试状态
	 * @param {StencilState} stencilState
	 */
	setStencilState(stencilState) {
		var gl = this.gl;
		var ss;
		if (!this.overrideStencilState) {
			ss = stencilState;
		}
		else {
			ss = this.overrideStencilState;
		}
		this.stencilState = ss;
		var CRS = this.data.currentRS;
		if (ss.enabled) {
			if (!CRS.stencilEnabled) {
				CRS.stencilEnabled = true;
				gl.enable(gl.STENCIL_TEST);
			}

			var compare = mapping.StencilCompare[ss.compare];
			if (compare != CRS.stencilCompareFunction || ss.reference != CRS.stencilReference || ss.mask != CRS.stencilMask) {
				CRS.stencilCompareFunction = compare;
				CRS.stencilReference = ss.reference;
				CRS.stencilMask = ss.mask;
				gl.stencilFunc(compare, ss.reference, ss.mask);
			}

			if (ss.writeMask != CRS.stencilWriteMask) {
				CRS.stencilWriteMask = ss.writeMask;
				gl.stencilMask(ss.writeMask);
			}

			var onFail = mapping.StencilOperation[ss.onFail];
			var onZFail = mapping.StencilOperation[ss.onZFail];
			var onZPass = mapping.StencilOperation[ss.onZPass];

			if (onFail != CRS.stencilOnFail || onZFail != CRS.stencilOnZFail || onZPass != CRS.stencilOnZPass) {
				CRS.stencilOnFail = onFail;
				CRS.stencilOnZFail = onZFail;
				CRS.stencilOnZPass = onZPass;
				gl.stencilOp(onFail, onZFail, onZPass);
			}
		}
		else {
			if (CRS.stencilEnabled) {
				CRS.stencilEnabled = false;
				gl.disable(gl.STENCIL_TEST);
			}
		}
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 */
	setViewport(x, y, width, height) {
		this.gl.viewport(x, y, width, height);
	}
	setDepthRange(min, max) {
		this.gl.depthRange(min, max);
	}
	resize(width, height) {
		this.width = width;
		this.height = height;
		var gl = this.gl;

		var param = gl.getParameter(gl.VIEWPORT);
		gl.viewport(param[0], param[1], width, height);
	}

	clearColorBuffer() {
		var c = this.clearColor;
		var gl = this.gl;
		gl.clearColor(c[0], c[1], c[2], c[3]);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}
	clearDepthBuffer() {
		var gl = this.gl;
		gl.clearDepth(this.clearDepth);
		gl.clear(gl.DEPTH_BUFFER_BIT);
	}
	clearStencilBuffer() {
		var gl = this.gl;
		gl.clearStencil(this.clearStencil);
		gl.clear(gl.STENCIL_BUFFER_BIT);
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @param w {number}
	 * @param h {number}
	 */
	clearColorBuffer(x, y, w, h) {
		var gl = this.gl;
		var cc = this.clearColor;
		gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(x, y, w, h);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.disable(gl.SCISSOR_TEST);
	}
	/**
	 * @param x {number}
	 * @param y {number}
	 * @param w {number}
	 * @param h {number}
	 */
	clearDepthBuffer(x, y, w, h) {
		var gl = this.gl;
		gl.clearDepth(this.clearDepth);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(x, y, w, h);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		gl.disable(gl.SCISSOR_TEST);
	}
	/**
	 * @param x {number}
	 * @param y {number}
	 * @param w {number}
	 * @param h {number}
	 */
	clearStencilBuffer(x, y, w, h) {
		var gl = this.gl;
		gl.clearStencil(this.clearStencil);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(x, y, w, h);
		gl.clear(gl.STENCIL_BUFFER_BIT);
		gl.disable(gl.SCISSOR_TEST);
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 */
	clearBuffers(x, y, width, height) {
		let gl = this.gl;
		if (x) {
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(x, y, width, height);
		}
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
		if (x) {
			gl.disable(gl.SCISSOR_TEST);
		}
	}

	/**
	 * 设置颜色掩码
	 * @param {boolean} allowRed
	 * @param {boolean} allowGreen
	 * @param {boolean} allowBlue
	 * @param {boolean} allowAlpha
	 */
	setColorMask(allowRed, allowGreen, allowBlue, allowAlpha) {
		this.allowRed = allowRed || false;
		this.allowGreen = allowGreen || false;
		this.allowBlue = allowBlue || false;
		this.allowAlpha = allowAlpha || false;
		this.gl.colorMask(allowRed, allowGreen, allowBlue, allowBlue);
	}
}

/**
 * Texture2D 2D纹理构造
 */
let VBAAttr = {
    offset: -1, // 偏移
    eType: 0,  // 元素类型构造
    wFn: 0,  // DataView 写函数名
    rFn: 0,  // DataView 读函数名
    eNum: 0,  // 元素类型数量
    cSize: 0   // 单元大小, 字节, 缓存值
};


/**
 * VertexBufferAccessor 顶点缓冲访问器
 */
class VertexBufferAccessor$1 {

    /**
     * @param {VertexFormat} format
     * @param {VertexBuffer} buffer
     * @param {Boolean} endian 字节序, 默认为小端
     */
    constructor(format, buffer, endian = true) {
        /**
         * @type {VertexFormat}
         */
        this.format = format;
        /**
         * @type {VertexBuffer}
         */
        this.vertexBuffer = buffer;

        this.stride = format.stride;
        this.endian = endian;

        /**
         * @type {ArrayBuffer}
         */
        this.data = buffer.getData();
        this.rw = new DataView(this.data.buffer);

        var i;
        const MAX_TCOORD_UNITS = VertexFormat$1.MAX_TCOORD_UNITS;
        const MAX_COLOR_UNITS = VertexFormat$1.MAX_COLOR_UNITS;

        this.position = Object.create(VBAAttr);
        this.normal = Object.create(VBAAttr);
        this.tangent = Object.create(VBAAttr);
        this.binormal = Object.create(VBAAttr);
        this.pointSize = Object.create(VBAAttr);
        this.tCoord = new Array(MAX_TCOORD_UNITS);
        this.color = new Array(MAX_COLOR_UNITS);
        this.blendIndices = Object.create(VBAAttr);
        this.blendWeight = Object.create(VBAAttr);


        for (i = 0; i < MAX_TCOORD_UNITS; ++i) {
            this.tCoord[i] = Object.create(VBAAttr);
        }
        for (i = 0; i < MAX_COLOR_UNITS; ++i) {
            this.color[i] = Object.create(VBAAttr);
        }

        this._initialize();
    }

    /**
     * @private
     */
    _initialize() {
        let fmt = this.format;
        let unit, units;

        // 顶点坐标
        fmt.fillVBAttr(VertexFormat$1.AU_POSITION, this.position);
        // 法线
        fmt.fillVBAttr(VertexFormat$1.AU_NORMAL, this.normal);
        // 切线
        fmt.fillVBAttr(VertexFormat$1.AU_TANGENT, this.tangent);
        // 双切线
        fmt.fillVBAttr(VertexFormat$1.AU_BINORMAL, this.binormal);
        // 点大小
        fmt.fillVBAttr(VertexFormat$1.AU_PSIZE, this.pointSize);
        // 纹理坐标
        units = VertexFormat$1.MAX_TCOORD_UNITS;
        for (unit = 0; unit < units; ++unit) {
            fmt.fillVBAttr(VertexFormat$1.AU_TEXCOORD, this.tCoord[unit], unit);
        }

        // 颜色
        units = VertexFormat$1.MAX_COLOR_UNITS;
        for (unit = 0; unit < units; ++unit) {
            fmt.fillVBAttr(VertexFormat$1.AU_COLOR, this.color[unit], unit);
        }

        fmt.fillVBAttr(VertexFormat$1.AU_BLENDINDICES, this.blendIndices);
        fmt.fillVBAttr(VertexFormat$1.AU_BLENDWEIGHT, this.blendWeight);
    }

    /**
     * @param visual {Visual}
     * @returns {VertexBufferAccessor}
     */
    static fromVisual(visual) {
        return new VertexBufferAccessor$1(visual.format, visual.vertexBuffer);
    }

    /**
     * 获取顶点数量
     * @returns {number}
     */
    get numVertices() {
        return this.vertexBuffer.numElements;
    }

    getData() {
        return this.data;
    }

    ////////////////// 顶点 ///////////////////////////////
    getPosition(index) {
        let t = this.position;
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    setPosition(index, dataArr) {
        let t = this.position;
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasPosition() {
        return this.position.offset !== -1;
    }

    ////////////////// 法线 ///////////////////////////////
    getNormal(index) {
        let t = this.normal;
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    setNormal(index, dataArr) {
        let t = this.normal;
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasNormal() {
        return this.normal.offset !== -1;
    }

    //////////////////////////////////////////////////////
    getTangent(index) {
        let t = this.tangent;
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    setTangent(index, dataArr) {
        let t = this.tangent;
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasTangent() {
        return this.tangent.offset !== -1;
    }

    //////////////////////////////////////////////////////
    getBinormal(index) {
        let t = this.binormal;
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    setBinormal(index, dataArr) {
        let t = this.binormal;
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasBinormal() {
        return this.binormal.offset !== -1;
    }

    //////////////////////////////////////////////////////
    getPointSize(index) {
        let t = this.pointSize;
        let startOffset = t.offset + index * this.stride;
        return this.rw[t.rFn](startOffset, this.endian);
    }

    setPointSize(index, val) {
        let t = this.pointSize;
        let startOffset = t.offset + index * this.stride;
        this.rw[t.wFn](startOffset, val, this.endian);
    }

    hasPointSize() {
        return this.pointSize.offset !== -1;
    }

    ///////////////////////////////////////////////////////////
    getTCoord(unit, index) {
        let t = this.tCoord[unit];
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    /**
     * @param {number} unit 
     * @param {number} index 
     * @param {Array<number>|DataView} dataArr 
     */
    setTCoord(unit, index, dataArr) {
        let t = this.tCoord[unit];
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasTCoord(unit) {
        return this.tCoord[unit].offset !== -1;
    }

    ///////////////////////////////////////////////////////////
    getColor(unit, index) {
        let t = this.color[unit];
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    setColor(unit, index, dataArr) {
        let t = this.color[unit];
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasColor(unit) {
        return this.color[unit].offset !== -1;
    }

    //////////////////////////////////////////////////////
    getBlendIndices(index) {
        let t = this.blendIndices;
        let startOffset = t.offset + index * this.stride;
        return this.rw[t.rFn](startOffset, this.endian);
    }

    setBlendIndices(index, val) {
        let t = this.blendIndices;
        let startOffset = t.offset + index * this.stride;
        this.rw[t.wFn](startOffset, val, this.endian);
    }

    hasBlendIndices() {
        return this.blendIndices.offset !== -1;
    }

    //////////////////////////////////////////////////////
    getBlendWeight(index) {
        let t = this.blendWeight;
        let startOffset = t.offset + index * this.stride;
        return this.rw[t.rFn](startOffset, this.endian);
    }

    setBlendWeight(index, val) {
        let t = this.blendWeight;
        let startOffset = t.offset + index * this.stride;
        this.rw[t.wFn](startOffset, val, this.endian);
    }

    hasBlendWeight() {
        return this.blendWeight.offset !== -1;
    }
}

/**
 * Visual
 */
class Visual$1 extends Spatial$1 {

    /**
     * @param {number} type primitiveType
     * @param {VertexFormat} format
     * @param {VertexBuffer} vertexBuffer
     * @param {IndexBuffer} indexBuffer
     */
    constructor(type, format, vertexBuffer, indexBuffer) {
        super();
        this.primitiveType = type || Visual$1.PT_NONE;

        /**
         * @type {VertexFormat}
         */
        this.format = format;

        /**
         * @type {VertexBuffer}
         */
        this.vertexBuffer = vertexBuffer;

        /**
         * @type {IndexBuffer}
         */
        this.indexBuffer = indexBuffer;
        this.modelBound = new Bound$1();

        /**
         * Shader effect used to draw the Visual.
         * @type {VisualEffectInstance}
         * @private
         */
        this.effect = null;

        // true则以线框模式渲染
        this.wire = false;

        if (format && vertexBuffer && indexBuffer) {
            this.updateModelSpace(Spatial$1.GU_MODEL_BOUND_ONLY);
        }
    }

    updateModelSpace(type) {
        this.updateModelBound();
    }

    updateWorldBound() {
        this.modelBound.transformBy(this.worldTransform, this.worldBound);
    }

    updateModelBound() {
        var numVertices = this.vertexBuffer.numElements;
        const format = this.format;
        var stride = format.stride;

        var posIndex = format.getIndex(VertexFormat$1.AU_POSITION);
        if (posIndex == -1) {
            console.assert(false, 'Update requires vertex positions');
            return;
        }

        var posType = format.getAttributeType(posIndex);
        if (posType != VertexFormat$1.AT_FLOAT3 && posType != VertexFormat$1.AT_FLOAT4) {
            console.assert(false, 'Positions must be 3-tuples or 4-tuples');
            return;
        }

        var data = this.vertexBuffer.getData();
        var posOffset = format.getOffset(posIndex);
        this.modelBound.computeFromData(numVertices, stride, data.slice(posOffset).buffer);
    }

    /**
     * Support for hierarchical culling.
     * @param {Culler} culler
     * @param {boolean} noCull
     */
    getVisibleSet(culler, noCull) {
        culler.insert(this);
    }

    /**
     * @param fileName {string} 文件
     */
    static loadWMVF(fileName) {
        return new Promise(function (resolve, reject) {
            var load = new L5.XhrTask(fileName, 'arraybuffer');
            load.then(function (data) {
                var inFile = new DataView(data);
                var ret = {};
                inFile.offset = 0;
                ret.primitiveType = inFile.getInt32(inFile.offset, true);
                inFile.offset += 4;

                ret.format = Visual$1.loadVertexFormat(inFile); // ok
                ret.vertexBuffer = Visual$1.loadVertexBuffer(inFile, ret.format);
                ret.indexBuffer = Visual$1.loadIndexBuffer(inFile);

                console.log(data.byteLength);
                console.log(inFile.offset);

                resolve(ret);
            }).catch(function (err) {
                console.log(err);
                reject(err);
            });
        }).catch(function (err) {
            console.assert(false, "Failed to open file :" + fileName);
        });
    }

    /**
     * 解析顶点格式
     * @param inFile {DataView}
     * @returns {VertexFormat}
     */
    static loadVertexFormat(inFile) {
        var numAttributes = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        var format = new VertexFormat$1(numAttributes);
        var streamIndex, offset, usageIndex, type, usage;

        for (var i = 0; i < numAttributes; ++i) {
            streamIndex = inFile.getUint32(inFile.offset, true);
            inFile.offset += 4;

            offset = inFile.getUint32(inFile.offset, true);
            inFile.offset += 4;

            type = inFile.getInt32(inFile.offset, true);
            inFile.offset += 4;

            usage = inFile.getInt32(inFile.offset, true);
            inFile.offset += 4;

            usageIndex = inFile.getUint32(inFile.offset, true);
            inFile.offset += 4;

            format.setAttribute(i, streamIndex, offset, type, usage, usageIndex);
        }

        format.stride = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        return format;
    }

    /**
     * 解析顶点缓冲对象
     * @param {BinDataView} inFile
     * @param {VertexFormat} format
     * @returns {VertexBuffer}
     */
    static loadVertexBuffer(inFile, format) {
        var numElements = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        var elementSize = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        var usage = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        var buffer = new VertexBuffer(numElements, elementSize, usage);
        var vba = new VertexBufferAccessor$1(format, buffer);
        // end ok

        vba.read(inFile);

        return buffer;
    }

    /**
     * @param {BinDataView} inFile
     * @returns {IndexBuffer}
     */
    static loadIndexBuffer(inFile) {
        var numElements = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        if (numElements > 0) {
            var elementSize = inFile.getInt32(inFile.offset, true);
            inFile.offset += 4;
            var usage = inFile.getInt32(inFile.offset, true);
            inFile.offset += 4;
            var offset = inFile.getInt32(inFile.offset, true);
            inFile.offset += 4;

            var buffer = new IndexBuffer(numElements, elementSize, usage);
            buffer.offset = offset;
            //var start = inFile.offset;
            // var end = start + buffer.numBytes;
            buffer.getData().set(new Uint8Array(inFile.buffer, inFile.offset, buffer.numBytes));

            inFile.offset += buffer.numBytes;

            return buffer;
        }

        return null;
    }

    /**
     * @param {InStream} inStream
     */
    load(inStream) {
        super.load(inStream);
        this.type = inStream.readEnum();
        this.modelBound = inStream.readBound();
        this.format = inStream.readPointer();
        this.vertexBuffer = inStream.readPointer();
        this.indexBuffer = inStream.readPointer();
        this.effect = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.format = inStream.resolveLink(this.format);
        this.vertexBuffer = inStream.resolveLink(this.vertexBuffer);
        this.indexBuffer = inStream.resolveLink(this.indexBuffer);
        this.effect = inStream.resolveLink(this.effect);
    }
}

/////////////////// 绘制类型 //////////////////////////////
DECLARE_ENUM(Visual$1, {
    PT_NONE: 0,  // 默认
    PT_POLYPOINT: 1,   // 点
    PT_POLYSEGMENTS_DISJOINT: 2,
    PT_POLYSEGMENTS_CONTIGUOUS: 3,
    PT_TRIANGLES: 4,  // abstract
    PT_TRIMESH: 5,
    PT_TRISTRIP: 6,
    PT_TRIFAN: 7,
    PT_MAX_QUANTITY: 8
}, false);

// Geometric updates.  If the positions in the vertex buffer have been
// modified, you might want to update the surface frames (normals,
// tangents, and bitangents) for indexed-triangle primitives.  It is
// assumed that the positions have been updated and the vertex buffer is
// unlocked.  The argument of UpdateModelSpace specifies the update
// algorithm:
//
//   GU_MODEL_BOUND_ONLY:
//      Update only the model-space bound of the new positions.
//
// For the other options, the model-space bound is always recomputed,
// regardless of type of primitive.  For the surface frames to be updated,
// the Visual must represent an indexed-triangle primitive and must have
// the relevant channels (normal, tangents, bitangents).  If the primitive
// is not indexed triangles, the update call does nothing to the frames.
// An update occurs only for those channels present in the vertex buffer.
// For example, if the vertex buffer has no normals, GU_NORMALS will
// have no effect on the vertex buffer.  As another example, if you
// specify GU_USE_GEOMETRY and the vertex buffer has normals and tangents
// but not bitangents, only normals and tangents are updated (i.e. the
// vertex buffer is not regenerated to have bitangents).
//
//   GU_NORMALS:
//      Update the normals.
//
//   GU_USE_GEOMETRY:
//      Use the mesh topology to determine the surface frames.  The
//      algorithm uses a least-squares method, which is expensive.
//
//   GU_USE_TCOORD_CHANNEL + nonnegative_integer:
//      The standard way to generate surface frames is to use a texture
//      coordinate unit from the vertex buffer.
//
// To reduce video memory usage by the vertex buffers, if your vertex
// shaders use normals, tangents, and bitangents, consider passing in
// normals and tangents, and then have the shader compute the bitangent as
//    bitangent = Cross(normal, tangent)
DECLARE_ENUM(Visual$1, {
    GU_MODEL_BOUND_ONLY: -3,
    GU_NORMALS: -2,
    GU_USE_GEOMETRY: -1,
    GU_USE_TCOORD_CHANNEL: 0
});

class Triangles extends Visual$1 {

    /**
     * @abstract
     */
    getNumTriangles() {
        throw new Error('Method:' + this.constructor.name + '.getNumTriangles not defined.');
    }

    /**
     * @param index
     * @param output
     * @abstract
     */
    getTriangle(index, output) {
        throw new Error('Method:' + this.constructor.name + '.getTriangle not defined.');
    }

    getNumVertices() {
        return this.vertexBuffer.numElements;
    }

    /**
     * 获取物体坐标系的三角形顶点数组
     * @param i {number}
     * @param modelTriangle {Array<Point>}
     */
    getModelTriangle(i, modelTriangle) {
        var v = new Array(3);
        if (this.getTriangle(i, v)) {
            var vba = new VertexBufferAccessor$1(this.format, this.vertexBuffer);
            var p = vba.getPosition(v[0]);
            modelTriangle[0] = new Point$1(p[0], p[1], p[2]);

            p = vba.getPosition(v[1]);
            modelTriangle[1] = new Point$1(p[0], p[1], p[2]);

            p = vba.getPosition(v[2]);
            modelTriangle[2] = new Point$1(p[0], p[1], p[2]);
            return true;
        }
        return false;
    }

    /**
     * 获取世界坐标系的三角形顶点数组
     * @param i {number}
     * @param worldTriangle {Point}
     */
    getWorldTriangle(i, worldTriangle) {
        var pos = new Array(3);
        if (this.getModelTriangle(i, pos)) {
            worldTriangle[0] = this.worldTransform.mulPoint(pos[0]);
            worldTriangle[1] = this.worldTransform.mulPoint(pos[1]);
            worldTriangle[2] = this.worldTransform.mulPoint(pos[2]);
            return true;
        }
        return false;
    }

    /**
     *
     * @param v {number}
     * @returns {Point}
     */
    getPosition(v) {
        var index = this.format.getIndex(VertexFormat.AU_POSITION);
        if (index >= 0) {
            var offset = this.format.getOffset(index);
            var stride = this.format.stride;
            var start = offset + v * stride;
            return new Point$1(
                new Float32Array(this.vertexBuffer.getData(), start, 3)
            );
        }

        console.assert(false, 'GetPosition failed.');
        return new Point$1(0, 0, 0);
    }

    updateModelSpace(type) {
        this.updateModelBound();
        if (type === Visual$1.GU_MODEL_BOUND_ONLY) {
            return;
        }

        var vba = VertexBufferAccessor$1.fromVisual(this);
        if (vba.hasNormal()) {
            this.updateModelNormals(vba);
        }

        if (type !== Visual$1.GU_NORMALS) {
            if (vba.hasTangent() || vba.hasBinormal()) {
                if (type === Visual$1.GU_USE_GEOMETRY) {
                    this.updateModelTangentsUseGeometry(vba);
                }
                else {
                    this.updateModelTangentsUseTCoords(vba);
                }
            }
        }

        Renderer$1.updateAll(this.vertexBuffer);
    }

    /**
     * 更新物体模型空间法线
     * @param vba {VertexBufferAccessor}
     */
    updateModelNormals(vba) {
        var i, t, pos0, pos1, pos2, tv0, tv1, tNormal,
            v = new Array(3);
        const numTriangles = this.getNumTriangles();
        for (i = 0; i < numTriangles; ++i) {
            // 获取三角形3个顶点对应的索引.
            if (!this.getTriangle(i, v)) {
                continue;
            }

            // 获取顶点坐标.
            pos0 = new Point$1(vba.getPosition(v[0]));
            pos1 = new Point$1(vba.getPosition(v[1]));
            pos2 = new Point$1(vba.getPosition(v[2]));

            // 计算三角形法线.
            tv0 = pos1.subAsVector(pos0);
            tv1 = pos2.subAsVector(pos0);
            tNormal = tv0.cross(tv1);
            tNormal.normalize();

            // 更新对应3个顶点的法线
            t = vba.getNormal(v[0]);
            t[0] = tNormal.x;
            t[1] = tNormal.y;
            t[2] = tNormal.z;

            t = vba.getNormal(v[1]);
            t[0] = tNormal.x;
            t[1] = tNormal.y;
            t[2] = tNormal.z;

            t = vba.getNormal(v[2]);
            t[0] = tNormal.x;
            t[1] = tNormal.y;
            t[2] = tNormal.z;
        }
    }

    /**
     * 更新物体模型空间切线
     * @param vba {VertexBufferAccessor}
     */
    updateModelTangentsUseGeometry(vba) {
        // Compute the matrix of normal derivatives.
        const numVertices = vba.getNumVertices();
        var dNormal = new Array(numVertices);
        var wwTrn = new Array(numVertices);
        var dwTrn = new Array(numVertices);
        var i, j, row, col;

        for (i = 0; i < numTriangles; ++i) {
            wwTrn[i] = new Matrix().zero();
            dwTrn[i] = new Matrix().zero();
            dNormal[i] = new Matrix().zero();

            // 获取三角形的3个顶点索引.
            var v = new Array(3);
            if (!this.getTriangle(i, v)) {
                continue;
            }

            for (j = 0; j < 3; j++) {
                // 获取顶点坐标和法线.
                var v0 = v[j];
                var v1 = v[(j + 1) % 3];
                var v2 = v[(j + 2) % 3];
                var pos0 = new Point$1(vba.getPosition(v0));
                var pos1 = new Point$1(vba.getPosition(v1));
                var pos2 = new Point$1(vba.getPosition(v2));
                var nor0 = new Vector(vba.getNormal(v0));
                var nor1 = new Vector(vba.getNormal(v1));
                var nor2 = new Vector(vba.getNormal(v2));

                // 计算从pos0到pos1的边,使其射向顶点切面，然后计算相邻法线的差
                var edge = pos1.subAsVector(pos0);
                var proj = edge.sub(nor0.scalar(edge.dot(nor0)));
                var diff = nor1.sub(nor0);
                for (row = 0; row < 3; ++row) {
                    for (col = 0; col < 3; ++col) {
                        wwTrn[v0].setItem(row, col, wwTrn.item(row, col) + proj[row] * proj[col]);
                        dwTrn[v0].setItem(row, col, dwTrn.item(row, col) + diff[row] * proj[col]);
                    }
                }

                // 计算从pos0到pos2的边,使其射向顶点切面，然后计算相邻法线的差
                edge = pos2.subAsVector(pos0);
                proj = edge.sub(nor0.scalar(edge.dot(nor0)));
                diff = nor2.sub(nor0);
                for (row = 0; row < 3; ++row) {
                    for (col = 0; col < 3; ++col) {
                        wwTrn[v0].setItem(row, col, wwTrn.item(row, col) + proj[row] * proj[col]);
                        dwTrn[v0].setItem(row, col, dwTrn.item(row, col) + diff[row] * proj[col]);
                    }
                }
            }
        }

        // Add N*N^T to W*W^T for numerical stability.  In theory 0*0^T is added
        // to D*W^T, but of course no update is needed in the implementation.
        // Compute the matrix of normal derivatives.
        for (i = 0; i < numVertices; ++i) {
            var nor = vba.getNormal(i);
            for (row = 0; row < 3; ++row) {
                for (col = 0; col < 3; ++col) {
                    wwTrn[i].setItem(row, col, 0.5 * wwTrn[i].item(row, col) + nor[row] * nor[col]);
                    dwTrn[i].setItem(row, col, dwTrn[i].item(row, col) * 0.5);
                }
            }

            wwTrn[i].setColumn(3, Point$1.ORIGIN);
            dNormal[i] = dwTrn[i].mul(wwTrn[i]).inverse();
        }

        // gc?
        wwTrn = null;
        dwTrn = null;

        // If N is a unit-length normal at a vertex, let U and V be unit-length
        // tangents so that {U, V, N} is an orthonormal set.  Define the matrix
        // J = [U | V], a 3-by-2 matrix whose columns are U and V.  Define J^T
        // to be the transpose of J, a 2-by-3 matrix.  Let dN/dX denote the
        // matrix of first-order derivatives of the normal vector field.  The
        // shape matrix is
        //   S = (J^T * J)^{-1} * J^T * dN/dX * J = J^T * dN/dX * J
        // where the superscript of -1 denotes the inverse.  (The formula allows
        // for J built from non-perpendicular vectors.) The matrix S is 2-by-2.
        // The principal curvatures are the eigenvalues of S.  If k is a principal
        // curvature and W is the 2-by-1 eigenvector corresponding to it, then
        // S*W = k*W (by definition).  The corresponding 3-by-1 tangent vector at
        // the vertex is called the principal direction for k, and is J*W.  The
        // principal direction for the minimum principal curvature is stored as
        // the mesh tangent.  The principal direction for the maximum principal
        // curvature is stored as the mesh bitangent.
        for (i = 0; i < numVertices; ++i) {
            // Compute U and V given N.
            var norvec = new Vector(vba.getNormal(i));
            var uvec = new Vector(),
                vvec = new Vector();

            Vector.generateComplementBasis(uvec, vvec, norvec);

            // Compute S = J^T * dN/dX * J.  In theory S is symmetric, but
            // because we have estimated dN/dX, we must slightly adjust our
            // calculations to make sure S is symmetric.
            var s01 = uvec.dot(dNormal[i].mulPoint(vvec));
            var s10 = vvec.dot(dNormal[i].mulPoint(uvec));
            var sAvr = 0.5 * (s01 + s10);
            var smat = [
                [uvec.dot(dNormal[i].mulPoint(uvec)), sAvr],
                [sAvr, vvec.dot(dNormal[i].mulPoint(vvec))]
            ];

            // Compute the eigenvalues of S (min and max curvatures).
            var trace = smat[0][0] + smat[1][1];
            var det = smat[0][0] * smat[1][1] - smat[0][1] * smat[1][0];
            var discr = trace * trace - 4.0 * det;
            var rootDiscr = Math.sqrt(Math.abs(discr));
            var minCurvature = 0.5 * (trace - rootDiscr);
            // float maxCurvature = 0.5f*(trace + rootDiscr);

            // Compute the eigenvectors of S.
            var evec0 = new Vector(smat[0][1], minCurvature - smat[0][0], 0);
            var evec1 = new Vector(minCurvature - smat[1][1], smat[1][0], 0);

            var tanvec, binvec;
            if (evec0.squaredLength() >= evec1.squaredLength()) {
                evec0.normalize();
                tanvec = uvec.scalar(evec0.x).add(vvec.scalar(evec0.y));
                binvec = norvec.cross(tanvec);
            }
            else {
                evec1.normalize();
                tanvec = uvec.scalar(evec1.x).add(vvec.scalar(evec1.y));
                binvec = norvec.cross(tanvec);
            }

            if (vba.hasTangent()) {
                var t = vba.getTangent(i);
                t[0] = tanvec.x;
                t[1] = tanvec.y;
                t[2] = tanvec.z;
            }

            if (vba.hasBinormal()) {
                var b = vba.getBinormal(i);
                b[0] = binvec.x;
                b[1] = binvec.y;
                b[2] = binvec.z;
            }
        }
        dNormal = null;
    }

    /**
     * @param vba {VertexBufferAccessor}
     */
    updateModelTangentsUseTCoords(vba) {
        // Each vertex can be visited multiple times, so compute the tangent
        // space only on the first visit.  Use the zero vector as a flag for the
        // tangent vector not being computed.
        const numVertices = vba.getNumVertices();
        var hasTangent = vba.hasTangent();
        var zero = Vector.ZERO;
        var i, t;
        if (hasTangent) {
            for (i = 0; i < numVertices; ++i) {
                t = vba.getTangent(i);
                t[0] = 0;
                t[1] = 0;
                t[2] = 0;
            }
        } else {
            for (i = 0; i < numVertices; ++i) {
                t = vba.getBinormal(i);
                t[0] = 0;
                t[1] = 0;
                t[2] = 0;
            }
        }

        const numTriangles = this.getNumTriangles();
        for (i = 0; i < numTriangles; i++) {
            // Get the triangle vertices' positions, normals, tangents, and
            // texture coordinates.
            var v = [0, 0, 0];
            if (!this.getTriangle(i, v)) {
                continue;
            }

            var locPosition = new Array(3);
            var locNormal = new Array(3);
            var locTangent = new Array(3);
            var locTCoord = new Array(2);
            var curr, k;
            for (curr = 0; curr < 3; ++curr) {
                k = v[curr];
                locPosition[curr] = new Point$1(vba.getPosition(k));
                locNormal[curr] = new Vector(vba.getNormal(k));
                locTangent[curr] = new Vector((hasTangent ? vba.getTangent(k) : vba.getBinormal(k)));
                locTCoord[curr] = vba.getTCoord(0, k);
            }

            for (curr = 0; curr < 3; ++curr) {
                var currLocTangent = locTangent[curr];
                if (!currLocTangent.equals(zero)) {
                    // 该顶点已被计算过
                    continue;
                }

                // 计算顶点切线空间
                var norvec = locNormal[curr];
                var prev = ((curr + 2) % 3);
                var next = ((curr + 1) % 3);
                var tanvec = Triangles.computeTangent(
                    locPosition[curr], locTCoord[curr],
                    locPosition[next], locTCoord[next],
                    locPosition[prev], locTCoord[prev]
                );

                // Project T into the tangent plane by projecting out the surface
                // normal N, and then making it unit length.
                tanvec -= norvec.dot(tanvec) * norvec;
                tanvec.normalize();

                // Compute the bitangent B, another tangent perpendicular to T.
                var binvec = norvec.unitCross(tanvec);

                k = v[curr];
                if (hasTangent) {
                    locTangent[k] = tanvec;
                    if (vba.hasBinormal()) {
                        t = vba.getBinormal(k);
                        t[0] = binvec.x;
                        t[1] = binvec.y;
                        t[2] = binvec.z;
                    }
                }
                else {
                    t = vba.getBinormal(k);
                    t[0] = tanvec.x;
                    t[1] = tanvec.y;
                    t[2] = tanvec.z;
                }
            }
        }
    }

    /**
     * 计算切线
     *
     * @param position0 {Point}
     * @param tcoord0 {Array}
     * @param position1 {Point}
     * @param tcoord1 {Array}
     * @param position2 {Point}
     * @param tcoord2 {Array}
     * @returns {Vector}
     */
    static computeTangent(position0, tcoord0,
        position1, tcoord1,
        position2, tcoord2) {
        // Compute the change in positions at the vertex P0.
        var v10 = position1.subAsVector(position0);
        var v20 = position2.subAsVector(position0);

        const ZERO_TOLERANCE = Math.ZERO_TOLERANCE;
        const abs = Math.abs;

        if (abs(v10.length()) < ZERO_TOLERANCE ||
            abs(v20.length()) < ZERO_TOLERANCE) {
            // The triangle is very small, call it degenerate.
            return Vector.ZERO;
        }

        // Compute the change in texture coordinates at the vertex P0 in the
        // direction of edge P1-P0.
        var d1 = tcoord1[0] - tcoord0[0];
        var d2 = tcoord1[1] - tcoord0[1];
        if (abs(d2) < ZERO_TOLERANCE) {
            // The triangle effectively has no variation in the v texture
            // coordinate.
            if (abs(d1) < ZERO_TOLERANCE) {
                // The triangle effectively has no variation in the u coordinate.
                // Since the texture coordinates do not vary on this triangle,
                // treat it as a degenerate parametric surface.
                return Vector.ZERO;
            }

            // The variation is effectively all in u, so set the tangent vector
            // to be T = dP/du.
            return v10.div(d1);
        }

        // Compute the change in texture coordinates at the vertex P0 in the
        // direction of edge P2-P0.
        var d3 = tcoord2[0] - tcoord0[0];
        var d4 = tcoord2[1] - tcoord0[1];
        var det = d2 * d3 - d4 * d1;
        if (abs(det) < ZERO_TOLERANCE) {
            // The triangle vertices are collinear in parameter space, so treat
            // this as a degenerate parametric surface.
            return Vector.ZERO;
        }

        // The triangle vertices are not collinear in parameter space, so choose
        // the tangent to be dP/du = (dv1*dP2-dv2*dP1)/(dv1*du2-dv2*du1)
        return v20.scalar(d2).sub(v10.scalar(d4)).div(det);
    }
}

class TriMesh extends Triangles {

    /**
     * @param {VertexFormat} format
     * @param {VertexBuffer} vertexBuffer
     * @param {IndexBuffer} indexBuffer
     */
    constructor(format, vertexBuffer, indexBuffer) {
        super(Visual$1.PT_TRIMESH, format, vertexBuffer, indexBuffer);
    }
    /**
     * 获取网格中的三角形数量
     * @returns {number}
     */
    getNumTriangles() {
        return this.indexBuffer.numElements / 3;
    }

    /**
     * 获取位置I处的三角形索引
     * @param {number} i
     * @param {Array} output 3 elements
     * @returns {boolean}
     */
    getTriangle(i, output) {
        if (0 <= i && i < this.getNumTriangles()) {
            var data = this.indexBuffer.getData();
            data = new Uint32Array(data.subarray(3 * i * 4, 3 * (i + 1) * 4).buffer);
            output[0] = data[0];
            output[1] = data[1];
            output[2] = data[2];
            return true;
        }
        return false;
    }
}

D3Object.Register('L5.TriMesh', TriMesh.factory);

class PolyPoint extends Visual$1 {

    /**
     * @param format {L5.VertexFormat}
     * @param vertexBuffer {L5.VertexBuffer}
     */
    constructor(format, vertexBuffer) {
        super(Visual$1.PT_POLYPOINT, format, vertexBuffer, null);
        this.numPoints = vertexBuffer.numElements;
    }

    getMaxNumPoints() {
        return this.vertexBuffer.numElements;
    }

    setNumPoints(num) {
        var numVertices = this.vertexBuffer.numElements;
        if (0 <= num && num <= numVertices) {
            this.numPoints = num;
        }
        else {
            this.numPoints = numVertices;
        }
    }
}

class StandardMesh {
    constructor(format, isStatic, inside, transform) {
        isStatic = isStatic === undefined ? true : isStatic;
        this.format = format;
        this.transform = transform || Transform$1.IDENTITY;
        this.isStatic = true;
        this.inside = !!inside;
        this.hasNormals = false;

        this.usage = isStatic ? Buffer$1.BU_STATIC : Buffer$1.BU_DYNAMIC;

        // 检查顶点坐标
        var posIndex = format.getIndex(VertexFormat$1.AU_POSITION);
        console.assert(posIndex >= 0, 'Vertex format must have positions');
        var posType = format.getAttributeType(posIndex);
        console.assert(posType === VertexFormat$1.AT_FLOAT3, 'Positions must be 3-element of floats');

        // 检查法线
        var norIndex = format.getIndex(VertexFormat$1.AU_NORMAL);
        if (norIndex >= 0) {
            var norType = format.getAttributeType(norIndex);
            this.hasNormals = (norType === VertexFormat$1.AT_FLOAT3);
        }

        const MAX_UNITS = StandardMesh.MAX_UNITS;
        const AU_TEXCOORD = VertexFormat$1.AU_TEXCOORD;
        const AT_FLOAT2 = VertexFormat$1.AT_FLOAT2;

        this.hasTCoords = new Array(MAX_UNITS);
        for (var unit = 0; unit < MAX_UNITS; ++unit) {
            this.hasTCoords[unit] = false;
            var tcdIndex = format.getIndex(AU_TEXCOORD, unit);
            if (tcdIndex >= 0) {
                var tcdType = format.getAttributeType(tcdIndex);
                if (tcdType === AT_FLOAT2) {
                    this.hasTCoords[unit] = true;
                }
            }
        }
    }

    /**
     * 更改三角形卷绕顺序
     * @param numTriangles {number} 三角形数量
     * @param indices {Uint32Array} 顶点索引数组
     */
    reverseTriangleOrder(numTriangles, indices) {
        var i, j1, j2, save;
        for (i = 0; i < numTriangles; ++i) {
            j1 = 3 * i + 1;
            j2 = j1 + 1;
            save = indices[j1];
            indices[j1] = indices[j2];
            indices[j2] = save;
        }
    }
    /**
     *
     * @param vba {VertexBufferAccessor}
     */
    createPlatonicNormals(vba) {
        if (this.hasNormals) {
            const numVertices = vba.numVertices;
            var t;
            for (var i = 0; i < numVertices; ++i) {
                t = Array.from(vba.getPosition(i));
                vba.setNormal(i, t);
            }
        }
    }
    /**
     *
     * @param vba {VertexBufferAccessor}
     */
    createPlatonicUVs(vba) {
        const MAX_UNITS = StandardMesh.MAX_UNITS;
        const numVertices = vba.numVertices;
        const INV_PI = _Math.INV_PI;
        var unit, i, pos, t;
        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                for (i = 0; i < numVertices; ++i) {
                    pos = vba.getPosition(i);
                    t = 0.5;
                    if (_Math.abs(pos[2]) < 1) {
                        t *= 1 + _Math.atan2(pos[1], pos[0]) * INV_PI;
                    }
                    vba.setTCoord(unit, i, [t, _Math.acos(pos[2]) * INV_PI]);
                }
            }
        }
    }


    /**
     * 长方形
     * @param {number} xSamples x方向点数量
     * @param {number} ySamples y方向点数量
     * @param {number} width x 方向长度
     * @param {number} height y 方向长度
     * @returns {TriMesh}
     */
    rectangle(xSamples, ySamples, width, height) {
        const format = this.format;
        const stride = format.stride;
        const usage = this.usage;
        const hasNormals = this.hasNormals;

        const MAX_UNITS = StandardMesh.MAX_UNITS;
        var numVertices = xSamples * ySamples;
        var numTriangles = 2 * (xSamples - 1) * (ySamples - 1);
        var numIndices = 3 * numTriangles;

        // 创建顶点缓冲
        var vertexBuffer = new VertexBuffer(numVertices, stride, usage);
        var vba = new VertexBufferAccessor$1(format, vertexBuffer);

        // 生成几何体
        var stepX = 1 / (xSamples - 1); // x 方向每2个顶点间的距离
        var stepY = 1 / (ySamples - 1); // y 方向每2个顶点间的距离
        var u, v, x, y, p;
        var i, i0, i1, unit;
        for (i1 = 0, i = 0; i1 < ySamples; ++i1) {
            v = i1 * stepY;
            y = (2 * v - 1) * height;
            for (i0 = 0; i0 < xSamples; ++i0, ++i) {
                u = i0 * stepX;
                x = (2 * u - 1) * width;

                p = vba.setPosition(i, [x, 0, y]);

                if (hasNormals) {
                    p = vba.setNormal(i, [0, 1, 0]);
                }

                for (unit = 0; unit < MAX_UNITS; ++unit) {
                    if (this.hasTCoords[unit]) {
                        p = vba.setTCoord(unit, i, [u, v]);
                    }
                }
            }
        }
        this.transformData(vba);

        // 生成顶点索引
        var indexBuffer = new IndexBuffer$1(numIndices, 4, usage);
        var indices = new Uint32Array(indexBuffer.getData().buffer);
        var v0, v1, v2, v3, idx = 0;
        for (i1 = 0; i1 < ySamples - 1; ++i1) {
            for (i0 = 0; i0 < xSamples - 1; ++i0) {
                v0 = i0 + xSamples * i1;
                v1 = v0 + 1;
                v2 = v1 + xSamples;
                v3 = v0 + xSamples;
                indices[idx++] = v0;
                indices[idx++] = v1;
                indices[idx++] = v2;
                indices[idx++] = v0;
                indices[idx++] = v2;
                indices[idx++] = v3;
            }
        }

        return new TriMesh(format, vertexBuffer, indexBuffer);
    }

    /**
     * 圆盘
     * todo error
     * @param shellSamples {number}
     * @param radialSamples {number}
     * @param radius {number}
     * @returns {TriMesh}
     */
    disk(shellSamples, radialSamples, radius) {
        const MAX_UNITS = StandardMesh.MAX_UNITS;
        const usage = this.usage;
        const format = this.format;
        const hasNormals = this.hasNormals;
        const cos = _Math.cos;
        const sin = _Math.sin;

        var rsm1 = radialSamples - 1,
            ssm1 = shellSamples - 1;
        var numVertices = 1 + radialSamples * ssm1;
        var numTriangles = radialSamples * (2 * ssm1 - 1);
        var numIndices = 3 * numTriangles;

        var vertexBuffer = new VertexBuffer(numVertices, format.stride, usage);
        var vba = new VertexBufferAccessor$1(format, vertexBuffer);

        var t;

        // Center of disk.
        vba.setPosition(0, [0, 0, 0]);

        if (hasNormals) {
            vba.setNormal(0, [0, 0, 1]);
        }

        var unit;
        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, 0, [0.5, 0.5]);
            }
        }

        var invSSm1 = 1 / ssm1;
        var invRS = 1 / radialSamples;
        var rsPI = _Math.TWO_PI * invRS;
        var tcoord = [0.5, 0.5];

        var angle, cs, sn, s, fraction, fracRadial, fracRadial1, i;

        for (var r = 0; r < radialSamples; ++r) {
            angle = rsPI * r;
            cs = cos(angle);
            sn = sin(angle);

            var radial = new Vector$1(cs, sn, 0);

            for (s = 1; s < shellSamples; ++s) {
                fraction = invSSm1 * s;  // in (0,R]
                fracRadial = radial.scalar(fraction);
                i = s + ssm1 * r;

                fracRadial1 = fracRadial.scalar(radius);
                vba.setPosition(i, [fracRadial1.x, fracRadial1.y, fracRadial1.z]);

                if (hasNormals) {
                    vba.setNormal(i, [0, 0, 1]);
                }

                tcoord[0] = 0.5 + 0.5 * fracRadial[0];
                tcoord[1] = 0.5 + 0.5 * fracRadial[1];
                for (unit = 0; unit < MAX_UNITS; ++unit) {
                    if (this.hasTCoords[unit]) {
                        vba.setTCoord(unit, i, tcoord);
                    }
                }
            }
        }
        this.transformData(vba);

        // Generate indices.
        var indexBuffer = new IndexBuffer$1(numIndices, 4, usage);
        var indices = new Uint32Array(indexBuffer.getData().buffer);
        var r0, r1;
        for (r0 = rsm1, r1 = 0, t = 0; r1 < radialSamples; r0 = r1++) {
            indices[0] = 0;
            indices[1] = 1 + ssm1 * r0;
            indices[2] = 1 + ssm1 * r1;
            indices += 3;
            ++t;
            for (s = 1; s < ssm1; ++s, indices += 6) {
                var i00 = s + ssm1 * r0;
                var i01 = s + ssm1 * r1;
                var i10 = i00 + 1;
                var i11 = i01 + 1;
                indices[0] = i00;
                indices[1] = i10;
                indices[2] = i11;
                indices[3] = i00;
                indices[4] = i11;
                indices[5] = i01;
                t += 2;
            }
        }

        return new TriMesh(format, vertexBuffer, indexBuffer);
    }


}
// todo
// StandardMesh.MAX_UNITS = VertexFormat.MAX_TCOORD_UNITS;




/**
 * 长方体, 面朝内
 * 中心点 [0,0,0]
 * @param {number} xExtent
 * @param {number} yExtent
 * @param {number} zExtent
 * @returns {TriMesh}
 */
StandardMesh.prototype.box = function (xExtent, yExtent, zExtent) {
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const MAX_UNITS = StandardMesh.MAX_UNITS;

    var numVertices = 8;
    var numTriangles = 12;
    var numIndices = 3 * numTriangles;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor$1(format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [-xExtent, -yExtent, -zExtent]);
    vba.setPosition(1, [+xExtent, -yExtent, -zExtent]);
    vba.setPosition(2, [+xExtent, +yExtent, -zExtent]);
    vba.setPosition(3, [-xExtent, +yExtent, -zExtent]);
    vba.setPosition(4, [-xExtent, -yExtent, +zExtent]);
    vba.setPosition(5, [+xExtent, -yExtent, +zExtent]);
    vba.setPosition(6, [+xExtent, +yExtent, +zExtent]);
    vba.setPosition(7, [-xExtent, +yExtent, +zExtent]);

    for (var unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            vba.setTCoord(unit, 0, [0.25, 0.75]);
            vba.setTCoord(unit, 1, [0.75, 0.75]);
            vba.setTCoord(unit, 2, [0.75, 0.25]);
            vba.setTCoord(unit, 3, [0.25, 0.25]);
            vba.setTCoord(unit, 4, [0, 1]);
            vba.setTCoord(unit, 5, [1, 1]);
            vba.setTCoord(unit, 6, [1, 0]);
            vba.setTCoord(unit, 7, [0, 0]);
        }
    }
    this.transformData(vba);

    // Generate indices (outside view).
    var ibuffer = new IndexBuffer$1(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 1;
    indices[2] = 2;
    indices[3] = 0;
    indices[4] = 2;
    indices[5] = 3;

    indices[6] = 0;
    indices[7] = 5;
    indices[8] = 1;
    indices[9] = 0;
    indices[10] = 4;
    indices[11] = 5;

    indices[12] = 0;
    indices[13] = 7;
    indices[14] = 4;
    indices[15] = 0;
    indices[16] = 3;
    indices[17] = 7;

    indices[18] = 6;
    indices[19] = 5;
    indices[20] = 4;
    indices[21] = 6;
    indices[22] = 4;
    indices[23] = 7;

    indices[24] = 6;
    indices[25] = 1;
    indices[26] = 5;
    indices[27] = 6;
    indices[28] = 2;
    indices[29] = 1;

    indices[30] = 6;
    indices[31] = 3;
    indices[32] = 2;
    indices[33] = 6;
    indices[34] = 7;
    indices[35] = 3;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    var mesh = new TriMesh(format, vbuffer, ibuffer);
    if (this.hasNormals) {
        mesh.updateModelSpace(Visual$1.GU_NORMALS);
    }
    return mesh;
};

/**
 * 圆柱体
 *
 * 中心(0,0,0)
 * @param {number} axisSamples 轴细分
 * @param {number} radialSamples 半径细分
 * @param {number} radius 圆柱体圆面半径
 * @param {number} height 圆柱体高度
 * @param {boolean} open 是否上下开口的
 * @returns {TriMesh}
 */
StandardMesh.prototype.cylinder = function (axisSamples, radialSamples, radius, height, open) {
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const TWO_PI = _Math.TWO_PI;
    const MAX_UNITS = StandardMesh.MAX_UNITS;
    const cos = _Math.cos;
    const sin = _Math.sin;
    const hasNormals = this.hasNormals;
    const inside = this.inside;

    var unit, numVertices, vba;
    var tcoord;
    var t, i;
    var vertexBuffer, ibuffer;
    var mesh;

    if (open) {
        numVertices = axisSamples * (radialSamples + 1);
        var numTriangles = 2 * (axisSamples - 1) * radialSamples;
        var numIndices = 3 * numTriangles;

        // Create a vertex buffer.
        vertexBuffer = new VertexBuffer(numVertices, stride, usage);
        vba = new VertexBufferAccessor$1(format, vertexBuffer);

        // Generate geometry.
        var invRS = 1 / radialSamples;
        var invASm1 = 1 / (axisSamples - 1);
        var halfHeight = 0.5 * height;
        var r, a, aStart, angle;

        // Generate points on the unit circle to be used in computing the
        // mesh points on a cylinder slice.
        var cs = new Float32Array(radialSamples + 1);
        var sn = new Float32Array(radialSamples + 1);
        for (r = 0; r < radialSamples; ++r) {
            angle = TWO_PI * invRS * r;
            cs[r] = cos(angle);
            sn[r] = sin(angle);
        }
        cs[radialSamples] = cs[0];
        sn[radialSamples] = sn[0];

        // Generate the cylinder itself.
        for (a = 0, i = 0; a < axisSamples; ++a) {
            var axisFraction = a * invASm1;  // in [0,1]
            var z = -halfHeight + height * axisFraction;

            // Compute center of slice.
            var sliceCenter = new Point$1(0, 0, z);

            // Compute slice vertices with duplication at endpoint.
            var save = i;
            for (r = 0; r < radialSamples; ++r) {
                var radialFraction = r * invRS;  // in [0,1)
                var normal = new Vector$1(cs[r], sn[r], 0);
                t = sliceCenter.add(normal.scalar(radius));
                vba.setPosition(i, [t.x, t.y, t.z]);

                if (hasNormals) {
                    if (inside) {
                        normal = normal.negative();
                    }
                    vba.setNormal(i, [normal.x, normal.y, normal.z]);
                }

                tcoord = [radialFraction, axisFraction];
                for (unit = 0; unit < MAX_UNITS; ++unit) {
                    if (this.hasTCoords[unit]) {
                        vba.setTCoord(unit, i, tcoord);
                    }
                }

                ++i;
            }

            vba.setPosition(i, vba.getPosition(save));
            if (hasNormals) {
                vba.setNormal(i, vba.getNormal(save));
            }

            tcoord = [1, axisFraction];
            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    vba.setTCoord(0, i, tcoord);
                }
            }

            ++i;
        }
        this.transformData(vba);

        // Generate indices.
        ibuffer = new IndexBuffer$1(numIndices, 4, usage);
        var indices = new Uint32Array(ibuffer.getData().buffer);
        var j = 0;
        for (a = 0, aStart = 0; a < axisSamples - 1; ++a) {
            var i0 = aStart;
            var i1 = i0 + 1;
            aStart += radialSamples + 1;
            var i2 = aStart;
            var i3 = i2 + 1;
            for (i = 0; i < radialSamples; ++i, j += 6) {
                if (inside) {
                    indices[j] = i0++;
                    indices[j + 1] = i2;
                    indices[j + 2] = i1;
                    indices[j + 3] = i1++;
                    indices[j + 4] = i2++;
                    indices[j + 5] = i3++;
                }
                else { // outside view
                    indices[j] = i0++;
                    indices[j + 1] = i1;
                    indices[j + 2] = i2;
                    indices[j + 3] = i1++;
                    indices[j + 4] = i3++;
                    indices[j + 5] = i2++;
                }
            }
        }
        mesh = new TriMesh(format, vertexBuffer, ibuffer);
    }
    else {
        mesh = this.sphere(axisSamples, radialSamples, radius);
        vertexBuffer = mesh.vertexBuffer;
        numVertices = vertexBuffer.numElements;
        vba = new VertexBufferAccessor$1(format, vertexBuffer);

        // Flatten sphere at poles.
        var hDiv2 = 0.5 * height;
        vba.getPosition(numVertices - 2)[2] = -hDiv2;  // south pole
        vba.getPosition(numVertices - 1)[2] = +hDiv2;  // north pole

        // Remap z-values to [-h/2,h/2].
        var zFactor = 2 / (axisSamples - 1);
        var tmp0 = radius * (-1 + zFactor);
        var tmp1 = 1 / (radius * (1 - zFactor));
        for (i = 0; i < numVertices - 2; ++i) {
            var pos = vba.getPosition(i);
            pos[2] = hDiv2 * (-1 + tmp1 * (pos[2] - tmp0));
            var adjust = radius * _Math.invSqrt(pos[0] * pos[0] + pos[1] * pos[1]);
            pos[0] *= adjust;
            pos[1] *= adjust;
        }
        this.transformData(vba);

        if (hasNormals) {
            mesh.updateModelSpace(Visual$1.GU_NORMALS);
        }
    }

    mesh.modelBound.center = Point$1.ORIGIN;
    mesh.modelBound.radius = _Math.sqrt(radius * radius + height * height);
    return mesh;
};

/**
 * 球体
 * 物体中心:(0,0,0), 半径: radius, 北极点(0,0,radius), 南极点(0,0,-radius)
 *
 * @param radius {float} 球体半径
 * @param zSamples {int}
 * @param radialSamples {int}
 */
StandardMesh.prototype.sphere = function (zSamples, radialSamples, radius) {
    const MAX_UNITS = StandardMesh.MAX_UNITS;
    const TWO_PI = _Math.TWO_PI;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const hasNormal = this.hasNormals;
    const inside = this.inside;

    var zsm1 = zSamples - 1,
        zsm2 = zSamples - 2,
        zsm3 = zSamples - 3;
    var rsp1 = radialSamples + 1;
    var numVertices = zsm2 * rsp1 + 2;
    var numTriangles = 2 * zsm2 * radialSamples;
    var numIndices = 3 * numTriangles;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor$1(format, vbuffer);

    // Generate geometry.
    var invRS = 1 / radialSamples;
    var zFactor = 2 / zsm1;
    var r, z, zStart, i, unit, tcoord, angle;

    // Generate points on the unit circle to be used in computing the mesh
    // points on a cylinder slice.
    var sn = new Float32Array(rsp1);
    var cs = new Float32Array(rsp1);
    for (r = 0; r < radialSamples; ++r) {
        angle = TWO_PI * invRS * r;
        cs[r] = _Math.cos(angle);
        sn[r] = _Math.sin(angle);
    }
    sn[radialSamples] = sn[0];
    cs[radialSamples] = cs[0];

    var t;

    // Generate the cylinder itself.
    for (z = 1, i = 0; z < zsm1; ++z) {
        var zFraction = zFactor * z - 1;  // in (-1,1)
        var zValue = radius * zFraction;

        // Compute center of slice.
        var sliceCenter = new Point$1(0, 0, zValue);

        // Compute radius of slice.
        var sliceRadius = _Math.sqrt(_Math.abs(radius * radius - zValue * zValue));

        // Compute slice vertices with duplication at endpoint.
        var save = i;
        for (r = 0; r < radialSamples; ++r) {
            var radialFraction = r * invRS;  // in [0,1)
            var radial = new Vector$1(cs[r], sn[r], 0);
            t = radial.scalar(sliceRadius).add(sliceCenter);
            vba.setPosition(i, [t.x, t.y, t.z]);

            if (hasNormal) {
                t.normalize();
                if (inside) {
                    t = t.negative();
                }
                vba.setNormal(i, [t.x, t.y, t.z]);
            }

            tcoord = [radialFraction, 0.5 * (zFraction + 1)];
            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    vba.setTCoord(unit, i, tcoord);
                }
            }
            ++i;
        }

        vba.setPosition(i, vba.getPosition(save));
        if (hasNormal) {
            vba.setNormal(i, vba.getNormal(save));
        }

        tcoord = [1, 0.5 * (zFraction + 1)];
        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, i, tcoord);
            }
        }
        ++i;
    }

    // south pole
    vba.setPosition(i, [0, 0, -radius]);
    var nor = [0, 0, inside ? 1 : -1];
    if (hasNormal) {
        vba.setNormal(i, nor);
    }
    tcoord = [0.5, 0.5];
    for (unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            vba.setTCoord(unit, i, tcoord);
        }
    }
    ++i;

    // north pole
    vba.setPosition(i, [0, 0, radius]);
    nor = [0, 0, inside ? -1 : 1];
    if (hasNormal) {
        vba.setNormal(i, nor);
    }
    tcoord = [0.5, 1];
    for (unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            vba.setTCoord(unit, i, tcoord);
        }
    }
    ++i;

    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer$1(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    var j;
    for (z = 0, j = 0, zStart = 0; z < zsm3; ++z) {
        var i0 = zStart;
        var i1 = i0 + 1;
        zStart += rsp1;
        var i2 = zStart;
        var i3 = i2 + 1;
        for (i = 0; i < radialSamples; ++i, j += 6) {
            if (inside) {
                indices[j] = i0++;
                indices[j + 1] = i2;
                indices[j + 2] = i1;
                indices[j + 3] = i1++;
                indices[j + 4] = i2++;
                indices[j + 5] = i3++;
            }
            else  // inside view
            {
                indices[j] = i0++;
                indices[j + 1] = i1;
                indices[j + 2] = i2;
                indices[j + 3] = i1++;
                indices[j + 4] = i3++;
                indices[j + 5] = i2++;
            }
        }
    }

    // south pole triangles
    var numVerticesM2 = numVertices - 2;
    for (i = 0; i < radialSamples; ++i, j += 3) {
        if (inside) {
            indices[j] = i;
            indices[j + 1] = i + 1;
            indices[j + 2] = numVerticesM2;
        }
        else {
            indices[j] = i;
            indices[j + 1] = numVerticesM2;
            indices[j + 2] = i + 1;
        }
    }

    // north pole triangles
    var numVerticesM1 = numVertices - 1,
        offset = zsm3 * rsp1;
    for (i = 0; i < radialSamples; ++i, j += 3) {
        if (inside) {
            indices[j] = i + offset;
            indices[j + 1] = numVerticesM1;
            indices[j + 2] = i + 1 + offset;
        }
        else {
            indices[j] = i + offset;
            indices[j + 1] = i + 1 + offset;
            indices[j + 2] = numVerticesM1;
        }
    }

    // The duplication of vertices at the seam cause the automatically
    // generated bounding volume to be slightly off center.  Reset the bound
    // to use the true information.
    var mesh = new TriMesh(this.format, vbuffer, ibuffer);
    mesh.modelBound.center = Point$1.ORIGIN;
    mesh.modelBound.radius = radius;
    return mesh;
};

/**
 * 圆环
 * @param circleSamples {int} 大圆细分
 * @param radialSamples {int} 小圆细分
 * @param outerRadius {float} 大圆半径
 * @param innerRadius {float} 小圆半径
 * @returns {TriMesh}
 */
StandardMesh.prototype.torus = function (circleSamples, radialSamples, outerRadius, innerRadius) {
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const hasNormals = this.hasNormals;
    const inside = this.inside;
    const MAX_UNITS = StandardMesh.MAX_UNITS;

    const TWO_PI = _Math.TWO_PI;
    const cos = _Math.cos;
    const sin = _Math.sin;

    var numVertices = (circleSamples + 1) * (radialSamples + 1);
    var numTriangles = 2 * circleSamples * radialSamples;
    var numIndices = 3 * numTriangles;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor$1(format, vbuffer);

    // Generate geometry.
    var invCS = 1 / circleSamples;
    var invRS = 1 / radialSamples;
    var c, r, i, save, unit, tcoord;
    var circleFraction, theta, cosTheta, sinTheta;
    var radialFraction, phi, cosPhi, sinPhi;
    var radial = Vector$1.ZERO;
    var torusMiddle = Vector$1.ZERO;
    var normal = Vector$1.ZERO;

    // Generate the cylinder itself.
    for (c = 0, i = 0; c < circleSamples; ++c) {
        // Compute center point on torus circle at specified angle.
        circleFraction = c * invCS;  // in [0,1)
        theta = TWO_PI * circleFraction;
        cosTheta = cos(theta);
        sinTheta = sin(theta);
        radial.assign(cosTheta, sinTheta, 0);
        torusMiddle.assign(cosTheta * outerRadius, sinTheta * outerRadius, 0);

        // Compute slice vertices with duplication at endpoint.
        save = i;
        for (r = 0; r < radialSamples; ++r) {
            radialFraction = r * invRS;  // in [0,1)
            phi = TWO_PI * radialFraction;
            cosPhi = cos(phi);
            sinPhi = sin(phi);

            normal.assign(innerRadius * cosTheta * cosPhi, innerRadius * sinTheta * cosPhi, innerRadius * sinPhi);
            vba.setPosition(i, torusMiddle.add(normal));
            if (hasNormals) {
                if (inside) {
                    normal.assign(-normal.x, -normal.y, -normal.z);
                }
                vba.setNormal(i, normal);
            }

            tcoord = [radialFraction, circleFraction];
            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    vba.setTCoord(unit, i, tcoord);
                }
            }

            ++i;
        }

        vba.setPosition(i, vba.getPosition(save));
        if (hasNormals) {
            vba.setNormal(i, vba.getNormal(save));
        }

        tcoord = [1, circleFraction];
        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, i, tcoord);
            }
        }

        ++i;
    }

    // Duplicate the cylinder ends to form a torus.
    for (r = 0; r <= radialSamples; ++r, ++i) {
        vba.setPosition(i, vba.getPosition(r));
        if (hasNormals) {
            vba.setNormal(i, vba.getNormal(r));
        }

        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, i, [vba.getTCoord(unit, r)[0], 1]);
            }
        }
    }

    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer$1(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    var i0, i1, i2, i3, offset = 0;
    var cStart = 0;
    for (c = 0; c < circleSamples; ++c) {
        i0 = cStart;
        i1 = i0 + 1;
        cStart += radialSamples + 1;
        i2 = cStart;
        i3 = i2 + 1;
        for (i = 0; i < radialSamples; ++i, offset += 6) {
            if (inside) {
                indices[offset] = i0++;
                indices[offset + 1] = i1;
                indices[offset + 2] = i2;
                indices[offset + 3] = i1++;
                indices[offset + 4] = i3++;
                indices[offset + 5] = i2++;
            }
            else {  // inside view
                indices[offset] = i0++;
                indices[offset + 1] = i2;
                indices[offset + 2] = i1;
                indices[offset + 3] = i1++;
                indices[offset + 4] = i2++;
                indices[offset + 5] = i3++;
            }
        }
    }

    // The duplication of vertices at the seam cause the automatically
    // generated bounding volume to be slightly off center.  Reset the bound
    // to use the true information.
    var mesh = new TriMesh(format, vbuffer, ibuffer);
    mesh.modelBound.center.assign(0, 0, 0);
    mesh.modelBound.radius = outerRadius;
    return mesh;
};

/**
 * 四面体
 */
StandardMesh.prototype.tetrahedron = function () {
    const fSqrt2Div3 = _Math.sqrt(2) / 3;
    const fSqrt6Div3 = _Math.sqrt(6) / 3;
    const fOneThird = 1 / 3;

    const numVertices = 4;
    const numTriangles = 4;
    const numIndices = 12;
    const stride = this.format.stride;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, this.usage);
    var vba = new VertexBufferAccessor$1(this.format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [0, 0, 1]);
    vba.setPosition(1, [2 * fSqrt2Div3, 0, -fOneThird]);
    vba.setPosition(2, [-fSqrt2Div3, fSqrt6Div3, -fOneThird]);
    vba.setPosition(3, [-fSqrt2Div3, -fSqrt6Div3, -fOneThird]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer$1(numIndices, 4, this.usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 1;
    indices[2] = 2;
    indices[3] = 0;
    indices[4] = 2;
    indices[5] = 3;
    indices[6] = 0;
    indices[7] = 3;
    indices[8] = 1;
    indices[9] = 1;
    indices[10] = 3;
    indices[11] = 2;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new TriMesh(this.format, vbuffer, ibuffer);
};
/**
 * 六面体
 */
StandardMesh.prototype.hexahedron = function () {
    const fSqrtThird = _Math.sqrt(1 / 3);

    const numVertices = 8;
    const numTriangles = 12;
    const numIndices = 36;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor$1(format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [-fSqrtThird, -fSqrtThird, -fSqrtThird]);
    vba.setPosition(1, [fSqrtThird, -fSqrtThird, -fSqrtThird]);
    vba.setPosition(2, [fSqrtThird, fSqrtThird, -fSqrtThird]);
    vba.setPosition(3, [-fSqrtThird, fSqrtThird, -fSqrtThird]);
    vba.setPosition(4, [-fSqrtThird, -fSqrtThird, fSqrtThird]);
    vba.setPosition(5, [fSqrtThird, -fSqrtThird, fSqrtThird]);
    vba.setPosition(6, [fSqrtThird, fSqrtThird, fSqrtThird]);
    vba.setPosition(7, [-fSqrtThird, fSqrtThird, fSqrtThird]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer$1(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 3;
    indices[2] = 2;
    indices[3] = 0;
    indices[4] = 2;
    indices[5] = 1;
    indices[6] = 0;
    indices[7] = 1;
    indices[8] = 5;
    indices[9] = 0;
    indices[10] = 5;
    indices[11] = 4;
    indices[12] = 0;
    indices[13] = 4;
    indices[14] = 7;
    indices[15] = 0;
    indices[16] = 7;
    indices[17] = 3;
    indices[18] = 6;
    indices[19] = 5;
    indices[20] = 1;
    indices[21] = 6;
    indices[22] = 1;
    indices[23] = 2;
    indices[24] = 6;
    indices[25] = 2;
    indices[26] = 3;
    indices[27] = 6;
    indices[28] = 3;
    indices[29] = 7;
    indices[30] = 6;
    indices[31] = 7;
    indices[32] = 4;
    indices[33] = 6;
    indices[34] = 4;
    indices[35] = 5;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new TriMesh(this.format, vbuffer, ibuffer);
};
/**
 * 八面体
 */
StandardMesh.prototype.octahedron = function () {
    const numVertices = 6;
    const numTriangles = 8;
    const numIndices = 24;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor$1(format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [1, 0, 0]);
    vba.setPosition(1, [-1, 0, 0]);
    vba.setPosition(2, [0, 1, 0]);
    vba.setPosition(3, [0, -1, 0]);
    vba.setPosition(4, [0, 0, 1]);
    vba.setPosition(5, [0, 0, -1]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer$1(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 4;
    indices[1] = 0;
    indices[2] = 2;
    indices[3] = 4;
    indices[4] = 2;
    indices[5] = 1;
    indices[6] = 4;
    indices[7] = 1;
    indices[8] = 3;
    indices[9] = 4;
    indices[10] = 3;
    indices[11] = 0;
    indices[12] = 5;
    indices[13] = 2;
    indices[14] = 0;
    indices[15] = 5;
    indices[16] = 1;
    indices[17] = 2;
    indices[18] = 5;
    indices[19] = 3;
    indices[20] = 1;
    indices[21] = 5;
    indices[22] = 0;
    indices[23] = 3;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new TriMesh(this.format, vbuffer, ibuffer);
};
/**
 * 十二面体
 */
StandardMesh.prototype.dodecahedron = function () {
    const a = 1 / _Math.sqrt(3);
    const b = _Math.sqrt((3 - _Math.sqrt(5)) / 6);
    const c = _Math.sqrt((3 + _Math.sqrt(5)) / 6);

    const numVertices = 20;
    const numTriangles = 36;
    const numIndices = 108;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor$1(this.format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [a, a, a]);
    vba.setPosition(1, [a, a, -a]);
    vba.setPosition(2, [a, -a, a]);
    vba.setPosition(3, [a, -a, -a]);
    vba.setPosition(4, [-a, a, a]);
    vba.setPosition(5, [-a, a, -a]);
    vba.setPosition(6, [-a, -a, a]);
    vba.setPosition(7, [-a, -a, -a]);
    vba.setPosition(8, [b, c, 0]);
    vba.setPosition(9, [-b, c, 0]);
    vba.setPosition(10, [b, -c, 0]);
    vba.setPosition(11, [-b, -c, 0]);
    vba.setPosition(12, [c, 0, b]);
    vba.setPosition(13, [c, 0, -b]);
    vba.setPosition(14, [-c, 0, b]);
    vba.setPosition(15, [-c, 0, -b]);
    vba.setPosition(16, [0, b, c]);
    vba.setPosition(17, [0, -b, c]);
    vba.setPosition(18, [0, b, -c]);
    vba.setPosition(19, [0, -b, -c]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer$1(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 8;
    indices[2] = 9;
    indices[3] = 0;
    indices[4] = 9;
    indices[5] = 4;
    indices[6] = 0;
    indices[7] = 4;
    indices[8] = 16;
    indices[9] = 0;
    indices[10] = 12;
    indices[11] = 13;
    indices[12] = 0;
    indices[13] = 13;
    indices[14] = 1;
    indices[15] = 0;
    indices[16] = 1;
    indices[17] = 8;
    indices[18] = 0;
    indices[19] = 16;
    indices[20] = 17;
    indices[21] = 0;
    indices[22] = 17;
    indices[23] = 2;
    indices[24] = 0;
    indices[25] = 2;
    indices[26] = 12;
    indices[27] = 8;
    indices[28] = 1;
    indices[29] = 18;
    indices[30] = 8;
    indices[31] = 18;
    indices[32] = 5;
    indices[33] = 8;
    indices[34] = 5;
    indices[35] = 9;
    indices[36] = 12;
    indices[37] = 2;
    indices[38] = 10;
    indices[39] = 12;
    indices[40] = 10;
    indices[41] = 3;
    indices[42] = 12;
    indices[43] = 3;
    indices[44] = 13;
    indices[45] = 16;
    indices[46] = 4;
    indices[47] = 14;
    indices[48] = 16;
    indices[49] = 14;
    indices[50] = 6;
    indices[51] = 16;
    indices[52] = 6;
    indices[53] = 17;
    indices[54] = 9;
    indices[55] = 5;
    indices[56] = 15;
    indices[57] = 9;
    indices[58] = 15;
    indices[59] = 14;
    indices[60] = 9;
    indices[61] = 14;
    indices[62] = 4;
    indices[63] = 6;
    indices[64] = 11;
    indices[65] = 10;
    indices[66] = 6;
    indices[67] = 10;
    indices[68] = 2;
    indices[69] = 6;
    indices[70] = 2;
    indices[71] = 17;
    indices[72] = 3;
    indices[73] = 19;
    indices[74] = 18;
    indices[75] = 3;
    indices[76] = 18;
    indices[77] = 1;
    indices[78] = 3;
    indices[79] = 1;
    indices[80] = 13;
    indices[81] = 7;
    indices[82] = 15;
    indices[83] = 5;
    indices[84] = 7;
    indices[85] = 5;
    indices[86] = 18;
    indices[87] = 7;
    indices[88] = 18;
    indices[89] = 19;
    indices[90] = 7;
    indices[91] = 11;
    indices[92] = 6;
    indices[93] = 7;
    indices[94] = 6;
    indices[95] = 14;
    indices[96] = 7;
    indices[97] = 14;
    indices[98] = 15;
    indices[99] = 7;
    indices[100] = 19;
    indices[101] = 3;
    indices[102] = 7;
    indices[103] = 3;
    indices[104] = 10;
    indices[105] = 7;
    indices[106] = 10;
    indices[107] = 11;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new TriMesh(format, vbuffer, ibuffer);
};
/**
 * 二十面体
 */
StandardMesh.prototype.icosahedron = function () {
    const goldenRatio = 0.5 * (1 + _Math.sqrt(5));
    const invRoot = 1 / _Math.sqrt(1 + goldenRatio * goldenRatio);
    const u = goldenRatio * invRoot;
    const v = invRoot;

    const numVertices = 12;
    const numTriangles = 20;
    const numIndices = 60;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor$1(this.format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [u, v, 0]);
    vba.setPosition(1, [-u, v, 0]);
    vba.setPosition(2, [u, -v, 0]);
    vba.setPosition(3, [-u, -v, 0]);
    vba.setPosition(4, [v, 0, u]);
    vba.setPosition(5, [v, 0, -u]);
    vba.setPosition(6, [-v, 0, u]);
    vba.setPosition(7, [-v, 0, -u]);
    vba.setPosition(8, [0, u, v]);
    vba.setPosition(9, [0, -u, v]);
    vba.setPosition(10, [0, u, -v]);
    vba.setPosition(11, [0, -u, -v]);

    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer$1(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 8;
    indices[2] = 4;
    indices[3] = 0;
    indices[4] = 5;
    indices[5] = 10;
    indices[6] = 2;
    indices[7] = 4;
    indices[8] = 9;
    indices[9] = 2;
    indices[10] = 11;
    indices[11] = 5;
    indices[12] = 1;
    indices[13] = 6;
    indices[14] = 8;
    indices[15] = 1;
    indices[16] = 10;
    indices[17] = 7;
    indices[18] = 3;
    indices[19] = 9;
    indices[20] = 6;
    indices[21] = 3;
    indices[22] = 7;
    indices[23] = 11;
    indices[24] = 0;
    indices[25] = 10;
    indices[26] = 8;
    indices[27] = 1;
    indices[28] = 8;
    indices[29] = 10;
    indices[30] = 2;
    indices[31] = 9;
    indices[32] = 11;
    indices[33] = 3;
    indices[34] = 11;
    indices[35] = 9;
    indices[36] = 4;
    indices[37] = 2;
    indices[38] = 0;
    indices[39] = 5;
    indices[40] = 0;
    indices[41] = 2;
    indices[42] = 6;
    indices[43] = 1;
    indices[44] = 3;
    indices[45] = 7;
    indices[46] = 3;
    indices[47] = 1;
    indices[48] = 8;
    indices[49] = 6;
    indices[50] = 4;
    indices[51] = 9;
    indices[52] = 4;
    indices[53] = 6;
    indices[54] = 10;
    indices[55] = 5;
    indices[56] = 7;
    indices[57] = 11;
    indices[58] = 7;
    indices[59] = 5;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new TriMesh(format, vbuffer, ibuffer);
};

/**
 * @param vba {VertexBufferAccessor}
 */
StandardMesh.prototype.transformData = function (vba) {
    if (this.transform.isIdentity()) {
        return;
    }

    const numVertices = vba.numVertices;
    var i, f3, t;
    for (i = 0; i < numVertices; ++i) {
        t = vba.getPosition(i);
        f3 = new Point$1(t);
        f3 = this.transform.mulPoint(f3);
        t[0] = f3.x;
        t[1] = f3.y;
        t[2] = f3.z;
    }

    if (this.hasNormals) {
        for (i = 0; i < numVertices; ++i) {
            t = vba.getNormal(i);
            f3 = (new Vector$1(t)).normalize();
            t[0] = f3.x;
            t[1] = f3.y;
            t[2] = f3.z;
        }
    }
};

/**
 * TriFan
 *
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexSize {number}
 */
class TriStrip extends Triangles {
    constructor(format, vertexBuffer, indexSize) {
        super(Visual.PT_TRISTRIP, format, vertexBuffer, null);
        console.assert(indexSize === 2 || indexSize === 4, 'Invalid index size.');

        var numVertices = this.vertexBuffer.numElements;
        this.indexBuffer = new IndexBuffer(numVertices, indexSize);
        var i, indices;

        if (indexSize == 2) {
            indices = new Uint16Array(this.indexBuffer.getData());
        }
        else // indexSize == 4
        {
            indices = new Uint32Array(this.indexBuffer.getData());
        }
        for (i = 0; i < numVertices; ++i) {
            indices[i] = i;
        }
    }

    /**
     * 获取网格中的三角形数量
     * @returns {number}
     */
    getNumTriangles() {
        return this.indexBuffer.numElements - 2;
    }

    /**
     * 获取位置I处的三角形索引
     * @param i {number}
     * @param output {Array} 3 elements
     * @returns {boolean}
     */
    getTriangle(i, output) {
        if (0 <= i && i < this.getNumTriangles()) {
            var data = new Uint32Array(this.indexBuffer.getData());
            output[0] = data[i];
            if (i & 1) {
                output[1] = data[i + 2];
                output[2] = data[i + 1];
            }
            else {
                output[1] = data[i + 1];
                output[2] = data[i + 2];
            }
            return output[0] !== output[1] &&
                output[0] !== output[2] &&
                output[1] !== output[2];
        }
        return false;
    }
}

D3Object.Register('L5.TriStrip', TriStrip.factory);

class PointController extends Controller {
    constructor() {
        super();

        this.systemLinearSpeed = 0.0;
        this.systemAngularSpeed = 0.0;
        this.systemLinearAxis = Vector$1.UNIT_Z;
        this.systemAngularAxis = Vector$1.UNIT_Z;

        this.numPoints = 0;
        this.pointLinearSpeed = 0.0;
        this.pointAngularSpeed = 0.0;
        this.pointLinearAxis = Vector$1.UNIT_Z;
        this.pointAngularAxis = Vector$1.UNIT_Z;
    }
    /**
     * The animation update.  The application time is in milliseconds.
     * @param {number} applicationTime
     */
    update(applicationTime) {
        if (!super.update(applicationTime)) {
            return false;
        }
        let ctrlTime = this.getControlTime(applicationTime);
        this.updateSystemMotion(ctrlTime);
        this.updatePointMotion(ctrlTime);
        return true;
    }

    reallocate(numPoints) {
        delete this.pointLinearSpeed;
        delete this.pointAngularSpeed;
        delete this.pointLinearAxis;
        delete this.pointAngularAxis;

        this.numPoints = numPoints;
        if (numPoints > 0) {
            this.pointLinearSpeed = new Array(numPoints);
            this.pointAngularSpeed = new Array(numPoints);
            this.pointLinearAxis = new Array(numPoints);
            this.pointAngularAxis = new Array(numPoints);
            for (let i = 0; i < numPoints; ++i) {
                this.pointLinearSpeed[i] = 0.0;
                this.pointAngularSpeed[i] = 0.0;
                this.pointLinearAxis[i] = Vector$1.UNIT_Z;
                this.pointAngularAxis[i] = Vector$1.UNIT_Z;
            }
        }
    }

    /**
     * @param {ControlledObject} ctldObj
     */
    setObject(ctldObj) {
        this.object = ctldObj;
        if (this.object) {
            console.assert(!(ctldObj instanceof PolyPoint), 'Invalid class');
            this.reallocate(ctldObj.vertexBuffer.numElements);
        }
        else {
            this.reallocate(0);
        }
    }

    /**
     * This class computes the new positions and orientations from the motion
     * parameters.  Derived classes should update the motion parameters and
     * then either call the base class update methods or provide its own
     * update methods for position and orientation.
     * @param {number} ctrlTime 
     */
    updateSystemMotion(ctrlTime) {
        let points = this.object;
        let distance = ctrlTime * this.systemLinearSpeed;
        let deltaTrn = this.systemLinearAxis.scalar(distance);
        points.localTransform.setTranslate(
            points.localTransform.getTranslate().add(deltaTrn)
        );

        let angle = ctrlTime * this.systemAngularSpeed;
        let deltaRot = Matrix$1.makeRotation(this.systemAngularAxis, angle);

        points.localTransform.setRotate(deltaRot.mul(points.localTransform.getRotate()));
    }

    updatePointMotion(ctrlTime) {
        let points = this.object;
        let vba = VertexBufferAccessor$1.fromVisual(points);

        const numPoints = points.numPoints;
        let i, distance, pos, deltaTrn;
        for (i = 0; i < numPoints; ++i) {
            distance = ctrlTime * this.pointLinearSpeed[i];
            deltaTrn = this.pointLinearAxis[i].scalar(distance);

            pos = vba.getPosition(i);
            pos[0] += deltaTrn.x;
            pos[1] += deltaTrn.y;
            pos[2] += deltaTrn.z;
        }

        let angle, normal, deltaRot;
        if (vba.hasNormal()) {
            for (i = 0; i < numPoints; ++i) {
                angle = ctrlTime * this.pointAngularSpeed[i];
                normal = vba.getNormal(i);
                normal.normalize();
                deltaRot = Matrix$1.makeRotation(this.pointAngularAxis[i], angle);
                vba.setNormal(i, deltaRot.mulPoint(normal));
            }
        }

        Renderer$1.updateAll(points.vertexBuffer);
    }
}

class SkinController extends Controller {

    /**
     * @param {number} numVertices
     * @param {number} numBones
     */
    constructor(numVertices = 0, numBones = 0) {
        super();
        this.numVertices = numVertices;
        this.numBones = numBones;
        this.__init();
    }

    __init() {
        let numBones = this.numBones,
            numVertices = this.numVertices;
        if (numVertices > 0) {
            /**
             * @let {Array<Node>}
             */
            this.bones = new Array(numBones);

            /**
             * @type {Array< Array<number> >}
             */
            this.weights = new Array(numVertices);
            /**
             * @type {Array< Array<Point> >}
             */
            this.offsets = new Array(numVertices);

            for (let i = 0; i < numVertices; ++i) {
                this.weights[i] = new Array(numBones);
                this.offsets[i] = new Array(numBones);
            }
        }
    }

    /**
     * 动画更新
     * @param {number} applicationTime 毫秒
     * @returns {boolean}
     */
    update(applicationTime) {
        if (!super.update(applicationTime)) {
            return false;
        }

        let visual = this.object;
        console.assert(
            this.numVertices === visual.vertexBuffer.numElements,
            'Controller must have the same number of vertices as the buffer'
        );

        let vba = VertexBufferAccessor.fromVisual(visual);

        // 在骨骼的世界坐标系计算蒙皮顶点, 所以visual的worldTransform必须是单位Transform
        visual.worldTransform = Transform.IDENTITY;
        visual.worldTransformIsCurrent = true;

        // 计算蒙皮顶点位置
        let nv = this.numVertices,
            nb = this.numBones,
            vertex, bone, weight, offset, worldOffset, position;
        for (vertex = 0; vertex < nv; ++vertex) {
            position = Point.ORIGIN;

            for (bone = 0; bone < nb; ++bone) {
                weight = this.weights[vertex][bone];
                if (weight !== 0) {
                    offset = this.offsets[vertex][bone];
                    worldOffset = this.bones[bone].worldTransform.mulPoint(offset);
                    position = position.add(worldOffset.scalar(weight));
                }
            }
            vba.setPosition(vertex, position);
        }

        visual.updateModelSpace(Visual.GU_NORMALS);
        Renderer$1.updateAll(visual.vertexBuffer());
        return true;
    }

    /**
     * 文件载入支持
     * @param {InStream} inStream
     */
    load(inStream) {
        super.load(inStream);
        let numVertices = inStream.readUint32();
        let numBones = inStream.readUint32();

        this.numVertices = numVertices;
        this.numBones = numBones;
        this.__init();
        let total = this.numVertices * this.numBones, i;
        let t = inStream.readArray(total);
        let t1 = inStream.readSizedPointArray(total);
        for (i = 0; i < numVertices; ++i) {
            this.weights[i] = t.slice(i * numBones, (i + 1) * numBones);
            this.offsets[i] = t1.slice(i * numBones, (i + 1) * numBones);
        }
        this.bones = inStream.readSizedPointerArray(numBones);
    }

    /**
     * 文件载入支持
     * @param {InStream} inStream
     */
    link(inStream) {
        super.link(inStream);
        inStream.resolveArrayLink(this.numBones, this.bones);
    }
}

D3Object.Register('L5.SkinController', SkinController.factory.bind(SkinController));

/**
 * Color 颜色
 * @author lonphy
 * @version 1.0
 */

class ShaderFloat extends D3Object {

    /**
     * @param numRegisters {number}
     */
    constructor(numRegisters) {
        super();
        this.numElements = 0;
        this.data = null;
        this.allowUpdater = false;
        this.setNumRegisters(numRegisters);
    }

    /**
     * @param numRegisters {number}
     */
    setNumRegisters(numRegisters) {
        console.assert(numRegisters > 0, 'Number of registers must be positive');
        this.numElements = 4 * numRegisters;
        this.data = new Float32Array(this.numElements);
    }

    getNumRegisters() {
        return this.numElements / 4;
    }

    item(index, val) {
        console.assert(0 <= index && index < this.numElements, 'Invalid index');
        if (val === undefined) {
            return this.data[index];
        }
        this.data[index] = val;
    }

    /**
     * @param i {number} location of elements
     * @param data {Float32Array} 4-tuple float
     */
    setOneRegister(i, data) {
        console.assert(0 <= i && i < this.numElements / 4, 'Invalid register');
        this.data.set(data.subarray(0, 4), 4 * i);
    }

    /**
     * @param data {Float32Array}
     */
    setRegister(data) {
        this.data.set(data.subarray(0, this.numElements));
    }

    /**
     * @param i {number}
     * @returns {Float32Array}
     */
    getOneRegister(i) {
        console.assert(0 <= i && i < this.numElements / 4, 'Invalid register');
        return new Float32Array(this.data.subarray(4 * i, 4 * i + 4));
    }

    /**
     * @returns {Float32Array}
     */
    getRegisters() {
        return new Float32Array(this.data);
    }

    /**
     * @param data {Float32Array}
     */
    copy(data) {
        //this.data.set(data.subarray(0, this.numElements));
        this.data.set(data);
        return this;
    }

    /**
     * @param visual {L5.Visual}
     * @param camera {L5.Camera}
     */
    update(visual, camera) {
        // 占位函数,子类实现
    }

    load(inStream) {
        super.load(inStream);
        this.data = new Float32Array(inStream.readFloatArray());
        this.numElements = this.data.length;
        this.allowUpdater = inStream.readBool();
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeFloat32Array(this.numElements, this.data);
        outStream.writeBool(this.allowUpdater);
    }
}

/**
 * 相机位置
 */
class CameraModelPositionConstant$1 extends ShaderFloat{
    constructor() {
        super(1);
        this.allowUpdater = true;
    }

    /**
     * 更新
     * @param visual {L5.Visual}
     * @param camera {L5.Camera}
     */
    update(visual, camera) {
        let worldPosition = camera.position;
        let worldInvMatrix = visual.worldTransform.inverse();
        let modelPosition = worldInvMatrix.mulPoint(worldPosition);
        this.copy(modelPosition);
    }
}

D3Object.Register('L5.CameraModelPositionConstant', CameraModelPositionConstant$1.factory);

/**
 * 灯光 - 环境光分量
 */
class LightAmbientConstant$1 extends  ShaderFloat{

    /**
     * @param light {L5.Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新环境光分量
     * @param visual {L5.Visual}
     * @param camera {L5.Camera}
     */
    update(visual, camera) {
        this.copy(this.light.ambient);
    }

    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
}

D3Object.Register('L5.LightAmbientConstant', LightAmbientConstant$1.factory);

/**
 * 灯光 - 衰减系数
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {L5.LightAttenuationConstant}
 * @extends {L5.ShaderFloat}
 */
class LightAttenuationConstant$1 extends ShaderFloat {

    /**
     * @param light {L5.Light} 灯光
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新衰减系数
     * @param visual {L5.Visual}
     * @param camera {L5.Camera}
     */
    update(visual, camera) {
        this.data[0] = this.light.constant;
        this.data[1] = this.light.linear;
        this.data[2] = this.light.quadratic;
        this.data[3] = this.light.intensity;
    }

    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
}

D3Object.Register('L5.LightAttenuationConstant', LightAttenuationConstant$1.factory);

/**
 * 灯光 - 漫反射分量
 */
class LightDiffuseConstant$1 extends ShaderFloat {

    /**
     * @param light {L5.Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新漫反射分量
     * @param visual {L5.Visual}
     * @param camera {L5.Camera}
     */
    update(visual, camera) {
        this.copy(this.light.diffuse);
    }

    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
}

D3Object.Register('L5.LightDiffuseConstant', LightDiffuseConstant$1.factory);

/**
 * 灯光 - 入射方向向量
 *
 */
class LightModelDirectionConstant$1 extends ShaderFloat {

    /**
     * @param light {Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新材质环境光系数
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update(visual, camera) {
        var worldInvMatrix = visual.worldTransform.inverse();
        var modelDir = worldInvMatrix.mulPoint(this.light.direction);
        this.copy(modelDir);
    }


    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
}

D3Object.Register('L5.LightModelDirectionConstant', LightModelDirectionConstant$1.factory);

/**
 * 灯光 - 光源位置
 */
class LightModelPositionConstant extends ShaderFloat {

    /**
     * @param light {Light} 灯光
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新材质环境光系数
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update(visual, camera) {
        var worldInvMatrix = visual.worldTransform.inverse();
        var modelPosition = worldInvMatrix.mulPoint(this.light.position);
        this.copy(modelPosition);
    }

    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
}

D3Object.Register('L5.LightModelPositionConstant', LightModelPositionConstant.factory);

/**
 * 灯光 - 高光分量
 */
class LightSpecularConstant$1 extends ShaderFloat {

    /**
     * @param light {Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新高光分量
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update(visual, camera) {
        this.copy(this.light.specular);
    }

    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
}

D3Object.Register('L5.LightSpecularConstant', LightSpecularConstant$1.factory);

/**
 * 灯光 - 聚光灯参数
 */
class LightSpotConstant extends ShaderFloat {

    /**
     * @param light {Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新材质环境光系数
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update (visual, camera) {
        this.data[0] = this.light.angle;
        this.data[1] = this.light.cosAngle;
        this.data[2] = this.light.sinAngle;
        this.data[3] = this.light.exponent;
    }

    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
}

D3Object.Register('L5.LightSpotConstant', LightSpotConstant.factory);

/**
 * 灯光 - 世界坐标系方向
 */
class LightWorldDirectionConstant extends ShaderFloat {

    /**
     * @param light {Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新光源世界坐标系的方向
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update (visual, camera) {
        this.copy(this.light.direction);
    }

    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
}

D3Object.Register('L5.LightWorldDirectionConstant', LightWorldDirectionConstant.factory);

/**
 * 灯光 - 世界坐标
 */
class LightWorldPositionConstant extends ShaderFloat {

    /**
     * @param light {Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新光源世界坐标系的方向
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update (visual, camera) {
        this.copy(this.light.position);
    }

    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
}

D3Object.Register('L5.LightWorldPositionConstant', LightWorldPositionConstant.factory);

/**
 * 材质环境光系数
 */

class MaterialAmbientConstant$1 extends ShaderFloat {

    /**
     * @param material {Material} 材质
     */
    constructor(material) {
        super(1);
        this.allowUpdater = true;
        this.material = material;
    }

    /**
     * 更新材质环境光系数
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update(visual, camera) {
        this.copy(this.material.ambient);
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
}

D3Object.Register('L5.MaterialAmbientConstant', MaterialAmbientConstant$1.factory);

/**
 * 材质漫反射系数
 */
class MaterialDiffuseConstant$1 extends ShaderFloat {

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
}

D3Object.Register('L5.MaterialDiffuseConstant', MaterialDiffuseConstant$1.factory);

/**
 * 材质自发光系数
 */
class MaterialEmissiveConstant$1 extends ShaderFloat{

    /**
     * @param material {Material} 材质
     */
    constructor(material) {
        super(1);
        this.allowUpdater = true;
        this.material = material;
    }

    /**
     * 更新材自发光系数
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update(visual, camera) {
        this.copy(this.material.emissive);
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
}

D3Object.Register('L5.MaterialEmissiveConstant', MaterialEmissiveConstant$1.factory);

/**
 * 材质高光系数
 */
class MaterialSpecularConstant$1 extends ShaderFloat {

    /**
     * @param material {Material} 材质
     */
    constructor(material) {
        super(1);
        this.allowUpdater = true;
        this.material = material;
    }

    /**
     * 更新材高光系数
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update(visual, camera) {
        this.copy(this.material.specular);
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
}

D3Object.Register('L5.MaterialSpecularConstant', MaterialSpecularConstant$1.factory);

/**
 * 透视视图坐标系矩阵
 */
class PVWMatrixConstant$1 extends ShaderFloat {
    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update (visual, camera) {
        var projViewMatrix = camera.projectionViewMatrix;
        var worldMatrix = visual.worldTransform.toMatrix();
        var projViewWorldMatrix = projViewMatrix.mul(worldMatrix);
        this.copy(projViewWorldMatrix);
    }
}

D3Object.Register('L5.PVWMatrixConstant', PVWMatrixConstant$1.factory);

/**
 * 视图坐标系矩阵
 */
class WMatrixConstant extends ShaderFloat{

    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update(visual, camera) {
        this.copy(visual.worldTransform.toMatrix());
    }
}

/**
 * 默认效果着色器
 */
class DefaultEffect extends VisualEffect {
    constructor() {
        super();

        let vs = new VertexShader('DefaultVS', 1, 1, 0);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setProgram(DefaultEffect.VS);

        let fs = new FragShader('DefaultFS');
        fs.setProgram(DefaultEffect.FS);

        let program = new Program('DefaultProgram', vs, fs);
        let pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        let technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    createInstance() {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        return instance;
    }
}

DECLARE_ENUM(DefaultEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
void main(){
    gl_Position = uPVWMatrix * vec4(modelPosition, 1.0);
}
`,
    FS: `#version 300 es
precision highp float;
out vec4 fragColor;
void main (void) {
    fragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
`
});

/**
 * 只有环境光和发射光的着色器
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {LightAmbEffect}
 * @extends {VisualEffect}
 */
class LightAmbEffect extends VisualEffect {

    constructor() {
        super();
        var vs = new VertexShader('LightAmbEffectVS', 1, 5);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setConstant(1, 'MaterialEmissive', Shader.VT_VEC4);
        vs.setConstant(2, 'MaterialAmbient', Shader.VT_VEC4);
        vs.setConstant(3, 'LightAmbient', Shader.VT_VEC4);
        vs.setConstant(4, 'LightAttenuation', Shader.VT_VEC4);
        vs.setProgram(LightAmbEffect.VS);

        var fs = new FragShader('LightAmbEffectFS', 1);
        fs.setProgram(LightAmbEffect.FS);

        var program = new Program('LightAmbProgram', vs, fs);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setVertexConstant(0, 1, new MaterialEmissiveConstant$1(material));
        instance.setVertexConstant(0, 2, new MaterialAmbientConstant$1(material));
        instance.setVertexConstant(0, 3, new LightAmbientConstant$1(light));
        instance.setVertexConstant(0, 4, new LightAttenuationConstant$1(light));
        return instance;
    }

    static createUniqueInstance(light, material) {
        var effect = new LightAmbEffect();
        return effect.createInstance(light, material);
    }
}

DECLARE_ENUM(LightAmbEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec3 LightAmbient;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]
layout(location=0) in vec3 modelPosition;
out vec3 vColor;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vec3 ambient = LightAttenuation.w * LightAmbient;
    vColor = MaterialEmissive + MaterialAmbient * ambient;
}
`,
    FS: `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 fragColor;
void main(){
    fragColor = vec4(vColor, 1.0);
}
`
});

/**
 * Gouraud 光照效果 (片段Blinn光照)
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {LightDirPerFragEffect}
 * @extends {VisualEffect}
 */
class LightDirPerFragEffect extends VisualEffect {

    constructor() {
        super();

        var vshader = new VertexShader('LightDirPerFragVS', 2, 1);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(LightDirPerFragEffect.VS);

        var fshader = new FragShader('LightDirPerFragFS', 0, 10);
        fshader.setConstant(0, 'CameraModelPosition', Shader.VT_VEC3);
        fshader.setConstant(1, 'MaterialEmissive', Shader.VT_VEC3);
        fshader.setConstant(2, 'MaterialAmbient', Shader.VT_VEC3);
        fshader.setConstant(3, 'MaterialDiffuse', Shader.VT_VEC4);
        fshader.setConstant(4, 'MaterialSpecular', Shader.VT_VEC4);
        fshader.setConstant(5, 'LightModelDirection', Shader.VT_VEC3);
        fshader.setConstant(6, 'LightAmbient', Shader.VT_VEC3);
        fshader.setConstant(7, 'LightDiffuse', Shader.VT_VEC3);
        fshader.setConstant(8, 'LightSpecular', Shader.VT_VEC3);
        fshader.setConstant(9, 'LightAttenuation', Shader.VT_VEC4);
        fshader.setProgram(LightDirPerFragEffect.FS);

        var program = new Program('LightDirPerFragProgram', vshader, fshader);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    static createUniqueInstance(light, material) {
        var effect = new LightDirPerFragEffect();
        return effect.createInstance(light, material);
    }

    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setFragConstant(0, 0, new CameraModelPositionConstant$1());
        instance.setFragConstant(0, 1, new MaterialEmissiveConstant$1(material));
        instance.setFragConstant(0, 2, new MaterialAmbientConstant$1(material));
        instance.setFragConstant(0, 3, new MaterialDiffuseConstant$1(material));
        instance.setFragConstant(0, 4, new MaterialSpecularConstant$1(material));
        instance.setFragConstant(0, 5, new LightModelDirectionConstant$1(light));
        instance.setFragConstant(0, 6, new LightAmbientConstant$1(light));
        instance.setFragConstant(0, 7, new LightDiffuseConstant$1(light));
        instance.setFragConstant(0, 8, new LightSpecularConstant$1(light));
        instance.setFragConstant(0, 9, new LightAttenuationConstant$1(light));
        return instance;
    }


    load(inStream) {
        this.___ = this.techniques;
        super.load(inStream);
    }

    postLink() {
        super.postLink();
        var pass = this.techniques[0].getPass(0);
        pass.program.vertexShader.program = (LightDirPerFragEffect.VS);
        pass.program.fragShader.program = (LightDirPerFragEffect.FS);

        this.techniques = this.___;
    }
}

DECLARE_ENUM(LightDirPerFragEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec3 vertexPosition;
out vec3 vertexNormal;
void main(){
    vertexPosition = modelPosition;
    vertexNormal = modelNormal;
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}
`,
    FS: `#version 300 es
precision highp float;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;    // alpha通道存储光滑度
uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]
in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;
void main () {
    vec3 normal = normalize(vertexNormal);
    vec3 color = LightAmbient * MaterialAmbient;           // 计算环境光分量
    float t = abs(dot(normal, LightModelDirection));        // 计算入射角cos值
    color = color + t * MaterialDiffuse.rgb * LightDiffuse;   // 计算漫反射分量
    if (t > 0.0) {
        vec3 tmp = normalize(CameraModelPosition - vertexPosition);
        tmp = normalize(tmp - LightModelDirection);
        t = max(dot(normal, tmp), 0.0);
        float weight = pow(t, clamp(MaterialSpecular.w, -128.0, 128.0) );
        color = weight * MaterialSpecular.rgb * LightSpecular + color;
    }
    color = color * LightAttenuation.w + MaterialEmissive;
    fragColor = vec4(color, MaterialDiffuse.a);
}
`
});

D3Object.Register('LightDirPerFragEffect', LightDirPerFragEffect.factory);

/**
 * 平行光 光照效果 (顶点Blinn光照)
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {LightDirPerVerEffect}
 * @extends {VisualEffect}
 */
class LightDirPerVerEffect extends VisualEffect {

    constructor() {
        super();
        var vshader = new VertexShader('LightDirPerVerVS', 2, 11);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC3);
        vshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC3);
        vshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC3);
        vshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
        vshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);

        vshader.setConstant(6, 'LightModelDirection', Shader.VT_VEC3);
        vshader.setConstant(7, 'LightAmbient', Shader.VT_VEC3);
        vshader.setConstant(8, 'LightDiffuse', Shader.VT_VEC3);
        vshader.setConstant(9, 'LightSpecular', Shader.VT_VEC3);
        vshader.setConstant(10, 'LightAttenuation', Shader.VT_VEC4);
        vshader.setProgram(LightDirPerVerEffect.VS);

        var fshader = new FragShader('LightDirPerVerFS');
        fshader.setProgram(LightDirPerVerEffect.FS);

        var program = new Program('LightDirPerVerProgram', vshader, fshader);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setVertexConstant(0, 1, new CameraModelPositionConstant$1());
        instance.setVertexConstant(0, 2, new MaterialEmissiveConstant$1(material));
        instance.setVertexConstant(0, 3, new MaterialAmbientConstant$1(material));
        instance.setVertexConstant(0, 4, new MaterialDiffuseConstant$1(material));
        instance.setVertexConstant(0, 5, new MaterialSpecularConstant$1(material));
        instance.setVertexConstant(0, 6, new LightModelDirectionConstant$1(light));
        instance.setVertexConstant(0, 7, new LightAmbientConstant$1(light));
        instance.setVertexConstant(0, 8, new LightDiffuseConstant$1(light));
        instance.setVertexConstant(0, 9, new LightSpecularConstant$1(light));
        instance.setVertexConstant(0, 10, new LightAttenuationConstant$1(light));
        return instance;
    }

    static createUniqueInstance(light, material) {
        var effect = new LightDirPerVerEffect();
        return effect.createInstance(light, material);
    }

    load(inStream) {
        this.___ = this.techniques;
        super.load(inStream);
    }

    postLink() {
        super.postLink();
        var pass = this.techniques[0].getPass(0);
        pass.program.vertexShader.vertexShader = (LightDirPerVerEffect.VertexSource);
        pass.program.fragShader.fragShader = (LightDirPerVerEffect.FragSource);
        this.techniques = this.___;
    }
}

DECLARE_ENUM(LightDirPerVerEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;       // alpha通道存储光滑度
uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec4 vColor;
void main(){
    vec3 nor = normalize( modelNormal );
    vec3 dir = normalize( LightModelDirection );
    vec3 color = LightAmbient * MaterialAmbient;                      // 环境光分量
    float t = max( dot(nor, dir) , 0.0);                                      // 入射角cos值
    if ( t > 0.0) {
        color = color + t * MaterialDiffuse.rgb * LightDiffuse;             // 漫反射分量
        vec3 viewVector = normalize(CameraModelPosition - modelPosition);   // 观察方向
        vec3 reflectDir = normalize( reflect(-dir, nor) );                      // 反射方向
        t = max( dot(reflectDir, viewVector), 0.0);
        float weight = pow(t, clamp(MaterialSpecular.w, -128.0, 128.0));
        color = weight * MaterialSpecular.rgb * LightSpecular + color;      // 高光分量
    }
    color = color * LightAttenuation.w + MaterialEmissive;                // 加入总光强系数
    vColor = vec4(color, MaterialDiffuse.a);
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
    FS: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(){
    fragColor = vColor;
}
`
});

D3Object.Register('L5.LightDirPerVerEffect', LightDirPerVerEffect.factory);

/**
 * 点光源 片元光照效果
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {LightPointPerFragEffect}
 * @extends {VisualEffect}
 */
class LightPointPerFragEffect extends VisualEffect {

    constructor() {
        super();
        var vshader = new VertexShader('LightPointPerFragVS', 2, 1);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(LightPointPerFragEffect.VS);

        var fshader = new FragShader('LightPointPerFragFS', 0, 11);
        fshader.setConstant(0, 'WMatrix', Shader.VT_MAT4);
        fshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC3);
        fshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC3);
        fshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC3);
        fshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
        fshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);
        fshader.setConstant(6, 'LightModelPosition', Shader.VT_VEC3);
        fshader.setConstant(7, 'LightAmbient', Shader.VT_VEC3);
        fshader.setConstant(8, 'LightDiffuse', Shader.VT_VEC3);
        fshader.setConstant(9, 'LightSpecular', Shader.VT_VEC3);
        fshader.setConstant(10, 'LightAttenuation', Shader.VT_VEC4);
        fshader.setProgram(LightPointPerFragEffect.FS);

        var program = new Program('LightPointPerFragProgram', vshader, fshader);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    /**
     * 创建点光源顶点光照程序
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setFragConstant(0, 0, new WMatrixConstant());

        instance.setFragConstant(0, 1, new CameraModelPositionConstant$1());
        instance.setFragConstant(0, 2, new MaterialEmissiveConstant$1(material));
        instance.setFragConstant(0, 3, new MaterialAmbientConstant$1(material));
        instance.setFragConstant(0, 4, new MaterialDiffuseConstant$1(material));
        instance.setFragConstant(0, 5, new MaterialSpecularConstant$1(material));
        instance.setFragConstant(0, 6, new LightModelPositionConstant(light));
        instance.setFragConstant(0, 7, new LightAmbientConstant$1(light));
        instance.setFragConstant(0, 8, new LightDiffuseConstant$1(light));
        instance.setFragConstant(0, 9, new LightSpecularConstant$1(light));
        instance.setFragConstant(0, 10, new LightAttenuationConstant$1(light));
        return instance;
    }

    /**
     * 创建唯一点光源顶点光照程序
     *
     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(light, material) {
        var effect = new LightPointPerFragEffect();
        return effect.createInstance(light, material);
    }

    load(inStream) {
        this.___ = this.techniques;
        super.load(inStream);
    }

    link(inStream) {
        super.link(inStream);
    }

    postLink() {
        super.postLink();
        var pass = this.techniques[0].getPass(0);
        pass.program.vertexShader.setProgram(LightPointPerFragEffect.VertexSource);
        pass.program.fragShader.setProgram(LightPointPerFragEffect.FragSource);
        this.techniques = this.___;
    }

    save(inStream) {
        super.save(inStream);
        // todo: implement
    }
}

DECLARE_ENUM(LightPointPerFragEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec3 vertexPosition;
out vec3 vertexNormal;

void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vertexPosition = modelPosition;
    vertexNormal = modelNormal;
}
`,
    FS: `#version 300 es
precision highp float;
uniform mat4 WMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;
uniform vec3 LightModelPosition;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;

in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;

void main(){
    vec3 normal = normalize(vertexNormal);
    vec3 vertexLightDiff = LightModelPosition - vertexPosition;
    vec3 vertexDirection = normalize(vertexLightDiff);
    float t = length(mat3(WMatrix) * vertexDirection);

    // t = intensity / (constant + d * linear + d*d* quadratic);
    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));
    vec3 color = MaterialAmbient * LightAmbient;

    float d = max(dot(normal, vertexDirection), 0.0);
    color = color + d * MaterialDiffuse.rgb * LightDiffuse;

    if (d > 0.0) {
        vec3 viewVector = normalize(CameraModelPosition - vertexPosition);
        vec3 reflectDir = normalize( reflect(-vertexDirection, normal) );               // 计算反射方向
        d = max(dot(reflectDir, viewVector), 0.0);
        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));
        color = color + d * MaterialSpecular.rgb * LightSpecular;
    }
    fragColor.rgb = MaterialEmissive + t * color;
    fragColor.a = MaterialDiffuse.a;
}
`
});


D3Object.Register('L5.LightPointPerFragEffect', LightPointPerFragEffect.factory);

/**
 * 点光源 顶点光照效果 (顶点Blinn光照)
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {LightPointPerVertexEffect}
 * @extends {VisualEffect}
 */
class LightPointPerVertexEffect extends VisualEffect {

    constructor() {
        super();
        var vshader = new VertexShader('LightPointPerVertexVS', 2, 12);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setConstant(1, 'WMatrix', Shader.VT_MAT4);
        vshader.setConstant(2, 'CameraModelPosition', Shader.VT_VEC3);
        vshader.setConstant(3, 'MaterialEmissive', Shader.VT_VEC3);
        vshader.setConstant(4, 'MaterialAmbient', Shader.VT_VEC3);
        vshader.setConstant(5, 'MaterialDiffuse', Shader.VT_VEC4);
        vshader.setConstant(6, 'MaterialSpecular', Shader.VT_VEC4);
        vshader.setConstant(7, 'LightModelPosition', Shader.VT_VEC3);
        vshader.setConstant(8, 'LightAmbient', Shader.VT_VEC3);
        vshader.setConstant(9, 'LightDiffuse', Shader.VT_VEC3);
        vshader.setConstant(10, 'LightSpecular', Shader.VT_VEC3);
        vshader.setConstant(11, 'LightAttenuation', Shader.VT_VEC4);
        vshader.setProgram(LightPointPerVertexEffect.VertexSource);

        var fshader = new FragShader('LightPointPerVertexFS');
        fshader.setProgram(LightPointPerVertexEffect.FragSource);

        var program = new Program('LightPointPerVertexProgram', vshader, fshader);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    /**
     * 创建点光源顶点光照程序
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setVertexConstant(0, 1, new WMatrixConstant());
        instance.setVertexConstant(0, 2, new CameraModelPositionConstant$1());
        instance.setVertexConstant(0, 3, new MaterialEmissiveConstant$1(material));
        instance.setVertexConstant(0, 4, new MaterialAmbientConstant$1(material));
        instance.setVertexConstant(0, 5, new MaterialDiffuseConstant$1(material));
        instance.setVertexConstant(0, 6, new MaterialSpecularConstant$1(material));
        instance.setVertexConstant(0, 7, new LightModelPositionConstant(light));
        instance.setVertexConstant(0, 8, new LightAmbientConstant$1(light));
        instance.setVertexConstant(0, 9, new LightDiffuseConstant$1(light));
        instance.setVertexConstant(0, 10, new LightSpecularConstant$1(light));
        instance.setVertexConstant(0, 11, new LightAttenuationConstant$1(light));
        return instance;
    }

    /**
     * 创建唯一点光源顶点光照程序
     *
     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(light, material) {
        var effect = new LightPointPerVertexEffect();
        return effect.createInstance(light, material);
    }

    load(inStream) {
        this.___ = this.techniques;
        super.load(inStream);
    }

    link(inStream) {
        super.link(inStream);
    }

    postLink() {
        super.postLink.call(this);
        var pass = this.techniques[0].getPass(0);
        pass.program.vertexShader.setProgram(LightPointPerVertexEffect.VertexSource);
        pass.program.fragShader.setProgram(LightPointPerVertexEffect.FragSource);
        this.techniques = this.___;
    }

    save(inStream) {
        super.save(inStream);
        // todo: implement
    }
}

DECLARE_ENUM(LightPointPerVertexEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform mat4 WMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;
uniform vec3 LightModelPosition;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;

layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;

out vec4 vColor;
void main(){
    vec3 nor = normalize(modelNormal);
    vec3 v1 = LightModelPosition - modelPosition;  // 指向光源的方向
    float t = length(WMatrix * vec4(v1, 0.0));
    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));
    vec3 dir = normalize(v1);                              // 光源方向
    float d = max( dot(nor, dir), 0.0);                    // 计算漫反射权重
    vec3 color = MaterialAmbient * LightAmbient;        // 环境光分量
    color = d * MaterialDiffuse.rgb*LightDiffuse + color; // 漫反射分量
    if (d > 0.0) {
        vec3 viewVector = normalize(CameraModelPosition - modelPosition); // 观察方向
        vec3 reflectDir = normalize( reflect(-dir, nor) );               // 计算反射方向
        d = max(dot(reflectDir, viewVector), 0.0);
        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));
        color = color + d * MaterialSpecular.rgb * LightSpecular;
    }
    vColor = vec4(MaterialEmissive + t*color, MaterialDiffuse.a);
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}
`,
    FS: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main() {
    fragColor = vColor;
}
`
});

D3Object.Register('L5.LightPointPerVertexEffect', LightPointPerVertexEffect.factory);

/**
 * 聚光灯 片元光照效果
 * @class
 * @extends {VisualEffect}
 *
 * @author lonphy
 * @version 2.0
 */
class LightSpotPerFragEffect extends VisualEffect {

    constructor() {
        super();
        var vshader = new VertexShader('LightSpotPerFragVS', 2, 1);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(LightSpotPerFragEffect.VertexSource);

        var fshader = new FragShader('LightSpotPerFragFS', 2, 13);
        fshader.setInput(0, 'vertexPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        fshader.setInput(1, 'vertexNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        fshader.setConstant(0, 'WMatrix', Shader.VT_MAT4);
        fshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC4);
        fshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC4);
        fshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC4);
        fshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
        fshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);
        fshader.setConstant(6, 'LightModelPosition', Shader.VT_VEC4);
        fshader.setConstant(7, 'LightModelDirection', Shader.VT_VEC4);
        fshader.setConstant(8, 'LightAmbient', Shader.VT_VEC4);
        fshader.setConstant(9, 'LightDiffuse', Shader.VT_VEC4);
        fshader.setConstant(10, 'LightSpecular', Shader.VT_VEC4);
        fshader.setConstant(11, 'LightSpotCutoff', Shader.VT_VEC4);
        fshader.setConstant(12, 'LightAttenuation', Shader.VT_VEC4);
        fshader.setProgram(LightSpotPerFragEffect.FragSource);

        var program = new Program('LightSpotPerFragProgram', vshader, fshader);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    /**
     * 创建聚光灯片元光照程序
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setFragConstant(0, 0, new WMatrixConstant());
        instance.setFragConstant(0, 1, new CameraModelPositionConstant$1());
        instance.setFragConstant(0, 2, new MaterialEmissiveConstant$1(material));
        instance.setFragConstant(0, 3, new MaterialAmbientConstant$1(material));
        instance.setFragConstant(0, 4, new MaterialDiffuseConstant$1(material));
        instance.setFragConstant(0, 5, new MaterialSpecularConstant$1(material));
        instance.setFragConstant(0, 6, new LightModelPositionConstant(light));
        instance.setFragConstant(0, 7, new LightModelDirectionConstant$1(light));
        instance.setFragConstant(0, 8, new LightAmbientConstant$1(light));
        instance.setFragConstant(0, 9, new LightDiffuseConstant$1(light));
        instance.setFragConstant(0, 10, new LightSpecularConstant$1(light));
        instance.setFragConstant(0, 11, new LightSpotConstant(light));
        instance.setFragConstant(0, 12, new LightAttenuationConstant$1(light));
        return instance;
    }


    /**
     * 创建唯一聚光灯光照程序
     *
     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(light, material) {
        var effect = new LightSpotPerFragEffect();
        return effect.createInstance(light, material);
    }
}

DECLARE_ENUM(LightSpotPerFragEffect, {
    VertexSource: [
        'uniform mat4 PVWMatrix;',
        'attribute vec3 modelPosition;',
        'attribute vec3 modelNormal;',
        'varying vec3 vertexPosition;',
        'varying vec3 vertexNormal;',
        'void main(){',
        '    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
        '    vertexPosition = modelPosition;',
        '    vertexNormal = modelNormal;',
        '}'
    ].join('\n'),
    FragSource: [
        'precision highp float;',
        'uniform mat4 WMatrix;',
        'uniform vec4 CameraModelPosition;',
        'uniform vec4 MaterialEmissive;',
        'uniform vec4 MaterialAmbient;',
        'uniform vec4 MaterialDiffuse;',
        'uniform vec4 MaterialSpecular;',
        'uniform vec4 LightModelPosition;',
        'uniform vec4 LightModelDirection;',
        'uniform vec4 LightAmbient;',
        'uniform vec4 LightDiffuse;',
        'uniform vec4 LightSpecular;',
        'uniform vec4 LightSpotCutoff;',
        'uniform vec4 LightAttenuation;',
        'varying vec3 vertexPosition;',
        'varying vec3 vertexNormal;',
        'void main (void) {',
        '    vec3 nor = normalize(vertexNormal);',
        '    vec3 spotDir = normalize(LightModelDirection.xyz);',
        '    vec3 lightDir = LightModelPosition.xyz - vertexPosition;',     // 指向光源的向量
        '    float attr = length(WMatrix * vec4(lightDir, 1.0));',         // 距离, 距离衰减系数
        '    attr = LightAttenuation.w/(LightAttenuation.x + attr *(LightAttenuation.y + attr*LightAttenuation.z));',
        '    lightDir = normalize(lightDir);',
        '    float dWeight = max(dot(nor, lightDir), 0.0);',         // 漫反射权重
        '    vec3 color = MaterialAmbient.rgb*LightAmbient.rgb;',
        '    if (dWeight > 0.0) {',
        '        float spotEffect = dot(spotDir, -lightDir);',          // 聚光轴 与 光线 的夹角cos值
        '        if (spotEffect >= LightSpotCutoff.y) {',
        '            spotEffect = pow(spotEffect, LightSpotCutoff.w);',
        '            vec3 reflectDir = normalize( reflect(-lightDir, nor) );',               // 计算反射方向
        '            vec3 viewVector = normalize(CameraModelPosition.xyz - vertexPosition);', // 观察方向
        '            float sWeight = max( dot(reflectDir, viewVector), 0.0);',
        '            sWeight = pow(sWeight, clamp(MaterialSpecular.a, -128.0, 128.0));',
        '            vec3 sColor = dWeight * MaterialDiffuse.rgb * LightDiffuse.rgb;',  // 漫反射分量
        '            sColor = sColor + sWeight * MaterialSpecular.rgb * LightSpecular.rgb;',  // 高光分量
        '            color = color + spotEffect * sColor;',
        '        }',
        '    }',
        '    gl_FragColor = vec4(MaterialEmissive.rgb + attr*color, MaterialDiffuse.a);',
        '}'
    ].join('\n')
});

/**
 * 聚光灯 顶点光照效果
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {LightSpotPerVertexEffect}
 * @extends {VisualEffect}
 */
class LightSpotPerVertexEffect extends VisualEffect {
    constructor() {
        super();
        var vshader = new VertexShader('LightSpotPerVertexVS', 2, 14);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setConstant(1, 'WMatrix', Shader.VT_MAT4);
        vshader.setConstant(2, 'CameraModelPosition', Shader.VT_VEC3);
        vshader.setConstant(3, 'MaterialEmissive', Shader.VT_VEC3);
        vshader.setConstant(4, 'MaterialAmbient', Shader.VT_VEC3);
        vshader.setConstant(5, 'MaterialDiffuse', Shader.VT_VEC4);
        vshader.setConstant(6, 'MaterialSpecular', Shader.VT_VEC4);
        vshader.setConstant(7, 'LightModelPosition', Shader.VT_VEC3);
        vshader.setConstant(8, 'LightModelDirection', Shader.VT_VEC3);
        vshader.setConstant(9, 'LightAmbient', Shader.VT_VEC3);
        vshader.setConstant(10, 'LightDiffuse', Shader.VT_VEC3);
        vshader.setConstant(11, 'LightSpecular', Shader.VT_VEC3);
        vshader.setConstant(12, 'LightSpotCutoff', Shader.VT_VEC4);
        vshader.setConstant(13, 'LightAttenuation', Shader.VT_VEC4);
        vshader.setProgram(LightSpotPerVertexEffect.VS);

        var fshader = new FragShader('LightSpotPerVertexFS');
        fshader.setProgram(LightSpotPerVertexEffect.FS);

        var program = new Program('LightSpotPerVertexProgram', vshader, fshader);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    /**
     * 创建点光源顶点光照程序
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setVertexConstant(0, 1, new WMatrixConstant());
        instance.setVertexConstant(0, 2, new CameraModelPositionConstant$1());
        instance.setVertexConstant(0, 3, new MaterialEmissiveConstant$1(material));
        instance.setVertexConstant(0, 4, new MaterialAmbientConstant$1(material));
        instance.setVertexConstant(0, 5, new MaterialDiffuseConstant$1(material));
        instance.setVertexConstant(0, 6, new MaterialSpecularConstant$1(material));
        instance.setVertexConstant(0, 7, new LightModelPositionConstant(light));
        instance.setVertexConstant(0, 8, new LightModelDirectionConstant$1(light));
        instance.setVertexConstant(0, 9, new LightAmbientConstant$1(light));
        instance.setVertexConstant(0, 10, new LightDiffuseConstant$1(light));
        instance.setVertexConstant(0, 11, new LightSpecularConstant$1(light));
        instance.setVertexConstant(0, 12, new LightSpotConstant(light));
        instance.setVertexConstant(0, 13, new LightAttenuationConstant$1(light));
        return instance;
    }

    /**
     * 创建唯一点光源顶点光照程序
     *
     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(light, material) {
        var effect = new LightSpotPerVertexEffect();
        return effect.createInstance(light, material);
    }
}

DECLARE_ENUM(LightSpotPerVertexEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform mat4 WMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;
uniform vec3 LightModelPosition;
uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightSpotCutoff;
uniform vec4 LightAttenuation;

layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec4 vColor;

void main(){
    vec3 nor = normalize(modelNormal);
    vec3 spotDir = normalize( LightModelDirection );
    vec3 lightDir = LightModelPosition - modelPosition;     // 指向光源的向量
    float attr = length(WMatrix * vec4(lightDir, 1.0));     // 距离, 距离衰减系数
    attr = LightAttenuation.w/(LightAttenuation.x + attr *(LightAttenuation.y + attr*LightAttenuation.z));
    lightDir = normalize(lightDir);
    float dWeight = max(dot(nor, lightDir), 0.0);           // 漫反射权重
    vec3 color = MaterialAmbient * LightAmbient;
    if (dWeight > 0.0) {
        float spotEffect = dot(spotDir, -lightDir);         // 聚光轴 与 光线 的夹角cos值
        if (spotEffect >= LightSpotCutoff.y) {
            spotEffect = pow(spotEffect, LightSpotCutoff.w);
            vec3 reflectDir = normalize( reflect(-lightDir, nor) );            // 计算反射方向
            vec3 viewVector = normalize(CameraModelPosition - modelPosition);  // 观察方向
            float sWeight = max( dot(reflectDir, viewVector), 0.0);
            sWeight = pow(sWeight, clamp(MaterialSpecular.a, -128.0, 128.0));
            vec3 sColor = dWeight * MaterialDiffuse.rgb * LightDiffuse;        // 漫反射分量
            sColor = sColor + sWeight * MaterialSpecular.rgb * LightSpecular;  // 高光分量
            color = color + spotEffect * sColor;
        }
    }
    vColor = vec4(MaterialEmissive + attr*color, MaterialDiffuse.a);
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}
`,
    FS: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main() {
    fragColor = vColor;
}
`
});

/**
 * 材质效果着色器
 */
class MaterialEffect$1 extends VisualEffect {
    constructor() {
        super();

        var vs = new VertexShader('MaterialVS', 1, 1);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setProgram(MaterialEffect$1.VS);

        var fs = new FragShader('MaterialFS', 0, 1);
        fs.setConstant(0, 'MaterialDiffuse', Shader.VT_VEC4);
        fs.setProgram(MaterialEffect$1.FS);

        var program = new Program('MaterialProgram', vs, fs);
        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }
    /**
     * @param {Material} material
     * @returns {VisualEffectInstance}
     */
    createInstance(material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setFragConstant(0, 0, new MaterialDiffuseConstant$1(material));
        return instance;
    }

    /**
     * @param {Material} material
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(material) {
        var effect = new MaterialEffect$1();
        return effect.createInstance(material);
    }
}

DECLARE_ENUM(MaterialEffect$1, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}
`,
    FS: `#version 300 es
precision highp float;
uniform vec4 MaterialDiffuse;
out vec4 fragColor;
void main(){
    fragColor = MaterialDiffuse;
}
`
});

class Texture2DEffect$1 extends VisualEffect {
    /**
     * @param {number} filter 纹理格式， 参考Shader.SF_XXX
     * @param {number} coordinate0 相当于宽度 参考Shader.SC_XXX
     * @param {number} coordinate1 相当于高度 参考Shader.SC_XXX
     */
    constructor(filter, coordinate0, coordinate1) {
        super();
        if (!filter) {
            filter = Shader.SF_NEAREST;
        }
        if (!coordinate0) {
            coordinate0 = Shader.SC_CLAMP_EDGE;
        }
        if (!coordinate1) {
            coordinate1 = Shader.SC_CLAMP_EDGE;
        }

        var vshader = new VertexShader('Texture2DVS', 2, 1, 0);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelTCoord0', Shader.VT_VEC2, Shader.VS_TEXCOORD0);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(Texture2DEffect$1.VS);

        var fshader = new FragShader('Texture2DFS', 0, 0, 1);
        fshader.setSampler(0, 'BaseSampler', Shader.ST_2D);
        fshader.setFilter(0, filter);
        fshader.setCoordinate(0, 0, coordinate0);
        fshader.setCoordinate(0, 1, coordinate1);
        fshader.setTextureUnit(0, Texture2DEffect$1.FragTextureUnit);
        fshader.setProgram(Texture2DEffect$1.FS);

        var program = new Program('Texture2DProgram', vshader, fshader);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    /**
     * Any change in sampler state is made via the frag shader.
     * @returns {FragShader}
     */
    getFragShader() {
        return super.getFragShader(0, 0);
    }

    /**
     * Create an instance of the effect with unique parameters.
     * If the sampler filter mode is set to a value corresponding to mipmapping,
     * then the mipmaps will be generated if necessary.
     *
     * @param {Texture2D} texture
     * @return {VisualEffectInstance}
     */
    createInstance(texture) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setFragTexture(0, 0, texture);

        var filter = this.getFragShader().getFilter(0);
        if (filter !== Shader.SF_NEAREST && filter != Shader.SF_LINEAR && !texture.hasMipmaps) {
            texture.upload();
        }

        return instance;
    }

    /**
     * Convenience for creating an instance.  The application does not have to
     * create the effect explicitly in order to create an instance from it.
     * @param texture {Texture2D}
     * @param filter {number}
     * @param coordinate0 {number}
     * @param coordinate1 {number}
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(texture, filter, coordinate0, coordinate1) {
        var effect = new Texture2DEffect$1();
        var fshader = effect.getFragShader();
        fshader.setFilter(0, filter);
        fshader.setCoordinate(0, 0, coordinate0);
        fshader.setCoordinate(0, 1, coordinate1);
        return effect.createInstance(texture);
    }
}

DECLARE_ENUM(Texture2DEffect$1, {
    FragTextureUnit: 0,
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=8) in vec2 modelTCoord0;
out vec2 vTCoord;
void main () {
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vTCoord = modelTCoord0;
}
`,
    FS: `#version 300 es
precision highp float;
uniform sampler2D BaseSampler;
in vec2 vTCoord;
out vec4 fragColor;
void main (void) {
    fragColor = texture(BaseSampler, vTCoord);
}
`
});

/**
 * 颜色缓冲 - 效果
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {VertexColor3Effect}
 * @extends {VisualEffect}
 */
class VertexColor3Effect extends VisualEffect {
    constructor() {
        super();
        var vs = new VertexShader('VertexColor3VS', 2, 1);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setInput(0, 'modelColor', Shader.VT_VEC3, Shader.VS_COLOR0);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setProgram(VertexColor3Effect.VS);

        var fs = new FragShader('VertexColor3FS');
        fs.setProgram(VertexColor3Effect.FS);

        var program = new Program('VertexColor3Program', vs, fs);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    createInstance() {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        return instance;
    }

    static createUniqueInstance() {
        var effect = new VertexColor3Effect();
        return effect.createInstance();
    }
}

DECLARE_ENUM(VertexColor3Effect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=3) in vec3 modelColor0;
layout(location=6) in float modelPointSize;
out vec3 vertexColor;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vertexColor = modelColor0;
    gl_PointSize = modelPointSize;
}
`,
    FS: `#version 300 es
precision highp float;
in vec3 vertexColor;
out vec4 fragColor;
void main () {
    fragColor = vec4(vertexColor, 1.0);
}
`
});

/**
 * 平行光Gouraud 光照+漫射纹理效果 (片段Blinn光照)
 */
class Texture2DLightDirPerFragEffect extends VisualEffect {

    /**
     * @param filter {number} 纹理格式， 参考Shader.SF_XXX
     * @param coordinate0 {number} 相当于宽度 参考Shader.SC_XXX
     * @param coordinate1 {number} 相当于高度 参考Shader.SC_XXX
     */
    constructor(filter = Shader.SF_NEAREST,
        coordinate0 = Shader.SC_CLAMP_EDGE,
        coordinate1 = Shader.SC_CLAMP_EDGE) {
        super();

        var vshader = new VertexShader('Texture2DLightDirPerFragVS', 3, 1);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setInput(2, 'modelTCoord0', Shader.VT_VEC2, Shader.VS_TEXCOORD0);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(Texture2DLightDirPerFragEffect.VS);

        var fshader = new FragShader('Texture2DLightDirPerFragFS', 0, 10, 1);
        fshader.setConstant(0, 'CameraModelPosition', Shader.VT_VEC3);
        fshader.setConstant(1, 'MaterialEmissive', Shader.VT_VEC3);
        fshader.setConstant(2, 'MaterialAmbient', Shader.VT_VEC3);
        fshader.setConstant(3, 'MaterialDiffuse', Shader.VT_VEC4);
        fshader.setConstant(4, 'MaterialSpecular', Shader.VT_VEC4);
        fshader.setConstant(5, 'LightModelDirection', Shader.VT_VEC3);
        fshader.setConstant(6, 'LightAmbient', Shader.VT_VEC3);
        fshader.setConstant(7, 'LightDiffuse', Shader.VT_VEC3);
        fshader.setConstant(8, 'LightSpecular', Shader.VT_VEC3);
        fshader.setConstant(9, 'LightAttenuation', Shader.VT_VEC4);

        fshader.setSampler(0, 'DiffuseSampler', Shader.ST_2D);
        fshader.setFilter(0, filter);
        fshader.setCoordinate(0, 0, coordinate0);
        fshader.setCoordinate(0, 1, coordinate1);
        fshader.setTextureUnit(0, Texture2DEffect.FragTextureUnit);

        fshader.setProgram(Texture2DLightDirPerFragEffect.FS);

        var program = new Program('TextureLightDirPerFragProgram', vshader, fshader);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    static createUniqueInstance(texture, light, material) {
        var effect = new Texture2DLightDirPerFragEffect();

        var fshader = effect.getFragShader();
        fshader.setFilter(0, filter);
        fshader.setCoordinate(0, 0, coordinate0);
        fshader.setCoordinate(0, 1, coordinate1);
        return effect.createInstance(texture, light, material);
    }

    createInstance(texture, light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        instance.setFragConstant(0, 0, new CameraModelPositionConstant());
        instance.setFragConstant(0, 1, new MaterialEmissiveConstant(material));
        instance.setFragConstant(0, 2, new MaterialAmbientConstant(material));
        instance.setFragConstant(0, 3, new MaterialDiffuseConstant(material));
        instance.setFragConstant(0, 4, new MaterialSpecularConstant(material));
        instance.setFragConstant(0, 5, new LightModelDirectionConstant(light));
        instance.setFragConstant(0, 6, new LightAmbientConstant(light));
        instance.setFragConstant(0, 7, new LightDiffuseConstant(light));
        instance.setFragConstant(0, 8, new LightSpecularConstant(light));
        instance.setFragConstant(0, 9, new LightAttenuationConstant(light));

        instance.setFragTexture(0, 0, texture);

        var filter = this.getFragShader(0, 0).getFilter(0);
        if (filter !== Shader.SF_NEAREST && filter != Shader.SF_LINEAR && !texture.hasMipmaps) {
            texture.generateMipmaps();
        }
        return instance;
    }
}

DECLARE_ENUM(Texture2DLightDirPerFragEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
layout(location=8) in vec2 modelTCoord0;
out vec3 vertexPosition;
out vec3 vertexNormal;
out vec2 vTCoord0;

void main(){
    vertexPosition = modelPosition;
    vertexNormal = modelNormal;
    vTCoord0 = modelTCoord0;
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}
`,
    FS: `#version 300 es
precision highp float;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;    // alpha通道存储光滑度
uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]
uniform sampler2D DiffuseSampler;
in vec2 vTCoord0;
in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;
void main () {
    vec3 tColor = texture(DiffuseSampler, vTCoord0).rgb;
    vec3 normal = normalize(vertexNormal);
    vec3 color = LightAmbient * MaterialAmbient *tColor;             // 计算环境光分量
    float t = abs(dot(normal, LightModelDirection));                 // 计算入射角cos值
    color = color + t * MaterialDiffuse.rgb * LightDiffuse * tColor; // 计算漫反射分量
    if (t > 0.0) {
        vec3 tmp = normalize(CameraModelPosition - vertexPosition);
        tmp = normalize(tmp - LightModelDirection);
        t = max(dot(normal, tmp), 0.0);
        float weight = pow(t, clamp(MaterialSpecular.w, -128.0, 128.0) );
        color = weight * MaterialSpecular.rgb * LightSpecular * tColor + color;
    }
    color = color * LightAttenuation.w + MaterialEmissive;
    fragColor = vec4(color, MaterialDiffuse.a);
}
`});

/**
 * 按键定义
 * @author lonphy
 * @version 1.0
 */
const KBM_SHIFT = 0x01;
const KBM_CTRL = 0x02;
const KBM_ALT = 0x03;
const KBM_META = 0x04;

const KB_BACK = 8;
const KB_TAB = 9;
const KB_ENTER = 13;
const KB_SHIFT = 16;
const KB_CTRL = 17;
const KB_ALT = 18;
const KB_CAPSLK = 20;
const KB_META = 91;

const KB_DELETE = 46;

const KB_ESC = 27;
const KB_ESCAPE = 32;
const KB_LEFT = 37;
const KB_UP = 38;
const KB_RIGHT = 39;
const KB_DOWN = 40;

const KB_0 = 48;
const KB_1 = 49;
const KB_2 = 50;
const KB_3 = 51;
const KB_4 = 52;
const KB_5 = 53;
const KB_6 = 54;
const KB_7 = 55;
const KB_8 = 56;
const KB_9 = 57;

const KB_A = 65;
const KB_B = 66;
const KB_C = 67;
const KB_D = 68;
const KB_E = 69;
const KB_F = 70;
const KB_G = 71;
const KB_H = 72;
const KB_I = 73;
const KB_J = 74;
const KB_K = 75;
const KB_L = 76;
const KB_M = 77;
const KB_N = 78;
const KB_O = 79;
const KB_P = 80;
const KB_Q = 81;
const KB_R = 82;
const KB_S = 83;
const KB_T = 84;
const KB_U = 85;
const KB_V = 86;
const KB_W = 87;
const KB_X = 88;
const KB_Y = 89;
const KB_Z = 90;

const KB_F1 = 112;
const KB_F2 = 113;
const KB_F3 = 114;
const KB_F4 = 115;
const KB_F5 = 116;
const KB_F6 = 117;
const KB_F7 = 118;
const KB_F8 = 119;
const KB_F9 = 120;
const KB_F10 = 121;
const KB_F11 = 122;
const KB_F12 = 123;

const MS_LEFT = 1;
const MS_MIDDLE = 2;
const MS_RIGHT = 3;



var key = Object.freeze({
	KBM_SHIFT: KBM_SHIFT,
	KBM_CTRL: KBM_CTRL,
	KBM_ALT: KBM_ALT,
	KBM_META: KBM_META,
	KB_BACK: KB_BACK,
	KB_TAB: KB_TAB,
	KB_ENTER: KB_ENTER,
	KB_SHIFT: KB_SHIFT,
	KB_CTRL: KB_CTRL,
	KB_ALT: KB_ALT,
	KB_CAPSLK: KB_CAPSLK,
	KB_META: KB_META,
	KB_DELETE: KB_DELETE,
	KB_ESC: KB_ESC,
	KB_ESCAPE: KB_ESCAPE,
	KB_LEFT: KB_LEFT,
	KB_UP: KB_UP,
	KB_RIGHT: KB_RIGHT,
	KB_DOWN: KB_DOWN,
	KB_0: KB_0,
	KB_1: KB_1,
	KB_2: KB_2,
	KB_3: KB_3,
	KB_4: KB_4,
	KB_5: KB_5,
	KB_6: KB_6,
	KB_7: KB_7,
	KB_8: KB_8,
	KB_9: KB_9,
	KB_A: KB_A,
	KB_B: KB_B,
	KB_C: KB_C,
	KB_D: KB_D,
	KB_E: KB_E,
	KB_F: KB_F,
	KB_G: KB_G,
	KB_H: KB_H,
	KB_I: KB_I,
	KB_J: KB_J,
	KB_K: KB_K,
	KB_L: KB_L,
	KB_M: KB_M,
	KB_N: KB_N,
	KB_O: KB_O,
	KB_P: KB_P,
	KB_Q: KB_Q,
	KB_R: KB_R,
	KB_S: KB_S,
	KB_T: KB_T,
	KB_U: KB_U,
	KB_V: KB_V,
	KB_W: KB_W,
	KB_X: KB_X,
	KB_Y: KB_Y,
	KB_Z: KB_Z,
	KB_F1: KB_F1,
	KB_F2: KB_F2,
	KB_F3: KB_F3,
	KB_F4: KB_F4,
	KB_F5: KB_F5,
	KB_F6: KB_F6,
	KB_F7: KB_F7,
	KB_F8: KB_F8,
	KB_F9: KB_F9,
	KB_F10: KB_F10,
	KB_F11: KB_F11,
	KB_F12: KB_F12,
	MS_LEFT: MS_LEFT,
	MS_MIDDLE: MS_MIDDLE,
	MS_RIGHT: MS_RIGHT
});

/**
 * 默认应用核心类
 *
 * @version 1.0
 * @author lonphy
 *
 * @type BaseApplication
 */
class BaseApplication {
    /**
     * @param title {string} 应用名称
     * @param width {number} 绘制区域宽度
     * @param height {number} 绘制区域高度
     * @param clearColor {Float32Array} 背景颜色
     * @param canvas {string} 需要渲染的CanvasID
     */
    constructor(title, width, height, clearColor, canvas) {
        BaseApplication._instance = this;
        var renderDOM = document.getElementById(canvas);
        renderDOM = renderDOM || document.createElement('canvas');

        renderDOM.width = width;
        renderDOM.height = height;

        this.title = title; // 实例名称
        this.width = width;
        this.height = height;
        this.clearColor = clearColor;

        this.colorFormat = Texture.TF_A8R8G8B8;
        this.depthStencilFormat = Texture.TF_D24S8;

        this.numMultisamples = 0;

        this.renderer = new Renderer$1(renderDOM, width, height, clearColor, this.colorFormat, this.depthStencilFormat, this.numMultisamples);
        this.renderDOM = renderDOM;

        this.lastTime = -1;
        this.accumulatedTime = 0;
        this.frameRate = 0;

        this.frameCount = 0;
        this.accumulatedFrameCount = 0;
        this.timer = 30;
        this.maxTimer = 30;

        this.textColor = '#000';

        this.loadWait = 0;

        this.applicationRun = false;
    }

    resetTime() {
        this.lastTime = -1;
    }

    run() {
        if (!this.onPreCreate()) return;

        if (!this.fpsOutput) {
            this.fpsOutput = document.createElement('div');
            this.fpsOutput.setAttribute('style', 'position:absolute;top:8px;left:8px;color:' + this.textColor);
            this.renderDOM.parentNode.appendChild(this.fpsOutput);
        }

        // Create the renderer.
        this.renderer.initialize(this.title, this.width, this.height,
            this.colorFormat, this.depthStencilFormat, this.numMultisamples);


        var handles = BaseApplication.handles;
        // TODO : 事件回调定义
        window.addEventListener('resize', handles.ResizeHandler, false);
        window.addEventListener('keydown', handles.KeyDownHandler, false);
        window.addEventListener('keyup', handles.KeyUpHandler, false);
        window.addEventListener('mousemove', handles.MouseMoveHandler, false);

        if (!this.onInitialize()) return -4;

        // The default OnPreidle() clears the buffers.  Allow the application to
        // fill them before the window is shown and before the event loop starts.
        this.onPreIdle();

        this.applicationRun = true;
        var $this = this;
        var loopFunc = function () {
            if (!$this.applicationRun) {
                $this.onTerminate();
                delete $this.renderer;
                delete $this.renderDOM;
                return;
            }
            $this.updateFrameCount();
            if ($this.loadWait === 0) {
                $this.onIdle.call($this);
            }
            requestAnimationFrame(loopFunc);
        };
        requestAnimationFrame(loopFunc);
    }

    measureTime() {
        // start performance measurements
        if (this.lastTime === -1.0) {
            this.lastTime = Date.now();
            this.accumulatedTime = 0;
            this.frameRate = 0;
            this.frameCount = 0;
            this.accumulatedFrameCount = 0;
            this.timer = this.maxTimer;
        }

        // accumulate the time only when the miniature time allows it
        if (--this.timer === 0) {
            var currentTime = Date.now();
            var dDelta = currentTime - this.lastTime;
            this.lastTime = currentTime;
            this.accumulatedTime += dDelta;
            this.accumulatedFrameCount += this.frameCount;
            this.frameCount = 0;
            this.timer = this.maxTimer;
        }
    }

    updateFrameCount() {
        ++this.frameCount;
    }

    /**
     * 更新FPS显示
     */
    drawFrameRate() {
        if (this.accumulatedTime > 0) {
            this.frameRate = (this.accumulatedFrameCount / this.accumulatedTime) * 1000;
        }
        else {
            this.frameRate = 0;
        }
        this.fpsOutput.textContent = 'fps: ' + this.frameRate.toFixed(1);
    }

    getAspectRatio() {
        return this.width / this.height;
    }

    onInitialize() {
        this.renderer.clearColor = this.clearColor;
        return true;
    }

    onTerminate() {
        this.applicationRun = false;
    }

    // 预创建,添加输入事件监听
    onPreCreate() {
        return true;
    }

    onPreIdle() {
        this.renderer.clearBuffers();
    }

    onIdle() {
    }

    onKeyDown(key$$1, x, y) {
        if (key$$1 === KB_F2) {
            this.resetTime();
            return true;
        }
        return false;
    }

    onKeyUp(key$$1, x, y) {
    }

    onMouseClick(button, state, x, y, modifiers) {
    }

    onMotion(button, x, y, modifiers) {
    }

    onPassiveMotion(x, y) {
    }

    onMouseWheel(delta, x, y, modifiers) {
    }

    onResize(w, h) {
        if (w > 0 && h > 0) {
            if (this.renderer) {
                this.renderer.resize(w, h);
                this.renderDOM.width = w;
                this.renderDOM.height = h;
            }
            this.width = w;
            this.height = h;
        }
    }

    getMousePosition() {
    }

    /**
     * @returns {BaseApplication}
     */
    static get instance() {
        return BaseApplication._instance || null;
    }

    /**
     * @param val {BaseApplication}
     */
    static set instance(val) {
        BaseApplication._instance = val;
    }

    static get gButton() {
        return BaseApplication._gButton || -1;
    }

    static set gButton(val) {
        BaseApplication._gButton = val;
    }

    static get gModifyButton() {
        return BaseApplication._gModifyButton || -1;
    }

    static set gModifyButton(val) {
        BaseApplication._gModifyButton = val;
    }

    static get mX() {
        return BaseApplication._mX || 0;
    }

    static set mX(val) {
        BaseApplication._mX = val;
    }

    static get mY() {
        return BaseApplication._mY || 0;
    }

    static set mY(val) {
        BaseApplication._mY = val;
    }

    static get handles() {

        return this._handles || (this._handles = {
            /**
             * 窗口大小调整事件
             * @param evt {Event}
             */
            ResizeHandler: evt => {
                var ins = this.instance;
                if (ins) {
                    ins.onResize(window.innerWidth, window.innerHeight);
                }
            },

            KeyDownHandler: evt => {
                var key$$1 = evt.keyCode;
                var ins = this.instance;
                if (ins) {
                    if (key$$1 === KB_ESC && evt.ctrlKey) {
                        ins.onTerminate();
                        return;
                    }
                    ins.onKeyDown(key$$1, this.mX, this.mY);
                    ins.onSpecialKeyDown(key$$1, this.mX, this.mY);
                }
            },
            KeyUpHandler: evt => {
                var key$$1 = evt.keyCode;
                var ins = this.instance;
                if (ins) {
                    ins.onKeyUp(key$$1, this.mX, this.mY);
                    ins.onSpecialKeyUp(key$$1, this.mX, this.mY);

                }
            },
            MouseMoveHandler: evt => {
                this.mX = evt.x;
                this.mY = evt.y;
            },
            MouseHandler: evt => {
                var ins = this.instance;
                if (ins) {
                    this.gModifyButton = evt.ctrlKey;
                    if (evt.state === 'down') {
                        this.gButton = evt.button;
                    } else {
                        this.gButton = -1;
                    }
                    ins.onMouseClick(evt.button, evt.state, x, y, this.gModifyButton);
                }
            },
            MotionHandler: (x, y) => {
                var ins = this.instance;
                if (ins) {
                    ins.onMotion(this.gButton, x, y, this.gModifyButton);
                }
            },
            PassiveMotionHandler: (x, y) => {
                var ins = this.instance;
                if (ins) {
                    ins.onPassiveMotion(x, y);
                }
            }
        });
    }
}

/**
 * 3D应用实现类
 *
 * @author lonphy
 * @version 1.0
 **/
class Application3D extends BaseApplication {
    constructor(title, width, height, clearColor, canvas) {
        super(title, width, height, clearColor, canvas);
        this.camera = null;

        this.worldAxis = [
            Vector$1.ZERO,
            Vector$1.ZERO,
            Vector$1.ZERO
        ];

        this.trnSpeed = 0;
        this.trnSpeedFactor = 0;
        this.rotSpeed = 0;
        this.rotSpeedFactor = 0;

        this.UArrowPressed = false;
        this.DArrowPressed = false;
        this.LArrowPressed = false;
        this.RArrowPressed = false;
        this.PgUpPressed = false;
        this.PgDnPressed = false;
        this.HomePressed = false;
        this.EndPressed = false;
        this.InsertPressed = false;
        this.DeletePressed = false;
        this.cameraMoveable = false;

        /**
         * @type {Spatial}
         */
        this.motionObject = null;
        this.doRoll = 0;
        this.doYaw = 0;
        this.doPitch = 0;
        this.xTrack0 = 0;
        this.xTrack1 = 0;
        this.yTrack0 = 0;
        this.yTrack1 = 0;
        /**
         * @type {Matrix}
         */
        this.saveRotate = null;
        this.useTrackBall = true;
        this.trackBallDown = false;
    }

    /**
     * @param motionObject {Spatial}
     */
    initializeObjectMotion (motionObject) {
        this.motionObject = motionObject;
    }


    moveObject () {
        // The coordinate system in which the rotations are applied is that of
        // the object's parent, if it has one.  The parent's world rotation
        // matrix is R, of which the columns are the coordinate axis directions.
        // Column 0 is "direction", column 1 is "up", and column 2 is "right".
        // If the object does not have a parent, the world coordinate axes are
        // used, in which case the rotation matrix is I, the identity.  Column 0
        // is (1,0,0) and is "direction", column 1 is (0,1,0) and is "up", and
        // column 2 is (0,0,1) and is "right".  This choice is consistent with
        // the use of rotations in the Camera and Light classes to store
        // coordinate axes.
        //
        // Roll is about the "direction" axis, yaw is about the "up" axis, and
        // pitch is about the "right" axis.
        var motionObject = this.motionObject;

        if (!this.cameraMoveable || !motionObject) {
            return false;
        }

        // Check if the object has been moved by the virtual trackball.
        if (this.trackBallDown) {
            return true;
        }

        // Check if the object has been moved by the function keys.
        var parent = motionObject.parent;
        var axis = Vector$1.ZERO;
        var angle;
        var rot, incr;
        var rotSpeed = this.rotSpeed;

        if (this.doRoll) {
            rot = motionObject.localTransform.getRotate();

            angle = this.doRoll * rotSpeed;
            if (parent) {
                parent.worldTransform.getRotate().getColumn(0, axis);
            }
            else {
                axis.set(1, 0, 0); // Vector.UNIT_X;
            }

            incr.makeRotation(axis, angle);
            rot = incr * rot;
            rot.orthoNormalize();
            motionObject.localTransform.setRotate(rot);
            return true;
        }

        if (this.doYaw) {
            rot = motionObject.localTransform.getRotate();

            angle = this.doYaw * rotSpeed;
            if (parent) {
                parent.worldTransform.getRotate().getColumn(1, axis);
            }
            else {
                axis.set(0, 1, 0); // Vector.UNIT_Y;
            }

            incr.makeRotation(axis, angle);
            rot = incr * rot;
            rot.orthoNormalize();
            motionObject.localTransform.setRotate(rot);
            return true;
        }

        if (this.doPitch) {
            rot = motionObject.localTransform.getRotate();

            angle = this.doPitch * rotSpeed;
            if (parent) {
                parent.worldTransform.getRotate().getColumn(2, axis);
            }
            else {
                axis.set(0, 0, 1); // Vector.UNIT_Z;
            }

            incr.makeRotation(axis, angle);
            rot = incr * rot;
            rot.orthoNormalize();
            motionObject.localTransform.setRotate(rot);
            return true;
        }

        return false;
    }


    rotateTrackBall (x0, y0, x1, y1) {
        if ((x0 === x1 && y0 === y1) || !this.camera) {
            // Nothing to rotate.
            return;
        }

        // Get the first vector on the sphere.
        var length = _Math.sqrt(x0 * x0 + y0 * y0), invLength, z0, z1;
        if (length > 1) {
            // Outside the unit disk, project onto it.
            invLength = 1 / length;
            x0 *= invLength;
            y0 *= invLength;
            z0 = 0;
        }
        else {
            // Compute point (x0,y0,z0) on negative unit hemisphere.
            z0 = 1 - x0 * x0 - y0 * y0;
            z0 = z0 <= 0 ? 0 : _Math.sqrt(z0);
        }
        z0 = -z0;

        // Use camera world coordinates, order is (D,U,R), so point is (z,y,x).
        var vec0 = new Vector$1(z0, y0, x0);

        // Get the second vector on the sphere.
        length = _Math.sqrt(x1 * x1 + y1 * y1);
        if (length > 1) {
            // Outside unit disk, project onto it.
            invLength = 1 / length;
            x1 *= invLength;
            y1 *= invLength;
            z1 = 0;
        }
        else {
            // Compute point (x1,y1,z1) on negative unit hemisphere.
            z1 = 1 - x1 * x1 - y1 * y1;
            z1 = z1 <= 0 ? 0 : _Math.sqrt(z1);
        }
        z1 = -z1;

        // Use camera world coordinates, order is (D,U,R), so point is (z,y,x).
        var vec1 = new Vector$1(z1, y1, x1);

        // Create axis and angle for the rotation.
        var axis = vec0.cross(vec1);
        var dot = vec0.dot(vec1);
        var angle;
        if (axis.normalize() > _Math.ZERO_TOLERANCE) {
            angle = _Math.acos(dot);
        }
        else  // Vectors are parallel.
        {
            if (dot < 0) {
                // Rotated pi radians.
                invLength = _Math.invSqrt(x0 * x0 + y0 * y0);
                axis.x = y0 * invLength;
                axis.y = -x0 * invLength;
                axis.z = 0;
                angle = _Math.PI;
            }
            else {
                // Rotation by zero radians.
                axis = Vector$1.UNIT_X;
                angle = 0;
            }
        }

        // Compute the world rotation matrix implied by trackball motion.  The
        // axis vector was computed in camera coordinates.  It must be converted
        // to world coordinates.  Once again, I use the camera ordering (D,U,R).
        var worldAxis = this.camera.direction.scalar(axis.x).add(
            this.camera.up.scalar(axis.y).add(
                this.camera.right.scalar(axis.z)
            )
        );


        var trackRotate = new Matrix$1(worldAxis, angle);

        // Compute the new local rotation.  If the object is the root of the
        // scene, the new rotation is simply the *incremental rotation* of the
        // trackball applied *after* the object has been rotated by its old
        // local rotation.  If the object is not the root of the scene, you have
        // to convert the incremental rotation by a change of basis in the
        // parent's coordinate space.
        var parent = this.motionObject.parent;
        var localRot;
        if (parent) {
            var parWorRotate = parent.worldTransform.GetRotate();
            localRot = parWorRotate.transposeTimes(trackRotate) * parWorRotate * this.saveRotate;
        }
        else {
            localRot = trackRotate * this.saveRotate;
        }
        localRot.orthonormalize();
        this.motionObject.localTransform.setRotate(localRot);
    }

    /**
     * 初始化相机运动参数
     *
     * @param trnSpeed {float} 移动速度
     * @param rotSpeed {float} 旋转速度
     * @param trnSpeedFactor {float} 移动速度变化因子 默认为2
     * @param rotSpeedFactor {float} 旋转速度变化因子 默认为2
     */
    initializeCameraMotion (trnSpeed, rotSpeed, trnSpeedFactor, rotSpeedFactor) {
        this.cameraMoveable = true;

        this.trnSpeed = trnSpeed;
        this.rotSpeed = rotSpeed;
        this.trnSpeedFactor = trnSpeedFactor || 2;
        this.rotSpeedFactor = rotSpeedFactor || 2;

        this.worldAxis[0] = this.camera.direction;
        this.worldAxis[1] = this.camera.up;
        this.worldAxis[2] = this.camera.right;
    }

    /**
     * 移动相机,如果有则更新相机
     *
     * @returns {boolean}
     */
    moveCamera () {
        if (!this.cameraMoveable) {
            return false;
        }

        var moved = false;

        if (this.UArrowPressed) {
            this.moveForward();
            moved = true;
        }

        if (this.DArrowPressed) {
            this.moveBackward();
            moved = true;
        }

        if (this.HomePressed) {
            this.moveUp();
            moved = true;
        }

        if (this.EndPressed) {
            this.moveDown();
            moved = true;
        }

        if (this.LArrowPressed) {
            this.turnLeft();
            moved = true;
        }

        if (this.RArrowPressed) {
            this.turnRight();
            moved = true;
        }

        if (this.PgUpPressed) {
            this.lookUp();
            moved = true;
        }

        if (this.PgDnPressed) {
            this.lookDown();
            moved = true;
        }

        if (this.InsertPressed) {
            this.moveRight();
            moved = true;
        }

        if (this.DeletePressed) {
            this.moveLeft();
            moved = true;
        }

        return moved;
    }


    moveForward () {
        var pos = this.camera.position;
        var t = this.worldAxis[0].scalar(this.trnSpeed);
        this.camera.setPosition(pos.sub(t));
    }

    moveBackward () {
        var pos = this.camera.position;
        var t = this.worldAxis[0].scalar(this.trnSpeed);
        this.camera.setPosition(pos.add(t));
    }

    moveUp () {
        var pos = this.camera.position;
        var t = this.worldAxis[1].scalar(this.trnSpeed);
        this.camera.setPosition(pos.sub(t));
    }

    moveDown () {
        var pos = this.camera.position;
        var t = this.worldAxis[1].scalar(this.trnSpeed);
        this.camera.setPosition(pos.add(t));
    }

    moveLeft () {
        var pos = this.camera.position;
        var t = this.worldAxis[2].scalar(this.trnSpeed);
        this.camera.setPosition(pos.sub(t));
    }

    moveRight () {
        var pos = this.camera.position;
        var t = this.worldAxis[2].scalar(this.trnSpeed);
        this.camera.setPosition(pos.add(t));
    }

    turnLeft () {
        var incr = Matrix$1.makeRotation(this.worldAxis[1], -this.rotSpeed);
        this.worldAxis[0] = incr.mulPoint(this.worldAxis[0]);
        this.worldAxis[2] = incr.mulPoint(this.worldAxis[2]);
        var camera = this.camera;
        var dir = incr.mulPoint(camera.direction);
        var up = incr.mulPoint(camera.up);
        var right = incr.mulPoint(camera.right);
        this.camera.setAxes(dir, up, right);
    }

    turnRight () {
        var incr = Matrix$1.makeRotation(this.worldAxis[1], this.rotSpeed);
        this.worldAxis[0] = incr.mulPoint(this.worldAxis[0]);
        this.worldAxis[2] = incr.mulPoint(this.worldAxis[2]);
        var camera = this.camera;
        var dVector = incr.mulPoint(camera.direction);
        var uVector = incr.mulPoint(camera.up);
        var rVector = incr.mulPoint(camera.right);
        this.camera.setAxes(dVector, uVector, rVector);
    }

    lookUp () {
        var incr = Matrix$1.makeRotation(this.worldAxis[2], -this.rotSpeed);
        var camera = this.camera;
        var dVector = incr.mulPoint(camera.direction);
        var uVector = incr.mulPoint(camera.up);
        var rVector = incr.mulPoint(camera.right);
        this.camera.setAxes(dVector, uVector, rVector);
    }

    lookDown () {
        var incr = Matrix$1.makeRotation(this.worldAxis[2], this.rotSpeed);
        var camera = this.camera;
        var dVector = incr.mulPoint(camera.direction);
        var uVector = incr.mulPoint(camera.up);
        var rVector = incr.mulPoint(camera.right);
        this.camera.setAxes(dVector, uVector, rVector);
    }

    /**
     *
     * @param isPerspective {Boolean} 透视相机
     * @returns {boolean}
     */
    onInitialize (isPerspective=true) {
        if (!super.onInitialize()) {
            return false;
        }
        this.camera = new Camera(isPerspective);
        this.renderer.camera = this.camera;
        this.motionObject = null;
        return true;
    }

    onKeyDown (key, x, y) {
        if (super.onKeyDown(key, x, y)) {
            return true;
        }
        var cameraMoveable = this.cameraMoveable;

        switch (key) {
            case KB_1:  // Slower camera translation.
                if (cameraMoveable) {
                    this.trnSpeed /= this.trnSpeedFactor;
                }
                return true;
            case KB_2:  // Faster camera translation.
                if (cameraMoveable) {
                    this.trnSpeed *= this.trnSpeedFactor;
                }
                return true;
            case KB_3:  // Slower camera rotation.
                if (cameraMoveable) {
                    this.rotSpeed /= this.rotSpeedFactor;
                }
                return true;
            case KB_4:  // Faster camera rotation.
                if (cameraMoveable) {
                    this.rotSpeed *= this.rotSpeedFactor;
                }
                return true;
        }

        return false;
    }

    onSpecialKeyDown (key, x, y) {
        if (this.cameraMoveable) {
            switch (key) {
                case KB_LEFT:
                    return (this.LArrowPressed = true);
                case KB_RIGHT:
                    return (this.RArrowPressed = true);
                case KB_UP:
                    return (this.UArrowPressed = true);
                case KB_DOWN:
                    return (this.DArrowPressed = true);
            }
        }

        if (this.motionObject) {
            if (key === KB_F1) {
                this.doRoll = -1;
                return true;
            }
            if (key === KB_F2) {
                this.doRoll = 1;
                return true;
            }
            if (key === KB_F3) {
                this.doYaw = -1;
                return true;
            }
            if (key === KB_F4) {
                this.doYaw = 1;
                return true;
            }
            if (key === KB_F5) {
                this.doPitch = -1;
                return true;
            }
            if (key === KB_F6) {
                this.doPitch = 1;
                return true;
            }
        }

        return false;
    }

    onSpecialKeyUp (key, x, y) {
        if (this.cameraMoveable) {
            if (key === KB_LEFT) {
                this.LArrowPressed = false;
                return true;
            }
            if (key === KB_RIGHT) {
                this.RArrowPressed = false;
                return true;
            }
            if (key === KB_UP) {
                this.UArrowPressed = false;
                return true;
            }
            if (key === KB_DOWN) {
                this.DArrowPressed = false;
                return true;
            }
        }

        if (this.motionObject) {
            if (key === KB_F1) {
                this.doRoll = 0;
                return true;
            }
            if (key === KB_F2) {
                this.doRoll = 0;
                return true;
            }
            if (key === KB_F3) {
                this.doYaw = 0;
                return true;
            }
            if (key === KB_F4) {
                this.doYaw = 0;
                return true;
            }
            if (key === KB_F5) {
                this.doPitch = 0;
                return true;
            }
            if (key === KB_F6) {
                this.doPitch = 0;
                return true;
            }
        }

        return false;
    }

    onMouseClick (button, state, x, y, modifiers) {
        var width = this.width;
        var height = this.height;
        if (!this.useTrackBall ||
            button !== MS_LEFT || !this.motionObject
        ) {
            return false;
        }

        var mult = 1 / (width >= height ? height : width);

        if (state === MS_RIGHT) {
            // Get the starting point.
            this.trackBallDown = true;
            this.saveRotate = this.motionObject.localTransform.getRotate();
            this.xTrack0 = (2 * x - width) * mult;
            this.yTrack0 = (2 * (height - 1 - y) - height) * mult;
        }
        else {
            this.trackBallDown = false;
        }

        return true;
    }

    onMotion (button, x, y, modifiers) {
        if (
            !this.useTrackBall ||
            button !== MS_LEFT || !this.trackBallDown || !this.motionObject
        ) {
            return false;
        }
        var width = this.width;
        var height = this.height;

        // Get the ending point.
        var mult = 1 / (width >= height ? height : width);
        this.xTrack1 = (2 * x - width) * mult;
        this.yTrack1 = (2 * (height - 1 - y) - height) * mult;

        // Update the object's local rotation.
        this.rotateTrackBall(this.xTrack0, this.yTrack0, this.xTrack1, this.yTrack1);
        return true;
    }

    onResize(width, height) {
        super.onResize(width, height);
        let params = this.camera.getPerspective();
        this.camera.setPerspective(params[0], this.getAspectRatio(), params[2], params[3]);
    }
}


//# sourceMappingURL=l5gl.module.js.map

/**
 * 点光源 顶点变形 + 片元光照效果
 */
class VSShaderEffect extends VisualEffect {

    constructor() {
        super();
        var vshader = new VertexShader('VSShaderEffectVS', 2, 1);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(VSShaderEffect.VS);

        var fshader = new FragShader('VSShaderEffectFS', 0, 11);
        fshader.setConstant(0, 'WMatrix', Shader.VT_MAT4);
        fshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC3);
        fshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC3);
        fshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC3);
        fshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
        fshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);
        fshader.setConstant(6, 'LightModelPosition', Shader.VT_VEC3);
        fshader.setConstant(7, 'LightAmbient', Shader.VT_VEC3);
        fshader.setConstant(8, 'LightDiffuse', Shader.VT_VEC3);
        fshader.setConstant(9, 'LightSpecular', Shader.VT_VEC3);
        fshader.setConstant(10, 'LightAttenuation', Shader.VT_VEC4);
        fshader.setProgram(VSShaderEffect.FS);

        var program = new Program('VSShaderEffectProgram', vshader, fshader);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    /**
     * 创建点光源顶点光照程序
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setFragConstant(0, 0, new WMatrixConstant());

        instance.setFragConstant(0, 1, new CameraModelPositionConstant$1());
        instance.setFragConstant(0, 2, new MaterialEmissiveConstant$1(material));
        instance.setFragConstant(0, 3, new MaterialAmbientConstant$1(material));
        instance.setFragConstant(0, 4, new MaterialDiffuseConstant$1(material));
        instance.setFragConstant(0, 5, new MaterialSpecularConstant$1(material));
        instance.setFragConstant(0, 6, new LightModelPositionConstant(light));
        instance.setFragConstant(0, 7, new LightAmbientConstant$1(light));
        instance.setFragConstant(0, 8, new LightDiffuseConstant$1(light));
        instance.setFragConstant(0, 9, new LightSpecularConstant$1(light));
        instance.setFragConstant(0, 10, new LightAttenuationConstant$1(light));
        return instance;
    }

    /**
     * 创建唯一点光源顶点光照程序
     *
     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(light, material) {
        var effect = new VSShaderEffect();
        return effect.createInstance(light, material);
    }
}

DECLARE_ENUM(VSShaderEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec3 vertexPosition;
out vec3 vertexNormal;

void main(){
    vec3 pos = modelPosition;
    vec2 posXZ = pos.xz;
    pos.y = 0.5 * sin( dot(posXZ, posXZ) );

    vec3 xtangent = vec3(1.0, 0.0, 0.0);
    vec3 ztangent = vec3(0.0, 0.0, 1.0);

    xtangent.y = 2.0 * 0.5 * pos.x * cos( dot(posXZ, posXZ) );
    ztangent.y = 2.0 * 0.5 * pos.z * cos( dot(posXZ, posXZ) );

    vertexNormal = normalize ( cross( xtangent, ztangent) );
    gl_Position = PVWMatrix * vec4(pos, 1.0);
    vertexPosition = pos;
}
`,
    FS: `#version 300 es
precision highp float;
uniform mat4 WMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;
uniform vec3 LightModelPosition;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;

in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;

void main(){
    vec3 normal = normalize(vertexNormal);
    vec3 vertexLightDiff = LightModelPosition - vertexPosition;
    vec3 vertexDirection = normalize(vertexLightDiff);
    float t = length(mat3(WMatrix) * vertexDirection);

    // t = intensity / (constant + d * linear + d*d* quadratic);
    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));
    vec3 color = MaterialAmbient * LightAmbient;

    float d = max(dot(normal, vertexDirection), 0.0);
    color = color + d * MaterialDiffuse.rgb * LightDiffuse;

    if (d > 0.0) {
        vec3 viewVector = normalize(CameraModelPosition - vertexPosition);
        vec3 reflectDir = normalize( reflect(vertexDirection, normal) );               // 计算反射方向
        d = max(dot(reflectDir, viewVector), 0.0);
        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));
        color = color + d * MaterialSpecular.rgb * LightSpecular;
    }
    fragColor.rgb = MaterialEmissive + t * color;
    fragColor.a = MaterialDiffuse.a;
}
`
});


D3Object.Register('L5.LightPointPerFragEffect', VSShaderEffect.factory);

/**
 * 点光源 顶点变形 + 片元光照效果
 */
class FRShaderEffect extends VisualEffect {

    constructor() {
        super();
        var vshader = new VertexShader('FRShaderEffectVS', 2, 1);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(FRShaderEffect.VS);

        var fshader = new FragShader('FRShaderEffectFS', 0, 11);
        fshader.setConstant(0, 'WMatrix', Shader.VT_MAT4);
        fshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC3);
        fshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC3);
        fshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC3);
        fshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
        fshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);
        fshader.setConstant(6, 'LightModelPosition', Shader.VT_VEC3);
        fshader.setConstant(7, 'LightAmbient', Shader.VT_VEC3);
        fshader.setConstant(8, 'LightDiffuse', Shader.VT_VEC3);
        fshader.setConstant(9, 'LightSpecular', Shader.VT_VEC3);
        fshader.setConstant(10, 'LightAttenuation', Shader.VT_VEC4);
        fshader.setProgram(FRShaderEffect.FS);

        var program = new Program('FRShaderEffectProgram', vshader, fshader);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    /**
     * 创建点光源顶点光照程序
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant$1());
        instance.setFragConstant(0, 0, new WMatrixConstant());

        instance.setFragConstant(0, 1, new CameraModelPositionConstant$1());
        instance.setFragConstant(0, 2, new MaterialEmissiveConstant$1(material));
        instance.setFragConstant(0, 3, new MaterialAmbientConstant$1(material));
        instance.setFragConstant(0, 4, new MaterialDiffuseConstant$1(material));
        instance.setFragConstant(0, 5, new MaterialSpecularConstant$1(material));
        instance.setFragConstant(0, 6, new LightModelPositionConstant(light));
        instance.setFragConstant(0, 7, new LightAmbientConstant$1(light));
        instance.setFragConstant(0, 8, new LightDiffuseConstant$1(light));
        instance.setFragConstant(0, 9, new LightSpecularConstant$1(light));
        instance.setFragConstant(0, 10, new LightAttenuationConstant$1(light));
        return instance;
    }

    /**
     * 创建唯一点光源顶点光照程序
     *
     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(light, material) {
        var effect = new FRShaderEffect();
        return effect.createInstance(light, material);
    }
}

DECLARE_ENUM(FRShaderEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec3 vertexPosition;
out vec3 vertexNormal;

void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vertexPosition = modelPosition;
    vertexNormal = modelNormal;
}
`,
    FS: `#version 300 es
#pragma debug(on)

precision highp float;
uniform mat4 WMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;
uniform vec3 LightModelPosition;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;

in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;

void main(){
    vec3 normal = normalize(vertexNormal);
    vec3 vertexLightDiff = LightModelPosition - vertexPosition;
    vec3 vertexDirection = normalize(vertexLightDiff);
    float t = length(mat3(WMatrix) * vertexDirection);

    // t = intensity / (constant + d * linear + d*d* quadratic);
    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));
    vec3 color = MaterialAmbient * LightAmbient;

    float d = max(dot(normal, vertexDirection), 0.0);
    color = color + d * MaterialDiffuse.rgb * LightDiffuse;

    if (d > 0.0) {
        vec3 viewVector = normalize(CameraModelPosition - vertexPosition);
        vec3 reflectDir = normalize( -reflect(vertexDirection, normal) );               // 计算反射方向
        d = max(dot(reflectDir, viewVector), 0.0);
        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));
        color = color + d * MaterialSpecular.rgb * LightSpecular;
    }
    fragColor.rgb = MaterialEmissive + t * color;
    fragColor.a = MaterialDiffuse.a;
}
`
});

class PointLightController extends PointController {
    constructor() {
        super();
        this.angle = 0;
        this.position = new Point$1(0, 10, 20);
    }

    updatePointMotion() {
        let vba = VertexBufferAccessor$1.fromVisual(this.object);
        let pos = vba.getPosition(0);

        this.angle++;
        let angle = this.angle * Math.PI / 180;

        let s = Math.sin(angle) * 15;
        let c = Math.cos(angle) * 20;

        pos.set([s, 10, c]);
        this.position.copy(pos);
        vba.setPosition(0, pos);

        Renderer$1.updateAll(this.object.vertexBuffer);
        this.angle %= 360;
    }

    getPosition() {
        return this.position;
    }
}

/**
 * @extends {Application3D}
 */
class Lights extends Application3D {

    constructor() {
        let canvas = document.querySelector('#ctx');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        super('Lights', w, h, [0, 0, 0, 1], 'ctx');

        this.textColor = "#fff";
        this.sceneCuller = null;
        this.scene = null;

        this.lights = null;

        this.effects = {
            plane: null
        };
        this.ptc = null;
    }

    onInitialize() {
        if (!super.onInitialize()) {
            return false;
        }

        // Set up the camera.
        this.camera.setPerspective(45.0, this.getAspectRatio(), 0.001, 100);

        this.camera.lookAt(Point$1.ORIGIN, Point$1.ORIGIN, Vector$1.UNIT_Y);
        let pos = new Point$1(0, 5, -30);
        this.camera.setPosition(pos);

        this.createScene();

        // Initial update of objects.
        this.scene.update();
        this.scene.culling = Spatial$1.CULLING_NEVER;

        // Initial culling of scene,
        this.sceneCuller = new Culler(this.camera);
        this.sceneCuller.computeVisibleSet(this.scene);

        this.initializeCameraMotion(1, 0.05);
        this.initializeObjectMotion(this.scene);
        this.initializeObjectMotion(this.points);
        return true;
    }

    onIdle() {
        this.measureTime();

        this.moveCamera();
        this.moveObject();
        this.scene.update(this.applicationTime);
        let pos = this.ptc.getPosition();
        this.lights.setPosition(pos);
        this.sceneCuller.computeVisibleSet(this.scene);
        // Draw the scene.
        if (this.renderer.preDraw()) {
            this.renderer.clearBuffers();
            this.renderer.drawVisibleSet(this.sceneCuller.visibleSet);
            this.drawFrameRate();
            this.renderer.postDraw();
        }
        this.updateFrameCount();
    }

    createLights() {
        this.lights = new Light$1(Light$1.LT_POINT);
        this.lights.ambient.set([0.2, 0.2, 0.2, 1]);
        this.lights.diffuse.set([0.8, 0.8, 0.5, 1]);
        this.lights.specular.set([1, 1, 1, 1]);
        this.lights.setPosition(new Point$1(0, 10, 20));
    }

    createScene() {
        this.scene = new Node();
        this.createLights();
        this.createLightsController();

        //  地板材质
        let m1 = new Material$1();
        m1.emissive.set([0, 0, 0, 1]);
        m1.ambient.set([0.3, 0.1, 0.3, 1]);
        m1.diffuse.set([0.7, 0, 0.07, 1]);
        m1.specular.set([0.8, 0.8, 0.8, 8]);

        // 地板 三种光特效
        let effect0 = (new FRShaderEffect()).createInstance(this.lights, m1);

        let effect1 = (new LightPointPerFragEffect).createInstance(this.lights, m1);

        let format = VertexFormat$1.create(2,
            VertexFormat$1.AU_POSITION, VertexFormat$1.AT_FLOAT3, 0,
            VertexFormat$1.AU_NORMAL, VertexFormat$1.AT_FLOAT3, 0);

        let std = new StandardMesh(format);

        this.plane0 = std.rectangle(64, 64, 16, 16);
        this.plane0.effect = effect0;

        this.scene.attachChild(this.plane0);
    }

    // create point light's point and controller
    createLightsController() {
        let format = VertexFormat$1.create(3,
            VertexFormat$1.AU_POSITION, VertexFormat$1.AT_FLOAT3, 0,
            VertexFormat$1.AU_COLOR, VertexFormat$1.AT_FLOAT3, 0,
            VertexFormat$1.AU_PSIZE, VertexFormat$1.AT_FLOAT1, 0);

        const stride = format.stride;
        const usage = format.usage;

        let vbo = new VertexBuffer(1, stride, Buffer$1.BU_DYNAMIC);
        let vba = new VertexBufferAccessor$1(format, vbo);
        vba.setPosition(0, this.lights.position);
        vba.setColor(0, 0, this.lights.diffuse);
        vba.setPointSize(0, 3);

        this.points = new PolyPoint(format, vbo);
        this.ptc = new PointLightController();
        this.points.attachController(this.ptc);
        this.points.effect = VertexColor3Effect.createUniqueInstance();
        this.points.culling = Spatial$1.CULLING_NEVER;
        this.scene.attachChild(this.points);
    }
}

window.onload = () => runApplication(Lights);

})));
//# sourceMappingURL=vertex.js.map
