const STATIC_SEPARATE_CONTENT = `
<div>
    <p>{state.x}<\/p>
    <button class="stateu">+</button>
<\/div>

<script>
    Object.assign(state, {x: 0}); 

    instance.onRerender = () => {
        const x = instance.querySelector(".stateu"); 
        x.addEventListener("click", () => { 
            state.x++;  
            instance.rerender(); 
        });
    }
<\/script>`;

component("omf-two", null, {fallback: STATIC_SEPARATE_CONTENT});
