/**
 * ControlledObject - 控制基类
 *
 * @version 2.0
 * @author lonphy
 */

import { D3Object } from '../../core/D3Object'
import { Controller } from './Controller'

export class ControlledObject extends D3Object {
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
