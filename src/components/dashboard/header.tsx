'use client'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon ,WifiIcon} from '@heroicons/react/24/outline'
import {
  useAccount,
  useLogout,
} from "@alchemy/aa-alchemy/react";
import {
  chain,
  accountType,
  gasManagerConfig,
  accountClientOptions as opts,
} from "@/config";
import { useRouter } from 'next/navigation'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  
const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
  { name: 'Portals', href: '/portals', current: true },
  { name: 'Tokens', href: '/tokens', current: false },
  { name: 'Donations', href: '/donations', current: false },
  { name: 'Verification', href: '/verification', current: false },

  
]
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

export default function Header({option}) {
  const { address } = useAccount({ type: accountType });
  const { logout } = useLogout();
 const router = useRouter();
const userNavClicked = (item)=>{
  alert("power")
  if(item == "Sign out"){
    logout()
    router.push("/")
}  
  }
    
return(<Disclosure as="nav" className="bg-indigo-600">
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <div className="flex h-16 items-center justify-between">
    <div className="flex items-center">
      <div className="flex-shrink-0">
      <WifiIcon aria-hidden="true" className="h-6 w-6 text-[#00FF00] text-bold" />

      </div>
      <div className="hidden md:block">
        <div className="ml-10 flex items-baseline space-x-4">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.name == option
                  ? 'bg-indigo-700 text-white'
                  : 'text-white hover:bg-indigo-500 hover:bg-opacity-75',
                'rounded-md px-3 py-2 text-sm font-medium',
              )}
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </div>
    <div className="hidden md:block">
      <div className="ml-4 flex items-center md:ml-6">
        <button
          type="button"
          className="relative rounded-full bg-indigo-600 p-1 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
        >
          <span className="absolute -inset-1.5" />
          <span className="sr-only">View notifications</span>
          {address}
        </button>

        {/* Profile dropdown */}
        <Menu as="div" className="relative ml-3">
          <div>
            <MenuButton className="relative flex max-w-xs items-center rounded-full bg-indigo-600 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Open user menu</span>
              <img alt="" src="/images/profile.jpg" className="h-8 w-8 rounded-full" />
            </MenuButton>
          </div>
          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            {userNavigation.map((item) => (
              <MenuItem key={item.name}>
                <button
                  onClick={()=>userNavClicked(item.name)}
                  className="text-left block w-full px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                >
                  {item.name}
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
      </div>
    </div>
    <div className="-mr-2 flex md:hidden">
      {/* Mobile menu button */}
      <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
        <span className="absolute -inset-0.5" />
        <span className="sr-only">Open main menu</span>
        <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
        <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
      </DisclosureButton>
    </div>
  </div>
</div>

<DisclosurePanel className="md:hidden">
  <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
    {navigation.map((item) => (
      <DisclosureButton
        key={item.name}
        as="a"
        href={item.href}
        aria-current={item.current ? 'page' : undefined}
        className={classNames(
          item.current ? 'bg-indigo-700 text-white' : 'text-white hover:bg-indigo-500 hover:bg-opacity-75',
          'block rounded-md px-3 py-2 text-base font-medium',
        )}
      >
        {item.name}
      </DisclosureButton>
    ))}
  </div>
  <div className="border-t border-indigo-700 pb-3 pt-4">
    <div className="flex items-center px-5">
      <div className="flex-shrink-0">
        <img alt="" src={"/images/profile.jpg"} className="h-10 w-10 rounded-full" />
      </div>
      <div className="ml-3">
        <div className="text-base font-medium text-white">        {address}
        </div>
        
      </div>
      <button
        type="button"
        className="relative ml-auto flex-shrink-0 rounded-full bg-indigo-600 p-1 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
      >
        <span className="absolute -inset-1.5" />
        <span className="sr-only">View notifications</span>
      </button>
    </div>
    <div className="mt-3 space-y-1 px-2">
      {userNavigation.map((item) => (
        <button
          key={item.name}
          onClick={()=>userNavClicked(item.name)}
          className="w-full text-left block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
        >
          {item.name}
        </button>
      ))}
    </div>
  </div>
</DisclosurePanel>
</Disclosure>)
}