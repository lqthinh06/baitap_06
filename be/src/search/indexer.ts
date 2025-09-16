// be/src/search/indexer.ts
import { es } from './es';

export const ES_INDEX = 'products';

export async function ensureIndex() {
  const exists = await es.indices.exists({ index: ES_INDEX });
  if (exists) return;

  // my_asciifolding: chuẩn hóa ký tự có dấu thành không dấu (ví dụ: “Cà phê” → “Ca phe”).
  // my_edge_ngram: tạo n-gram để hỗ trợ auto-complete (ví dụ: “samsung” → “sa”, “sam”, “sams”, …).
  // vi_edge: analyzer cho indexing → dùng n-gram để tìm nhanh khi gõ dở.
  // vi_search: analyzer cho truy vấn → không dùng n-gram, chỉ lọc lowercase + bỏ dấu, giúp tìm chính xác hơn.
  await es.indices.create({
    index: ES_INDEX,
    body: {
      settings: {
        analysis: {
          filter: {
            my_asciifolding: { type: 'asciifolding', preserve_original: true },
            my_edge_ngram:   { type: 'edge_ngram', min_gram: 2, max_gram: 20 }
          },
          analyzer: {
            vi_edge: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'my_asciifolding', 'my_edge_ngram']
            },
            vi_search: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'my_asciifolding']
            }
          }
        }
      },
      mappings: {
        properties: {
          id: { type: 'keyword' },
          name: {
            type: 'text',
            analyzer: 'vi_edge',
            search_analyzer: 'vi_search',
            fields: {
              raw: { type: 'keyword' }
            }
          },
          description: { type: 'text', analyzer: 'vi_search' },
          category:    { type: 'keyword' },
          price:       { type: 'double' },
          originalPrice:{ type: 'double' },
          rating:      { type: 'float' },
          sold:        { type: 'integer' },
          discount:    { type: 'integer' },
          views:       { type: 'integer' },
          image:       { type: 'keyword', index: false },
          createdAt:   { type: 'date' },
          updatedAt:   { type: 'date' }
        }
      }
    }
  });
}

export async function indexProduct(doc: any) {
  await es.index({
    index: ES_INDEX,
    id: doc.id,
    document: doc,
    refresh: 'wait_for'
  });
}

export async function removeProduct(id: string) {
  await es.delete({ index: ES_INDEX, id }).catch(() => {});
}
