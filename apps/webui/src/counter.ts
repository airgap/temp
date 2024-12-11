import gsap from 'gsap';

export const registerCounter = () =>
  gsap.registerEffect({
    name: 'counter',
    extendTimeline: true,
    defaults: {
      end: 0,
      duration: 0.5,
      ease: 'power1',
      increment: 1,
    },
    effect: (targets: HTMLElement[], config: GSAPTweenVars) => {
      const tl = gsap.timeline();
      const num = targets[0].innerText.replace(/,/g, '');
      targets[0].innerText = num;

      tl.to(
        targets,
        {
          duration: config.duration,
          innerText: config.end,
          //snap:{innerText:config.increment},
          modifiers: {
            innerText: function (innerText: string) {
              return gsap.utils
                .snap(config.increment, Number(innerText))
                .toLocaleString('en-us');
            },
          },
          ease: config.ease,
        },
        0,
      );

      return tl;
    },
  });
