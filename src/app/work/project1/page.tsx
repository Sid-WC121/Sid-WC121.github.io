import Navbar from "../../components/navbar"

export default function Pj1() {
    return (
        <main>
            <Navbar/>
            <div className="flex flex-1 py-4 h-screen sm:h-fit flex-col space-y-2 px-4">
            <span className="font-bold text-3xl">Pg1</span>
            <div className="border-dashed border border-zinc-500 w-full h-12 rounded-lg"></div>
            <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg"></div>
            <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg"></div>
            <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg"></div>
            <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg"></div>
            <div className="border-dashed border border-zinc-500 w-full h-64 rounded-lg"></div>
            </div>
        </main>
    );
}  