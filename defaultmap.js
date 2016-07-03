/** @template KEY, VALUE */
class DefaultMap extends Map {
  /** @param {function(KEY): VALUE} func */
  constructor(func) {
    super();
    /** @const @private */
    this.func_ = func;
  }

  get(key) {
    if (!this.has(key)) {
      this.set(key, this.func_(key));
    }
    return super.get(key);
  }
}

module.exports = DefaultMap;
