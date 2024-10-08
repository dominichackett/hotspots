"use client";
import {EvmPriceServiceConnection} from '@pythnetwork/pyth-evm-js'
import { useAuthenticate, useSignerStatus } from "@alchemy/aa-alchemy/react";
import { FormEvent, useCallback, useState,useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import Image from 'next/image'
import { getPortalById ,getTokens,getEasVerified} from "@/goldsky/goldsky";
import {PriceServiceConnection} from '@pythnetwork/price-service-client'
import Notification from '@/components/Notification/Notification'
import { encodeFunctionData } from "viem";
import { contractABI,contractAddress,tokenABI } from '../../contracts'
import { formatUnits } from "viem";
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit'

import {
  useAccount,
  useLogout,
  useSendUserOperation,
  useSmartAccountClient,
  useUser,
} from "@alchemy/aa-alchemy/react";
import {
  chain,
  accountType,
  gasManagerConfig,
  accountClientOptions as opts,
} from "@/config";
import { parseUnits } from "viem";
import { CheckBadgeIcon } from '@heroicons/react/24/solid'

export const Portal = (props:any) => {
  
  const [portalId,setPortalId] = useState("1")
  const [wcVerified,setwcVerified] = useState(false)
  const [easVerified,setEASVerified] = useState(false)
  const [portal,setPortal] = useState() 
  const [action,setAction] = useState()
  const [tokens,setTokens] = useState([])
  const user = useUser();
  const { address } = useAccount({ type: accountType });
  const [refreshData,setRefreshData] = useState(new Date().getTime())
  const { logout } = useLogout();
  useEffect(()=>{
    async function _getTokens(){
      const results = await getTokens()
      console.log(results)
      setTokens(results.data.approvedTokens
      )
    }
        _getTokens()
        console.log(props)
        setPortalId(props.portalId)
   },[])
  const { isInitializing, isAuthenticating, isConnected, status } =
    useSignerStatus();
  const isLoading =
    isInitializing || (isAuthenticating && status !== "AWAITING_EMAIL_AUTH");
   // [!region sending-user-op]
  // use config values to initialize our smart account client
  const { client } = useSmartAccountClient({
    type: accountType,
    gasManagerConfig,
    opts,
  });

  // provide the useSendUserOperation with a client to send a UO
  // this hook provides us with a status, error, and a result
  const {
    sendUserOperation,
    sendUserOperationResult,
    isSendingUserOperation,
    error: isSendUserOperationError,
  } = useSendUserOperation({ client, waitForTxn: true ,
    onSuccess: ({ hash, request }) => {
      // [optional] Do something with the hash and request
      createSuccess(hash,request);
    },
    onError: (error) => {
      createError(error);
      // [optional] Do something with the error
    },});

  // NOTIFICATIONS functions
  const [notificationTitle, setNotificationTitle] = useState();
  const [notificationDescription, setNotificationDescription] = useState();
  const [dialogType, setDialogType] = useState(1);
  const [show, setShow] = useState(false);
  const close = async () => {
setShow(false);
};

const { authenticate } = useAuthenticate();
  const login =() => {
    authenticate({type: "passkey",
      createNew: false});
  };


  const signup =() => {
    authenticate({type: "passkey",
      createNew: true,
      username: "Hotspots Passkey"});
  };

const createError= (error:any)=>{
    let actionTitle
    if(action == 1)
        actionTitle ="Donation Error"
    if(action == 2)
        actionTitle ="Token Approval Error"
    if(action == 3)
        actionTitle ="Subscribe Error"
  
 

  setDialogType(2) //Error
  setNotificationTitle(actionTitle);
  setNotificationDescription(error?.error?.data?.message ? error?.error?.data?.message: error.message )
  setShow(true)

}

const createSuccess = (hash:any,request:any)=>{
  
    let actionTitle
    let description
    if(action == 1)
        {
            actionTitle ="Donation"
            description = "Donation successfully made"   
        }
    if(action == 2)
        {
            actionTitle ="Token Approval"
            description = "Token spend approved"   
        }   
    if(action == 3)
       { actionTitle ="Subscribe"
       
        description = "Subscription successfully made"   
    }  
  setDialogType(1) //Success
  setNotificationTitle(actionTitle);
  setNotificationDescription(description)
  setShow(true)
  console.log(hash)
  console.log(request)
  setRefreshData(new Date().getTime())

}





  useEffect(()=>{
    async function getPortal(){
       const results = await getPortalById(portalId) 
       console.log(results)
       if(results.data.newPortals.length >=1)
        {
          setPortal(results.data.newPortals[0])
          if(results.data.newPortals[0].wcRequired==false)
            setwcVerified(true)
        }  
    }

    async function getEas(){
      const results = await getEasVerified(portalId) 
      console.log(results)
      if(results.data.portalVerifieds.length >=1)
       {

          setEASVerified(true)
       }  
   }


    if(portalId)
     {    
       getPortal() 
       getEas()
     }   
   
  },[portalId])
  const donate = async()=>{
    const token = document.getElementById("tokens").value
    const amount = document.getElementById("amount").value
  console.log(token)
    if(!token || token==-1)
     {
        setDialogType(2) //Error
        setNotificationTitle("Donation");
        setNotificationDescription("Token not selected." )
        setShow(true)
      return
     }  
     
     if(!amount || amount <= 0 || isNaN(parseFloat(amount))  )
        {
           setDialogType(2) //Error
           setNotificationTitle("Donation");
           setNotificationDescription("Please enter donation amount." )
           setShow(true)
         return
        }  

        if(tokens[token].contractAddress=="0x0000000000000000000000000000000000000000")
         {
            setAction(1)
            setDialogType(3) //Information
        setNotificationTitle("Donation");
        setNotificationDescription("Sending Donation." )
        setShow(true)

            const callData = encodeFunctionData({
                abi: contractABI,
                functionName: "donate",
                args: [portal.portalId,tokens[token].contractAddress,parseUnits(amount,18)],
              });
          
            sendUserOperation({
                uo: {
                  target: contractAddress,
                  data: callData,
                  value: parseUnits(amount,18)
                },
              });
         }   
         else{

            setAction(1)
            setDialogType(3) //Information
        setNotificationTitle("Donation");
        setNotificationDescription("Sending Donation." )
        setShow(true)


        const approveCallData = encodeFunctionData({
            abi: tokenABI,
            functionName: "approve",
            args: [contractAddress,parseUnits(amount,tokens[token].decimals)],
          });
      
            const callData = encodeFunctionData({
                abi: contractABI,
                functionName: "donate",
                args: [portal.portalId,tokens[token].contractAddress,parseUnits(amount,tokens[token].decimals)],
              });
          
            sendUserOperation({
                uo: [{
                  target: tokens[token].contractAddress,
                  data: approveCallData,
                },{
                    target: contractAddress,
                    data: callData,
                   
                  }],
              });

         }
  }

  const connect = async()=>{
   
    if(portal.fee == 0)
     {
        alert("Connect");
        return
     }else{
        const token = document.getElementById("tokens").value
        const amount = document.getElementById("amount").value
        if(!token || token==-1)
         {
            setDialogType(2) //Error
            setNotificationTitle("Subscription");
            setNotificationDescription("Token not selected." )
            setShow(true)
          return
         }  

         
         
            const connection = new PriceServiceConnection("https://hermes.pyth.network", {priceFeedRequestConfig: {
                // Provide this option to retrieve binary price updates for on-chain contracts.
                // Ignore this option for off-chain use.
                binary: true,
              }});
            //const updateData = await connection.getLatestVaas([tokens[token].priceFeedId])
            const pricefeed = await connection.getLatestPriceFeeds([tokens[token].priceFeedId])
            //console.log(pricefeed)
            const updateData = new Uint8Array(Buffer.from([pricefeed[0].vaa],"base64")) 
           // console.log(pricefeed)
           // console.log(new Uint8Array(Buffer.from(updateData,"base64")))
             const price = formatUnits(pricefeed[0].price.price,8)
            const cost =portal.fee/price
            //console.log(cost)
            const costInWEI = parseUnits(cost.toString(),tokens[token].decimals) 
            console.log(costInWEI)
             console.log(parseUnits(cost.toString(),tokens[token].decimals))
           // console.log(updateData)
            const encoder = new TextEncoder()
            const x = encoder.encode(pricefeed[0].vaa)
           // console.log(x)
            const y = Array.from(x, byte => byte.toString(16).padStart(2, '0')).join('');
           // console.log(y)

            const xconnection = new EvmPriceServiceConnection("https://hermes.pyth.network");
            const priceUpdateData = await xconnection.getPriceFeedsUpdateData([tokens[token].priceFeedId]);
            console.log(priceUpdateData)
             
            if(tokens[token].contractAddress=="0x0000000000000000000000000000000000000000")
                {
                   setAction(3)
                   setDialogType(3) //Information
               setNotificationTitle("Subscription");
               setNotificationDescription("Subscribing to WIFI service." )
               setShow(true)
                   const callData = encodeFunctionData({
                       abi: contractABI,
                       functionName: "paySubscription",
                       args: [portal.portalId,tokens[token].contractAddress,priceUpdateData],
                     });
                 console.log(callData)
                   sendUserOperation({
                       uo: {
                         target: contractAddress,
                         data: callData,
                         value: costInWEI
                       },
                     });
                }   else{

                  setAction(3)
                  setDialogType(3) //Information
              setNotificationTitle("Subscription");
              setNotificationDescription("Subscribing to WIFI service." )
              setShow(true)
                

                  const approveCallData = encodeFunctionData({
                    abi: tokenABI,
                    functionName: "approve",
                    args: [contractAddress,costInWEI],
                  });

                  const callData = encodeFunctionData({
                    abi: contractABI,
                    functionName: "paySubscription",
                    args: [portal.portalId,tokens[token].contractAddress,priceUpdateData],
                  });
                
                  sendUserOperation({
                    uo: [{
                      target: tokens[token].contractAddress,
                      data: approveCallData,
                    },{
                        target: contractAddress,
                        data: callData,
                       
                      }],
                  });
    
                
                }
                
    
     }   
  }

  const verifyProof = async (proof) => {
    const response = await fetch("/api/worldid", {
      method: "POST",
      body: JSON.stringify({
        proof
        
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    if(!response.ok)
    throw new Error("Error Verifying World Id")
  };
  
  // TODO: Functionality after verifying
  const onSuccess = () => {
    console.log("Success")
    setwcVerified(true)
  };

  const signOut = ()=>{
    logout()
    setwcVerified(false)
  }
  
  return (
    <Card>

   <Notification
        type={dialogType}
        show={show}
        close={close}
        title={notificationTitle}
        description={notificationDescription}
      />

        <form className="flex flex-col gap-8" >
          <div className="flex justify-center items-center">
          <img  className="text-[18px] font-semibold overflow-hidden rounded-full border-4 border-gray-300"
      src={portal?.logo ? portal.logo: "/images/hotspots.jpg"} 
      alt="hotspots" 
      width={300} 
      height={100}


    /> 
             </div>
             
           <span className="text-2xl text-center">{portal?.name ? portal.name: "Hotspots"}</span>  
           <span className="text-2xl text-center">Fee: ${portal?.fee ? portal.fee: ""} usd</span>  
           {easVerified &&<div className='flex flex-row space-x-2 items-center justify-center'><span>EAS Verified</span> <span className="text-2xl text-green-500"> <CheckBadgeIcon  className="h-8 w-8 text-blue"/></span></div>}
 { (portalId && !wcVerified ) &&         <IDKitWidget
    app_id="app_staging_696c70b863a8fefb5305a02877b7e0f4"
    action="hotspots-ethglobal-login"
    false
    verification_level={VerificationLevel.Device}
    handleVerify={verifyProof}
    onSuccess={onSuccess}>
    {({ open }) => (
      <Button
      type="Button"
        onClick={open}
      >
        Verify with World ID
      </Button>
    )}
</IDKitWidget>
}
           {isConnected && <span className="text-sm text-center">Address: {address}</span>}  
            {isConnected            &&  <Button type="button" onClick={signOut}>Logout</Button>
        }  
             {(!isConnected && wcVerified) &&<div className="flex flex-row space-x-2">
             <Button type="button" onClick={login}>Log in</Button>
             <Button type="button" onClick={signup}>Sign Up</Button>
             </div>}
          <div className="flex flex-col justify-between gap-6">
          {isConnected && <div>      <select  
              id="tokens"
            className="w-full rounded-md border border-stroke bg-[#353444] py-3 px-6 text-base font-medium text-body-color outline-none transition-all focus:bg-[#454457] focus:shadow-input"
            >
            <option value={"-1"}>Select Token</option>
  {tokens.map((token,index) => (
    <option key={index} value={index}>
      {token.name}
    </option>
  ))}
</select>

      <div className="mt-2 mb-2"><Button type="button" onClick={connect}>Connect</Button>
      </div>
            <div className="flex flex-row space-x-2">
            <Input type="number" id="amount" placeholder="Amount" />

            <Button type="button" onClick={donate}>Donate</Button>

            </div> </div> }
            
          </div>
        </form>
      
    </Card>
  );
};
