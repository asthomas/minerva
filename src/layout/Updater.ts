module minerva.layout {
    var NO_PIPE = new pipe.TriPipeDef<pipe.ITriTapin, pipe.IPipeInput, pipe.IPipeState, pipe.IPipeOutput>();
    var NO_VO: IVisualOwner = {
        updateBounds: function () {
        },
        invalidate: function (region: Rect) {
        }
    };

    export class Updater {
        private $$measure: IMeasurePipe = null;
        private $$arrange: IArrangePipe = null;
        private $$sizing: ISizingPipe = null;
        private $$processdown: IProcessDownPipe = null;
        private $$processup: IProcessUpPipe = null;
        private $$render: IRenderPipe = null;

        private $$visualParentUpdater: Updater = null;
        private $$surface: ISurface = null;

        private $$inDownDirty = false;
        private $$inUpDirty = false;

        assets: IUpdaterAssets = {
            width: NaN,
            height: NaN,
            minWidth: 0.0,
            minHeight: 0.0,
            maxWidth: Number.POSITIVE_INFINITY,
            maxHeight: Number.POSITIVE_INFINITY,
            useLayoutRounding: true,
            margin: new Thickness(),
            horizontalAlignment: HorizontalAlignment.Stretch,
            verticalAlignment: VerticalAlignment.Stretch,
            clip: null,
            effect: null,
            visibility: Visibility.Visible,
            opacity: 1.0,
            isHitTestVisible: true,
            renderTransform: mat3.identity(),
            renderTransformOrigin: new Point(),
            projection: null,
            effectPadding: new Thickness(),

            isTopLevel: false,

            previousConstraint: new Size(),
            desiredSize: new Size(),
            hiddenDesire: new Size(),

            renderSize: new Size(),
            lastRenderSize: new Size(),
            layoutSlot: new Rect(),
            layoutClip: new Rect(),
            compositeLayoutClip: null,

            actualWidth: 0,
            actualHeight: 0,
            z: NaN,

            totalIsRenderVisible: true,
            totalOpacity: 1.0,
            totalIsHitTestVisible: true,
            totalHasRenderProjection: false,

            extents: new Rect(),
            extentsWithChildren: new Rect(),
            surfaceBoundsWithChildren: new Rect(),
            globalBoundsWithChildren: new Rect(),

            layoutXform: mat3.identity(),
            carrierXform: mat3.identity(),
            renderXform: mat3.identity(),
            absoluteXform: mat3.identity(),
            carrierProjection: mat4.identity(),
            localProjection: mat4.identity(),
            absoluteProjection: mat4.identity(),

            dirtyRegion: new Rect(),
            dirtyFlags: 0,
            uiFlags: UIFlags.RenderVisible | UIFlags.HitTestVisible,
            forceInvalidate: false
        };

        constructor () {
        }

        /////// PREPARE PIPES

        setMeasurePipe (pipedef?: measure.MeasurePipeDef): Updater {
            this.$$measure = <IMeasurePipe>pipe.createTriPipe(pipedef || NO_PIPE);
            return this;
        }

        setArrangePipe (pipedef?: arrange.ArrangePipeDef): Updater {
            this.$$arrange = <IArrangePipe>pipe.createTriPipe(pipedef || NO_PIPE);
            return this;
        }

        setSizingPipe (pipedef?: sizing.SizingPipeDef): Updater {
            this.$$sizing = <ISizingPipe>pipe.createTriPipe(pipedef || NO_PIPE);
            return this;
        }

        setProcessDownPipe (pipedef?: processdown.ProcessDownPipeDef): Updater {
            this.$$processdown = <IProcessDownPipe>pipe.createTriPipe(pipedef || NO_PIPE);
            return this;
        }

        setProcessUpPipe (pipedef?: processup.ProcessUpPipeDef): Updater {
            this.$$processup = <IProcessUpPipe>pipe.createTriPipe(pipedef || NO_PIPE);
            return this;
        }

        setRenderPipe (pipedef?: render.RenderPipeDef): Updater {
            this.$$render = <IRenderPipe>pipe.createTriPipe(pipedef || NO_PIPE);
            return this;
        }

        /////// RUN PIPES

        measure (availableSize: Size): boolean {
            var pipe = this.$$measure;
            var output = pipe.output;
            var success = pipe.def.run(this.assets, pipe.state, output, availableSize);
            if (output.newUpDirty)
                Updater.$$addUpDirty(this);
            if (output.newDownDirty)
                Updater.$$addDownDirty(this);
            if (output.newUiFlags)
                Updater.$$propagateUiFlagsUp(this, output.newUiFlags);
            return success;
        }

        arrange (finalRect: Rect): boolean {
            var pipe = this.$$arrange;
            var output = pipe.output;
            var success = pipe.def.run(this.assets, pipe.state, output, finalRect);
            if (output.newUpDirty)
                Updater.$$addUpDirty(this);
            if (output.newDownDirty)
                Updater.$$addDownDirty(this);
            if (output.newUiFlags)
                Updater.$$propagateUiFlagsUp(this, output.newUiFlags);
            return success;
        }

        sizing (oldSize: Size, newSize: Size): boolean {
            var pipe = this.$$sizing;
            var assets = this.assets;
            oldSize.width = assets.actualWidth;
            oldSize.height = assets.actualHeight;
            var success = pipe.def.run(assets, pipe.state, pipe.output);
            Size.copyTo(pipe.output.actualSize, newSize);
            return success;
        }

        processDown (): boolean {
            if (!this.$$inDownDirty)
                return true;
            if (this.$$visualParentUpdater && this.$$visualParentUpdater.$$inDownDirty) {
                //OPTIMIZATION: uie is overzealous. His parent will invalidate him later
                return false;
            }

            var pipe = this.$$processdown;
            var vp = this.$$visualParentUpdater;
            var success = pipe.def.run(this.assets, pipe.state, pipe.output, vp ? vp.assets : null);
            this.$$inDownDirty = false;
            if (pipe.output.newUpDirty)
                Updater.$$addUpDirty(this);
            return success;
        }

        processUp (): boolean {
            if (!this.$$inUpDirty)
                return true;

            var pipe = this.$$processup;
            var success = pipe.def.run(this.assets, pipe.state, pipe.output, Updater.$$getVisualOnwer(this));
            this.$$inUpDirty = false;
            return success;
        }

        render (ctx: render.RenderContext, region: Rect): boolean {
            var pipe = this.$$render;
            return pipe.def.run(this.assets, pipe.state, pipe.output, ctx, region);
        }

        ///////

        invalidateMeasure() {
            this.assets.dirtyFlags |= DirtyFlags.Measure;
            this.assets.uiFlags |= UIFlags.MeasureHint;
            //TODO: Propagate up
        }

        invalidateArrange() {
            this.assets.dirtyFlags |= DirtyFlags.Arrange;
            this.assets.uiFlags |= UIFlags.ArrangeHint;
            //TODO: Propagate up
        }

        updateBounds (forceRedraw?: boolean) {
            var assets = this.assets;
            assets.dirtyFlags |= DirtyFlags.Bounds;
            Updater.$$addUpDirty(this);
            if (forceRedraw === true)
                assets.forceInvalidate = true;
        }

        invalidate (region: Rect) {
            var assets = this.assets;
            if (!assets.totalIsRenderVisible || (assets.totalOpacity * 255) < 0.5)
                return;
            assets.dirtyFlags |= DirtyFlags.Invalidate;
            Updater.$$addUpDirty(this);
            Rect.union(assets.dirtyRegion, region);
        }

        findChildInList (list: Updater[]) {
            for (var i = 0, len = list.length; i < len; i++) {
                if (list[i].$$visualParentUpdater === this)
                    return i;
            }
            return -1;
        }

        /////// STATIC HELPERS

        static walk(updater: Updater): IWalker<Updater> {
            //TODO: Implement walk
            return null;
        }

        static walkDeep(updater: Updater): IDeepWalker<Updater> {
            //TODO: Implement walkDeep
            return null;
        }

        static doMeasure(updater: Updater) {
            var assets = updater.assets;
            var last = assets.previousConstraint;
            var old = new Size();

            //TODO: Set last to infinite if not attached, no visual parent, layout container, and no last

            if (last) {
                Size.copyTo(assets.desiredSize, old);
                updater.measure(last);
                if (Size.isEqual(old, assets.desiredSize))
                    return;
            }

            var vp = updater.$$visualParentUpdater;
            if (vp)
                vp.invalidateMeasure();

            assets.dirtyFlags &= ~DirtyFlags.Measure;
        }

        static doArrange(updater: Updater) {
            var assets = updater.assets;
            var last = assets.layoutSlot || undefined;

            var vp = updater.$$visualParentUpdater;
            if (vp) {
                var desired: size;
                if (this.IsLayoutContainer) {
                    desired = size.copyTo(this.DesiredSize);
                    if (n.IsAttached && n.IsTopLevel && !n.ParentNode) {
                        var measure = this.PreviousConstraint;
                        if (measure)
                            size.max(desired, measure);
                        else
                            desired = size.copyTo(surface.Extents);
                    }
                } else {
                    desired = size.fromRaw(fe.ActualWidth, fe.ActualHeight);
                }

                var viewport = rect.fromSize(desired);
                viewport.X = Controls.Canvas.GetLeft(fe);
                viewport.Y = Controls.Canvas.GetTop(fe);
                last = viewport;
            }

            if (last) {
                updater.arrange(last);
            } else if (vp) {
                vp.invalidateArrange();
            }
        }

        private static $$getVisualOnwer (updater: Updater): IVisualOwner {
            if (updater.$$visualParentUpdater)
                return updater.$$visualParentUpdater;
            if (updater.assets.isTopLevel && updater.$$surface)
                return updater.$$surface;
            return NO_VO;
        }

        private static $$addUpDirty (updater: Updater) {
            if (updater.$$surface && !updater.$$inUpDirty) {
                updater.$$surface.addUpDirty(updater);
                updater.$$inUpDirty = true;
            }
        }

        private static $$addDownDirty (updater: Updater) {
            if (updater.$$surface && !updater.$$inDownDirty) {
                updater.$$surface.addDownDirty(updater);
                updater.$$inDownDirty = true;
            }
        }

        private static $$propagateUiFlagsUp (updater: Updater, flags: UIFlags) {
            var vpu = updater;
            while ((vpu = vpu.$$visualParentUpdater) != null && (vpu.assets.uiFlags & flags) > 0) {
                vpu.assets.uiFlags |= flags;
            }
        }
    }
}