
class Multiset {
  /** @param {!Iterable<T>=} elems */
  constructor(elems = []) {
    /** @private {number} */
    this.size_ = 0;
    /** @private @const {!Map<T, number>} */
    this.map_ = new Map();
    for (const elem of elems) {
      this.add(elem);
    }
  }

  * [Symbol.iterator]() {
    for (const [elem, count] of this.map_.entries()) {
      for (let i = 0; i < count; i++) {
        yield elem;
      }
    }
  }

  count(elem) {
    return this.map_.get(elem) || 0;
  }

  elements() {
    return this.map_.keys();
  }

  size() {
    return this.size_;
  }

  clear() {
    this.map_.clear();
  }

  add(elem, count = 1) {
    const oldCount = this.map_.get(elem) || 0;
    const newCount = Math.max(0, oldCount + Math.round(count));
    this.size_ += (newCount - oldCount);
    newCount ? this.map_.set(elem, newCount) : this.map_.delete(elem);
  }

  remove(elem, count = 1) {
    this.add(elem, -count);
  }
}
module.exports = Multiset;
