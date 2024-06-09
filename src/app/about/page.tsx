import Navbar from "../components/navbar"
import '../globals.css'
import './About.css'

export default function About() {
    return (
        <main>
            <Navbar/>
            <div className="flex flex-1 py-4 h-screen sm:h-fit flex-col space-y-2 px-4">
            <span className="font-bold text-1xl flex pt-3">About</span>
            <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
                <div className="border-dashed border border-zinc-500 w-full rounded-lg flex items-center justify-center lg:text-9xl md:text-7xl sm:text-6xl text-6xl font-serif">Sidharth<br />P</div>
                <div className=" w-full h-[400px] rounded-lg lg:pl-[160px] pb-[100px]">
                    <div className="scale">
                        <div className="picture picture1">
                            <p className="text font-permanent-marker">Image 1</p>
                        </div>
                        <div className="picture picture2">
                            <p className="text font-permanent-marker">Image 2</p>
                        </div>
                        <div className="picture picture3">
                            <p className="text font-permanent-marker">Image 3</p>
                        </div>
                    </div>
                </div>
                <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg"></div>
                <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg px-2 py-2 text-zinc-400">ABOUT -</div>
            </div>
            <div className="border-b border-zinc-500 w-full"></div>
            <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
                <div className=" w-full h-[400px] rounded-lg px-2 py-2 text-zinc-400">EDUCATION
                    <div className="flex flex-col justify-center h-[80%] gap-2">
                        <div className="font-bold text-2xl dark:text-neutral-300 text-neutral-800">Amrita Vishwa Vidyapeetham, Amritapuri</div>
                        <div className="font-bold text-2xl dark:text-neutral-400 text-neutral-500">Amrita School of Engineering</div>
                        <div className="py-3 text-neutral-900 dark:text-neutral-300"> Bachelor of Technology (B.Tech) in Electronics and Computer Engineering </div>
                        <div className=" text-neutral-700 dark:text-neutral-400"> 2021 - 2025 </div>
                    </div>
                </div>
                <div className="border-dashed border border-zinc-500 w-full h-[400px] rounded-lg"></div>
                <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg"></div>
                <div className="border-dashed border border-zinc-500 w-full h-[400px] rounded-lg px-2 py-2 text-zinc-400">EXPERIENCE</div>
                
            </div>
            <div className="grid grid-cols-1 gap-5 py-3">
                <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg  text-zinc-400  px-2"> PUBLICATIONS</div>
            </div>
            <div className="border-b border-zinc-500 w-full"></div>
            <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
                <div className=" w-full h-[350px] rounded-lg px-2 text-zinc-400 flex flex-col justify-center">THINGS I LOVE TO DO
                    <div className="font-bold text-2xl dark:text-neutral-300 text-neutral-800 pt-4">Travel to new places</div>
                    <div className="font-bold text-2xl dark:text-neutral-300 text-neutral-800">Sketching, Painting</div>
                </div>
                <div className="border-dashed border border-zinc-500 w-full h-[350px] rounded-lg"></div>
            </div>
            </div>
        </main>
    );
}  