const joke = ['为什么', '程序员', '总把', '万圣节', '和圣诞节', '搞混？', '因为 Oct 31 == Dec 25！'];
const tok = (n) => joke.slice(0, n).join(' ');
const frames = [];
for (let i = 1; i <= 7; i++) {
  frames.push({
    hl: i === 7 ? ['inv', 'val', 'msg'] : ['msg'],
    dim: false,
    panels: {
      inv: i < 7 ? '~ ⏳ 阻塞等待中……（用户什么也看不到）' : '+ ✅ 一次性拿到完整结果：' + tok(7),
      val: i < 7 ? '① {messages: [Human("讲个笑话")]}\n~ ⏳ 模型生成中……' : '① {messages: [Human("讲个笑话")]}\n+ ② {messages: [Human(…), AI("' + tok(7) + '")]}',
      msg: '> ' + tok(i) + (i < 7 ? ' ▌' : ''),
    },
    caption: i < 7 ? `时间 t=${i}：messages 模式已经在逐 token 输出，invoke 还在等` : '结束：三种方式最终内容一样，差别只在"什么时候、以什么粒度"拿到',
    dur: i === 7 ? 3500 : 900,
  });
}
module.exports = {
  title: '流式输出对比：invoke vs stream(values) vs stream(messages)', width: 1100, height: 400,
  panels: [
    { id: 'inv', x: 20, y: 0, w: 1060, h: 110, title: 'agent.invoke(...)　—— 不流式：等全部跑完才返回', mono: true },
    { id: 'val', x: 20, y: 130, w: 1060, h: 120, title: 'agent.stream(..., stream_mode="values")　—— 每个节点跑完，推送一次完整状态', mono: true },
    { id: 'msg', x: 20, y: 270, w: 1060, h: 120, title: 'agent.stream(..., stream_mode="messages")　—— 模型每吐一个 token 就推送（延迟最低）', mono: true },
  ],
  frames,
};
