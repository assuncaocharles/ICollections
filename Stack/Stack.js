class Stack{

    constructor(){
        this.count = 0;
        this.storage = {};
    }

    push(val){
        this.storage[this.count] = val;
        this.count++;
    }

    pop(){
        if (this.count === 0) {
            return undefined;
        }
        this.count--;
        var result = this.storage[this.count];
        delete this.storage[this.count];
        return result;
    }

    get size(){
        return this.count;
    }

    get peek() {
        return this.storage[this.count - 1];
    }
}


module.exports = Stack;