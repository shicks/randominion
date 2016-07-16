const EMPTY = new Set();

/** @template KEY, VALUE */
class Multimap {
  constructor() {
    /** @const @private {!Map<KEY, !Set<VALUE>>} */
    this.map_ = new Map();
  }

  /**
   * @param {KEY} key
   * @param {VALUE} value
   */
  put(key, value) {
    let set = this.map_.get(key);
    if (!set) this.map_.set(set = new Set());
    set.add(value);
  }

  /**
   * @param {KEY} key
   * @param {VALUE} value
   */
  remove(key, value) {
    const set = this.map_.get(key);
    if (set) {
      set.delete(value);
      if (!set.size) this.map_.delete(key);
    }
  }

  /**
   * @param {KEY} key
   */
  removeAll(key) {
    this.map_.delete(key);
  }

  /** Clears the multimap. */
  clear() {
    this.map_.clear();
  }

  /**
   * Returns a read-only wrapper around the set for the given key.
   * @param {KEY} key
   * @return {!Set<VALUE>}
   */
  get(key) {
    const unimplemented = {value() { throw new Error('unimplemented'); }};
    return Object.create(
        this.map_.get(key) || EMPTY, {
          set: unimplemented,
          delete: unimplemented,
          clear: unimplemented,
        });
  }
}

module.exports = Multimap;
