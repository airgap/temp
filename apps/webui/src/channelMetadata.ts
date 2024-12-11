import autist from './autist.png';
import dog from './dog.jpg';
import engage from './engage.gif';
import khan from './khan.gif';
import bees from './oprahbees.gif';
import phantom from './zod-phantom.gif';

export type ChannelMetadata = {
  channel: number;
  image: string;
  stream?: string;
  visible?: boolean;
};
export const channelMetadata: ChannelMetadata[] = [
  {
    channel: 1,
    image: autist,
  },
  {
    channel: 2,
    image: dog,
    stream: '35b2f962a4df48b0eb3a2fb847159cf6',
    visible: true,
  },
  {
    channel: 3,
    image: phantom,
    visible: true,
  },
  {
    channel: 4,
    image: bees,
    visible: true,
  },
  {
    channel: 5,
    image: khan,
    stream: 'e93bc0d477d0bc9ca8befc971e831a4a',
    visible: true,
  },
  {
    channel: 6,
    image: engage,
  },
];
export const visibleChannels = channelMetadata.filter(({ visible }) => visible);
