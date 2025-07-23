const e = document.createElement("textarea");

function component(name, path, {extendTagName = null, sharedState = {}, fallback = ""} = {} ) {
    // Get tag type from extendTagName
    let extendTagClass = extendTagName ? document.createElement(extendTagName).constructor : HTMLElement;

    // Create dynamic object
    const dynamicExtend = class DYNAMICEX extends extendTagClass {
        static fetchRan = false;    // Updates to true when fetch runs (not necessarily successfully)
        static raw;
        static instances = [];
        static sharedState = structuredClone(sharedState);

        constructor() {
            super();
            this.raw;

            this.state = {};
            this.onRerender = () => {};
            this.onDestroy = () => {};
            this.templateEval = (t) => new Function("instance", "state", "sharedState", "rerenderAll", `return \`${t}\`;`)(this, this.state, dynamicExtend.sharedState, dynamicExtend.rerenderAll);
            dynamicExtend.instances.push(this);
        }
        
        static rerenderAll() {
            dynamicExtend.instances.forEach(i => i.rerender());
        }

        rerender() {
            // Clear old content
            this.textContent = "";


            // Parse raw contents into a DOM 
            const DOM = new DOMParser().parseFromString(this.raw, "text/html");


            // Preprocess HTML string contents (so that ${expressions} are evaluated and displayed properly) and append to dom 
            e.innerHTML = DOM.body.innerHTML;                   // Decoding HTML entities so that javascript can execute correctly
            
            try {
                DOM.body.innerHTML = this.templateEval(e.value);
            } catch (err) {
                throw new Error(`${e.value}\n${err}`);
            }
            
            (DOM.body.childNodes).forEach(n => this.appendChild(n.cloneNode(true)));


            // Run rerender
            this.onRerender.call(this);
        }
        
        
        connectedCallback() {
            const DOM = new DOMParser().parseFromString(dynamicExtend.raw, "text/html");
            
            // Extract and run scripts and styles
            const scripts = DOM.querySelectorAll("script");
            const styles = DOM.querySelectorAll("style");

            scripts.forEach(script => new Function("instance", "state", "sharedState", "rerenderAll", script.textContent)(this, this.state, dynamicExtend.sharedState, dynamicExtend.rerenderAll));        // TODO: error handling?
            styles.forEach(style => document.body.appendChild(style.cloneNode(true)));

            scripts.forEach(s => s.remove());
            styles.forEach(s => s.remove());
                
            this.raw = DOM.body.innerHTML;      // Recache 
                
            this.rerender();
        }


        disconnectedCallback() {
            this.onDestroy.call(this);
        }
    }


    // Define element helper function
    const define = (raw) => {
        // Filter out comments
        const DOM = new DOMParser().parseFromString(raw, "text/html"); 
        
        const walker = document.createTreeWalker(DOM.body, NodeFilter.SHOW_COMMENT); 
        let node;
        let commentNodes = [];
                
        while (node = walker.nextNode()) {
            commentNodes.push(node);
        }
            
        commentNodes.forEach(n => n.remove());
        
        // Potential optimisation by doing something like (this may cause issues with treewalker losing it's cursor)
        /*
        let node = walker.nextNode();
        do {
            node.remove();
            node = walker.currentNode;
        } while (walker.nextNode());
        */
        
        // Setting element text and registering
        dynamicExtend.raw = DOM.body.innerHTML;
        dynamicExtend.fetchRan = true;
        
        if (extendTagName === null) {
            customElements.define(name, dynamicExtend);
        } else { 
            customElements.define(name, dynamicExtend, { extends: extendTagName });
        }
    };


    // Creating the customElement 
    if (path) {
        fetch(path)
            .then(res => res.ok ? res.text() : Promise.reject(new Error(`Status from component ${name} at location ${path} threw ${res.status}`)))
            .then(raw => define(raw))           // Retroactively add content to DYNEX 
            .catch(_ => define(fallback))       // Fallback content used if fetch fails
    } else { 
        define(fallback);                       // Fallback content used if path isn't provided
    }


    // Async fetch breaks component display - manually upgrade to return display to normal
    return customElements.whenDefined(name).then(() => {
        document.querySelectorAll(`${name}, ${extendTagName}[is="${name}"]`).forEach(e => customElements.upgrade(e));
    });
}
