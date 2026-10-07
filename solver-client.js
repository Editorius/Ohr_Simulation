/* One running calculation, one replaceable pending request. Old results cannot
   reach the view. A blob worker also works when index.html is opened locally. */
(function (root) {
  "use strict";
  function solvePair(options) {
    const start = performance.now();
    const passive = CochleaModel.solveForView({...options,activity:0});
    const active = options.activity ? CochleaModel.solveForView(options) : passive;
    return {passive,active,elapsed:performance.now()-start};
  }

  function workerMain() {
    const recent = new Map();
    self.onmessage = ({ data }) => {
      const { id, options } = data;
      try {
        const key = JSON.stringify(options);
        let pair = recent.get(key);
        if (!pair) {
          pair = solvePair(options);
          if (recent.size >= 8) recent.delete(recent.keys().next().value);
          recent.set(key, pair);
        }
        self.postMessage({ id, pair });
      } catch (e) {
        self.postMessage({ id, error: e.message });
      }
    };
  }
  class SolverClient {
    constructor(onResult, onError) {
      this.onResult = onResult;
      this.onError = onError;
      this.latest = 0;
      this.busy = null;
      this.next = null;
      this.worker = null;
      try {
        const blob = new Blob(
            [
              CochleaNumerics.workerSource,
              CochleaModel.workerSource,
              "\n",
              solvePair.toString(),
              "\n(",
              workerMain.toString(),
              ")();",
            ],
            { type: "text/javascript" },
          ),
          url = URL.createObjectURL(blob);
        this.worker = new Worker(url);
        URL.revokeObjectURL(url);
        this.worker.onmessage = (e) => this.finish(e.data);
        this.worker.onerror = () => {
          this.worker.terminate();
          this.worker = null;
          const job = this.next || this.busy;
          this.busy = null;
          this.next = null;
          if (job) this.run(job);
        };
      } catch {
        this.worker = null;
      }
    }
    invalidate() {
      this.latest++;
      this.next = null;
    }
    request(options) {
      const job = { id: ++this.latest, options };
      if (this.busy) this.next = job;
      else this.run(job);
      return job.id;
    }
    run(job) {
      this.busy = job;
      if (this.worker) this.worker.postMessage(job);
      else
        setTimeout(() => {
          try {
            this.finish({ id: job.id, pair: solvePair(job.options) });
          } catch (e) {
            this.finish({ id: job.id, error: e.message });
          }
        }, 0);
    }
    finish(message) {
      this.busy = null;
      if (message.id === this.latest) {
        if (message.error) this.onError(message.error);
        else this.onResult(message.pair);
      }
      if (this.next) {
        const job = this.next;
        this.next = null;
        this.run(job);
      }
    }
  }
  root.SolverClient = SolverClient;
})(globalThis);
