module minerva.layout.measure.tapins {
    export var checkNeedMeasure: IMeasureTapin = function (input: IInput, state: IState, output: IOutput, availableSize: Size): boolean {
        if ((input.dirtyFlags & DirtyFlags.Measure) > 0)
            return true;
        var pc = input.previousConstraint;
        if (!pc || pc.width !== availableSize.width || pc.height !== availableSize.height) {
            Size.copyTo(pc, output.previousConstraint);
            return true;
        }
        return false;
    };
}