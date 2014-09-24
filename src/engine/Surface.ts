module minerva.engine {
    export interface IPass extends layout.draft.ILayoutPipeData {
        count: number;
        maxCount: number;
    }

    export class Surface implements layout.ISurface {
        private $$layout = new layout.draft.LayoutPipeDef();

        private $$canvas: HTMLCanvasElement = null;
        private $$ctx: layout.render.RenderContext = null;

        private $$layers: layout.Updater[] = [];

        private $$downDirty: layout.Updater[] = [];
        private $$upDirty: layout.Updater[] = [];
        private $$dirtyRegion: Rect = null;

        updateBounds() {

        }

        invalidate(region?: Rect) {
            region = region || new Rect(0, 0, this.$$canvas.offsetWidth, this.$$canvas.offsetHeight);
            if (!this.$$dirtyRegion)
                this.$$dirtyRegion = new Rect(region.x, region.y, region.width, region.height);
            else
                Rect.union(this.$$dirtyRegion, region);
        }

        render() {
            var region = this.$$dirtyRegion;
            if (!region || Rect.isEmpty(region))
                return;
            this.$$dirtyRegion = null;
            Rect.roundOut(region);

            var ctx = this.$$ctx;
            ctx.raw.clearRect(region.x, region.y, region.width, region.height);
            ctx.save();
            ctx.clipRect(region);
            for (var layers = this.$$layers, i = 0, len = layers.length; i < len; i++) {
                layers[i].render(ctx, region);
            }
            ctx.restore();
        }

        addUpDirty(updater: layout.Updater) {
            this.$$upDirty.push(updater);
        }

        addDownDirty(updater: layout.Updater) {
            this.$$downDirty.push(updater);
        }

        updateLayout(): boolean {
            var pass: IPass = {
                count: 0,
                maxCount: 250,
                updater: null,
                assets: null,
                flag: UIFlags.None,
                measureList: [],
                arrangeList: [],
                sizingList: [],
                surfaceSize: new Size(this.$$canvas.offsetWidth, this.$$canvas.offsetHeight)
            };
            var updated = false;
            var layersUpdated = true;
            while (pass.count < pass.maxCount && layersUpdated) {
                layersUpdated = draft(this.$$layers, this.$$layout, pass);
                updated = process(this.$$downDirty, this.$$upDirty) || layersUpdated || updated;
            }

            if (pass.count >= pass.maxCount) {
                console.error("[MINERVA] Aborting infinite update loop");
            }

            return updated;
        }
    }
}