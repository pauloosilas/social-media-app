"use server"

import { createPostSchema } from "@/lib/validation";
import { validateRequest } from "../../../../auth"
import prisma from "@/lib/prisma";

export async function submitPost(input: string){
    const { user } = await validateRequest();
 
    if(!user) throw Error("Unauthorized")

    const {content} = createPostSchema.parse({ content: input})

    await prisma.post.create({
       data:{
        content,
        userId: user.id
       },
    });

    
}