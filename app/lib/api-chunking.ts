/**
 * Helper functions for chunking large API requests to prevent timeouts
 */

export interface ChunkedRequestOptions {
  /** Maximum number of dates per chunk */
  maxDatesPerChunk?: number;
  /** Maximum number of stockIds per chunk */
  maxStocksPerChunk?: number;
  /** Delay between chunks (ms) */
  delayBetweenChunks?: number;
  /** Maximum retry attempts per chunk */
  maxRetries?: number;
  /** Retry delay multiplier (exponential backoff) */
  retryDelayMs?: number;
  /** Callback to report progress */
  onProgress?: (current: number, total: number) => void;
}

const DEFAULT_OPTIONS: Required<ChunkedRequestOptions> = {
  maxDatesPerChunk: 7, // 7 days per chunk (1 week)
  maxStocksPerChunk: 5, // 5 branches per chunk
  delayBetweenChunks: 200, // 200ms delay between chunks
  maxRetries: 3,
  retryDelayMs: 1000,
  onProgress: () => {},
};

/**
 * Chunk an array into smaller arrays
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delayMs: number,
  attempt = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= maxRetries) {
      throw error;
    }
    const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
    console.log(`⚠️ Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`);
    await sleep(delay);
    return retryWithBackoff(fn, maxRetries, delayMs, attempt + 1);
  }
}

/**
 * Fetch data in chunks to prevent timeout
 * 
 * @param fetchFn Function that takes (stockIds, dates) and returns Promise<Response>
 * @param stockIds Array of stock IDs to fetch
 * @param dates Array of date strings (ISO format: YYYY-MM-DD)
 * @param options Chunking options
 */
export async function fetchChunked<T>(
  fetchFn: (stockIds: string[], dates: string[]) => Promise<T>,
  stockIds: string[],
  dates: string[],
  options: ChunkedRequestOptions = {}
): Promise<T[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { maxDatesPerChunk, maxStocksPerChunk, delayBetweenChunks, maxRetries, retryDelayMs, onProgress } = opts;

  // If request is small enough, fetch directly without chunking
  const totalRequests = Math.ceil(dates.length / maxDatesPerChunk) * Math.ceil(stockIds.length / maxStocksPerChunk);
  if (totalRequests === 1 && dates.length <= maxDatesPerChunk && stockIds.length <= maxStocksPerChunk) {
    console.log(`📦 Single request (${dates.length} dates, ${stockIds.length} stocks) - no chunking needed`);
    try {
      const result = await retryWithBackoff(
        () => fetchFn(stockIds, dates),
        maxRetries,
        retryDelayMs
      );
      onProgress(1, 1);
      return [result];
    } catch (error) {
      console.error('❌ Single request failed:', error);
      throw error;
    }
  }

  // Chunk dates and stockIds
  const dateChunks = chunkArray(dates, maxDatesPerChunk);
  const stockChunks = chunkArray(stockIds, maxStocksPerChunk);

  console.log(`📦 Chunking request: ${dates.length} dates → ${dateChunks.length} chunks, ${stockIds.length} stocks → ${stockChunks.length} chunks`);
  console.log(`📦 Total chunks: ${dateChunks.length * stockChunks.length}`);

  const results: T[] = [];
  let currentChunk = 0;
  const totalChunks = dateChunks.length * stockChunks.length;

  // Fetch each combination of date chunk and stock chunk
  for (const dateChunk of dateChunks) {
    for (const stockChunk of stockChunks) {
      currentChunk++;
      onProgress(currentChunk, totalChunks);

      try {
        const result = await retryWithBackoff(
          () => fetchFn(stockChunk, dateChunk),
          maxRetries,
          retryDelayMs
        );
        results.push(result);

        // Small delay between chunks to avoid overwhelming the server
        if (currentChunk < totalChunks) {
          await sleep(delayBetweenChunks);
        }
      } catch (error) {
        console.error(`❌ Chunk ${currentChunk}/${totalChunks} failed:`, error);
        // Continue with other chunks even if one fails
        // You might want to throw here depending on your requirements
        throw error;
      }
    }
  }

  return results;
}

/**
 * Aggregate multiple API responses into a single result
 * Assumes response is an array of { stockId: string; days: Array<{ date: string; ... }> }
 */
export function aggregateStockResponses<T extends { stockId: string; days: Array<{ date: string }> }>(
  responses: T[]
): T[] {
  if (responses.length === 0) return [];
  if (responses.length === 1) return responses;

  // Group by stockId and merge days
  const stockMap = new Map<string, T>();

  responses.forEach((response) => {
    const existing = stockMap.get(response.stockId);
    if (existing) {
      // Merge days, avoiding duplicates
      const dateMap = new Map<string, typeof response.days[0]>();
      existing.days.forEach((day) => dateMap.set(day.date, day));
      response.days.forEach((day) => dateMap.set(day.date, day));
      existing.days = Array.from(dateMap.values());
    } else {
      stockMap.set(response.stockId, { ...response });
    }
  });

  return Array.from(stockMap.values());
}

