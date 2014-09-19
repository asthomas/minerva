module minerva.def.processup {
    export interface IProcessUpTapin extends ITapin {
        (input: IInput, state: IState, output: IOutput, vpinput: IInput, vpoutput: IOutput):boolean;
    }
    export interface IInput extends IPipeInput {
        width: number;
        height: number;
        minWidth: number;
        minHeight: number;
        maxWidth: number;
        maxHeight: number;
        useLayoutRounding: boolean;
        actualWidth: number;
        actualHeight: number;
        effectPadding: Thickness;
        localProjection: number[];
        absoluteProjection: number[];
        extents: Rect;
        extentsWithChildren: Rect;
        globalBoundsWithChildren: Rect;
        surfaceBoundsWithChildren: Rect;
        dirtyFlags: DirtyFlags;
        forceInvalidate: boolean;
    }
    export interface IState extends IPipeState {
        actualSize: Size;
    }
    export interface IOutput extends IPipeOutput, helpers.IInvalidateable {
        extents: Rect;
        extentsWithChildren: Rect;
        globalBoundsWithChildren: Rect;
        surfaceBoundsWithChildren: Rect;
        dirtyFlags: DirtyFlags;
        dirtyRegion: Rect;
        invalidateSubtreePaint: boolean;
        forceInvalidate: boolean;
    }

    export class ProcessUpPipeDef extends PipeDef<IProcessUpTapin, IInput, IState, IOutput> {
        constructor() {
            super();
            this.addTapin('calcActualSize', tapins.calcActualSize)
                .addTapin('calcExtents', tapins.calcExtents)
                .addTapin('calcPaintBounds', tapins.calcPaintBounds)
                .addTapin('processBounds', tapins.processBounds)
                .addTapin('processNewBounds', tapins.processNewBounds)
                .addTapin('processInvalidate', tapins.processInvalidate);
        }

        createState(): IState {
            return {
                actualSize: new Size()
            };
        }

        createOutput(): IOutput {
            return {
                extents: new Rect(),
                extentsWithChildren: new Rect(),
                globalBoundsWithChildren: new Rect(),
                surfaceBoundsWithChildren: new Rect(),
                dirtyFlags: 0,
                dirtyRegion: new Rect(),
                invalidateSubtreePaint: false,
                forceInvalidate: false,
                totalIsRenderVisible: false,
                totalOpacity: 1.0
            };
        }

        prepare(input: IInput, state: IState, output: IOutput) {

        }

        flush(input: IInput, state: IState, output: IOutput) {

            // DirtyFlags.Transform most likely won't be set on input or outpu
        }
    }
}