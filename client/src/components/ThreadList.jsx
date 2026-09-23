import { useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getThreads } from "../services/threads.service";
import ThreadItem from "./ThreadItem.jsx";
import { useIntersection } from "../hooks/useIntersection";

export default function ThreadList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["threads"],
    queryFn: ({ pageParam }) => getThreads({ cursor: pageParam, take: 10 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const sentinelRef = useRef(null);

  const onIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useIntersection(sentinelRef, onIntersect);

  if (isPending) return <p className="muted">Loading threads…</p>;
  if (isError) return <p className="error">Could not load threads: {error.message}</p>;

  const threads = data.pages.flatMap((page) => page.threads);

  return (
    <div>
      <ul className="threads">
        {threads.map((thread) => (
          <ThreadItem key={thread.id} thread={thread} />
        ))}
      </ul>

      {hasNextPage && <div ref={sentinelRef} />}

      {isFetchingNextPage && (
        <p className="loading-more">Loading more…</p>
      )}
    </div>
  );
}
