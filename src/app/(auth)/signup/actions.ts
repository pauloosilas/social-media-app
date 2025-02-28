"use server"

import prisma from "@/lib/prisma";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import {hash} from "@node-rs/argon2"
import { generateIdFromEntropySize } from "lucia";
import { lucia } from "../../../../auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";

export async function signUp(
    credentials: SignUpValues
): Promise<{error: string}>{
    try {
        const { username, email, password } = signUpSchema.parse(credentials);

        const passwordHash = await hash(password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });

        const userId = generateIdFromEntropySize(10) 

        const existingUsername = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive"
                }
            }
        });

        if(existingUsername){
            return{
                error: "Username already taken"
            }
        };

       const existingEmail = await prisma.user.findFirst({
        where: {
            username: {
                equals: email,
                mode: "insensitive"
            }
        }
    });

    if(existingEmail){
        return{
            error: "Email already taken"
        }
    }

    await prisma.user.create({
        data:{
            id: userId,
            username,
            displayName: username,
            email,
            passwordHash
        }
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );

    return redirect("/")

    } catch (error) {
        console.log(error);
        if(isRedirectError(error)) throw error;
        return{
            error: "Something went wrong. Pease try again."
        }
    }
}