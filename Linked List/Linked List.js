class Node{
    constructor(data){
        this.data = data;
        this.next = null;
    }
}

class LinkedList{

    constructor(){
        this._head = null;
        this.length = 0;
    }

    get size(){
        return this.length;
    }

    get head(){
        return this._head;
    }

    add(data){
        let node = new Node(data)
        if(this._head == null){
            this._head = node;
        }else{
            let temp = this._head;

            while(temp.next){
                temp = temp.next;
            }

            temp.next = node;
        }
        this.length++;
    }

    remove(nodeData){
        if(!this._head){
            throw new Error("Empty list");
        }
        else{
            let temp = this._head;
            let prev;
            if(temp.data == nodeData){
                this._head = this._head.next;
            }else{
                while(temp.data != nodeData && temp.next != null){
                    prev = temp;
                    temp = temp.next;
                }
                prev.next = temp.next;
            }
            this.length--;
        }
    }

    addAt(index, data){    
        
        if(index>this.length || index<0){
            throw new Error("Index not fit in aactual list range");
            return;
        }
        var node = new Node(data);
        if(index == 0){
            node.next = this._head;
            this._head = node;
        }else{
            let count = 0;
            let curr = this._head;
            let prev;
            while(count < index){
                prev = curr;
                curr = curr.next;
                count++;                
            }
            node.next = curr;
            prev.next = node;
        }
        this.length++;
    }

    removeAt(index){
        if(index>=this.length || index<0){
            throw new Error("Index not fit in aactual list range");
            return;
        }
        if(index==0){
            this._head = this._head.next;
        }else{
            let curr = this._head;
            let prev;
            let count = 0;
            while(count<index){
                prev = curr;
                curr = curr.next;
                count++;
            }
            prev.next = curr.next;
        }
        this.length--;
    }

    indexOf(nodeData){
        let curr = this._head;
        let index = 0;
        while(curr.data != nodeData){
            if(curr.next){
                curr = curr.next
                index++;
            }
            else{
                return -1;
            }
        }
        return index;
    }

    dataAt(index){
        if(index<0 || index>=this.length){
            return -1;
        }
        let count = 0;
        let temp = this._head;
        while(count < index){
            temp = temp.next;
            count++;
        }
        return temp.data;
    }
}

module.exports = LinkedList;

// var linked = new LinkedList();

// linked.add(10);
// linked.add(5);
// linked.add(3);

// linked.removeAt(2);

// console.log(linked.dataAt(3));

// console.log(linked);

// linked.addAt(2,2);

// console.log(linked);


// console.log(linked);

// console.log(linked.indexOf(15));
