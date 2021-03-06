/// <reference path="../../shape/measure/ShapeMeasurePipeDef" />

module minerva.shapes.path.measure {
    export interface IInput extends shape.measure.IInput {
        data: AnonPathGeometry;
    }
    export interface IState extends shape.measure.IState {
    }
    export interface IOutput extends shape.measure.IOutput {
    }

    export class PathMeasurePipeDef extends shape.measure.ShapeMeasurePipeDef {
        constructor () {
            super();
            this.addTapinBefore('calcNaturalBounds', 'buildPath', tapins.buildPath)
                .replaceTapin('calcNaturalBounds', tapins.calcNaturalBounds)
                .addTapinAfter('doOverride', 'adjustNoStretchDesired', tapins.adjustNoStretchDesired);
        }
    }

    export module tapins {
        export function buildPath (input: IInput, state: IState, output: IOutput, tree: core.IUpdaterTree) {
            return true;
        }

        export function calcNaturalBounds (input: IInput, state: IState, output: IOutput, tree: core.IUpdaterTree) {
            var nb = output.naturalBounds;
            nb.x = nb.y = nb.width = nb.height = 0;
            if (input.data) {
                var bounds = input.data.GetBounds(input);
                Rect.copyTo(bounds, nb);
            }

            return true;
        }

        export function adjustNoStretchDesired (input: IInput, state: IState, output: IOutput, tree: core.IUpdaterTree) {
            if (input.stretch === Stretch.None) {
                var nb = output.naturalBounds;
                var ds = output.desiredSize;
                ds.width = nb.width + Math.max(0, nb.x);
                ds.height = nb.height + Math.max(0, nb.y);
            }

            return true;
        }
    }
}