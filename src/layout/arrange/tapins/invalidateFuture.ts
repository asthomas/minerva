module minerva.layout.arrange.tapins {
    export var invalidateFuture: IArrangeTapin = function (input: IInput, state: IState, output: IOutput, finalRect: Rect): boolean {
        var lc = output.layoutClip;
        lc.x = lc.y = lc.width = lc.height = 0;
        output.dirtyFlags |= DirtyFlags.LocalTransform;
        output.dirtyFlags |= DirtyFlags.LocalProjection;
        output.dirtyFlags |= DirtyFlags.Bounds;
        return true;
    };
}