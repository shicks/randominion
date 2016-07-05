const ImmutableList = require('./immutablelist');

/** @template T */
class Rule {
  constructor(weight = 1) {
    this.weight_ = weight;
  }

  /**
   * @param {!ImmutableList<T>} cards
   * @param {!ImmutableList<T>} selection
   * @return {function(T): number}
   */
  apply(cards, selection) {
    throw new Error('Abstract Rule::apply not overridden in ' + this);
  }

  /**
   * @param {!ImmutableList<T>} cards
   * @param {!ImmutableList<T>} selection
   * @return {!ImmutableList<T>}
   */
  validate(cards, selection) {
    return selection; // must be reference-same as selection if valid...
  }

  get weight() {
    return this.weight_;
  }
}
module.exports = Rule;


// TODO - all this rule factory stuff is mainly for UI.

Rule.Arg = class {
  /** @param {string} name
      @param {string} description
      @param {string} type */
  constructor(name, description, type) {
    /** @private @const */
    this.name_ = name;
    /** @private @const */
    this.description_ = description;
    /** @private @const */
    this.type_ = type;
  }

  get name() { return this.name_; }
  get description() { return this.description_; }

  /** @param {*} arg
      @return {boolean} */
  checkType(arg) {
    // Note: could override this.
    return typeof arg == this.type_;
  }
};


Rule.Arg.String = class extends Rule.Arg {
  constructor(/** string */ name, /** string */ description) {
    super(name, description, 'string');
  }
};


Rule.Arg.Numeric = class extends Rule.Arg {
  constructor(
      /** string */ name, /** string */ description,
      /** number */ min, /** number */ max) {
    super(name, description, 'number');
    /** @private @const */
    this.min_ = min;
    /** @private @const */
    this.max_ = max;

    // integer or decimal?!?
  }

  get min() { return this.min_; }
  get max() { return this.max_; }
};


Rule.Factory = class {
  /** @param {function(new: Rule, ...?)} ctor
      @param {string} name
      @param {string} description
      @param {!Array<!Rule.Arg>} args */
  constructor(ctor, name, description, args) {
    /** @private @const */
    this.ctor_ = ctor;
    /** @private @const */
    this.name_ = name;
    /** @private @const */
    this.description_ = description;
    /** @private @const */
    this.args_ = args;
    // TODO - repeatable?!?
  }
  get name() { return this.name_; }
  get description() { return this.description_; }
  get args() { return this.args_; }

  create(params) {
    // Note: Seq.zip(params, this.args_)
    if (params.length != this.args_.length) {
      throw new Error('Bad number of args for ' + this.name_);
    }
    for (let i = 0; i < params.length; i++) {
      if (!this.args_[i].checkType(params[i])) {
        throw new Error(
            `Bad argument type for ${this.name_}.${this.args_[i].name}`);
      }
      return Reflect.construct(this.ctor_, params);
    }
  }
};
