import { Node, mergeAttributes } from '@tiptap/core';

export interface TelegramOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    telegram: {
      setTelegramEmbed: (options: { src: string }) => ReturnType;
    };
  }
}

export const Telegram = Node.create<TelegramOptions>({
  name: 'telegram',
  group: 'block',
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'telegram-iframe w-full max-w-2xl mx-auto rounded-xl my-8',
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      height: {
        default: 500,
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[data-telegram-iframe="true"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      frameborder: '0',
      scrolling: 'no',
      style: `border: none; overflow: hidden; width: 100%; height: ${HTMLAttributes.height}px;`,
      'data-telegram-iframe': 'true'
    })];
  },

  addCommands() {
    return {
      setTelegramEmbed:
        (options) =>
        ({ commands }) => {
          let src = options.src;
          // Convert https://t.me/durov/43 to https://t.me/durov/43?embed=1
          if (src.includes('t.me') && !src.includes('?embed=1')) {
            src = src.split('?')[0] + '?embed=1';
          }
          return commands.insertContent({
            type: this.name,
            attrs: { src },
          });
        },
    };
  },
});
