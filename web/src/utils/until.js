class until {
  static elapsed(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  static nextIdle(ms) {
    if (!self.requestIdleCallback) return Promise.resolve();
    if (this.idleDeadline && this.idleDeadline.timeRemaining() > ms)
      return Promise.resolve();
    if (this.idleDeadline && this.idleDeadline.didTimeout)
      return Promise.resolve();
    return new Promise((resolve) =>
      requestIdleCallback(
        (deadline) => {
          this.idleDeadline = deadline;
          resolve();
        },
        { timeout: 160 }
      )
    );
  }
  static defineProperty(object, name, initialValue) {
    let value = initialValue;
    object.changed = object.changed || {};
    this.defineEvent(object.changed, name);
    Object.defineProperty(object, name, {
      get: () => value,
      set: (newValue) => {
        let oldValue = value;
        value = newValue;
        if (newValue !== oldValue) {
          object.changed[name].fire({
            name: name,
            value: newValue,
            old: oldValue,
          });
        }
        return value;
      },
    });
  }
  static defineEvent(object, name) {
    let promise = null;
    Object.defineProperty(object, name, {
      get: () => {
        if (!promise) {
          let resolver = null;
          promise = new Promise((r) => {
            resolver = (value) => {
              promise = null;
              r(value);
            };
          });
          promise.resolver = resolver;
          promise.fire = (value) => {
            object[name].resolver(value);
          };
          promise.listen = (fn) => {
            let cancel = null;
            let canceled = false;
            const cancelPromise = new Promise(
              (r) =>
                (cancel = () => {
                  canceled = true;
                  r();
                })
            );
            (async () => {
              while (true) {
                let value = await Promise.race([object[name], cancelPromise]);
                if (canceled) return;
                fn(value);
              }
            })();
            return cancel;
          };
        }
        return promise;
      },
    });
  }
}

Object.defineProperty(until, "nextFrame", {
  get: () => new Promise((r) => requestAnimationFrame(r)),
});
until.eventProxies = new WeakMap();
until = new Proxy(until, {
  apply: (object, thisArg, args) => {
    const eventSource = args[0];
    if (!eventSource) throw "must pass an argument to until()";
    const options = args[1] || {};
    options.once = true;
    let proxy = object.eventProxies.get(eventSource);
    if (!proxy) {
      proxy = new Proxy(
        {},
        {
          get: (object, eventName) => {
            let promise = object[eventName];
            if (!promise) {
              promise = object[eventName] = new Promise((r) => {
                eventSource.addEventListener(
                  eventName,
                  (value) => {
                    object[eventName] = null;
                    r(value);
                  },
                  options
                );
              });
              promise.listen = (fn) => {
                let cancel = null;
                let canceled = false;
                const cancelPromise = new Promise(
                  (r) =>
                    (cancel = () => {
                      canceled = true;
                      r();
                    })
                );
                (async () => {
                  while (true) {
                    let value = await Promise.race([
                      proxy[eventName],
                      cancelPromise,
                    ]);
                    if (canceled) return;
                    fn(value);
                  }
                })();
                return cancel;
              };
            }
            return promise;
          },
        }
      );
      object.eventProxies.set(eventSource, proxy);
    }
    return proxy;
  },
});
