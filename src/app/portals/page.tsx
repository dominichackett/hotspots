'use client'

import Header from '@/components/dashboard/header'
import CreatePortal from '@/components/CreatePortal/CreatePortal'
import { useState ,useEffect} from 'react'
import Notification from '@/components/Notification/Notification'
import { encodeFunctionData } from "viem";
import { getPortals ,getEasVerifications} from '@/goldsky/goldsky'
import { uploadToIPFS } from '@/fleek/fleek';
import { contractABI,contractAddress } from '../../../contracts'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'

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

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
const statuses = { true: 'text-green-400 bg-green-400/10', false: 'text-rose-400 bg-rose-400/10' }
const activityItems = [
  {
    user: {
      name: 'Michael Foster',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    commit: '2d89f0c8',
    branch: 'main',
    status: 'Completed',
    duration: '25s',
    date: '45 minutes ago',
    dateTime: '2023-01-23T11:00',
  },
  {
    user: {
      name: 'Lindsay Walton',
      imageUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    commit: '249df660',
    branch: 'main',
    status: 'Completed',
    duration: '1m 32s',
    date: '3 hours ago',
    dateTime: '2023-01-23T09:00',
  },
  {
    user: {
      name: 'Courtney Henry',
      imageUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    commit: '11464223',
    branch: 'main',
    status: 'Error',
    duration: '1m 4s',
    date: '12 hours ago',
    dateTime: '2023-01-23T00:00',
  },
  {
    user: {
      name: 'Courtney Henry',
      imageUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    commit: 'dad28e95',
    branch: 'main',
    status: 'Completed',
    duration: '2m 15s',
    date: '2 days ago',
    dateTime: '2023-01-21T13:00',
  },
  {
    user: {
      name: 'Michael Foster',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    commit: '624bc94c',
    branch: 'main',
    status: 'Completed',
    duration: '1m 12s',
    date: '5 days ago',
    dateTime: '2023-01-18T12:34',
  },
  {
    user: {
      name: 'Courtney Henry',
      imageUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    commit: 'e111f80e',
    branch: 'main',
    status: 'Completed',
    duration: '1m 56s',
    date: '1 week ago',
    dateTime: '2023-01-16T15:54',
  },
  {
    user: {
      name: 'Michael Foster',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    commit: '5e136005',
    branch: 'main',
    status: 'Completed',
    duration: '3m 45s',
    date: '1 week ago',
    dateTime: '2023-01-16T11:31',
  },
  {
    user: {
      name: 'Whitney Francis',
      imageUrl:
        'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    commit: '5c1fd07f',
    branch: 'main',
    status: 'Completed',
    duration: '37s',
    date: '2 weeks ago',
    dateTime: '2023-01-09T08:45',
  },
]

export default function Portal() {

  const user = useUser();
  const [verifications,setVerifications] = useState(new Map())
  const[gotVerifications,setGotVerifications] = useState(false)
  
  const { address } = useAccount({ type: accountType });
  const [openCreatePortal,setOpenCreatePortal] = useState(false)
  const [refreshData,setRefreshData] = useState(new Date().getTime())
  const [portals,setPortals] = useState([])
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


const createError= (error:any)=>{
  setDialogType(2) //Error
  setNotificationTitle("Create Portal");
  setNotificationDescription(error?.error?.data?.message ? error?.error?.data?.message: error.message )
  setShow(true)

}

const createSuccess = (hash:any,request:any)=>{
  setDialogType(1) //Success
  setNotificationTitle("Create Portal");
  setNotificationDescription("Portal created successfully." )
  setShow(true)
  console.log(hash)
  console.log(request)
  setRefreshData(new Date().getTime())

}

  const createPortal = async(name:string,fee:number,isChecked:boolean,selectedFile:any,filename:string)=>{

    setOpenCreatePortal(false)
    if(!name || name=="")
     {
      setDialogType(2) //Error
      setNotificationTitle("Create Portal");
      setNotificationDescription("Please enter the portal name.")
      setShow(true)
      return
  
     }

     if(!fee || fee <0)
     {
      setDialogType(2) //Error
      setNotificationTitle("Create Portal");
      setNotificationDescription("Please enter zero or greater for the subscription fee.")
      setShow(true)
      return
  
     } 

     if(!selectedFile || selectedFile==undefined)
      {
       setDialogType(2) //Error
       setNotificationTitle("Create Portal");
       setNotificationDescription("Please select an image for the portal")
       setShow(true)
       return
   
      } 


    setDialogType(3) //Info
    setNotificationTitle("Create Portal");
    setNotificationDescription("Uploading portal image.")
    setShow(true)
  try{
    const result = await  uploadToIPFS(filename,selectedFile)
    //console.log(await result.json())
    
     const cid =result.cid.toV1().toString()
     const url = `https://${cid}.ipfs.cf-ipfs.com`
    
    // setShow(false)
    setNotificationDescription("Creating portal.")
    const callData = encodeFunctionData({
      abi: contractABI,
      functionName: "createPortal",
      args: [name,url,isChecked,fee],
    });


    sendUserOperation({
      uo: {
        target: contractAddress,
        data: callData,
      },
    });

  }catch(error)
  {
     setDialogType(2) //Error
     setNotificationTitle("Create Portal");
     setNotificationDescription(error?.error?.data?.message ? error?.error?.data?.message: error.message )
     setShow(true)
   return
  }
    
   } 

   const closeCreatePortal = ()=>{
    setOpenCreatePortal(false)
   }

   useEffect(()=>{
    async function _getPortals(){
      const results = await getPortals(address)
      console.log(results)
      setPortals(results.data.newPortals)
    }
     if(address!=undefined)
        _getPortals()
   },[address,gotVerifications,refreshData])

   useEffect(()=>{
    async function _getVerifications(){
      const results = await getEasVerifications()
      console.log(results)
      
      let _verifications = new Map()
      for(const index in results.data.portalVerifieds)
      {
         
        _verifications.set(results.data.portalVerifieds[index].portalId ,results.data.portalVerifieds[index].uid)   
      }
      
      setGotVerifications(true)
      setVerifications(_verifications)
  
    }
     
        _getVerifications()
    },[refreshData])  
    const getStatus = (id:any)=>{
      const item = verifications.get(id)
      if(item)
        return true
      else
        return false
  }

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div className="min-h-full">
       <Header option={"Portals"}/>
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold leading-6 text-gray-900">Captive Portals</h1>
            <button onClick={()=>setOpenCreatePortal(true)} type="button" className="mt-4 bg-[#363FF9] text-[#FBFDFF] rounded-lg p-3  transition duration-500 ease-in-out hover:scale-105" >Create Portal</button>

          </div>
        </header>
        <CreatePortal open={openCreatePortal} setOpen={closeCreatePortal} createPortal={createPortal}/>
         <Notification
        type={dialogType}
        show={show}
        close={close}
        title={notificationTitle}
        description={notificationDescription}
      />

        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="bg-gray-900 py-10">
      <h2 className="px-4 text-base font-semibold leading-7 text-white sm:px-6 lg:px-8">Captive Portals</h2>
      <table className="mt-6 w-full whitespace-nowrap text-left">
        <colgroup>
          <col className="w-full sm:w-4/12" />
          <col className="lg:w-4/12" />
          <col className="lg:w-2/12" />
          <col className="lg:w-1/12" />
          <col className="lg:w-1/12" />
        </colgroup>
        <thead className="border-b border-white/10 text-sm leading-6 text-white">
          <tr>
            <th scope="col" className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8">
              Portal
            </th>
            <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">
              Id
            </th>
            <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">
              Fee
            </th>
            <th scope="col" className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">
              Status
            </th>
            <th scope="col" className="text-center py-2 pl-0 pr-4 text-center font-semibold sm:pr-8 sm:text-left lg:pr-20">
              World ID Required
            </th>

          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {portals.map((item) => (
            <tr key={item.id}>
              <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                <div className="flex items-center gap-x-4">
                  <img alt="" src={item.logo} className="h-16 w-16 rounded-full bg-gray-800" />
                  <div className="truncate text-sm font-medium leading-6 text-white">{item.name}</div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="rounded-md bg-gray-700/40 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-white/10">
                    {item.portalId}
                  </div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="rounded-md bg-gray-700/40 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-white/10">
                    ${item.fee} usd
                  </div>
                </div>
              </td>
              <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                
                <div className="flex items-center justify-end gap-x-2 sm:justify-start">
              
                
              {getStatus(item.portalId) ? <div className='flex flex-row space-x-2 items-center justify-center'><span>EAS Verified</span> <span className="text-2xl text-green-500"> <CheckBadgeIcon  className="h-8 w-8 text-blue"/></span>
                 </div> :(<span>Unverified</span>)}

              </div>
                </div>
              </td>
              <td className=" hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
              <div className="flex justify-center gap-x-3">
                <div className="rounded-md bg-gray-700/40 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-white/10">
                  {item.wcRequired ? "Yes":"No"}
                </div>
              </div>
            </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
          </div>
        </main>
      </div>
    </>
  )
}
