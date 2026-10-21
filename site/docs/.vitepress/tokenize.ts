// 中文没有空格分词，用 Intl.Segmenter 切词，让本地搜索能搜中文。
// 建索引（Node）和搜索（浏览器）必须用同一个切词函数。
const seg = new Intl.Segmenter('zh', { granularity: 'word' })

export function tokenize(text: string) {
  const out: string[] = []
  for (const { segment, isWordLike } of seg.segment(text)) {
    if (isWordLike) out.push(segment)
  }
  return out
}
