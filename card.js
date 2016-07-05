
function lpad(str, size) {
  if (str.length < size) {
    str = str + ' '.repeat(size - str.length);
  }
  return str;
}

class Card {
  constructor(json) {
    this.name_ = json.name;
    this.expansion_ = json.expansion;
    this.cost_ = new Card.Cost(json.cost);
    /** @const {!Set<string>} */
    this.tags_ = new Set(json.tags);
    this.text_ = json.text;
  }

  has(tag) { return this.tags_.has(tag); }

  get name() { return this.name_; }
  get expansion() { return this.expansion_; }
  get cost() { return this.cost_; }
  get tags() { return /* immutable? */ this.tags_.values(); }
  get text() { return this.text_; }

  toString() {
    return `${lpad(this.name_, 25)} ${lpad(`(${this.cost_})`, 7)} ${
        this.expansion_}`;
  }
}
module.exports = Card;


Card.Cost = class {
  constructor(spec) {
    this.spec_ = spec;
    let match;
    this.coins_ = (match = /\$(\d+)/.exec(this.cost_)) ?
        parseInt(match[1], 10) : 0;
    this.potions_ = (match = /(\d*)P/.exec(this.cost_)) ?
        parseInt(match[1] || '1', 10) : 0;
    this.debts_ = (match = /~(\d+)/.exec(this.cost_)) ?
        parseInt(match[1], 10) : 0;
  }

  get coins() { return this.coins_; }
  get potions() { return this.potions_; }
  get debts() { return this.debts_; }
  get total() { return this.coins_ + this.potions_ + this.debts_; }

  toString() {
    return this.spec_;
  }

  // TODO(sdh): lessThan and greaterThan?  (note partial ordering)
}
