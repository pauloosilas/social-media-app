"use client"

import Post from "@/components/posts/Posts";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { PostData, PostsPage } from "@/lib/types"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react";

export default function ForYouFeed(){
  const { data, fetchNextPage, hasNextPage,isFetching, isFetchingNextPage, status} = useInfiniteQuery({
    queryKey:["post-feed", "for-you"],
    queryFn: ({pageParam}) => kyInstance.get(
      "/api/posts/for-you", 
      pageParam ? { searchParams: {cursor: pageParam}} : {}
    ).json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  const posts = data?.pages.flatMap(page => page.posts) || [];
  
  if(status === "pending"){
    return <Loader2 className="mx-auto animate-spin" />
  }

  if(status === "error"){
    return <p className="text-center text-destructive">
        An error occurred white loading posts
    </p>
  }

  return(
    <div className="space-y-5">
       { posts.map(post => (
         <Post key={post.id} post={post} />
       ))} 
       <Button onClick={() => fetchNextPage()}>Load more</Button>
    </div>
  )
}