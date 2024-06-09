import Navbar from "./components/navbar"
import Link from 'next/link';

export default function Work() {
  return (
    <main>
      <Navbar/>
        <div className="flex flex-1 py-4 h-screen sm:h-fit flex-col space-y-2 px-4">
        <span className="font-bold text-3xl">Works</span>
        <div className="border-dashed border border-zinc-500 w-full h-12 rounded-lg"></div>
        <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg">
          <Link href="/work/project1" className="text-2xl font-bold ">project1</Link>
        </div>
        <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg">
        <Link href="/work/project2" className="text-2xl font-bold ">project2</Link>
        </div>
        <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg"></div>
        <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg"></div>
        <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg"></div>
        </div>
    </main>
  );
}
