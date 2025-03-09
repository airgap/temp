<script lang="ts">
    const PieceComponent = (function() {
      return {
        render: (props: { x: number; y: number; p: 'X' | 'O'; i: number; key: number }) => {
          let grown = false;
          
          onMount(() => {
            requestAnimationFrame(() => grown = true);
          });
          
          return `
            <img
              key="${props.key}"
              style="
                position: absolute;
                width: 33.33%;
                height: 33.33%;
                transition: all .5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${Math.random() * 0.3}s;
                transform: scale(${grown ? 75 : 0}%);
                left: ${33.33 * props.x}%;
                top: ${33.33 * props.y}%;
                opacity: ${props.i < 9 ? 1 : 0};
                pointer-events: none;
              "
              src="${images[props.p]}"
              alt="${props.p}"
            />
          `;
        }
      };
    })();
  </script>
  