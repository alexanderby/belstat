if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function (callback, thisArg) {
            for (let i = 0; i < this.length; i++) {
                if (callback.call(thisArg, this[i], this)) {
                    return i;
                }
            }
            return -1;
        }
    });
}
