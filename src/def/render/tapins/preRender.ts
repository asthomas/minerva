module minerva.def.render.tapins {
    export var preRender: IRenderTapin = function (assets: IAssets, state: IState, output: IOutput, ctx: CanvasRenderingContext2D, region: Rect): boolean {
        var effect = assets.Effect;
        if (!effect)
            return true;
        RenderContext.save(ctx);
        effect.PreRender(ctx);
        return true;
    };
}