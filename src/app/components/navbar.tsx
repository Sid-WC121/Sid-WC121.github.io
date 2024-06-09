import Link from 'next/link';
import { useState } from 'react';
import ThemeSwitch from './ThemeSwitch';
import Image from 'next/image';

const Navbar = () => {

    return (
        <nav>
        <div className="flex fixed top-6 inset-x-0 mx-auto  pr-8 pl-8 py-1  items-center justify-between">
            <Link href="/"> 
                <Image
                    src="/logo.png"
                    width={45}
                    height={45}
                    alt="Logo"
                    className="rounded-full"
                /> 
            </Link>
            <div className="flex max-w-fit  fixed top-6 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-8 pl-8 py-4  items-center justify-center space-x-4 gap-5">
                <Link href="/"> Work </Link>
                <Link href="/about">About </Link>
            </div>
            <ThemeSwitch/>
        </div>
        </nav>
    );
};
export default Navbar;