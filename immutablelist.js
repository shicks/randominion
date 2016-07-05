
/** @template T */
class ImmutableList {
  /** @param {!Iterable<T>=} elems */
  constructor(elems = []) {
    /** @private @const */
    this.elems_ = [...elems];
  }

  get(index) {
    return this.elems_[index];
  }

  size() {
    return this.elems_.length;
  }

  [Symbol.iterator]() {
    return this.elems_[Symbol.iterator]();
  }

  map(func) {
    return this.elems_.map(func);
  }
}

module.exports = ImmutableList;
