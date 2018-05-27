export class Queue{
    constructor(){
        this.collection = [];
    }

    print() {
        console.log(collection);
    }

    enqueue(element) {
        this.collection.push(element);
    }

    dequeue(){
        return this.collection.shift();
    }

    get front(){
        return this.collection[0];
    }

    get size(){
        return this.collection.length;
    }

    get isEmpty(){
        return (this.collection.length === 0);
    }
}

