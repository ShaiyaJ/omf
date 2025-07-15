<div align="center">
    <h1>🌐 One More Framework 🌐</h1>
    <p>--A ~100 line JavaScript frontend framework inspired by the likes of Raylib--</p>
</div>

## About
One More Framework (or OMF) is a super-lightweight frontend framework that fits in under 100 lines of JavaScript. It has no dependencies on any other JavaScript library.

It was inspired by how components are organised in [Svelte](https://svelte.dev/) and how simple libraries like [Raylib](https://www.raylib.com/) and [Macroquad](https://macroquad.rs/) are for game development.

Most frontend frameworks have a dependency on NPM and, especially for smaller apps, include a *lot* of bloat. OMF aims to be a framework where the source code is so small you can just copy and paste it into a `<script>` tag. 

### What do you get?
Components, with local state, a `.rerender` function and lifecycle hooks `.onRerender` and `.onDestory` (and, in a way, "onCreate").

That's what you get. 

OMF is built for smaller websites and apps. It's not *impossible* to make larger apps with it, but you'll be expected to provide functionality for things yourself (in a similar philosophy to Raylib and Macroquad). Most noteably **sharing/syncing state between components**. This is what makes OMF so light.

However, there is a silver lining. This means you can choose an approach that works best for your project - rather than relying on what the authors of a framework *think* suits your project best. 

## Use
To use OMF, include the source in a `<script>` tag in the `head` of your document. You can do this either by using the Github repo as a `src=` or by copy and pasting the source code directly into it.

Register components with `component(name, path)`.

Then use your components by doing `<name></name>`.

To write a component, open a new file and write HTML as you normally would (just without any boilerplate) - then inside a `script` tag you can assign functions to the lifecycle hooks and write code to run on component creation.

**To learn how to use OMF properly, refer to the examples (at `/examples`) or the docs (at `/docs` or on the [Github Page site](https://ShaiyaJ.github.io/omf/))**, experienced developers can probably get away with just using `/examples` as a reference guide. 

## Licence
This project is under the MIT Licence. This means you can copy, modify, redistribute, etc. - without any need for credit.

Credit is appreciated, but obviously not required. 

See `/LICENSE` for details.
