module minerva {
    export class PipeDefinition<T extends ITapin, TAssets extends IPipeAssets, TState extends IPipeState, TOutput extends IPipeOutput> {
        private $$names: string[] = [];
        tapins: T[] = [];

        addTapin (name: string, tapin: T): PipeDefinition<T> {
            this.$$names.push(name);
            this.tapins.push(tapin);
            return this;
        }

        addTapinBefore (name: string, tapin: T, before?: string): PipeDefinition<T> {
            var names = this.$$names;
            var tapins = this.tapins;
            var index = !before ? -1 : names.indexOf(before);
            if (index === -1) {
                names.unshift(name);
                tapins.unshift(tapin);
            } else {
                names.splice(index, 0, name);
                tapins.splice(index, 0, tapin);
            }
            return this;
        }

        addTapinAfter (name: string, tapin: T, after?: string): PipeDefinition<T> {
            var names = this.$$names;
            var tapins = this.tapins;
            var index = !after ? -1 : names.indexOf(after);
            if (index === -1 || index === names.length - 1) {
                names.push(name);
                tapins.push(tapin);
            } else {
                names.splice(index + 1, 0, name);
                tapins.splice(index + 1, 0, tapin);
            }
            return this;
        }

        replace (name: string, tapin: T): PipeDefinition<T> {
            var names = this.$$names;
            var tapins = this.tapins;
            var index = names.indexOf(name);
            if (index === -1)
                throw new Error("Could not replace pipe tap-in. No pipe tap-in named `" + name + "`.");
            tapins[index] = tapin;
            return this;
        }

        initAssets (assets: TAssets) {
        }

        initState (state: TState) {
        }

        initOutput (output: TOutput) {
        }
    }
}