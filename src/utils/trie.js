var _ = require("lodash");

class Trie {
  constructor() {
    this.id = null;
    this.children = {};
  }

  insert(key, id) {
    // base case: If we're at the end of key, store the id in this node
    if (key === "") {
      this.id = id;
    }
    // if we're not at the end of key
    else {
      const char = key.slice(0, 1).toLowerCase();
      // if the current node doesn't have a child for the key's first character
      if (this.children[char] === undefined) {
        // then create a blank node
        this.children[char] = new Trie();
      }
      // continue recursively traversing/inserting nodes
      this.children[char].insert(key.slice(1), id);
    }
  }

  // takes key and returns the node after traversing trie with key.
  // periods are ignored
  nodeAt(key) {
    if (key) {
      const char = key.slice(0, 1).toLowerCase();
      return this.nextNode(char) ? this.nextNode(char).nodeAt(key.slice(1).toLowerCase()) : undefined;
    } else {
      return this;
    }
  }

  nextNode(char) {
    if (char === ".") {
      return this;
    } else {
      return this.children[char];
    }
  }

  isCountryNode() {
    return this.id !== null
  }

  // BFS print function
  // ==== represents a node with no children
  print(detailed = false) {
    let queue = [{ ...this, value: "" }];
    let res = "";
    while (queue.length) {
      const curr = queue.shift();
      if (detailed || curr.id) {
        // might need to be curr.id !== null
        res += `${curr.value}: ${curr.id}\n`;
      }
      _.forIn(curr.children, (node, char) => {
        queue.push({ ...node, value: curr.value + char });
      });
    }
    console.log(res);
  }
}

// console.log(JSON.stringify(countries));

// module.exports = Trie;
export default Trie;
