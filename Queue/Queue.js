class Queue{
    constructor(){
        this.collection = [];
    }

    print() {
        console.log(collection);
    }

    enqueue(element) {
        collection.push(element);
    }

    dequeue(){
        return collection.shift();
    }

    front() {
        return collection[0];
    }

    size(){
        return collection.length;
    }

    isEmpty() {
        return (collection.length === 0);
    }
}

var q = new Queue();
q.enqueue('a');
q.enqueue('b');
q.enqueue('c');
q.print();
q.dequeue();
console.log(q.front());
q.print();


class PriorityQueue{
    constructor(){
        this.collection = [];
    }

    printCollection(){
        console.log(this.collection);
    }

    enqueue( element ){
        if (this.isEmpty()) {
            this.collection.push(element);
        } else {
            let added = false;
            for (let i = 0; i < this.collection.length; i++) {
                if (element[1] < this.collection[i][1]) { //checking priorities
                    this.collection.splice(i, 0, element);
                    added = true;
                    break;
                }
            }
            if (!added) {
                this.collection.push(element);
            }
        }
    }

    dequeue() {
        const value = this.collection.shift();
        return value[0];
    }

    front() {
        return this.collection[0];
    }

    size() {
        return this.collection.length;
    }

    isEmpty() {
        return (this.collection.length === 0);
    }
}

var pq = new PriorityQueue();
pq.enqueue(['Beau Carnes', 2]);
pq.enqueue(['Quincy Larson', 3]);
pq.enqueue(['Ewa Mitulska-Wójcik', 1])
pq.enqueue(['Briana Swift', 2])
pq.printCollection();
pq.dequeue();
console.log(pq.front());
pq.printCollection();
