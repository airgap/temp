<script>
    import "./Tippy.sass";

    import { Color } from '@tiptap/extension-color'
    import ListItem from '@tiptap/extension-list-item'
    import TextStyle from '@tiptap/extension-text-style'
    import StarterKit from "@tiptap/starter-kit";
    import { Editor } from "@tiptap/core";
    import { onMount } from "svelte";

    let element = $state();
    let editor = $state();

	const {value, oninput} = $props();

    onMount(() => {
      editor = new Editor({
        element: element,
        extensions: [
          Color.configure({ types: [TextStyle.name, ListItem.name] }),
          TextStyle.configure({ types: [ListItem.name] }),
          StarterKit,
        ],
        content: value,
        onTransaction: () => {
          // force re-render so `editor.isActive` works as expected
          editor = editor;
        },
		  onUpdate: e => oninput(e.editor.getHTML())
      });
    });
  </script>
  <div bind:this={element}></div>
