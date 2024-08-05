"use client";

import { useAuthenticate, useSignerStatus } from "@alchemy/aa-alchemy/react";
import { FormEvent, useCallback, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import Image from 'next/image'

export const PasskeyCard = () => {
  const [email, setEmail] = useState<string>("");
  const onEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    [],
  );
  // [!region authenticating]
  const { authenticate } = useAuthenticate();
  const login =() => {
    authenticate({type: "passkey",
      createNew: false});
  };


  const signup =() => {
    authenticate({type: "passkey",
      createNew: true,
      username: `${email}`});
  };

  const { status } = useSignerStatus();
  const isAwaitingEmail = status === "AWAITING_EMAIL_AUTH";
  // [!endregion authenticating]

  return (
    <Card>
      {isAwaitingEmail ? (
        <div className="text-[18px] font-semibold">Check your email!</div>
      ) : (
        <form className="flex flex-col gap-8" >
          <div className="text-[18px] font-semibold overflow-hidden rounded-full border-4 border-gray-300">
          <Image 
      src="/images/hotspots.jpg" 
      alt="hotspots" 
      width={300} 
      height={100}


    /> 
             </div>
           <span className="text-2xl text-center">Hotspots</span>  
  
          <div className="flex flex-col justify-between gap-6">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={onEmailChange}
            />
            <Button type="button" onClick={login}>Log in</Button>
            <Button type="button" onClick={signup}>Sign Up</Button>

          </div>
        </form>
      )}
    </Card>
  );
};
